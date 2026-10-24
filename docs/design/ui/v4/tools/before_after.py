# Ghép ảnh so sánh v3 (trước) và v4 (sau). python3 -P before_after.py
import os
from PIL import Image, ImageDraw, ImageFont
UI = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
V4 = os.path.join(UI, 'v4')
def lab(im, text):
    d = ImageDraw.Draw(im); f = ImageFont.truetype(os.path.join(UI, 'mockups', 'fonts', 'x'), 20) if False else ImageFont.load_default(size=26)
    w = d.textlength(text, font=f); d.rectangle((10, 10, 30 + w, 52), fill=(20, 14, 6)); d.text((20, 15), text, fill=(255, 240, 200), font=f); return im
def pair(a, b, ta, tb, w=1200):
    A, B = Image.open(a).convert('RGB'), Image.open(b).convert('RGB'); h = int(w * A.height / A.width)
    A, B = lab(A.resize((w, h), Image.LANCZOS), ta), lab(B.resize((w, int(w * B.height / B.width)), Image.LANCZOS), tb)
    out = Image.new('RGB', (w * 2 + 12, max(A.height, B.height)), (20, 14, 6)); out.paste(A, (0, 0)); out.paste(B, (w + 12, 0)); return out
m = pair(os.path.join(UI, '01_map_desktop.png'), os.path.join(V4, '01_map_desktop_v4.png'), 'TRUOC - v3 (SVG phang)', 'SAU - v4 (tranh thu tuc)')
z_src = os.path.join(V4, '02_zoom_detail_v4_hi.png') if os.path.exists(os.path.join(V4, '02_zoom_detail_v4_hi.png')) else os.path.join(V4, '02_zoom_detail_v4.png')
z = pair(os.path.join(UI, '05_zoom_detail.png'), z_src, 'TRUOC - v3 can canh', 'SAU - v4 can canh')
out = Image.new('RGB', (m.width, m.height + z.height + 12), (20, 14, 6)); out.paste(m, (0, 0)); out.paste(z, (0, m.height + 12))
out.save(os.path.join(V4, '00_before_after.png')); print(out.size)
