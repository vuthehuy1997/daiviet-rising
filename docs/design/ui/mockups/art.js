/* Thư viện minh họa SVG thủ tục cho mockup (CR-003). Tự vẽ, không dùng tài nguyên của Riot. */
const INK = '#3b2a1c';
function R(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const f1 = (n) => n.toFixed(1);

function blob(cx, cy, rx, ry, seed, n = 16, j = .18) {
  const r = R(seed), pts = [];
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, k = 1 + (r() - .5) * 2 * j; pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); }
  const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  const m0 = mid(pts[n - 1], pts[0]); let d = `M${f1(m0[0])},${f1(m0[1])}`;
  for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n], m = mid(p, q); d += `Q${f1(p[0])},${f1(p[1])} ${f1(m[0])},${f1(m[1])}`; }
  return d + 'Z';
}

/* ---------- màu & ánh sáng (nguồn sáng: góc trên-trái, bóng đổ xuống phải) ---------- */
const INK2 = '#4a3322';
const _hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, t) => { const A = _hex(a), B = _hex(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
const lit = (c, t = .25) => mix(c, '#fff3cc', t);
const dark = (c, t = .3) => mix(c, '#2a1c24', t);
const SH = 'rgba(40,30,15,.28)';

/* ---------- vật thể trên bản đồ ---------- */
function tree(x, y, s = 1, seed = 1) {
  const r = R(seed * 7 + 3), pine = r() < .3, base = ['#6f8f4e', '#5f8244', '#7b9a55', '#678a4a'][Math.floor(r() * 4)];
  let g = `<g transform="translate(${f1(x)},${f1(y)}) scale(${s})"><ellipse cx="8" cy="3" rx="${pine ? 12 : 16}" ry="4.5" fill="${SH}"/>`;
  if (pine) {
    g += `<rect x="-2" y="-6" width="4" height="9" fill="#5a3d24" stroke="${INK2}" stroke-width="1"/>`;
    for (let i = 0; i < 3; i++) {
      const w = 18 - i * 4, y0 = -4 - i * 12, y1 = y0 - 19;
      g += `<path d="M${-w},${y0} L0,${y1} L${w},${y0} Q0,${y0 + 5} ${-w},${y0}Z" fill="${dark(base, .22)}" stroke="${INK2}" stroke-width="1.2" stroke-linejoin="round"/><path d="M${-w},${y0} L0,${y1} L1,${y0 + 3}Z" fill="${lit(base, .2)}"/>`;
    }
  } else {
    g += `<rect x="-2.2" y="-9" width="4.4" height="12" fill="#5a3d24" stroke="${INK2}" stroke-width="1"/>`;
    g += `<path d="${blob(0, -18, 15, 13, seed, 10, .12)}" fill="${dark(base, .28)}" stroke="${INK2}" stroke-width="1.4"/>`;
    g += `<path d="${blob(-1.5, -20, 13, 11, seed + 1, 9, .12)}" fill="${base}"/>`;
    g += `<path d="${blob(-4.5, -24, 8, 6, seed + 2, 8, .12)}" fill="${lit(base, .35)}"/>`;
    for (let i = 0; i < 5; i++) g += `<circle cx="${f1((r() - .6) * 18)}" cy="${f1(-14 - r() * 14)}" r="${f1(1.2 + r() * 1.4)}" fill="${r() < .5 ? lit(base, .5) : dark(base, .4)}" opacity=".7"/>`;
  }
  return g + '</g>';
}
function bamboo(x, y, s = 1) {
  let g = `<g transform="translate(${x},${y}) scale(${s})"><ellipse cx="6" cy="3" rx="20" ry="4" fill="${SH}"/>`;
  for (let i = -2; i <= 2; i++) {
    const h = 44 + (i % 2 ? 6 : 0), bx = i * 6, tx = i * 9;
    g += `<path d="M${bx},0 Q${bx + i * 2},${-h * .55} ${tx},${-h}" stroke="${INK2}" stroke-width="4.6" fill="none" stroke-linecap="round"/><path d="M${bx},0 Q${bx + i * 2},${-h * .55} ${tx},${-h}" stroke="#86a655" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    g += `<path d="M${tx},${-h} l9,-4 M${tx},${-h} l-9,-3 M${tx * .9},${-h * .72} l8,-3 M${tx * .9},${-h * .72} l-8,-2" stroke="#5f8244" stroke-width="2.2" stroke-linecap="round"/>`;
  }
  return g + '</g>';
}
function mountain(x, y, s = 1, seed = 1, tone = 0) {
  const r = R(seed * 11 + 5);
  const pal = [['#d9cfb2', '#b0a488', '#867b64'], ['#d2c7aa', '#aa9e83', '#80755e'], ['#ddd3b8', '#b8ac90', '#8f846b']][tone % 3];
  const n = 3, order = [], xs = [-58, 56, 0];
  for (let i = 0; i < n; i++) order.push({ px: xs[i] + (r() - .5) * 14, h: i === 2 ? 98 + r() * 14 : 66 + r() * 18, w: i === 2 ? 66 : 52 });
  let g = `<g transform="translate(${x},${y}) scale(${s})"><ellipse cx="8" cy="4" rx="112" ry="12" fill="${SH}"/>`;
  for (const p of order) {
    const a = [p.px, -p.h], L = [p.px - p.w, 0], Rr = [p.px + p.w * .95, 0], rb = [p.px + (r() - .4) * 12, 0];
    const kL = [p.px - p.w * .5 + (r() - .5) * 6, -p.h * .5], kR = [p.px + p.w * .5, -p.h * .42];
    const ridge = `M${f1(a[0])},${f1(a[1])} L${f1(kL[0] + 10)},${f1(kL[1] + 12)} L${f1(rb[0])},0`;
    g += `<path d="M${f1(L[0])},0 L${f1(kL[0])},${f1(kL[1])} L${f1(a[0])},${f1(a[1])} L${f1(kR[0])},${f1(kR[1])} L${f1(Rr[0])},0Z" fill="${pal[1]}" stroke="${INK2}" stroke-width="2.2" stroke-linejoin="round"/>`;
    g += `<path d="M${f1(L[0])},0 L${f1(kL[0])},${f1(kL[1])} L${f1(a[0])},${f1(a[1])} L${f1(kL[0] + 10)},${f1(kL[1] + 12)} L${f1(rb[0])},0Z" fill="${pal[0]}"/>`;
    g += `<path d="M${f1(a[0])},${f1(a[1])} L${f1(kR[0])},${f1(kR[1])} L${f1(Rr[0])},0 L${f1(rb[0])},0 L${f1(kL[0] + 10)},${f1(kL[1] + 12)}Z" fill="${pal[2]}" opacity=".55"/>`;
    g += `<path d="${ridge}" stroke="${INK2}" stroke-width="1.3" fill="none" opacity=".6" stroke-linejoin="round"/>`;
    for (let i = 1; i <= 6; i++) { // nét gạch bóng trên mặt khuất sáng
      const t = i / 7, ax = a[0] + (Rr[0] - a[0]) * t, ay = a[1] + (0 - a[1]) * t, bx = a[0] + (rb[0] - a[0]) * t, by = a[1] * (1 - t);
      g += `<path d="M${f1(ax)},${f1(ay)} L${f1(ax + (bx - ax) * .62)},${f1(ay + (by - ay) * .62)}" stroke="${INK2}" stroke-width="1.1" opacity=".5" stroke-linecap="round"/>`;
    }
    g += `<path d="M${f1(kL[0] + 2)},${f1(kL[1] + 4)} l-5,10 M${f1(kL[0] - 6)},${f1(kL[1] + 16)} l-4,9" stroke="#fff8e0" stroke-width="2" opacity=".55" stroke-linecap="round"/>`;
  }
  g += `<ellipse cx="0" cy="-2" rx="104" ry="13" fill="#f6efd6" opacity=".55" filter="url(#soft)"/>`;
  for (let i = 0; i < 6; i++) g += tree(-90 + i * 36 + (r() - .5) * 14, 2 + (r() - .5) * 6, .5, seed * 5 + i);
  return g + '</g>';
}
/* mái ngói cong, đầu đao vểnh (kiểu Lý) — tâm x=0, mép mái ở y, đỉnh ở y-h */
function roof(w, h, y, tint) {
  const a = y - h, L = lit(tint, .24), D = dark(tint, .2);
  const top = `Q${-w * .7},${y + 3} ${-w * .5},${y - h * .45} Q${-w * .2},${a + h * .1} 0,${a}`;
  const left = `M${-w - 4},${y - 5} ${top} L0,${y + h * .2} Q${-w * .4},${y + h * .2} ${-w - 4},${y - 5}Z`;
  const full = `M${-w - 4},${y - 5} ${top} Q${w * .2},${a + h * .1} ${w * .5},${y - h * .45} Q${w * .7},${y + 3} ${w + 4},${y - 5} Q${w * .4},${y + h * .2} 0,${y + h * .2} Q${-w * .4},${y + h * .2} ${-w - 4},${y - 5}Z`;
  let g = `<path d="${full}" fill="${D}" stroke="${INK2}" stroke-width="1.7" stroke-linejoin="round"/><path d="${left}" fill="${tint}"/>`;
  for (let k = 1; k <= 3; k++) { const yk = y - h * k * .22, wk = w * (.9 - k * .22); g += `<path d="M${f1(-wk)},${f1(yk)} Q0,${f1(yk + h * .13)} ${f1(wk)},${f1(yk)}" stroke="${dark(tint, .45)}" stroke-width="1" fill="none" opacity=".45"/>`; }
  g += `<path d="M${f1(-w * .24)},${f1(a + 2)} Q0,${f1(a - 4)} ${f1(w * .24)},${f1(a + 2)}" stroke="#e8c27a" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  return g;
}
function house(x, y, s = 1, tint = '#b0603f') {
  return `<g transform="translate(${f1(x)},${f1(y)}) scale(${s})"><ellipse cx="9" cy="4" rx="28" ry="6.5" fill="${SH}"/><path d="M-15,-16 h30 v18 h-30z" fill="#efe0b8" stroke="${INK2}" stroke-width="1.5"/><path d="M4,-16 h11 v18 h-11z" fill="#d3c08c"/><path d="M-15,-16 v18 M-5,-16 v18 M5,-16 v18" stroke="#6b4a2c" stroke-width="1.7"/><rect x="-4.5" y="-9" width="9" height="11" fill="#4a3220" stroke="${INK2}" stroke-width="1"/><circle cx="10" cy="-6" r="2.4" fill="#d7432f" stroke="${INK2}" stroke-width=".8"/>${roof(27, 26, -12, tint)}</g>`;
}
function pagoda(x, y, s = 1) { // tháp canh nhiều tầng (3 tầng mái)
  let g = `<g transform="translate(${f1(x)},${f1(y)}) scale(${s})"><ellipse cx="9" cy="4" rx="24" ry="6" fill="${SH}"/>`;
  const tiers = [[13, 0, 30], [10, -27, 24], [7.5, -50, 18]];
  for (let i = 0; i < 3; i++) {
    const [hw, by, rw] = tiers[i];
    g += `<path d="M${-hw},${by} v-12 h${hw * 2} v12z" fill="#e8d7a8" stroke="${INK2}" stroke-width="1.4"/><path d="M${hw * .15},${by} v-12 h${hw * .85} v12z" fill="#cdb87f"/><path d="M${-hw * .35},${by} v-8 h${hw * .7} v8z" fill="#4a3220"/>${roof(rw, 16, by - 10, '#b0603f')}`;
  }
  return g + `<path d="M0,-70 v-9" stroke="${INK2}" stroke-width="2"/><circle cx="0" cy="-81" r="2.6" fill="#e8c27a" stroke="${INK2}" stroke-width="1"/></g>`;
}
function tower(x, y, s = 1) { // chòi canh gỗ
  return `<g transform="translate(${f1(x)},${f1(y)}) scale(${s})"><ellipse cx="8" cy="4" rx="17" ry="4.5" fill="${SH}"/><path d="M-11,2 L-8,-30 M11,2 L8,-30 M-10,-10 L10,-22 M10,-10 L-10,-22" stroke="${INK2}" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M-11,2 L-8,-30 M11,2 L8,-30 M-10,-10 L10,-22 M10,-10 L-10,-22" stroke="#8a6338" stroke-width="2.2" fill="none" stroke-linecap="round"/><rect x="-13" y="-38" width="26" height="9" fill="#a47c48" stroke="${INK2}" stroke-width="1.5"/><path d="M0,-38 v9" stroke="${INK2}" stroke-width="1" opacity=".5"/>${roof(17, 16, -38, '#b0603f')}</g>`;
}
function field(x, y, s = 1, gold = false) {
  const a = gold ? '#d9c25a' : '#9fc060', b = gold ? '#b99a38' : '#6f9440', w = gold ? '#efe08a' : '#cfe6a0';
  let g = `<g transform="translate(${f1(x)},${f1(y)}) scale(${s})"><path d="M2,-13 L33,3 L2,19 L-29,3Z" fill="${SH}"/><path d="M0,-16 L30,0 L0,16 L-30,0Z" fill="${a}" stroke="${INK2}" stroke-width="1.7" stroke-linejoin="round"/><path d="M0,-16 L-30,0 L0,16 L-8,0Z" fill="${w}" opacity=".35"/>`;
  for (let i = -3; i <= 3; i++) g += `<path d="M${-26 + i * 4 + 4},${i * 2.1 - 5} L${4 + i * 4 + 4},${i * 2.1 + 9}" stroke="${b}" stroke-width="2.2" stroke-linecap="round"/>`;
  g += `<path d="M-20,-1 l9,5 M6,-8 l9,5" stroke="#fff" stroke-width="1.4" opacity=".55" stroke-linecap="round"/>`;
  return g + '</g>';
}
function palisade(x, y, n = 6, s = 1) {
  let g = `<g transform="translate(${f1(x)},${f1(y)}) scale(${s})"><path d="M-2,3 h${n * 7 + 6}" stroke="${SH}" stroke-width="5" stroke-linecap="round"/>`;
  for (let i = 0; i < n; i++) { const h = 15 + ((i * 7) % 4); g += `<path d="M${i * 7},0 l0,${-h} l3.5,-6 l3.5,6 l0,${h}z" fill="#a47c48" stroke="${INK2}" stroke-width="1.2" stroke-linejoin="round"/><path d="M${i * 7},0 l0,${-h} l3.5,-6 l0,${h + 6}z" fill="#c29a5e"/>`; }
  return g + `<path d="M-1,-6 h${n * 7 + 2}" stroke="#6b4a2c" stroke-width="2"/></g>`;
}
function flag(x, y, color = '#2f5d73', s = 1) {
  return `<g transform="translate(${f1(x)},${f1(y)}) scale(${s})"><ellipse cx="3" cy="2" rx="6" ry="2" fill="${SH}"/><path d="M0,0 L0,-50" stroke="${INK2}" stroke-width="2.6" stroke-linecap="round"/><circle cx="0" cy="-52" r="2.4" fill="#e8c27a" stroke="${INK2}" stroke-width="1"/><path d="M1,-48 Q12,-54 22,-48 Q32,-44 40,-48 L36,-40 L40,-32 Q30,-34 22,-30 Q12,-26 1,-32Z" fill="${color}" stroke="${INK2}" stroke-width="1.5" stroke-linejoin="round"/><path d="M1,-48 Q12,-54 22,-48 L22,-30 Q12,-26 1,-32Z" fill="${lit(color, .18)}" opacity=".5"/></g>`;
}
function tent(x, y, s = 1, c = '#a33b2f') {
  return `<g transform="translate(${f1(x)},${f1(y)}) scale(${s})"><ellipse cx="9" cy="4" rx="26" ry="6" fill="${SH}"/><path d="M-23,3 L0,-36 L23,3Z" fill="${dark(c, .25)}" stroke="${INK2}" stroke-width="2" stroke-linejoin="round"/><path d="M-23,3 L0,-36 L-2,3Z" fill="${lit(c, .12)}"/><path d="M-12,3 L0,-36 M-6,3 L0,-36 M10,3 L0,-36" stroke="${INK2}" stroke-width="1" opacity=".4"/><path d="M-5,3 L0,-14 L5,3Z" fill="#241710"/><path d="M0,-36 v-8" stroke="${INK2}" stroke-width="2"/><path d="M0,-44 l12,3 l-12,4Z" fill="#d7a63a" stroke="${INK2}" stroke-width="1"/><path d="M-23,3 l-6,3 M23,3 l6,3" stroke="${INK2}" stroke-width="1.4" opacity=".7"/></g>`;
}
function fire(x, y, s = 1) {
  return `<g transform="translate(${f1(x)},${f1(y)}) scale(${s})"><circle cx="0" cy="-10" r="30" fill="url(#glow)"/><path d="M-13,3 L13,-1 M-13,-1 L13,3" stroke="${INK2}" stroke-width="5.4" stroke-linecap="round"/><path d="M-13,3 L13,-1 M-13,-1 L13,3" stroke="#7a5230" stroke-width="3" stroke-linecap="round"/><path d="M0,-3 Q-14,-14 -5,-29 Q-2,-20 4,-25 Q12,-13 0,-3Z" fill="#e8742a" stroke="${INK2}" stroke-width="1.3" stroke-linejoin="round"/><path d="M0,-3 Q-6,-10 -1,-18 Q5,-12 0,-3Z" fill="#f8dc66"/><path d="M2,-32 q-8,-10 2,-20 q10,-8 0,-20" stroke="#6b6458" stroke-width="3" fill="none" opacity=".35" stroke-linecap="round"/></g>`;
}
function spears(x, y, s = 1) {
  let g = `<g transform="translate(${f1(x)},${f1(y)}) scale(${s})">`;
  for (let i = 0; i < 4; i++) g += `<path d="M${i * 6},0 L${i * 6 + (i - 1.5) * 1.5},-34" stroke="${INK2}" stroke-width="2.6" stroke-linecap="round"/><path d="M${i * 6 + (i - 1.5) * 1.5},-34 l-2,-6 l4,0z" fill="#c8ced4" stroke="${INK2}" stroke-width="1"/>`;
  return g + `<path d="M-2,-12 h24" stroke="#6b4a2c" stroke-width="2"/></g>`;
}
function dock(x, y, s = 1) {
  return `<g transform="translate(${x},${y}) scale(${s})"><path d="M-28,2 L28,-12" stroke="${INK2}" stroke-width="11" stroke-linecap="round"/><path d="M-28,2 L28,-12" stroke="#b08a58" stroke-width="7" stroke-linecap="round"/><path d="M-20,-1 l3,-5 M-4,-5 l3,-5 M12,-8 l3,-5" stroke="#7a5a34" stroke-width="1.4"/><path d="M-20,8 v-10 M0,2 v-10 M20,-4 v-10" stroke="${INK2}" stroke-width="2.6"/></g>`;
}
function boat(x, y, s = 1) {
  return `<g transform="translate(${x},${y}) scale(${s})"><ellipse cx="2" cy="8" rx="26" ry="4" fill="rgba(20,50,70,.25)"/><path d="M-24,0 Q0,13 24,0 L17,-7 L-17,-7Z" fill="#8a6338" stroke="${INK2}" stroke-width="1.7" stroke-linejoin="round"/><path d="M-24,0 Q0,13 24,0 L22,-2 Q0,8 -22,-2Z" fill="#6b4a2c"/><path d="M0,-7 L0,-30 M0,-28 L16,-10 L0,-10Z" stroke="${INK2}" stroke-width="1.5" fill="#efe2c0" stroke-linejoin="round"/></g>`;
}
function cloud(x, y, s = 1, seed = 1) {
  const r = R(seed); let g = `<g transform="translate(${x},${y}) scale(${s})" opacity=".94"><ellipse cx="14" cy="60" rx="80" ry="12" fill="rgba(40,30,15,.12)" filter="url(#soft)"/>`;
  const parts = [[0, 0, 44, 26], [-40, 8, 32, 20], [42, 10, 36, 22], [10, -16, 30, 20]];
  for (const [cx, cy, rx, ry] of parts) g += `<path d="${blob(cx, cy, rx, ry, Math.floor(r() * 999), 10, .08)}" fill="#fbf6e6" stroke="#8d8368" stroke-width="1.5"/>`;
  for (const [cx, cy, rx, ry] of parts) g += `<path d="${blob(cx - 2, cy - 2, rx - 3, ry - 3, Math.floor(r() * 999), 10, .08)}" fill="#fffdf2"/>`;
  return g + `<path d="M-24,12 q12,-8 26,-2 M2,16 q14,-6 28,0" stroke="#cbbf9f" stroke-width="2" fill="none" stroke-linecap="round"/></g>`;
}
function tuft(x, y, s = 1, c = '#7d9a4c') {
  return `<path d="M${f1(x)},${f1(y)} l-3,-7 M${f1(x)},${f1(y)} l0,-9 M${f1(x)},${f1(y)} l3,-7" stroke="${c}" stroke-width="${f1(1.5 * s)}" stroke-linecap="round" fill="none"/>`;
}

/* ---------- đường, sông ---------- */
function roadPath(a, b, seed) {
  const r = R(seed), mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
  const off = (r() - .5) * 0.28 * L; return `M${a[0]},${a[1]} Q${f1(mx - dy / L * off)},${f1(my + dx / L * off)} ${b[0]},${b[1]}`;
}

/* ---------- bảng tên (ruy-băng) & huy hiệu ---------- */
function banner(cx, cy, text, kind = 'own') {
  const w = Math.max(104, text.length * 8.6 + 34), h = 28, x = cx - w / 2, y = cy - h / 2;
  const pal = { own: ['#f7edcf', '#b8892b', '#2f5d73'], open: ['#dccd9f', '#8a7650', '#4a3a22'], enemy: ['#f3d9cd', '#9c2f25', '#7a1f17'] }[kind];
  let cap = '';
  if (kind === 'enemy') cap = `<rect x="${x - 10}" y="${y}" width="9" height="${h}" fill="#9c2f25"/><rect x="${x + w + 1}" y="${y}" width="9" height="${h}" fill="#9c2f25"/>`;
  return `<g><path d="M${x - 10},${y} L${x + w + 10},${y} L${x + w + 2},${y + h / 2} L${x + w + 10},${y + h} L${x - 10},${y + h} L${x - 2},${y + h / 2}Z" fill="${pal[0]}" stroke="${pal[1]}" stroke-width="2.6" stroke-linejoin="round"/>${cap}<path d="M${x + 4},${y + 3} h${w - 8}" stroke="${pal[1]}" stroke-width="1" opacity=".5"/><text x="${cx}" y="${cy + 5}" text-anchor="middle" font-family="Lora,serif" font-weight="700" font-size="14" letter-spacing=".04em" fill="${pal[2]}">${text.toUpperCase()}</text></g>`;
}
function chip(cx, cy, icon, text, tone = 'own') {
  const bg = tone === 'enemy' ? '#f3d9cd' : '#f7edcf', st = tone === 'enemy' ? '#9c2f25' : '#8a7650';
  return `<g transform="translate(${cx},${cy})"><rect x="-30" y="-12" width="60" height="24" rx="12" fill="${bg}" stroke="${st}" stroke-width="1.8"/><use href="#${icon}" x="-25" y="-9" width="18" height="18"/><text x="10" y="5" text-anchor="middle" font-family="Be Vietnam Pro,sans-serif" font-weight="600" font-size="13" fill="${INK}">${text}</text></g>`;
}
function alertBadge(x, y, n) {
  return `<g transform="translate(${x},${y})"><circle r="25" fill="none" stroke="#a33b2f" stroke-width="2" opacity=".5"/><circle r="19" fill="#a33b2f" stroke="#e8c27a" stroke-width="2.6"/><use href="#i-hourglass" x="-9" y="-16" width="18" height="18" color="#fff"/><text x="0" y="11" text-anchor="middle" font-family="Be Vietnam Pro,sans-serif" font-weight="700" font-size="14" fill="#fff">${n}</text></g>`;
}

/* ---------- tập biểu tượng (symbol, 32x32) ---------- */
const SYMBOLS = `
<symbol id="i-grain" viewBox="0 0 32 32"><path d="M16 30 V8" stroke="#3b2a1c" stroke-width="2" stroke-linecap="round"/><g fill="#e0b13a" stroke="#3b2a1c" stroke-width="1.3"><ellipse cx="11" cy="9" rx="3" ry="5" transform="rotate(-25 11 9)"/><ellipse cx="21" cy="9" rx="3" ry="5" transform="rotate(25 21 9)"/><ellipse cx="11" cy="17" rx="3" ry="5" transform="rotate(-25 11 17)"/><ellipse cx="21" cy="17" rx="3" ry="5" transform="rotate(25 21 17)"/><ellipse cx="16" cy="5" rx="2.6" ry="4.5"/></g></symbol>
<symbol id="i-wood" viewBox="0 0 32 32"><path d="M5 11 H25 V23 H5Z" fill="#a98456" stroke="#3b2a1c" stroke-width="1.8" stroke-linejoin="round"/><ellipse cx="25" cy="17" rx="4" ry="6" fill="#d9b985" stroke="#3b2a1c" stroke-width="1.8"/><ellipse cx="25" cy="17" rx="1.6" ry="2.6" fill="none" stroke="#3b2a1c" stroke-width="1.2"/><path d="M8 14 H20 M8 20 H20" stroke="#6b4a2c" stroke-width="1.2"/></symbol>
<symbol id="i-stone" viewBox="0 0 32 32"><path d="M4 24 L9 11 L17 6 L26 12 L28 24Z" fill="#a9a393" stroke="#3b2a1c" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 11 L15 16 L17 6 M15 16 L18 24 M15 16 L26 12" stroke="#3b2a1c" stroke-width="1.2" fill="none"/><path d="M9 11 L17 6 L15 16Z" fill="rgba(255,255,255,.4)"/></symbol>
<symbol id="i-iron" viewBox="0 0 32 32"><path d="M4 22 L9 12 H23 L28 22Z" fill="#7d8791" stroke="#3b2a1c" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 12 L12 16 H20 L23 12" fill="#aab3bb" stroke="#3b2a1c" stroke-width="1.2"/><path d="M12 16 L10 22 M20 16 L22 22" stroke="#3b2a1c" stroke-width="1"/></symbol>
<symbol id="i-lotus" viewBox="0 0 32 32"><g stroke="#3b2a1c" stroke-width="1.5" stroke-linejoin="round"><path d="M16 26 C9 22 6 15 8 9 C13 11 15 16 16 26Z" fill="#f2c4cf"/><path d="M16 26 C23 22 26 15 24 9 C19 11 17 16 16 26Z" fill="#f2c4cf"/><path d="M16 27 C12 21 12 12 16 5 C20 12 20 21 16 27Z" fill="#fbdfe6"/></g><path d="M7 27 Q16 31 25 27" stroke="#5f8244" stroke-width="2.2" fill="none" stroke-linecap="round"/></symbol>
<symbol id="i-shield" viewBox="0 0 32 32"><path d="M16 3 L27 7 V16 C27 23 22 27 16 30 C10 27 5 23 5 16 V7Z" fill="#2f5d73" stroke="#3b2a1c" stroke-width="1.8" stroke-linejoin="round"/><path d="M16 8 V25 M9 14 H23" stroke="#e8c27a" stroke-width="2"/></symbol>
<symbol id="i-swords" viewBox="0 0 32 32"><path d="M6 6 L24 24 M26 6 L8 24" stroke="#3b2a1c" stroke-width="3.6" stroke-linecap="round"/><path d="M6 6 L24 24 M26 6 L8 24" stroke="#c8ced4" stroke-width="1.8" stroke-linecap="round"/><path d="M20 28 L28 20 M4 20 L12 28" stroke="#6b4a2c" stroke-width="3" stroke-linecap="round"/></symbol>
<symbol id="i-hourglass" viewBox="0 0 32 32"><path d="M8 4 H24 M8 28 H24 M10 4 C10 12 16 14 16 16 C16 18 10 20 10 28 M22 4 C22 12 16 14 16 16 C16 18 22 20 22 28" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 25 H20 L16 20Z" fill="currentColor"/></symbol>
<symbol id="i-scroll" viewBox="0 0 32 32"><path d="M8 5 H23 Q26 5 26 8 V24 Q26 27 23 27 H10 Q7 27 7 24" fill="#f2e6c4" stroke="#3b2a1c" stroke-width="1.8"/><path d="M8 5 Q5 5 5 8 Q5 11 8 11 H10" fill="#e3d3a4" stroke="#3b2a1c" stroke-width="1.6"/><path d="M12 12 H22 M12 16 H22 M12 20 H19" stroke="#6b4a2c" stroke-width="1.5" stroke-linecap="round"/></symbol>
<symbol id="i-gear" viewBox="0 0 32 32"><path d="M16 3 l3 3 4-1 1 4 4 2-1 4 3 3-3 3 1 4-4 2-1 4-4-1-3 3-3-3-4 1-1-4-4-2 1-4-3-3 3-3-1-4 4-2 1-4 4 1z" fill="#c9a24a" stroke="#3b2a1c" stroke-width="1.6" stroke-linejoin="round"/><circle cx="16" cy="16" r="5" fill="#efe2c0" stroke="#3b2a1c" stroke-width="1.6"/></symbol>
<symbol id="i-undo" viewBox="0 0 32 32"><path d="M10 12 H20 A7 7 0 0 1 20 26 H12" stroke="#fff" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 6 L8 12 L14 18" stroke="#fff" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></symbol>
<symbol id="i-book" viewBox="0 0 32 32"><path d="M5 7 Q11 5 16 8 Q21 5 27 7 V25 Q21 23 16 26 Q11 23 5 25Z" fill="#f2e6c4" stroke="#3b2a1c" stroke-width="1.8" stroke-linejoin="round"/><path d="M16 8 V26" stroke="#3b2a1c" stroke-width="1.5"/></symbol>
<symbol id="i-diamond" viewBox="0 0 32 32"><path d="M16 3 L29 16 L16 29 L3 16Z" fill="#2f5d73" stroke="#e8c27a" stroke-width="2.4" stroke-linejoin="round"/><path d="M16 9 L22 16 L16 23 L10 16Z" fill="#efe2c0" stroke="#3b2a1c" stroke-width="1.2"/></symbol>
<symbol id="i-lock" viewBox="0 0 32 32"><rect x="7" y="14" width="18" height="14" rx="3" fill="#a79c82" stroke="#3b2a1c" stroke-width="1.6"/><path d="M11 14 V10 A5 5 0 0 1 21 10 V14" stroke="#3b2a1c" stroke-width="2" fill="none"/></symbol>
<symbol id="i-plus" viewBox="0 0 32 32"><path d="M16 7 V25 M7 16 H25" stroke="#c0762b" stroke-width="3.4" stroke-linecap="round"/></symbol>
<symbol id="i-check" viewBox="0 0 32 32"><path d="M6 17 L13 24 L26 8" stroke="#2f7a46" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></symbol>
<symbol id="i-farm" viewBox="0 0 32 32"><path d="M16 6 L30 16 L16 26 L2 16Z" fill="#9fbd62" stroke="#3b2a1c" stroke-width="1.8" stroke-linejoin="round"/><path d="M8 14 L18 21 M12 11 L22 18 M16 9 L25 15" stroke="#6d8c3c" stroke-width="2"/></symbol>
<symbol id="i-lumber" viewBox="0 0 32 32"><path d="M3 26 L14 24 L26 26 M5 20 H23 M7 14 H21" stroke="#3b2a1c" stroke-width="5" stroke-linecap="round"/><path d="M3 26 L14 24 L26 26 M5 20 H23 M7 14 H21" stroke="#a98456" stroke-width="2.6" stroke-linecap="round"/><path d="M24 4 L29 9 L22 16Z" fill="#c8ced4" stroke="#3b2a1c" stroke-width="1.4"/></symbol>
<symbol id="i-barracks" viewBox="0 0 32 32"><path d="M3 27 L16 8 L29 27Z" fill="#c9a24a" stroke="#3b2a1c" stroke-width="1.8" stroke-linejoin="round"/><path d="M13 27 L16 17 L19 27Z" fill="#2b1c0e"/><path d="M16 8 V2 L23 4 L16 6" fill="#a33b2f" stroke="#3b2a1c" stroke-width="1.3"/></symbol>
<symbol id="i-watch" viewBox="0 0 32 32"><path d="M9 29 L11 14 M23 29 L21 14 M10 22 L22 18" stroke="#6b4a2c" stroke-width="2.6" fill="none"/><rect x="8" y="9" width="16" height="6" fill="#9b7a4b" stroke="#3b2a1c" stroke-width="1.6"/><path d="M6 9 L16 2 L26 9Z" fill="#a2543a" stroke="#3b2a1c" stroke-width="1.6" stroke-linejoin="round"/></symbol>
<symbol id="i-palisade" viewBox="0 0 32 32"><g fill="#9b7a4b" stroke="#3b2a1c" stroke-width="1.4" stroke-linejoin="round"><path d="M3 28 V12 L6.5 6 L10 12 V28Z"/><path d="M11 28 V10 L14.5 4 L18 10 V28Z"/><path d="M19 28 V12 L22.5 6 L26 12 V28Z"/></g></symbol>
<symbol id="i-helm" viewBox="0 0 32 32"><path d="M6 20 C6 10 10 5 16 5 C22 5 26 10 26 20 V24 H6Z" fill="#c8ced4" stroke="#3b2a1c" stroke-width="1.8" stroke-linejoin="round"/><path d="M16 5 V1 M10 20 H22 M13 24 V17 M19 24 V17" stroke="#3b2a1c" stroke-width="1.6"/><path d="M16 2 q5 -2 7 1" stroke="#a33b2f" stroke-width="3" stroke-linecap="round" fill="none"/></symbol>
<symbol id="i-bow" viewBox="0 0 32 32"><path d="M9 4 C22 8 22 24 9 28" stroke="#6b4a2c" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M9 4 L9 28" stroke="#3b2a1c" stroke-width="1.2"/><path d="M5 16 H28 M28 16 l-5 -4 M28 16 l-5 4" stroke="#3b2a1c" stroke-width="2" stroke-linecap="round" fill="none"/></symbol>
<symbol id="i-spear" viewBox="0 0 32 32"><path d="M6 28 L24 6" stroke="#6b4a2c" stroke-width="3" stroke-linecap="round"/><path d="M22 3 L29 3 L29 10 L22 9Z" fill="#c8ced4" stroke="#3b2a1c" stroke-width="1.5" stroke-linejoin="round" transform="rotate(0)"/><path d="M12 19 l4 4" stroke="#a33b2f" stroke-width="3"/></symbol>
<symbol id="i-hat" viewBox="0 0 32 32"><path d="M3 20 C8 8 24 8 29 20 C22 24 10 24 3 20Z" fill="#d9b985" stroke="#3b2a1c" stroke-width="1.8" stroke-linejoin="round"/><path d="M16 9 V21 M9 12 L11 22 M23 12 L21 22" stroke="#9b7a4b" stroke-width="1.2"/></symbol>
<symbol id="i-sword" viewBox="0 0 32 32"><path d="M7 25 L25 7" stroke="#3b2a1c" stroke-width="4.4" stroke-linecap="round"/><path d="M7 25 L25 7" stroke="#d6dbe0" stroke-width="2.2" stroke-linecap="round"/><path d="M5 20 L12 27 M3 29 L7 25" stroke="#6b4a2c" stroke-width="3" stroke-linecap="round"/></symbol>
<symbol id="i-banner" viewBox="0 0 32 32"><path d="M9 29 V3" stroke="#3b2a1c" stroke-width="2.6" stroke-linecap="round"/><path d="M10 4 Q20 0 28 6 Q20 10 10 12Z" fill="#a33b2f" stroke="#3b2a1c" stroke-width="1.6" stroke-linejoin="round"/></symbol>
`;

/* ---------- đĩa Kết thúc lượt (sen–mặt trời) ---------- */
function endDisc(size = 150) {
  let petals = '';
  for (let i = 0; i < 12; i++) petals += `<path d="M0,-22 C-9,-34 -8,-48 0,-56 C8,-48 9,-34 0,-22Z" transform="rotate(${i * 30})" fill="${i % 2 ? '#f6d68a' : '#fbe9b8'}" stroke="#3b2a1c" stroke-width="1.5" stroke-linejoin="round"/>`;
  return `<svg width="${size}" height="${size}" viewBox="-80 -80 160 160"><defs><radialGradient id="dg" cx=".4" cy=".35"><stop offset="0" stop-color="#3f7690"/><stop offset="1" stop-color="#1f4254"/></radialGradient><linearGradient id="gg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f0cf75"/><stop offset=".5" stop-color="#b8892b"/><stop offset="1" stop-color="#e3b857"/></linearGradient></defs><circle r="76" fill="url(#gg)" stroke="#3b2a1c" stroke-width="2.4"/><circle r="66" fill="url(#dg)" stroke="#e8c27a" stroke-width="3"/><circle r="60" fill="none" stroke="#e8c27a" stroke-width="1" stroke-dasharray="2 5" opacity=".8"/>${petals}<circle r="22" fill="#f1c043" stroke="#3b2a1c" stroke-width="2"/><circle r="14" fill="#f8de7a"/><path d="M-6,-3 q6,-6 12,0" stroke="#b8892b" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`;
}

/* ---------- bản đồ nghệ thuật CMP-01 ---------- */
const TILES = {
  'TIL-001': { n: 'Thủ phủ', p: [760, 700], t: 'dong_bang', s: 'settled' },
  'TIL-002': { n: 'Châu Đông', p: [1030, 650], t: 'dong_bang', s: 'open' },
  'TIL-003': { n: 'Châu Tây', p: [500, 640], t: 'nui', s: 'open' },
  'TIL-004': { n: 'Châu Nam', p: [1010, 800], t: 'ven_bien', s: 'open' },
  'TIL-005': { n: 'Đồng Trung', p: [760, 500], t: 'dong_bang', s: 'settled' },
  'TIL-006': { n: 'Rừng Tây', p: [520, 465], t: 'rung', s: 'open' },
  'TIL-007': { n: 'Bến sông Nam', p: [760, 330], t: 'song', s: 'hostile' },
  'TIL-008': { n: 'Cửa Đông Bắc', p: [1080, 410], t: 'dong_bang', s: 'hostile' },
  'TIL-009': { n: 'Rừng biên', p: [520, 290], t: 'rung', s: 'hostile' },
  'TIL-010': { n: 'Tuyến sông biên', p: [760, 170], t: 'song', s: 'hostile' },
  'TIL-011': { n: 'Trại biên Tây', p: [520, 110], t: 'nui', s: 'hostile' },
  'TIL-012': { n: 'Doanh trại biên Đông', p: [1070, 150], t: 'dong_bang', s: 'hostile' },
};
const EDGES = [[1, 2], [1, 3], [1, 4], [1, 5], [2, 5], [2, 8], [3, 5], [3, 6], [5, 6], [5, 7], [5, 8], [6, 9], [7, 8], [7, 9], [7, 10], [8, 10], [8, 12], [9, 11], [10, 11], [10, 12]];
const id3 = (n) => 'TIL-' + String(n).padStart(3, '0');

function settlementArt(id) {
  const [x, y] = TILES[id].p, st = TILES[id].s, sd = Number(id.slice(4)) * 7, hostile = st === 'hostile';
  const base = hostile ? 'url(#dirtE)' : st === 'settled' ? 'url(#dirtO)' : 'url(#dirtN)';
  let g = `<path d="${blob(x + 8, y + 10, 84, 42, sd, 14, .1)}" fill="rgba(40,30,15,.3)" filter="url(#soft)"/>`;
  g += `<path d="${blob(x, y + 2, 80, 40, sd, 14, .1)}" fill="${base}" stroke="${INK2}" stroke-width="1.6" stroke-opacity=".7"/><path d="${blob(x - 4, y - 2, 62, 28, sd + 1, 12, .1)}" fill="rgba(255,244,205,.25)"/>`;
  const r = R(sd);
  for (let i = 0; i < 9; i++) { const a = r() * 6.283, d = .8 + r() * .12; g += tuft(x + Math.cos(a) * 72 * d, y + 4 + Math.sin(a) * 34 * d, 1, hostile ? '#8a7648' : '#6f9440'); }
  for (let i = 0; i < 6; i++) g += `<ellipse cx="${f1(x + (r() - .5) * 120)}" cy="${f1(y + 6 + (r() - .5) * 52)}" rx="${f1(2 + r() * 2)}" ry="${f1(1.4 + r())}" fill="#a79c82" stroke="${INK2}" stroke-width=".8" opacity=".8"/>`;
  if (st === 'settled') {
    if (id === 'TIL-001') {
      g += `<path d="M${x - 72},${y + 2} Q${x},${y - 56} ${x + 72},${y + 2}" stroke="${INK2}" stroke-width="13" fill="none" stroke-linecap="round"/><path d="M${x - 72},${y + 2} Q${x},${y - 56} ${x + 72},${y + 2}" stroke="#b9ad92" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M${x - 72},${y - 1} Q${x},${y - 59} ${x + 72},${y - 1}" stroke="#e4dabd" stroke-width="3" fill="none" stroke-linecap="round" stroke-dasharray="7 4"/>`;
      g += field(x - 14, y + 22, .8, false) + field(x + 24, y + 26, .7, true) + pagoda(x + 2, y - 16, 1.05) + house(x - 40, y + 6, 1.05) + house(x + 44, y + 10, 1) + palisade(x - 28, y + 30, 8, .9) + flag(x - 74, y - 2, '#2f5d73', .8) + flag(x + 76, y + 2, '#2f5d73', .75);
    } else g += field(x - 46, y + 10, .95) + house(x + 6, y, 1.1) + house(x - 16, y - 12, .8, '#9f5a3c') + palisade(x - 26, y + 26, 7, .9) + flag(x + 34, y - 6, '#2f5d73', .85);
  } else if (st === 'open') {
    g += `<path d="M${x - 34},${y + 8} q34,-14 68,0" stroke="${INK2}" stroke-width="1.5" fill="none" stroke-dasharray="3 5" opacity=".55"/><path d="M${x - 9},${y - 4} h18 M${x},${y - 13} v18" stroke="#c0762b" stroke-width="3.4" stroke-linecap="round" opacity=".9"/>`;
    const t = TILES[id].t;
    if (t === 'rung') g += tree(x - 44, y + 8, 1.1, 5) + tree(x + 42, y + 12, 1, 8) + tree(x + 12, y + 22, .85, 11) + tree(x - 18, y - 14, .8, 14);
    if (t === 'ven_bien') g += boat(x + 46, y + 14, .9) + tree(x - 46, y + 10, .9, 3);
    if (t === 'nui') g += mountain(x - 24, y + 16, .45, 3, 1);
    if (t === 'dong_bang') g += house(x + 30, y + 8, .8, '#9f5a3c') + field(x - 40, y + 10, .75);
  } else { // địch
    const n = { 'TIL-007': 2, 'TIL-008': 2, 'TIL-009': 2, 'TIL-010': 3, 'TIL-011': 3, 'TIL-012': 4 }[id] || 2;
    g += `<path d="M${x - 70},${y + 4} Q${x},${y - 46} ${x + 70},${y + 4}" stroke="${INK2}" stroke-width="3" fill="none" stroke-dasharray="3 4" opacity=".5"/>`;
    const tents = []; for (let i = 0; i < n; i++) tents.push([x - 48 + i * (96 / Math.max(1, n - 1 + .0001)) * (n > 1 ? 1 : 0) + (n === 1 ? 48 : 0), y + 4 - (i % 2) * 12, 1 - (i % 2) * .12]);
    tents.sort((a, b) => a[1] - b[1]);
    for (const [tx, ty, ts] of tents) g += tent(tx, ty, ts);
    g += tent(x + 2, y + 14, 1.18, '#8f2d24') + fire(x + 38, y + 18, 1) + spears(x - 58, y + 20, .85) + flag(x - 8, y - 12, '#a33b2f', 1) + palisade(x - 36, y + 34, 9, .85);
    if (id === 'TIL-007' || id === 'TIL-010') g += dock(x - 66, y + 18, .8);
  }
  return g;
}

function mapSvg({ viewBox = '0 0 1600 900', sel = null, showAlert = true, w = 1600, h = 900, army = true } = {}) {
  const P = (n) => TILES[id3(n)].p;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${viewBox}" preserveAspectRatio="xMidYMid slice" font-family="Be Vietnam Pro,sans-serif"><defs>
<filter id="rough" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="5"/></filter>
<filter id="soft" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="6"/></filter>
<filter id="blur30" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="34"/></filter>
<filter id="paper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" seed="7"/><feColorMatrix values="0 0 0 0 .35  0 0 0 0 .26  0 0 0 0 .14  0 0 0 .22 0"/></filter>
<filter id="wash" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".008 .014" numOctaves="4" seed="11" result="t"/><feColorMatrix in="t" values="0 0 0 0 .42  0 0 0 0 .5  0 0 0 0 .2  0 0 0 .9 -.28" result="c"/><feComposite in="c" in2="SourceGraphic" operator="in"/></filter>
<filter id="mottle" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="3" seed="19" result="t"/><feColorMatrix in="t" values="0 0 0 0 .98  0 0 0 0 .95  0 0 0 0 .7  0 0 0 1.3 -.6" result="c"/><feComposite in="c" in2="SourceGraphic" operator="in"/></filter>
<radialGradient id="land" cx=".42" cy=".42" r=".8"><stop offset="0" stop-color="#d3d89c"/><stop offset=".6" stop-color="#b4c27a"/><stop offset="1" stop-color="#93a865"/></radialGradient>
<radialGradient id="vig" cx=".5" cy=".5" r=".78"><stop offset=".55" stop-color="rgba(60,40,20,0)"/><stop offset="1" stop-color="rgba(50,32,16,.5)"/></radialGradient>
<linearGradient id="sun" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="rgba(255,236,170,.34)"/><stop offset=".55" stop-color="rgba(255,236,170,0)"/><stop offset="1" stop-color="rgba(40,50,90,.18)"/></linearGradient>
<linearGradient id="sea" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#a9cbd0"/><stop offset=".5" stop-color="#7aa8b8"/><stop offset="1" stop-color="#5f90a6"/></linearGradient>
<linearGradient id="fog" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(238,230,205,.85)"/><stop offset="1" stop-color="rgba(238,230,205,0)"/></linearGradient>
<radialGradient id="dirtO" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#f0e3b4"/><stop offset="1" stop-color="#d3c08a"/></radialGradient>
<radialGradient id="dirtN" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#e2d6a8"/><stop offset="1" stop-color="#bda978"/></radialGradient>
<radialGradient id="dirtE" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#d9c493"/><stop offset="1" stop-color="#a98c5e"/></radialGradient>
<radialGradient id="glow"><stop offset="0" stop-color="rgba(255,170,60,.65)"/><stop offset="1" stop-color="rgba(255,170,60,0)"/></radialGradient>
<marker id="arr" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10Z" fill="#a33b2f"/></marker>
${SYMBOLS}</defs>`;
  const land = blob(800, 450, 960, 560, 21, 22, .06);
  s += `<rect width="1600" height="900" fill="#e6d9b3"/>`;
  // đất liền: viền cát → cỏ, rồi các mảng màu loang
  s += `<g filter="url(#rough)"><path d="${land}" fill="#dccd98" stroke="${INK}" stroke-width="3"/></g>`;
  s += `<g filter="url(#rough)"><path d="${blob(800, 450, 940, 540, 21, 22, .06)}" fill="url(#land)"/></g>`;
  s += `<g opacity=".7" filter="url(#blur30)"><ellipse cx="500" cy="470" rx="200" ry="150" fill="#6f9446"/><ellipse cx="520" cy="270" rx="170" ry="110" fill="#6a8b44"/><ellipse cx="1150" cy="300" rx="190" ry="110" fill="#6f9446"/><ellipse cx="780" cy="640" rx="230" ry="110" fill="#c8cf86"/><ellipse cx="1060" cy="620" rx="150" ry="100" fill="#d4d38d"/><ellipse cx="760" cy="170" rx="160" ry="80" fill="#a2b36c"/><ellipse cx="300" cy="420" rx="140" ry="260" fill="#b0a780"/></g>`;
  s += `<path d="${land}" fill="#fff" filter="url(#wash)" opacity=".55" style="mix-blend-mode:multiply"/><path d="${land}" fill="#fff" filter="url(#mottle)" opacity=".5"/>`;
  s += `<path d="${land}" fill="url(#sun)"/>`;
  // cỏ lác đác
  { const gr = R(77); for (let i = 0; i < 260; i++) { const x = 140 + gr() * 1280, y = 40 + gr() * 830; if (Object.values(TILES).some((t) => Math.hypot(t.p[0] - x, (t.p[1] - y) * 1.6) < 96)) continue; s += tuft(x, y, 1, gr() < .5 ? '#7d9a4c' : '#a2b568'); } }
  // biển (đông nam) có độ sâu và sóng vỗ bờ
  const sea = 'M1600,360 C1520,410 1440,500 1452,590 C1462,680 1400,760 1330,900 L1600,900Z';
  s += `<g filter="url(#rough)"><path d="${sea}" fill="url(#sea)" stroke="${INK}" stroke-width="2.6"/></g><path d="M1600,372 C1526,420 1456,506 1466,590 C1476,676 1416,760 1348,900" stroke="#f7f2dc" stroke-width="5" fill="none" opacity=".75" stroke-dasharray="14 8" stroke-linecap="round"/>`;
  for (let i = 0; i < 22; i++) { const r = R(i + 40), x = 1480 + r() * 110, y = 470 + r() * 410; s += `<path d="M${f1(x)},${f1(y)} q8,-7 16,0 q8,7 16,0" stroke="#fff" stroke-width="2" fill="none" opacity=".7" stroke-linecap="round"/>`; }
  // sông: bờ cát → bờ cỏ → nước sâu → nước nông → ánh
  const river = 'M560,-10 C640,80 700,120 690,190 S640,290 720,350 S900,395 1100,470 S1330,560 1452,596';
  s += `<g filter="url(#rough)"><path d="${river}" stroke="#d6c68f" stroke-width="62" fill="none" stroke-linecap="round"/><path d="${river}" stroke="${INK}" stroke-width="48" fill="none" stroke-linecap="round" opacity=".8"/><path d="${river}" stroke="#5f8da0" stroke-width="42" fill="none" stroke-linecap="round"/><path d="${river}" stroke="#86b0bd" stroke-width="30" fill="none" stroke-linecap="round"/><path d="${river}" stroke="#b9d8dd" stroke-width="14" fill="none" stroke-linecap="round" opacity=".9"/></g>`;
  s += `<path d="${river}" stroke="#fff" stroke-width="2" fill="none" stroke-dasharray="18 26" opacity=".6" stroke-linecap="round" transform="translate(3,-5)"/>`;
  // núi, rừng
  const M = [[300, 230, 1.15, 1], [390, 150, .95, 2], [330, 70, 1.0, 3], [230, 340, .95, 4], [320, 470, 1.0, 5], [250, 590, 1.15, 6], [380, 710, 1.05, 7], [470, 560, .8, 8], [300, 800, 1.0, 9], [480, 60, .8, 10], [1260, 100, .95, 11], [1360, 170, 1.0, 12], [1300, 260, .85, 13]];
  M.sort((a, b) => a[1] - b[1]); for (const [x, y, sc, sd] of M) s += mountain(x, y, sc, sd, sd);
  const rnd = R(5), trees = [];
  for (const [cx, cy, n] of [[520, 465, 22], [520, 290, 22], [1180, 290, 20], [1220, 560, 12], [900, 770, 12], [640, 600, 8], [960, 240, 12], [930, 520, 9], [1330, 340, 8]]) for (let i = 0; i < n; i++) trees.push([cx + (rnd() - .5) * 240, cy + (rnd() - .5) * 130, .75 + rnd() * .5, Math.floor(rnd() * 99)]);
  trees.sort((a, b) => a[1] - b[1]);
  for (const [x, y, sc, sd] of trees) { if (Object.values(TILES).some((t) => Math.hypot(t.p[0] - x, (t.p[1] - y) * 1.5) < 88)) continue; s += tree(x, y, sc, sd); }
  for (const [x, y] of [[880, 700], [1160, 740], [620, 760], [1220, 380], [860, 580]]) s += bamboo(x, y, 1);
  // làng nhỏ ven đường
  for (const [x, y, sc] of [[880, 600, .6], [640, 400, .55], [1120, 540, .55], [900, 260, .55]]) s += house(x, y, sc, '#9f5a3c') + house(x + 26 * sc, y + 10 * sc, sc * .8, '#b0603f');
  // đường đất: bóng viền, mặt đường, vệt bánh xe
  for (const [a, b] of EDGES) { const d = roadPath(P(a), P(b), a * 13 + b); s += `<path d="${d}" stroke="rgba(60,40,20,.35)" stroke-width="17" fill="none" stroke-linecap="round" transform="translate(2,3)"/><path d="${d}" stroke="#8a7646" stroke-width="15" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#efe3b9" stroke-width="10" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#c9b277" stroke-width="1.5" fill="none" stroke-dasharray="1 8" stroke-linecap="round" transform="translate(0,-2)"/><path d="${d}" stroke="#c9b277" stroke-width="1.5" fill="none" stroke-dasharray="1 8" stroke-linecap="round" transform="translate(0,2)"/>`; }
  // đợt tập kích: 012 → 008 → 005 theo đường
  if (showAlert) { const d1 = roadPath(P(12), P(8), 12 * 13 + 8), d2 = roadPath(P(8), P(5), 8 * 13 + 5); s += `<path d="${d1} ${d2.replace(/^M[^Q]*/, '')}" stroke="#a33b2f" stroke-width="6" fill="none" stroke-dasharray="14 9" stroke-linecap="round" marker-end="url(#arr)" opacity=".9"/>`; }
  // địa điểm (vẽ từ trên xuống dưới)
  const order = Object.keys(TILES).sort((a, b) => TILES[a].p[1] - TILES[b].p[1]);
  for (const id of order) {
    const [x, y] = TILES[id].p, st = TILES[id].s;
    if (sel === id) s += `<path d="${blob(x, y + 2, 98, 56, 5, 14, .08)}" fill="rgba(240,207,117,.35)" stroke="#f0cf75" stroke-width="5"/><path d="${blob(x, y + 2, 98, 56, 5, 14, .08)}" fill="none" stroke="${INK}" stroke-width="1.6" stroke-dasharray="8 6"/>`;
    s += settlementArt(id);
    const name = TILES[id].n, kind = st === 'settled' ? 'own' : st === 'open' ? 'open' : 'enemy';
    s += banner(x, y + 54, name, kind);
    if (st === 'settled') s += chip(x, y + 80, 'i-shield', id === 'TIL-001' ? '3' : '2', 'own');
    if (st === 'hostile') { const n = { 'TIL-007': '3', 'TIL-008': '4', 'TIL-009': '4', 'TIL-010': '6', 'TIL-011': '7', 'TIL-012': '9' }[id]; s += chip(x, y + 80, 'i-swords', n ? '≈' + n : '?', 'enemy'); }
  }
  if (showAlert) s += alertBadge(P(5)[0] + 70, P(5)[1] - 52, 2);
  // đội quân đang hành quân 001→005
  if (army) { const [x, y] = [800, 612]; s += `<g transform="translate(${x},${y})"><ellipse cx="4" cy="14" rx="22" ry="5" fill="rgba(60,40,20,.3)"/><use href="#i-banner" x="-14" y="-34" width="34" height="34"/><use href="#i-helm" x="-12" y="-4" width="24" height="24"/></g>` + chip(x + 58, y + 6, 'i-hourglass', '1 lượt', 'own').replace('<use href="#i-hourglass"', '<use color="#2f5d73" href="#i-hourglass"'); }
  // sương mù vùng chưa khám phá (phía bắc) + mây rìa + tối góc
  s += `<rect x="0" y="0" width="1600" height="150" fill="url(#fog)" opacity=".55"/>`;
  s += cloud(1500, 130, 1.5, 3) + cloud(110, 800, 1.7, 4) + cloud(1250, 850, 1.2, 5) + cloud(60, 80, 1.3, 6);
  s += `<rect width="1600" height="900" fill="url(#vig)"/><rect width="1600" height="900" filter="url(#paper)" style="mix-blend-mode:multiply"/></svg>`;
  return s;
}
