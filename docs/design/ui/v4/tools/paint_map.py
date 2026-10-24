#!/usr/bin/env python3
"""Đại Việt Rising — bản đồ "tranh thủ tục" (v4).
Chạy:  python3 -P paint_map.py   (cần numpy, scipy, opencv, pillow; chỉ chạy lúc THIẾT KẾ/build, không chạy trong game)
Vào : ../build/sprites.png (lớp công trình SVG trong suốt, do render_sprites.mjs chụp)
Ra  : ../build/map_bg.png (bản gốc), ../map_bg.webp (nén), ../build/roads.json (đường đi cho lớp phủ SVG)
Toàn bộ nội dung do thuật toán sinh ra, không dùng ảnh bên thứ ba. Ngoài độ nhiễu seed cố định => tái lập được.
Toạ độ nội bộ = toạ độ 1600x900 của mockup, nhân S=2 khi vẽ.
"""
import json, math, os, sys
import numpy as np, cv2
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
BUILD = os.path.join(HERE, '..', 'build')
S = int(os.environ.get('S', 2))
NOSPR = os.environ.get('NOSPR') == '1'   # bản dùng trong game: không nướng công trình/đất địa điểm theo phe (vẽ sống bằng SVG theo trạng thái ô)
OUT = os.environ.get('OUT')
SUF = '' if S == 2 else f'_s{S}'
W, H = 1600 * S, 900 * S
rng = np.random.default_rng(20260524)

# ---------- tiện ích ----------
def fbm(seed, cells=6, octaves=5, pers=.5, aniso=(1, 1)):
    r = np.random.default_rng(seed); out = np.zeros((H, W), np.float32); amp = 1.; tot = 0
    for o in range(octaves):
        cw, ch = max(2, int(cells * aniso[0] * 2 ** o)), max(2, int(cells * aniso[1] * 2 ** o))
        a = r.random((ch + 2, cw + 2)).astype(np.float32)
        out += amp * cv2.resize(a, (W, H), interpolation=cv2.INTER_CUBIC); tot += amp; amp *= pers
    out /= tot; out -= out.min(); out /= max(1e-6, out.max()); return out
def shift(a, dy, dx):  # dịch ảnh không cuộn vòng
    M = np.float32([[1, 0, dx], [0, 1, dy]]); return cv2.warpAffine(a, M, (a.shape[1], a.shape[0]), borderMode=cv2.BORDER_REPLICATE)
def sstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)
def mixc(a, b, t):  # a,b: (3,) ; t: (H,W)
    return a[None, None, :] * (1 - t[..., None]) + b[None, None, :] * t[..., None]
def hexc(h): return np.array([int(h[i:i + 2], 16) / 255. for i in (1, 3, 5)], np.float32)
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32); X, Y = xx / S, yy / S  # toạ độ 1600x900

TILES = {1: ('Thủ phủ', 760, 700, 'own'), 2: ('Châu Đông', 1030, 650, 'open'), 3: ('Châu Tây', 500, 640, 'open'), 4: ('Châu Nam', 1010, 800, 'open'),
         5: ('Đồng Trung', 760, 500, 'own'), 6: ('Rừng Tây', 520, 465, 'open'), 7: ('Bến sông Nam', 760, 330, 'enemy'), 8: ('Cửa Đông Bắc', 1080, 410, 'enemy'),
         9: ('Rừng biên', 520, 290, 'enemy'), 10: ('Tuyến sông biên', 760, 170, 'enemy'), 11: ('Trại biên Tây', 520, 110, 'enemy'), 12: ('Doanh trại biên Đông', 1070, 150, 'enemy')}
EDGES = [(1, 2), (1, 3), (1, 4), (1, 5), (2, 5), (2, 8), (3, 5), (3, 6), (5, 6), (5, 7), (5, 8), (6, 9), (7, 8), (7, 9), (7, 10), (8, 10), (8, 12), (9, 11), (10, 11), (10, 12)]

def bez(p0, p1, p2, p3, n=60):
    t = np.linspace(0, 1, n)[:, None]
    return (1 - t) ** 3 * p0 + 3 * (1 - t) ** 2 * t * p1 + 3 * (1 - t) * t ** 2 * p2 + t ** 3 * p3

# ---------- sông & biển ----------
RIVER_CP = [((560, -10), (640, 80), (700, 120), (690, 190)), ((690, 190), (680, 260), (640, 290), (720, 350)),
            ((720, 350), (800, 410), (900, 395), (1100, 470)), ((1100, 470), (1300, 545), (1330, 560), (1452, 596)), ((1452, 596), (1500, 612), (1550, 625), (1620, 640))]
river = np.vstack([bez(*[np.array(p, float) for p in seg]) for seg in RIVER_CP])
rw = np.interp(np.arange(len(river)), [0, len(river) * .35, len(river)], [15, 19, 30])  # nửa bề rộng (1x)
def poly_mask(pts, widths, wob=None):
    m = np.zeros((H, W), np.uint8)
    for i in range(len(pts) - 1):
        cv2.line(m, tuple(np.round(pts[i] * S).astype(int)), tuple(np.round(pts[i + 1] * S).astype(int)), 255, int(widths[i] * 2 * S), cv2.LINE_AA)
    return m.astype(np.float32) / 255
