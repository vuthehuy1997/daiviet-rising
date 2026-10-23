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

/* ---------- vật thể trên bản đồ ---------- */
function tree(x, y, s = 1, seed = 1) {
  const r = R(seed), c = ['#6f8f4e', '#5f8244', '#7b9a55'][Math.floor(r() * 3)];
  return `<g transform="translate(${x},${y}) scale(${s})"><ellipse cx="0" cy="2" rx="13" ry="4" fill="rgba(60,40,20,.2)"/><rect x="-2" y="-8" width="4" height="10" fill="#6b4a2c" stroke="${INK}" stroke-width="1.2"/><path d="${blob(0, -18, 13, 12, seed, 9, .12)}" fill="${c}" stroke="${INK}" stroke-width="1.6"/><path d="${blob(-4, -22, 6, 5, seed + 3, 7, .1)}" fill="rgba(255,255,230,.3)"/></g>`;
}
function bamboo(x, y, s = 1) {
  let g = `<g transform="translate(${x},${y}) scale(${s})">`;
  for (let i = -2; i <= 2; i++) g += `<path d="M${i * 6},0 Q${i * 6 + i * 2},-26 ${i * 8},-46" stroke="#7a9a4a" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M${i * 8},-46 l8,-4 M${i * 8},-38 l-8,-3 M${i * 7},-30 l7,-3" stroke="#5f8244" stroke-width="2" stroke-linecap="round"/>`;
  return g + `<path d="M-16,2 h32" stroke="${INK}" stroke-width="1.2" opacity=".5"/></g>`;
}
function mountain(x, y, s = 1, seed = 1, tone = 0) {
  const base = ['#cdc2a6', '#c2b79c', '#d4cab0'][tone % 3], shade = ['#a89c82', '#9d9179', '#b0a58b'][tone % 3];
  let h = '';
  const r = R(seed); for (let i = 0; i < 5; i++) { const hx = 36 + i * 7 + r() * 4, hy = -30 + i * 8; h += `M${hx},${hy} l-6,10 `; }
  return `<g transform="translate(${x},${y}) scale(${s})"><ellipse cx="4" cy="2" rx="80" ry="8" fill="rgba(60,40,20,.18)"/><path d="M-70,0 L-18,-70 L8,-48 L30,-84 L78,0Z" fill="${base}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/><path d="M30,-84 L78,0 L22,0 L18,-40Z" fill="${shade}"/><path d="M-18,-70 L-8,-34 L-30,0 L-70,0Z" fill="rgba(255,255,255,.28)"/><path d="${h}" stroke="${INK}" stroke-width="1.1" opacity=".55" fill="none" stroke-linecap="round"/><path d="M-30,-48 l8,12 M-44,-30 l6,10" stroke="${INK}" stroke-width="1" opacity=".5"/></g>`;
}
function house(x, y, s = 1, tint = '#a2543a') {
  return `<g transform="translate(${x},${y}) scale(${s})"><ellipse cx="0" cy="3" rx="22" ry="5" fill="rgba(60,40,20,.22)"/><rect x="-13" y="-16" width="26" height="18" fill="#f2e6c4" stroke="${INK}" stroke-width="1.6"/><rect x="-4" y="-9" width="8" height="11" fill="#6b4a2c" stroke="${INK}" stroke-width="1.2"/><path d="M-23,-13 Q-16,-15 -12,-25 L0,-33 L12,-25 Q16,-15 23,-13 Q8,-11 0,-11 Q-8,-11 -23,-13Z" fill="${tint}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/><path d="M-8,-27 L8,-27" stroke="#e8c27a" stroke-width="1.6"/></g>`;
}
function tower(x, y, s = 1) {
  return `<g transform="translate(${x},${y}) scale(${s})"><ellipse cx="0" cy="3" rx="16" ry="4" fill="rgba(60,40,20,.22)"/><path d="M-10,0 L-7,-30 M10,0 L7,-30 M-9,-12 L9,-22 M9,-12 L-9,-22" stroke="#6b4a2c" stroke-width="2.6" fill="none"/><rect x="-12" y="-36" width="24" height="8" fill="#9b7a4b" stroke="${INK}" stroke-width="1.6"/><path d="M-14,-36 L0,-52 L14,-36Z" fill="#a2543a" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/></g>`;
}
function field(x, y, s = 1, gold = false) {
  const a = gold ? '#d9c25a' : '#9fbd62', b = gold ? '#c4ab45' : '#86a64f';
  let g = `<g transform="translate(${x},${y}) scale(${s})"><path d="M0,-16 L30,0 L0,16 L-30,0Z" fill="${a}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>`;
  for (let i = -3; i <= 3; i++) g += `<path d="M${i * 7},${-14 + Math.abs(i) * 2} L${i * 7 + 14},${-6 + Math.abs(i)}" stroke="${b}" stroke-width="2" opacity=".0"/>`;
  for (let i = -2; i <= 2; i++) g += `<path d="M${-24 + i * 4},${i * 2.2 - 6} L${6 + i * 4},${i * 2.2 + 8}" stroke="${b}" stroke-width="2.2"/>`;
  return g + '</g>';
}
function palisade(x, y, n = 6, s = 1) {
  let g = `<g transform="translate(${x},${y}) scale(${s})">`;
  for (let i = 0; i < n; i++) g += `<path d="M${i * 7},0 l0,-15 l3.5,-6 l3.5,6 l0,15z" fill="#9b7a4b" stroke="${INK}" stroke-width="1.3" stroke-linejoin="round"/>`;
  return g + '</g>';
}
function flag(x, y, color = '#2f5d73', s = 1) {
  return `<g transform="translate(${x},${y}) scale(${s})"><path d="M0,0 L0,-46" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/><path d="M1,-46 Q14,-52 26,-44 Q14,-40 1,-34Z" fill="${color}" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/></g>`;
}
function tent(x, y, s = 1, c = '#a33b2f') {
  return `<g transform="translate(${x},${y}) scale(${s})"><ellipse cx="0" cy="3" rx="22" ry="5" fill="rgba(60,40,20,.22)"/><path d="M-20,2 L0,-32 L20,2Z" fill="${c}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><path d="M0,-32 L-3,2 M0,-32 L4,2" stroke="${INK}" stroke-width="1.2" opacity=".6"/><path d="M-4,2 L0,-12 L4,2Z" fill="#2b1c0e"/></g>`;
}
function fire(x, y, s = 1) {
  return `<g transform="translate(${x},${y}) scale(${s})"><path d="M-12,2 L12,-2 M-12,-2 L12,2" stroke="#6b4a2c" stroke-width="4" stroke-linecap="round"/><path d="M0,-4 Q-12,-14 -4,-26 Q-2,-18 3,-22 Q10,-12 0,-4Z" fill="#e8742a" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/><path d="M0,-4 Q-5,-10 -1,-16 Q4,-11 0,-4Z" fill="#f6d35a"/></g>`;
}
function dock(x, y, s = 1) {
  return `<g transform="translate(${x},${y}) scale(${s})"><path d="M-26,0 L26,-12" stroke="#6b4a2c" stroke-width="9" stroke-linecap="round"/><path d="M-26,0 L26,-12" stroke="#a98456" stroke-width="5" stroke-linecap="round"/><path d="M-18,6 v-10 M0,0 v-10 M18,-6 v-10" stroke="${INK}" stroke-width="2.4"/></g>`;
}
function boat(x, y, s = 1) {
  return `<g transform="translate(${x},${y}) scale(${s})"><path d="M-22,0 Q0,12 22,0 L16,-6 L-16,-6Z" fill="#8a6338" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/><path d="M0,-6 L0,-26 L14,-10Z" fill="#efe2c0" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/></g>`;
}
function cloud(x, y, s = 1, seed = 1) {
  const r = R(seed); let g = `<g transform="translate(${x},${y}) scale(${s})" opacity=".92">`;
  const parts = [[0, 0, 44, 26], [-40, 8, 32, 20], [42, 10, 36, 22], [10, -16, 30, 20]];
  for (const [cx, cy, rx, ry] of parts) g += `<path d="${blob(cx, cy, rx, ry, Math.floor(r() * 999), 10, .08)}" fill="#fbf6e6" stroke="#8d8368" stroke-width="1.6"/>`;
  for (const [cx, cy, rx, ry] of parts) g += `<path d="${blob(cx, cy, rx - 3, ry - 3, Math.floor(r() * 999), 10, .08)}" fill="#fbf6e6"/>`;
  return g + `<path d="M-20,-4 q10,-8 22,-2 M-4,10 q12,-6 24,0" stroke="#b9ae92" stroke-width="1.6" fill="none" stroke-linecap="round"/></g>`;
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

function settlementArt(id, mode) {
  const [x, y] = TILES[id].p, st = TILES[id].s;
  let g = `<path d="${blob(x, y + 2, 78, 40, Number(id.slice(4)) * 7, 14, .1)}" fill="${st === 'hostile' ? '#d7c39a' : '#e6d7a6'}" stroke="${INK}" stroke-width="2" opacity=".96"/>`;
  if (st === 'settled') {
    if (id === 'TIL-001') g += field(x - 52, y + 6, 1, false) + field(x + 54, y + 10, 1, true) + house(x - 18, y - 4, 1.15) + house(x + 18, y + 4, 1) + tower(x + 2, y - 14, .95) + palisade(x - 30, y + 24, 8, .9) + flag(x - 2, y - 26, '#2f5d73', .9);
    else g += field(x - 44, y + 8, .9) + house(x + 4, y - 2, 1.05) + palisade(x - 26, y + 22, 7, .9) + flag(x + 26, y - 6, '#2f5d73', .8);
  } else if (st === 'open') {
    g += `<path d="M${x - 34},${y + 6} q34,-14 68,0" stroke="${INK}" stroke-width="1.6" fill="none" stroke-dasharray="3 5" opacity=".6"/><path d="M${x - 8},${y - 6} h16 M${x},${y - 14} v16" stroke="#c0762b" stroke-width="3" stroke-linecap="round" opacity=".85"/>`;
    if (TILES[id].t === 'rung') g += tree(x - 40, y + 12, 1, 5) + tree(x + 38, y + 14, .9, 8) + tree(x + 10, y + 22, .8, 11);
    if (TILES[id].t === 'ven_bien') g += boat(x + 44, y + 14, .9);
    if (TILES[id].t === 'nui') g += mountain(x - 40, y + 20, .5, 3, 1);
  } else { // địch
    const n = { 'TIL-007': 2, 'TIL-008': 2, 'TIL-009': 2, 'TIL-010': 3, 'TIL-011': 3, 'TIL-012': 4 }[id] || 2;
    g += fire(x + 32, y + 12, 1);
    for (let i = 0; i < n; i++) g += tent(x - 44 + i * 30, y + 8 - (i % 2) * 8, 1);
    g += flag(x - 4, y - 14, '#a33b2f', .95) + palisade(x - 34, y + 26, 8, .85);
    if (id === 'TIL-007' || id === 'TIL-010') g += dock(x - 62, y + 14, .8);
  }
  return g;
}

function mapSvg({ viewBox = '0 0 1600 900', sel = null, showAlert = true, w = 1600, h = 900, army = true, hideRibbon = false } = {}) {
  const P = (n) => TILES[id3(n)].p;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${viewBox}" preserveAspectRatio="xMidYMid slice" font-family="Be Vietnam Pro,sans-serif"><defs>
<filter id="rough" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="5"/></filter>
<filter id="paper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" seed="7"/><feColorMatrix values="0 0 0 0 .35  0 0 0 0 .26  0 0 0 0 .14  0 0 0 .22 0"/></filter>
<filter id="wash" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".012" numOctaves="3" seed="11" result="t"/><feColorMatrix in="t" values="0 0 0 0 .45  0 0 0 0 .5  0 0 0 0 .25  0 0 0 .6 -.1" result="c"/><feComposite in="c" in2="SourceGraphic" operator="in"/></filter>
<radialGradient id="land" cx=".45" cy=".5" r=".75"><stop offset="0" stop-color="#cfd49b"/><stop offset=".7" stop-color="#b9c37f"/><stop offset="1" stop-color="#a7b574"/></radialGradient>
<radialGradient id="vig" cx=".5" cy=".5" r=".75"><stop offset=".6" stop-color="rgba(60,40,20,0)"/><stop offset="1" stop-color="rgba(60,40,20,.38)"/></radialGradient>
<marker id="arr" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10Z" fill="#a33b2f"/></marker>
${SYMBOLS}</defs>`;
  s += `<rect width="1600" height="900" fill="#e6d9b3"/>`;
  s += `<g filter="url(#rough)"><path d="${blob(800, 450, 960, 560, 21, 22, .06)}" fill="url(#land)" stroke="${INK}" stroke-width="3"/></g>`;
  s += `<rect width="1600" height="900" filter="url(#wash)" opacity=".5"/>`;
  // biển (đông nam)
  s += `<g filter="url(#rough)"><path d="M1600,360 C1520,410 1440,500 1452,590 C1462,680 1400,760 1330,900 L1600,900Z" fill="#9dbcc2" stroke="${INK}" stroke-width="2.6"/></g>`;
  for (let i = 0; i < 16; i++) { const r = R(i + 40), x = 1440 + r() * 150, y = 560 + r() * 320; s += `<path d="M${f1(x)},${f1(y)} q8,-7 16,0 q8,7 16,0" stroke="#fff" stroke-width="2" fill="none" opacity=".75" stroke-linecap="round"/>`; }
  // sông
  const river = 'M560,-10 C640,80 700,120 690,190 S640,290 720,350 S900,395 1100,470 S1330,560 1452,596';
  s += `<g filter="url(#rough)"><path d="${river}" stroke="${INK}" stroke-width="40" fill="none" stroke-linecap="round" opacity=".85"/><path d="${river}" stroke="#7fa7b4" stroke-width="34" fill="none" stroke-linecap="round"/><path d="${river}" stroke="#a9c9d0" stroke-width="20" fill="none" stroke-linecap="round" opacity=".85"/></g>`;
  for (let i = 0; i < 14; i++) { const r = R(i + 90), t = r(); s += `<path d="M${f1(620 + t * 600)},${f1(150 + t * 330)} q6,-5 12,0 q6,5 12,0" stroke="#fff" stroke-width="1.8" fill="none" opacity=".7" stroke-linecap="round" transform="translate(${f1((r() - .5) * 60)},${f1((r() - .5) * 30)})"/>`; }
  // núi, rừng
  const M = [[300, 230, 1.2, 1], [380, 170, 1.0, 2], [330, 80, 1.1, 3], [250, 330, .9, 4], [330, 460, 1.0, 5], [260, 580, 1.2, 6], [380, 700, 1.1, 7], [450, 560, .9, 8], [310, 780, 1.0, 9], [470, 60, .8, 10], [1250, 90, .9, 11], [1340, 160, 1.0, 12], [1290, 250, .8, 13]];
  M.sort((a, b) => a[1] - b[1]); for (const [x, y, sc, sd] of M) s += mountain(x, y, sc, sd, sd);
  const rnd = R(5);
  const trees = []; for (const [cx, cy, n] of [[520, 465, 16], [520, 290, 16], [1180, 290, 14], [1220, 560, 9], [900, 770, 8], [640, 600, 6], [960, 240, 8], [930, 520, 6]]) for (let i = 0; i < n; i++) trees.push([cx + (rnd() - .5) * 220, cy + (rnd() - .5) * 120, .75 + rnd() * .5, Math.floor(rnd() * 99)]);
  trees.sort((a, b) => a[1] - b[1]);
  for (const [x, y, sc, sd] of trees) { if (Object.values(TILES).some((t) => Math.hypot(t.p[0] - x, t.p[1] - y) < 62)) continue; s += tree(x, y, sc, sd); }
  for (const [x, y] of [[880, 700], [1160, 740], [620, 760], [1220, 380]]) s += bamboo(x, y, 1);
  // đường
  for (const [a, b] of EDGES) { const d = roadPath(P(a), P(b), a * 13 + b); s += `<path d="${d}" stroke="#7d6a42" stroke-width="15" fill="none" stroke-linecap="round" opacity=".75"/><path d="${d}" stroke="#ecdfb4" stroke-width="10" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#bfa86a" stroke-width="1.6" fill="none" stroke-dasharray="1 9" stroke-linecap="round"/>`; }
  // đợt tập kích: từ 012 → 008 → 005 theo đường
  if (showAlert) { const d1 = roadPath(P(12), P(8), 12 * 13 + 8), d2 = roadPath(P(8), P(5), 8 * 13 + 5); s += `<path d="${d1} ${d2.replace(/^M[^Q]*/, '')}" stroke="#a33b2f" stroke-width="6" fill="none" stroke-dasharray="14 9" stroke-linecap="round" marker-end="url(#arr)" opacity=".9"/>`; }
  // địa điểm (vẽ từ trên xuống dưới)
  const order = Object.keys(TILES).sort((a, b) => TILES[a].p[1] - TILES[b].p[1]);
  for (const id of order) {
    const [x, y] = TILES[id].p, st = TILES[id].s;
    if (sel === id) s += `<path d="${blob(x, y + 2, 92, 52, 5, 14, .08)}" fill="rgba(240,207,117,.35)" stroke="#f0cf75" stroke-width="5"/><path d="${blob(x, y + 2, 92, 52, 5, 14, .08)}" fill="none" stroke="${INK}" stroke-width="1.6" stroke-dasharray="8 6"/>`;
    s += settlementArt(id);
    const name = TILES[id].n, kind = st === 'settled' ? 'own' : st === 'open' ? 'open' : 'enemy';
    s += banner(x, y + 54, name, kind);
    if (st === 'settled') s += chip(x, y + 80, 'i-shield', id === 'TIL-001' ? '3' : '2', 'own');
    if (st === 'hostile') s += chip(x, y + 80, 'i-swords', { 'TIL-007': '3', 'TIL-008': '4', 'TIL-009': '4', 'TIL-010': '6', 'TIL-011': '7', 'TIL-012': '9' }[id] ? '≈' + { 'TIL-007': '3', 'TIL-008': '4', 'TIL-009': '4', 'TIL-010': '6', 'TIL-011': '7', 'TIL-012': '9' }[id] : '?', 'enemy');
  }
  if (showAlert) s += alertBadge(P(5)[0] + 70, P(5)[1] - 52, 2);
  // đội quân đang hành quân 001→005
  if (army) { const [x, y] = [800, 612]; s += `<g transform="translate(${x},${y})"><ellipse cx="0" cy="12" rx="20" ry="5" fill="rgba(60,40,20,.25)"/><use href="#i-banner" x="-14" y="-34" width="34" height="34"/><use href="#i-helm" x="-12" y="-4" width="24" height="24"/></g>` + chip(x + 58, y + 6, 'i-hourglass', '1 lượt', 'own').replace('<use href="#i-hourglass"', '<use color="#2f5d73" href="#i-hourglass"'); }
  // mây rìa
  s += cloud(1500, 140, 1.5, 3) + cloud(110, 820, 1.7, 4) + cloud(1250, 860, 1.2, 5) + cloud(60, 90, 1.3, 6);
  s += `<rect width="1600" height="900" fill="url(#vig)"/><rect width="1600" height="900" filter="url(#paper)" style="mix-blend-mode:multiply"/></svg>`;
  return s;
}