warp = (fbm(3, 5, 4) - .5) * 26 * S
def warped(m, k=1.): # làm bờ ngoằn ngoèo bằng remap
    mx = (xx + warp * k).astype(np.float32); my = (yy + np.roll(warp, 300, 1) * k).astype(np.float32)
    return cv2.remap(m, mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
water_r = warped(poly_mask(river, rw))
sea_poly = np.array(list(bez(np.array([1600, 360.]), np.array([1520, 410.]), np.array([1440, 500.]), np.array([1452, 590.])))
                    + list(bez(np.array([1452, 590.]), np.array([1462, 680.]), np.array([1400, 760.]), np.array([1330, 900.]))) + [[1600, 900.]]) * S
sea_m = np.zeros((H, W), np.uint8); cv2.fillPoly(sea_m, [np.round(sea_poly).astype(np.int32)], 255)
sea = warped(cv2.GaussianBlur(sea_m, (0, 0), 3).astype(np.float32) / 255, 1.2)
water = np.maximum(water_r, sea)
water_b = (water > .5).astype(np.uint8)
dist_w = cv2.distanceTransform(1 - water_b, cv2.DIST_L2, 5) / S     # khoảng cách tới nước (px 1x), phía đất
dist_in = cv2.distanceTransform(water_b, cv2.DIST_L2, 5) / S         # độ sâu trong nước

# ---------- độ cao ----------
f_lo, f_mid, f_hi = fbm(11, 3, 5), fbm(12, 8, 5), fbm(13, 24, 4)
def aniso_d(cx, cy, rx, ry, k=.35):
    return np.hypot((X - cx) / rx, (Y - cy) / ry * 1.0) + k * (f_mid - .5)
peaks = [  # (x, y, rx, ry, cao) — dãy núi tây (Hộ quốc tuyến), góc đông bắc, núi xa phía bắc
    (300, 230, 150, 130, 1.0), (390, 140, 120, 110, .85), (330, 60, 130, 90, .8), (230, 350, 130, 120, .95), (320, 470, 120, 120, .85), (250, 600, 150, 130, 1.0),
    (380, 720, 140, 110, .85), (470, 560, 80, 80, .55), (300, 810, 150, 100, .9), (170, 140, 120, 140, .8), (150, 480, 100, 150, .8), (140, 760, 120, 120, .75),
    (1260, 95, 130, 100, .85), (1370, 170, 120, 100, .9), (1310, 270, 100, 90, .7), (1500, 90, 120, 100, .8), (950, 20, 260, 80, .5), (700, 10, 240, 70, .45)]
Hm = np.zeros((H, W), np.float32)
ridged = 1 - np.abs(2 * fbm(14, 6, 5) - 1)
wa, wb = (fbm(17, 7, 4) - .5) * 20, (fbm(18, 7, 4) - .5) * 15      # làm lệch toạ độ => sống núi răng cưa
for pi_, (px, py, rx, ry, a) in enumerate(peaks):
    r_ = np.random.default_rng(700 + pi_)
    for sub in range(3):                                               # mỗi đỉnh = 3 chóp kim tự tháp nghiêng => dãy núi nhiều tầng
        ox, oy = (r_.random() - .5) * rx * 1.1, (r_.random() - .5) * ry * .9
        th = (r_.random() - .5) * .9; c_, s_ = math.cos(th), math.sin(th)
        ux, vy = X + wa - (px + ox), (Y + wb - (py + oy)) * 1.35
        gx2, gy2 = ux * c_ + vy * s_, -ux * s_ + vy * c_
        sc_ = (.85, .6, .5)[sub]
        d = np.maximum(np.abs(gx2) / (rx * sc_ * .85), np.abs(gy2) / (ry * sc_ * 1.2) + .0)
        h = a * (1.0 - .12 * sub) * np.clip(1 - d, 0, 1) * (1 + .22 * (ridged - .5))
        Hm = np.maximum(Hm, h)
ridge2 = 1 - np.abs(2 * fbm(15, 16, 4) - 1)
Hh = .16 * f_lo + .06 * f_mid + Hm * (.85 + .22 * ridge2 * sstep(.1, .5, Hm))
# làm phẳng quanh các địa điểm
for k, (n, x, y, st) in TILES.items():
    f = sstep(1.35, .8, np.hypot((X - x) / 110, (Y - y) / 60)); Hh = Hh * (1 - f) + (Hh * .15 + .06) * f
Hh = np.where(water > .5, np.minimum(Hh, .05), Hh)
Hs = cv2.GaussianBlur(Hh, (0, 0), .7)
gy_, gx_ = np.gradient(Hs)
slope = np.hypot(gx_, gy_) * 9
# ánh sáng từ Tây-Bắc (trái-trên); bóng rơi về Đông-Nam
L = np.array([-.62, -.62, .48], np.float32)
nk = 38 + 110 * sstep(.15, .4, Hs)
nx_, ny_ = -gx_ * nk, -gy_ * nk
nz_ = np.ones_like(nx_); nn = np.sqrt(nx_ ** 2 + ny_ ** 2 + nz_ ** 2)
shade = np.clip((nx_ * L[0] + ny_ * L[1] + nz_ * L[2]) / nn, -1, 1); shade = (shade - .45) / .6
shade = np.clip(shade * .5 + .5, 0, 1)

# ---------- màu nền ----------
C = {k: hexc(v) for k, v in dict(meadowL='#c2cf6a', meadow='#8cae45', meadowD='#5f8a3a', forest='#3c6b36', forestD='#27492f', paddyG='#cfc664', paddyD='#9cba4e', dry='#c9ac6d',
                                 rockL='#d2d0b0', rockM='#9aaa9c', rockD='#72879a', ink='#2a2a26', sand='#e6d29b', deep='#235f7b', mid='#4a98a8', shal='#92cdbd', foam='#f6f2db', shadowT='#2a3c5a', sunT='#fff0b8').items()}
moist = .6 * fbm(21, 4, 5) + .4 * fbm(22, 10, 4)
dryness = fbm(23, 3, 4)
base = mixc(C['meadow'], C['meadowL'], sstep(.38, .72, f_mid * .6 + dryness * .5 + (1 - moist) * .2))
base = base * (1 - sstep(.55, .85, moist)[..., None] * .35) + C['meadowD'][None, None] * sstep(.55, .85, moist)[..., None] * .35
base = base * (1 - sstep(.64, .8, dryness)[..., None] * .5) + C['dry'][None, None] * sstep(.64, .8, dryness)[..., None] * .5

# ruộng lúa ô thửa (gần các địa điểm của ta + dọc hạ lưu)
cent = [(760, 720, 250, 110), (1030, 650, 170, 110), (1010, 800, 170, 80), (880, 520, 130, 70), (1000, 560, 120, 60), (640, 800, 150, 50)]
pm = np.zeros((H, W), np.float32)
for (cx, cy, rx, ry) in cent: pm = np.maximum(pm, np.exp(-((X - cx) / rx) ** 2 - ((Y - cy) / ry) ** 2))
pm = sstep(.28, .55, pm * (.7 + .5 * f_mid)) * sstep(.2, .1, Hh)
ang = math.radians(-18); u = (X * math.cos(ang) + Y * math.sin(ang)) / 36; v = (-X * math.sin(ang) + Y * math.cos(ang)) / 24
u = u + (fbm(31, 5, 3) - .5) * 2.4; v = v + (fbm(32, 5, 3) - .5) * 2.4
cid = (np.floor(u) * 7919 + np.floor(v) * 104729).astype(np.int64)
cr = ((cid * 2654435761) % 1000003) / 1000003.
fu, fv = u - np.floor(u), v - np.floor(v)
bund = np.minimum(np.minimum(fu, 1 - fu), np.minimum(fv, 1 - fv))
pad_col = mixc(C['paddyD'], C['paddyG'], sstep(.25, .8, cr.astype(np.float32)))
pad_col = pad_col * (.93 + .12 * ((cr * 13) % 1)[..., None])
pad_col = pad_col * (1 - sstep(.05, .0, bund)[..., None] * .2) + C['meadowL'][None, None] * sstep(.03, .0, bund)[..., None] * .25
base = base * (1 - pm[..., None]) + pad_col * pm[..., None]

# rừng nền: khối xanh thẫm dưới tán cây
forest_centers = [(520, 465, 150, 90, 1), (520, 290, 150, 95, 1), (1190, 300, 150, 90, 1), (1230, 560, 110, 70, .9), (900, 770, 110, 60, .9), (640, 600, 90, 60, .8), (960, 245, 110, 55, .8),
                  (930, 520, 70, 40, .6), (1340, 360, 100, 60, .8), (470, 400, 100, 140, .6), (400, 200, 100, 120, .7), (1400, 220, 120, 80, .7), (620, 160, 90, 60, .6), (850, 90, 140, 50, .7)]
fd = np.zeros((H, W), np.float32)
for (cx, cy, rx, ry, a) in forest_centers: fd = np.maximum(fd, a * np.exp(-((X - cx) / rx) ** 2 - ((Y - cy) / ry) ** 2))
fd = fd * (.5 + .9 * fbm(41, 12, 4)) * sstep(.62, .45, Hh) * (1 - pm)  # mật độ rừng 0..~1
for k, (n, x, y, st) in TILES.items(): fd *= 1 - sstep(1.5, .9, np.hypot((X - x) / 92, (Y - y) / 52))
fdb = cv2.GaussianBlur(fd, (0, 0), 7 * S)
base = base * (1 - sstep(.18, .6, fdb)[..., None] * .55) + C['forest'][None, None] * sstep(.18, .6, fdb)[..., None] * .55

# đá/núi
rockm = sstep(.2, .34, Hh) * (.4 + .6 * sstep(.18, .5, slope + Hh * .5))
rock_t = sstep(.2, .85, shade)
rock_col = mixc(C['rockD'], C['rockM'], sstep(0, .5, rock_t)); rock_col = rock_col * (1 - sstep(.5, 1, rock_t)[..., None]) + C['rockL'][None, None] * sstep(.5, 1, rock_t)[..., None]
# chân núi xanh, đỉnh xám xanh
rock_green = (sstep(.7, .3, Hh) * (.55 + .25 * f_hi))[..., None] * .7
rock_col = rock_col * (1 - rock_green) + (C['forestD'][None, None] * (.7 + .5 * shade[..., None])) * rock_green
base = base * (1 - rockm[..., None]) + rock_col * rockm[..., None]

# ---------- chiếu sáng ----------
# bậc tông (tranh cel) cho đá, mềm theo nhiễu
sq = np.round((shade + (f_hi - .5) * .16) * 4) / 4
shade_p = shade * (1 - .55 * rockm) + sq * .55 * rockm
light = .74 + .6 * (shade_p - .5) * (.45 + .95 * rockm) + .08
col = base * np.clip(light, .25, 1.5)[..., None]
cool = sstep(.45, .05, shade_p) * (.1 + .15 * rockm)
col = col * (1 - cool[..., None]) + C['shadowT'][None, None] * col * 1.6 * cool[..., None]
warm = sstep(.62, .95, shade_p) * (.12 + .2 * rockm)
col = col * (1 - warm[..., None]) + C['sunT'][None, None] * col * 1.1 * warm[..., None]

col = np.maximum(col, hexc('#62748a')[None, None] * (rockm * .95)[..., None])  # sàn tối: bóng đá là xanh chàm, không đen
# gạch bóng (hatch) trên mặt khuất sáng của núi: nét song song chéo, độ dày theo độ tối
hu = (X * .62 - Y * .78) / 3.2 + (f_hi - .5) * 2.2 + (fbm(51, 18, 3) - .5) * 1.5
hf = np.abs(hu - np.floor(hu) - .5) * 2
dark = sstep(.58, .15, shade_p) * rockm
hatch = sstep(1 - dark * .78 - .05, 1 - dark * .78 + .1, hf) * sstep(.05, .35, dark)
col = col - (col - hexc('#2f3a48')[None, None]) * (hatch[..., None] * .34)
# nét gờ/vách đá: tối ở dốc đứng, sáng viền phía tây-bắc
cliff = sstep(.28, .75, slope) * rockm
col = col * (1 - cliff[..., None] * .22)
crest = np.clip(cv2.GaussianBlur(Hs, (0, 0), 3) - cv2.GaussianBlur(Hs, (0, 0), 14), 0, 1)
col = col + (np.clip(crest * 7, 0, 1) * rockm * sstep(.5, .95, shade_p))[..., None] * .22 * C['sunT'][None, None]
# mây/sương trên đỉnh
mist = sstep(.62, .85, fbm(61, 5, 5, aniso=(1.6, 1))) * sstep(.3, .6, Hh) * (1 - sstep(.6, .8, Hh)) * .3
col = col * (1 - mist[..., None]) + C['foam'][None, None] * mist[..., None]

# ---------- nước ----------
shore = sstep(0, 6, dist_in)                                   # 0 ở bờ → 1 vào sâu
wtex = fbm(71, 14, 4, aniso=(2.2, 1)) - .5
wcol = mixc(C['shal'], C['mid'], sstep(.0, 9, dist_in + wtex * 7)); wcol = wcol * (1 - sstep(8, 26, dist_in + wtex * 9)[..., None]) + C['deep'][None, None] * sstep(8, 26, dist_in + wtex * 9)[..., None]
wcol = wcol * (.98 + .25 * (fbm(72, 30, 3) - .5))[..., None]
# phản chiếu bóng núi/ánh trời
wcol = wcol + (shade[..., None] - .5) * .08
# vệt sóng/ánh sáng
sx = (X * .3 + wtex * 80); streak = sstep(.60, .66, fbm(73, 26, 3, aniso=(3, 1))) * sstep(.45, .5, fbm(74, 60, 2)) * sstep(3, 9, dist_in) * .9

flow_ln = np.zeros((H, W), np.uint8)
rr_ = np.random.default_rng(404)
for _ in range(190):
    i0 = int(rr_.integers(0, len(river) - 12)); off = (rr_.random() * 2 - 1) * rw[i0] * .62
    seg = river[i0:i0 + 9 + int(rr_.integers(0, 8))]
    nrm_ = np.gradient(seg, axis=0); nrm_ = np.stack([-nrm_[:, 1], nrm_[:, 0]], 1); nrm_ /= (np.linalg.norm(nrm_, axis=1, keepdims=True) + 1e-6)
    pts_l = (seg + nrm_ * (off + np.sin(np.linspace(0, 3, len(seg)) + rr_.random() * 6) * 1.2)[:, None]) * S
    cv2.polylines(flow_ln, [np.round(pts_l).astype(np.int32)], False, 255, int(1.4 * S), cv2.LINE_AA)
fl = cv2.GaussianBlur(flow_ln, (0, 0), .7).astype(np.float32) / 255 * water_r * .55
wcol = wcol + fl[..., None] * (C['foam'][None, None] - wcol) * 1.0
# bờ đất cát và viền đậm của sông
bank_sand = sstep(10, 0.5, dist_w + (f_hi - .5) * 6) * (1 - water)
sandc = mixc(C['sand'], C['dry'], sstep(.3, .8, f_hi))
col = col * (1 - (bank_sand * .78)[..., None]) + sandc * (bank_sand * .78)[..., None]
col = col * (1 - water[..., None]) + wcol * water[..., None]
edge_ink = (sstep(1.8, 0.2, dist_w + (f_hi - .5) * 1.2) * (1 - water) + sstep(0, 1.6, 1.6 - dist_in) * water * 0) * 0.62
col = col - (col - C['ink'][None, None] * .5 * np.array([.6, 1, 1.1], np.float32)[None, None]) * edge_ink[..., None]
# bọt sóng bờ biển
foam = sstep(5, 0, dist_in + (f_hi - .5) * 8) * sea * (1 - sstep(.4, .8, f_hi)) * water
col = col * (1 - (foam * .7)[..., None]) + C['foam'][None, None] * (foam * .7)[..., None]
for i in range(34):  # sóng nhỏ ở biển (nét cong ngắn)
    r_ = np.random.default_rng(100 + i); x0, y0 = 1470 + r_.random() * 120, 430 + r_.random() * 450
    pts = np.array([[x0 + dx, y0 + 2.2 * math.sin(dx / 5.5)] for dx in np.linspace(0, 20 + r_.random() * 14, 12)]) * S
    tmp = np.zeros((H, W), np.uint8); cv2.polylines(tmp, [np.round(pts).astype(np.int32)], False, 255, int(1.5 * S), cv2.LINE_AA)
    m_ = (tmp.astype(np.float32) / 255 * sea * .6 * (dist_in > 14))[..., None]; col = col * (1 - m_) + C['foam'][None, None] * m_

# ---------- đường ----------
def road_pts(a, b, seed):
    r = np.random.default_rng(seed); a = np.array(a, float); b = np.array(b, float); d = b - a; Ln = np.hypot(*d)
    nrm = np.array([-d[1], d[0]]) / Ln
    off = (r.random() - .5) * .3 * Ln; mid = (a + b) / 2 + nrm * off
    pts = bez(a, a + (mid - a) * .9, b + (mid - b) * .9, b, 70)
    wig = np.cumsum(r.normal(0, .5, len(pts))); wig -= np.linspace(wig[0], wig[-1], len(pts))
    return pts + nrm[None] * wig[:, None] * 1.6 * np.sin(np.linspace(0, math.pi, len(pts)))[:, None]
roads = {}
road_m = np.zeros((H, W), np.uint8); road_in = np.zeros((H, W), np.uint8)
for (a, b) in EDGES:
    p = road_pts(TILES[a][1:3], TILES[b][1:3], a * 13 + b); roads[f'{a}-{b}'] = p.round(1).tolist()
    q = np.round(p * S).astype(np.int32)
    cv2.polylines(road_m, [q], False, 255, 13 * S, cv2.LINE_AA); cv2.polylines(road_in, [q], False, 255, 8 * S, cv2.LINE_AA)
json.dump(roads, open(os.path.join(BUILD, 'roads.json'), 'w'))
rm, ri = road_m.astype(np.float32) / 255, road_in.astype(np.float32) / 255
rm_s = cv2.GaussianBlur(rm, (0, 0), 1.2) ; ri_s = cv2.GaussianBlur(ri, (0, 0), 1.0)
rm_s = rm_s * (1 - water); ri_s = ri_s * (1 - water)
# bóng + viền đất sẫm + mặt đường sáng có vân + vệt bánh
sh_off = shift(cv2.GaussianBlur(rm, (0, 0), 3), 3 * S, 2 * S) * (1 - water)
col = col * (1 - sh_off[..., None] * .28)
col = col * (1 - rm_s[..., None] * .85) + (C['dry'] * .52)[None, None] * rm_s[..., None] * .85
roadc = mixc(hexc('#e9d9a4'), hexc('#cdb77c'), sstep(.3, .75, fbm(81, 40, 3)))
col = col * (1 - ri_s[..., None] * .95) + roadc * ri_s[..., None] * .95 * (.92 + .12 * shade[..., None])
rut = sstep(.94, 1, np.abs(np.sin((fbm(82, 60, 2)) * 40))) * ri_s * .15
col = col * (1 - rut[..., None])

# ---------- mặt bằng địa điểm ----------
pad = np.zeros((H, W), np.float32); pad_rim = np.zeros((H, W), np.float32); pad_t = np.zeros((H, W, 3), np.float32)
tint = {'own': hexc('#c9ae6e'), 'open': hexc('#a99d66'), 'enemy': hexc('#7a5f3e')}
for k, (n, x, y, st) in TILES.items():
    r_ = np.random.default_rng(k * 77)
    m = np.zeros((H, W), np.uint8)
    for j in range(5):
        a_ = r_.random() * 6.283; ox, oy = math.cos(a_) * 34 * r_.random(), math.sin(a_) * 14 * r_.random()
        cv2.ellipse(m, (int((x + ox) * S), int((y + 4 + oy) * S)), (int((52 + r_.random() * 26) * S), int((26 + r_.random() * 12) * S)), 0, 0, 360, 255, -1, cv2.LINE_AA)
    m = cv2.GaussianBlur(m, (0, 0), 1.5).astype(np.float32) / 255
    pad = np.maximum(pad, m); pad_t = np.where(m[..., None] > .05, tint['open' if NOSPR else st][None, None], pad_t)
pad = sstep(.42, .56, pad * .85 + (fbm(95, 22, 4) - .5) * .5) * (1 - water)
padr = pad - cv2.erode(pad, np.ones((3, 3), np.uint8), iterations=3 * S)    # vành
pad_in = cv2.GaussianBlur(pad, (0, 0), 9 * S)
dirtc = pad_t * (.80 + .45 * (fbm(91, 40, 4)[..., None] - .5) + .06) * (.88 + .24 * shade[..., None])
dirtc = dirtc * (1 - sstep(.2, .85, pad_in)[..., None] * 0) + 0
inner = pad * (1 - sstep(.0, .6, 1 - pad_in) * 0)
# bóng đổ + đất
shd = shift(cv2.GaussianBlur(pad, (0, 0), 6), 7 * S, 5 * S)
col = col * (1 - shd[..., None] * .3 * (1 - pad[..., None]))
col = col * (1 - pad[..., None] * .96) + dirtc * pad[..., None] * .96
col = col * (1 - (cv2.GaussianBlur(padr, (0, 0), 1.6) * .38)[..., None]) + hexc('#5a4326')[None, None] * (cv2.GaussianBlur(padr, (0, 0), 1.6) * .38)[..., None]
# sáng ở giữa, tối xuống rìa (khối dẹt giống bệ đất)
col = col * (1 + (sstep(.35, .95, pad_in) * pad * .1)[..., None]) * (1 - (sstep(.9, .4, pad_in) * pad * .08)[..., None])
# cỏ viền, đá nhỏ
grass_layer = col.copy()

# ---------- vẽ trực tiếp: cây, tre, cỏ, đá (thủ công bằng cv2, đã khử răng cưa) ----------
img = np.clip(col, 0, 1)
img8 = np.ascontiguousarray((img[..., ::-1] * 255).astype(np.uint8))  # BGR
def bgr(c, f=1.): return tuple(int(np.clip(v * f, 0, 1) * 255) for v in (c[2], c[1], c[0]))
def shd_draw(canvas_shadow, x, y, rx, ry, a=255):
    cv2.ellipse(canvas_shadow, (int(x * S), int(y * S)), (int(rx * S), int(ry * S)), 0, 0, 360, a, -1, cv2.LINE_AA)
shadow_c = np.zeros((H, W), np.uint8)
# danh sách cây
def near_tile(x, y, rx=92, ry=54): return any(math.hypot((x - t[1]) / rx, (y - t[2]) / ry) < 1 for t in TILES.values())
road_d = cv2.distanceTransform((rm < .3).astype(np.uint8), cv2.DIST_L2, 5) / S
trees = []
tr = np.random.default_rng(555)
for _ in range(60000):
    x, y = tr.random() * 1600, 8 + tr.random() * 890
    ix, iy = int(x * S), int(y * S)
    if ix >= W or iy >= H: continue
    d = fd[iy, ix]
    if tr.random() > d ** 1.35 * .95 or water[iy, ix] > .02 or road_d[iy, ix] < 9 or near_tile(x, y) or pad[iy, ix] > .02: continue
    trees.append((x, y))
# mật độ: tỉa bớt các cây quá gần nhau (poisson thô)
pts_ = np.array(trees) if trees else np.zeros((0, 2)); keep = []
grid = {}
for i, (x, y) in enumerate(pts_):
    gk = (int(x // 11), int(y // 11)); ok = True
    for dx in (-1, 0, 1):
        for dy in (-1, 0, 1):
            for j in grid.get((gk[0] + dx, gk[1] + dy), []):
                if math.hypot(pts_[j][0] - x, pts_[j][1] - y) < 12.5: ok = False
    if ok: keep.append(i); grid.setdefault(gk, []).append(i)
trees = [tuple(pts_[i]) for i in keep]
trees.sort(key=lambda t: t[1])
print('cây:', len(trees))
for (x, y) in trees: shd_draw(shadow_c, x + 4.5, y + 2.5, 8, 3.6, 255)
shadow_f = cv2.GaussianBlur(shadow_c, (0, 0), 2.2).astype(np.float32) / 255
img8 = (img8 * (1 - shadow_f[..., None] * .5 * np.array([1, .9, .8], np.float32))).astype(np.uint8)

greens = [hexc(h) for h in ('#4a7a3a', '#58863e', '#6a8f3a', '#3d6e42', '#74983f', '#4a7238', '#5f8a45')]
def draw_broad(im, x, y, sc, r):
    c = greens[int(r.integers(len(greens)))]; h = (y > 0)
    rr = 8.5 * sc; cx, cy = x * S, (y - rr * .9) * S
    cv2.line(im, (int(x * S), int(y * S)), (int(x * S), int((y - rr * .5) * S)), bgr(hexc('#4a3220')), max(1, int(1.8 * S * sc)), cv2.LINE_AA)
    lobes = [(math.cos(a) * rr * .42, math.sin(a) * rr * .36) for a in (r.random() * 6.283 + k * 1.57 for k in range(4))]
    for (lx, ly) in lobes + [(0, 0)]:                                                           # nền tối: 5 thùy => viền tán lồi lõm
        cv2.circle(im, (int(cx + lx * S), int(cy + ly * S)), int(rr * .62 * S), bgr(c, .5), -1, cv2.LINE_AA)
    for (lx, ly) in lobes[:3]:
        cv2.circle(im, (int(cx + (lx - .08 * rr) * S), int(cy + (ly - .1 * rr) * S)), int(rr * .5 * S), bgr(c, .86), -1, cv2.LINE_AA)
    for (lx, ly) in lobes[:2]:                                                                  # sáng dần về góc TÂY-BẮC
        cv2.circle(im, (int(cx + (lx - .2 * rr) * S), int(cy + (ly - .26 * rr) * S)), int(rr * .3 * S), bgr(c, 1.18), -1, cv2.LINE_AA)
    for _ in range(int(4 * sc)):                                                                # vài nét lá (không phải chấm tròn)
        a = r.random() * 6.283; d = r.random() * rr * .6
        px, py = cx + math.cos(a) * d * S, cy + math.sin(a) * d * S * .85
        cv2.line(im, (int(px), int(py)), (int(px + 2.4 * S), int(py - 1.2 * S)), bgr(c, 1.3 if math.cos(a) + math.sin(a) < 0 else .55), max(1, int(S * 1.1)), cv2.LINE_AA)
    cv2.ellipse(im, (int(cx), int(cy + rr * .08 * S)), (int(rr * .95 * S), int(rr * .85 * S)), 0, 20, 150, bgr(hexc('#1c3320')), max(1, int(1.0 * S)), cv2.LINE_AA)
def draw_pine(im, x, y, sc, r):
    c = greens[int(r.integers(2, 6))] * np.array([.85, 1, 1.05], np.float32); w, h = 7 * sc, 24 * sc
    cv2.line(im, (int(x * S), int(y * S)), (int(x * S), int((y - 4 * sc) * S)), bgr(hexc('#3d2a1a')), max(1, int(2 * S)), cv2.LINE_AA)
    for i in range(3):
        yb = y - 3 * sc - i * h * .27; yt = yb - h * .5; ww = w * (1 - i * .22)
        L_ = np.array([[x - ww, yb], [x, yt], [x, yb]]) * S; R_ = np.array([[x, yt], [x + ww, yb], [x, yb]]) * S
        cv2.fillPoly(im, [np.round(L_).astype(np.int32)], bgr(c, 1.15), cv2.LINE_AA); cv2.fillPoly(im, [np.round(R_).astype(np.int32)], bgr(c, .62), cv2.LINE_AA)
        cv2.line(im, (int((x - ww) * S), int(yb * S)), (int((x + ww) * S), int(yb * S)), bgr(hexc('#1b2f20')), max(1, int(S * .9)), cv2.LINE_AA)
for (x, y) in trees:
    r = np.random.default_rng(int(x * 100 + y * 7))
    sc = .7 + r.random() ** 1.6 * .9
    (draw_pine if (y < 300 and r.random() < .3) or (Hh[min(H - 1, int(y * S)), min(W - 1, int(x * S))] > .26 and r.random() < .6) else draw_broad)(img8, x, y, sc, r)

# tre (cụm thân thẳng, lá mảnh) ở vài chỗ
def draw_bamboo(im, x, y, r):
    for i in range(7):
        bx = x + (i - 3) * 4.2 + r.random() * 2; hgt = 40 + r.random() * 22; lean = (r.random() - .5) * 5
        c = hexc('#9bb64a') if i % 2 else hexc('#7da23e')
        cv2.line(im, (int(bx * S), int(y * S)), (int((bx + lean) * S), int((y - hgt) * S)), bgr(c), int(2.4 * S), cv2.LINE_AA)
        cv2.line(im, (int((bx + .9) * S), int(y * S)), (int((bx + lean + .9) * S), int((y - hgt) * S)), bgr(c, .6), int(.9 * S), cv2.LINE_AA)
        for k in range(1, 5): cv2.line(im, (int((bx - 1.5 + lean * k / 5) * S), int((y - hgt * k / 5) * S)), (int((bx + 1.5 + lean * k / 5) * S), int((y - hgt * k / 5) * S)), bgr(hexc('#52702a')), int(S * .9), cv2.LINE_AA)
        for k in range(5):
            a = -1.9 + r.random() * 1.1 + (k % 2) * 1.0; Ln = 8 + r.random() * 6
            cv2.line(im, (int((bx + lean) * S), int((y - hgt + r.random() * 8) * S)), (int((bx + lean + math.cos(a) * Ln) * S), int((y - hgt + math.sin(a) * Ln + 4) * S)), bgr(hexc('#a9c45a') if k % 2 else hexc('#5f8a30')), int(1.4 * S), cv2.LINE_AA)
for (x, y) in [(880, 700), (1160, 745), (620, 765), (1225, 385), (865, 585), (1205, 620), (330, 540)]:
    shd_draw(shadow_c, x + 6, y + 2, 20, 5, 255); draw_bamboo(img8, x, y, np.random.default_rng(int(x + y)))

# cỏ lác đác + đá + hoa dại (các nét ngắn có hướng)
gr = np.random.default_rng(909)
for _ in range(1400):
    x, y = gr.random() * 1600, gr.random() * 900; ix, iy = int(x * S), int(y * S)
    if ix >= W or iy >= H or water[iy, ix] > .02 or Hh[iy, ix] > .24 or near_tile(x, y, 88, 50) or road_d[iy, ix] < 7 or fd[iy, ix] > .3: continue
    loc = img8[iy, ix][::-1].astype(np.float32) / 255; c = np.clip(loc * (1.28 if gr.random() < .5 else .72) + np.array([.0, .02, -.03]), 0, 1)
    for k in range(3): cv2.line(img8, (int(x * S), int(y * S)), (int((x + (k - 1) * 1.8) * S), int((y - 3.5 - gr.random() * 2.5) * S)), bgr(c, 1.0 + .08 * k), max(1, int(S * .8)), cv2.LINE_AA)
    if gr.random() < .06: cv2.circle(img8, (int((x + 3) * S), int((y - 3) * S)), int(1.8 * S), bgr(hexc('#f2e4a0')), -1, cv2.LINE_AA)

# ---------- sương, mây, ánh sáng toàn cục ----------
imgf = img8[..., ::-1].astype(np.float32) / 255
# công trình (lớp SVG) -> painterize
spr = (np.zeros((H, W, 4), np.float32) if NOSPR else np.array(Image.open(os.path.join(BUILD, f'sprites{SUF}.png')).convert('RGBA')).astype(np.float32) / 255)
sa = spr[..., 3]; srgb = spr[..., :3]
# nền phẳng giả để mean-shift không bị viền lem
bg_fill = srgb * sa[..., None] + imgf * (1 - sa[..., None])
tmp8 = (bg_fill * 255).astype(np.uint8)
ms = cv2.pyrMeanShiftFiltering(np.ascontiguousarray(tmp8[..., ::-1]), 3, 9, 0)[..., ::-1].astype(np.float32) / 255
bt = (fbm(121, 70, 3, aniso=(2.4, 1)) - .5)                            # nét cọ ngang
ms = cv2.addWeighted(ms, 1.35, cv2.GaussianBlur(ms, (0, 0), 1.6), -.35, 0) * (1 + .10 * bt[..., None])
# viền mực thô: lấy cạnh alpha + cạnh màu của sprite, làm mảnh, ám nâu
edge = cv2.Canny((np.clip(sa, 0, 1) * 255).astype(np.uint8), 40, 120).astype(np.float32) / 255
edge = cv2.GaussianBlur(edge, (0, 0), .9) * 1.5
dark_spr = sstep(.36, .12, cv2.cvtColor((srgb * 255).astype(np.uint8), cv2.COLOR_RGB2GRAY).astype(np.float32) / 255) * sa
spr_col = ms * sa[..., None] + imgf * (1 - sa[..., None])
# bóng đổ công trình (về Đông-Nam)
sh2 = shift(cv2.GaussianBlur(sa, (0, 0), 3.2), 7 * S, 6 * S)
imgf = imgf * (1 - np.clip(sh2 - sa, 0, 1)[..., None] * .42 * np.array([1, .95, .85], np.float32))
imgf = imgf * (1 - sa[..., None]) + ms * sa[..., None]
imgf = imgf * (1 - (np.clip(edge, 0, 1) * sa)[..., None] * .35)

# chiếu sáng toàn cục: mặt trời Tây-Bắc, mảng bóng mây trôi, sương xa phía bắc (vùng chưa khám phá)
sun = np.exp(-(((X - 330) / 700) ** 2 + ((Y - 120) / 520) ** 2)).astype(np.float32)
cloud_sh = sstep(.52, .72, fbm(131, 3, 4, aniso=(1.4, 1)))
imgf = imgf * (1 - cloud_sh[..., None] * .16 * np.array([1, .96, .86], np.float32))
imgf = imgf + sun[..., None] * .06 * C['sunT'][None, None]
fog_n = sstep(210, 20, Y) * (.5 + .5 * fbm(132, 6, 4))
fogc = hexc('#c9c9cf'); imgf = imgf * (1 - fog_n[..., None] * .3) + fogc[None, None] * fog_n[..., None] * .3
# mây trắng ở rìa
def cloud_layer(seed, cx, cy, rx, ry):
    f = fbm(seed, 7, 5); d = np.hypot((X - cx) / rx, (Y - cy) / ry)
    return sstep(.95, .35, d + (f - .5) * .9)
cl = np.maximum.reduce([cloud_layer(141, 1520, 120, 150, 70), cloud_layer(142, 60, 870, 120, 50), cloud_layer(143, 1250, 880, 160, 60), cloud_layer(144, 40, 50, 90, 40), cloud_layer(145, 1560, 420, 70, 110)]) * .85
cl_sh = shift(cv2.GaussianBlur(cl, (0, 0), 8), 16 * S, 12 * S)
imgf = imgf * (1 - cl_sh[..., None] * .22) * 1
cshade = sstep(.0, .5, np.clip(shift(cl, 14 * S, 10 * S) - cl, 0, 1) + np.clip(cl - shift(cl, -12 * S, -9 * S), 0, 1) * 0)  # cạnh ĐN xám xanh
cc = np.array([.98, .97, .93], np.float32)[None, None] * (1 - (sstep(.35, 1, cl) * .0)[..., None])
cc = cc * (1 - (.28 * sstep(.2, .9, cl) * (1 - sstep(.6, 1, shift(cl, -10 * S, -8 * S))))[..., None]) + hexc('#b8c3d6')[None, None] * ((.28 * sstep(.2, .9, cl) * (1 - sstep(.6, 1, shift(cl, -10 * S, -8 * S))))[..., None])
imgf = imgf * (1 - cl[..., None]) + cc * cl[..., None]

# tô màu loang & viền đọng sắc (pigment pooling): tối ở ranh giới vùng màu
blur = cv2.GaussianBlur(imgf, (0, 0), 2.2)
gxb = cv2.Sobel(blur, cv2.CV_32F, 1, 0); gyb = cv2.Sobel(blur, cv2.CV_32F, 0, 1)
gm = np.sqrt((gxb ** 2 + gyb ** 2).sum(-1))
pool = np.clip(gm * 2.2, 0, .6)
imgf = imgf * (1 - pool[..., None] * .22)
# nét cọ: hạt theo hướng (anisotropic) + hạt giấy
streak = fbm(151, 90, 3, aniso=(1.8, 1)) - .5
grain = rng.normal(0, 1, (H, W)).astype(np.float32); grain = cv2.GaussianBlur(grain, (0, 0), .8)
imgf = imgf * (1 + .07 * streak[..., None] + 0.0)
# vignette ấm-tối
vv = np.hypot((X - 800) / 1000, (Y - 470) / 640).astype(np.float32)
vig = sstep(.55, 1.15, vv)
imgf = imgf * (1 - vig[..., None] * .42) + hexc('#2a1e2a')[None, None] * vig[..., None] * .08
# phối màu cuối: nâng tương phản vừa phải, tông ấm
imgf = np.clip(imgf, 0, 1)
imgf = np.clip((imgf - .5) * 1.1 + .5, 0, 1)
gray = (imgf * np.array([.3, .59, .11], np.float32)).sum(-1, keepdims=True); imgf = np.clip(gray + (imgf - gray) * .84, 0, 1)  # bớt bão hòa về mức tranh vẽ (~.38)
out = (imgf * 255 + .5).astype(np.uint8)
if not NOSPR: Image.fromarray(out).save(os.path.join(BUILD, f'map_bg{SUF}.png'))
if S == 2:
    dst = OUT or os.path.join(BUILD, '..', 'map_bg.webp')
    Image.fromarray(out).save(dst, quality=int(os.environ.get('Q', 78)), method=6)
    print('ok', os.path.getsize(dst) // 1024, 'kB webp')
else: print('ok', SUF)
