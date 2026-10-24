// @ts-nocheck
/* Tranh minh họa cho thẻ sự kiện (CR-003 V2): 8 cảnh SVG tự vẽ, viewBox 760x250, cùng nguồn sáng/bảng màu với bản đồ. */
import { INK2, R, blob, boat, fire, flag, house, palisade, roof, tent, tree } from './art_base';

const f = (n: number) => n.toFixed(1);
const SKY = (id: string, a: string, b: string, c: string) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset=".55" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient>`;
const DEFS = `<radialGradient id="eg-sun"><stop offset="0" stop-color="rgba(255,244,190,.95)"/><stop offset=".35" stop-color="rgba(255,214,120,.5)"/><stop offset="1" stop-color="rgba(255,190,100,0)"/></radialGradient>
<radialGradient id="eg-fire"><stop offset="0" stop-color="rgba(255,160,50,.9)"/><stop offset="1" stop-color="rgba(255,150,40,0)"/></radialGradient>
<linearGradient id="eg-mist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(255,236,200,0)"/><stop offset=".6" stop-color="rgba(255,232,190,.65)"/><stop offset="1" stop-color="rgba(255,232,190,0)"/></linearGradient>
<filter id="eg-soft" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="6"/></filter>`;

function ridge(y0: number, amp: number, seed: number, fill: string, stroke = 'rgba(60,50,60,.35)') {
  const r = R(seed); let d = `M0,${y0}`;
  for (let x = 0; x <= 760; x += 70) d += ` L${x + 35},${f(y0 - amp * (.4 + r() * .6))} L${x + 70},${f(y0 - amp * .15 * r())}`;
  return `<path d="${d} L760,250 L0,250Z" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`;
}
function person(x: number, y: number, s = 1, cloak = '#4a3a52', hat = '#d9b985', flip = 1) {
  return `<g transform="translate(${x},${y}) scale(${s * flip},${s})"><ellipse cx="4" cy="2" rx="12" ry="3" fill="rgba(0,0,0,.28)"/><path d="M-9,2 Q-8,-18 0,-24 Q8,-18 9,2Z" fill="${cloak}" stroke="${INK2}" stroke-width="1.3" stroke-linejoin="round"/><circle cx="0" cy="-27" r="5.5" fill="#c99a6a" stroke="${INK2}" stroke-width="1.2"/><path d="M-11,-29 Q0,-44 11,-29Z" fill="${hat}" stroke="${INK2}" stroke-width="1.2" stroke-linejoin="round"/></g>`;
}
const frame = `<rect width="760" height="250" fill="none" stroke="rgba(40,26,12,.55)" stroke-width="22" opacity=".35" filter="url(#eg-soft)"/>`;
const wrap = (inner: string, skyId: string, sky: string) => `<svg viewBox="0 0 760 250" width="760" height="250" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><defs>${DEFS}${sky}</defs><rect width="760" height="250" fill="url(#${skyId})"/>${inner}${frame}</svg>`;

/* EVT-01: trinh sát trên vách đá nhìn xuống trại địch lúc bình minh */
function scout() {
  const pine = (x: number, y: number, k: number, c: string) => { let g = `<g transform="translate(${x},${y}) scale(${k})"><rect x="-2" y="-8" width="4" height="10" fill="#1f1a14"/>`; for (let i = 0; i < 4; i++) { const w = 20 - i * 4, y0 = -6 - i * 14; g += `<path d="M${-w},${y0} L0,${y0 - 22} L${w},${y0} Q0,${y0 + 5} ${-w},${y0}Z" fill="${c}"/>`; } return g + '</g>'; };
  let s = `<circle cx="470" cy="116" r="120" fill="url(#eg-sun)"/><circle cx="470" cy="116" r="27" fill="#fff0b8"/>`;
  for (let i = 0; i < 14; i++) s += `<path d="M470,116 L${f(470 + Math.cos(i / 14 * 6.283) * 520)},${f(116 + Math.sin(i / 14 * 6.283) * 520)}" stroke="#fff3c4" stroke-width="${i % 2 ? 5 : 10}" opacity=".13"/>`;
  s += ridge(150, 55, 11, '#b8c1c4') + `<rect y="110" width="760" height="40" fill="url(#eg-mist)"/>` + ridge(185, 55, 12, '#8e9fa8') + `<rect y="140" width="760" height="40" fill="url(#eg-mist)" opacity=".8"/>`;
  s += `<path d="M0,176 C120,160 200,186 330,172 C470,158 560,186 760,168 L760,250 L0,250Z" fill="#6f8a5a" stroke="${INK2}" stroke-width="1.6"/><path d="M130,250 C200,214 300,206 360,190 C420,176 450,170 520,174 C440,182 400,196 340,214 C270,232 230,246 220,250Z" fill="#f2d8a0" stroke="${INK2}" stroke-width="1.4"/>`;
  for (const [x, y] of [[300, 188], [336, 184], [372, 190], [330, 196]]) s += `<path d="M${x - 11},${y} L${x},${y - 17} L${x + 11},${y}Z" fill="#8f2d24" stroke="${INK2}" stroke-width="1.2"/>`;
  for (const [x, y] of [[318, 194], [352, 194], [280, 190]]) s += `<circle cx="${x}" cy="${y}" r="13" fill="url(#eg-fire)"/><circle cx="${x}" cy="${y}" r="2.4" fill="#ffe27a"/><path d="M${x},${y - 3} q-5,-12 1,-24 q6,-10 -1,-20" stroke="#6b6458" stroke-width="2" fill="none" opacity=".4"/>`;
  s += `<path d="M0,250 L0,196 C60,188 110,200 170,214 C200,222 230,236 250,250Z" fill="#3f5233" stroke="${INK2}" stroke-width="2"/>${pine(40, 214, 1.5, '#2b3a24')}${pine(96, 220, 1.2, '#33452a')}${pine(150, 236, .95, '#2b3a24')}`;
  s += `<path d="M540,250 L566,168 C590,158 640,160 700,170 L760,176 L760,250Z" fill="#5c4a3a" stroke="${INK2}" stroke-width="2.2" stroke-linejoin="round"/><path d="M566,168 C590,158 640,160 700,170 L690,180 C640,172 596,174 572,184Z" fill="#8f8a52"/>`;
  s += person(640, 170, 1.4, '#2b2230', '#c8ced4') + `<path d="M668,176 L672,106" stroke="${INK2}" stroke-width="3" stroke-linecap="round"/><path d="M672,108 Q688,102 702,112 Q688,116 672,122Z" fill="#a33b2f" stroke="${INK2}" stroke-width="1.6"/>`;
  return wrap(s, 'eg-sk1', SKY('eg-sk1', '#7f9fae', '#f4d8a0', '#e58a54'));
}
/* EVT-02: dân tản cư tới cổng thành lúc hoàng hôn */
function refugees() {
  let s = `<circle cx="190" cy="118" r="100" fill="url(#eg-sun)"/><circle cx="190" cy="118" r="24" fill="#ffe3a0"/>` + ridge(160, 50, 21, '#a58f9c') + `<rect y="120" width="760" height="50" fill="url(#eg-mist)"/>`;
  s += `<path d="M0,172 C150,160 300,184 460,170 C580,160 680,176 760,168 L760,250 L0,250Z" fill="#7d8a52" stroke="${INK2}" stroke-width="1.6"/><path d="M0,226 C160,200 330,206 470,196 C560,190 640,194 760,196 L760,250 L0,250Z" fill="#d6c08a" stroke="${INK2}" stroke-width="1.4"/>`;
  s += `<path d="M520,200 L520,120 L760,120 L760,200Z" fill="#b9ad92" stroke="${INK2}" stroke-width="2"/><path d="M520,120 L760,120" stroke="#e4dabd" stroke-width="5"/><path d="M536,200 V158 Q560,138 584,158 V200Z" fill="#2a1c12" stroke="${INK2}" stroke-width="2"/>`;
  s += `<g transform="translate(640,128)">${roof(46, 36, 0, '#b0603f')}</g><path d="M600,118 h80 v6 h-80z" fill="#6b4a2c"/>`;
  for (const x of [545, 575]) s += `<circle cx="${x}" cy="150" r="9" fill="url(#eg-fire)"/><circle cx="${x}" cy="150" r="3" fill="#ffe27a"/>`;
  s += `<g>${[[60, 214, 1.05], [110, 218, 1.1], [160, 212, .95], [215, 220, 1.1], [270, 213, 1], [335, 219, 1.1], [400, 211, .95], [450, 216, 1.05]].map(([x, y, k], i) => person(x, y, k * 1.15, ['#6a5a46', '#4a5a52', '#6b4a52'][i % 3], '#d9b985') + `<path d="M${x - 14},${y - 34} q10,-10 20,0 l-3,12 h-14z" fill="#b08a58" stroke="${INK2}" stroke-width="1.2"/>`).join('')}</g>`;
  s += tree(30, 190, 1.4, 3) + tree(700, 232, 1.2, 8);
  return wrap(s, 'eg-sk2', SKY('eg-sk2', '#6d5f86', '#e8a27a', '#f4c27a'));
}
/* EVT-03: tin đồn quanh đống lửa ban đêm */
function rumor() {
  const r = R(33); let s = `<circle cx="590" cy="60" r="60" fill="rgba(210,225,255,.25)"/><circle cx="590" cy="60" r="20" fill="#f2f0dc"/><circle cx="582" cy="55" r="20" fill="#202b4a"/>`;
  for (let i = 0; i < 60; i++) s += `<circle cx="${f(r() * 760)}" cy="${f(r() * 130)}" r="${f(.5 + r() * 1.2)}" fill="#fff6d6" opacity="${f(.4 + r() * .6)}"/>`;
  s += ridge(165, 50, 31, '#26304f', 'rgba(10,15,30,.5)') + ridge(190, 40, 32, '#1d2640', 'rgba(10,15,30,.5)');
  s += `<path d="M0,196 C200,184 400,204 760,190 L760,250 L0,250Z" fill="#2a3a30" stroke="${INK2}" stroke-width="1.6"/>`;
  s += tent(120, 205, 1.6, '#7a2a22') + tent(640, 208, 1.5, '#7a2a22') + tree(40, 200, 1.5, 4) + tree(720, 205, 1.4, 6);
  s += `<circle cx="380" cy="214" r="120" fill="url(#eg-fire)" opacity=".55"/>` + fire(380, 226, 2.4);
  s += person(300, 230, 1.5, '#3a2a2a', '#b89868') + person(350, 238, 1.5, '#2a3a4a', '#b89868') + person(450, 236, 1.5, '#4a2a3a', '#b89868', -1) + person(500, 228, 1.4, '#2a4a3a', '#b89868', -1);
  return wrap(s, 'eg-sk3', SKY('eg-sk3', '#0e1428', '#1d2a50', '#33406a'));
}
/* EVT-04: thương nhân qua biên giới (thuyền chở hàng, trạm gác) */
function merchant() {
  let s = `<circle cx="600" cy="70" r="90" fill="url(#eg-sun)"/><circle cx="600" cy="70" r="22" fill="#fff5c8"/>` + ridge(150, 50, 41, '#aab9b0') + `<rect y="110" width="760" height="40" fill="url(#eg-mist)"/>`;
  s += `<path d="M0,160 C200,148 400,168 760,156 L760,250 L0,250Z" fill="#8fae66" stroke="${INK2}" stroke-width="1.6"/><path d="M0,212 C160,190 320,226 470,204 C600,186 700,210 760,200 L760,250 L0,250Z" fill="#6f9fb0" stroke="${INK2}" stroke-width="1.6"/>`;
  for (let i = 0; i < 9; i++) s += `<path d="M${40 + i * 80},${222 + (i % 3) * 8} q8,-6 16,0 q8,6 16,0" stroke="#e8f4f4" stroke-width="2" fill="none" opacity=".8"/>`;
  s += palisade(540, 168, 9, 1.2) + `<g transform="translate(560,160)">${house(40, 0, 1.1)}</g>` + flag(655, 166, '#a33b2f', 1.3) + flag(520, 168, '#2f5d73', 1.1);
  s += `<g transform="translate(250,222) scale(2)">${boat(0, 0, 1)}</g>` + `<g transform="translate(228,206)"><rect x="-12" y="-14" width="14" height="14" fill="#b08a58" stroke="${INK2}" stroke-width="1.3"/><rect x="6" y="-12" width="12" height="12" fill="#c9a24a" stroke="${INK2}" stroke-width="1.3"/></g>`;
  s += person(430, 190, 1.4, '#6b4a2c', '#d9b985') + person(470, 192, 1.3, '#2f5d73', '#d9b985', -1);
  s += tree(60, 196, 1.5, 9) + tree(130, 190, 1.2, 12);
  return wrap(s, 'eg-sk4', SKY('eg-sk4', '#88b4d0', '#f6e6b0', '#f0c88a'));
}
/* EVT-05: kho lương trống, bao rỗng, quạ */
function granary() {
  let s = ridge(150, 40, 51, '#b4b4b0') + `<rect y="110" width="760" height="40" fill="url(#eg-mist)"/>`;
  s += `<path d="M0,168 C200,156 400,178 760,162 L760,250 L0,250Z" fill="#8a8a5a" stroke="${INK2}" stroke-width="1.6"/><path d="M0,214 C240,196 480,222 760,204 L760,250 L0,250Z" fill="#b8a678" stroke="${INK2}" stroke-width="1.4"/>`;
  s += `<g transform="translate(380,190)"><ellipse cx="14" cy="6" rx="160" ry="14" fill="rgba(40,30,15,.28)"/><path d="M-110,0 V-62 H110 V0Z" fill="#c9b27a" stroke="${INK2}" stroke-width="2"/><path d="M20,0 V-62 H110 V0Z" fill="#a89460"/><path d="M-110,-62 v62 M-60,-62 v62 M-10,-62 v62 M40,-62 v62 M90,-62 v62" stroke="#6b4a2c" stroke-width="3"/><path d="M-40,0 V-46 H20 V0Z" fill="#2a1c12" stroke="${INK2}" stroke-width="2"/>${roof(130, 56, -58, '#a2543a')}</g>`;
  for (const [x, y, k] of [[250, 224, 1], [300, 232, .9], [520, 228, 1.05]]) s += `<g transform="translate(${x},${y}) scale(${k})"><path d="M-14,2 Q-18,-16 -6,-24 Q4,-28 12,-22 Q20,-12 14,2Z" fill="#d9c9a0" stroke="${INK2}" stroke-width="1.4" stroke-linejoin="round"/><path d="M-8,-22 q8,-6 16,0" stroke="${INK2}" stroke-width="1.4" fill="none"/></g>`;
  const r = R(7); for (let i = 0; i < 26; i++) s += `<ellipse cx="${f(230 + r() * 300)}" cy="${f(232 + r() * 12)}" rx="2.4" ry="1.4" fill="#e0c060" opacity=".9"/>`;
  for (const [x, y] of [[180, 70], [230, 50], [560, 80], [610, 56]]) s += `<path d="M${x},${y} q10,-10 20,0 q10,-10 20,0" stroke="#1d1814" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  s += person(150, 232, 1.5, '#5a4a3a', '#d9b985') + person(640, 236, 1.4, '#4a3a4a', '#d9b985', -1);
  return wrap(s, 'eg-sk5', SKY('eg-sk5', '#a8b2b6', '#d8d8c8', '#e6dcb8'));
}
/* EVT-06: lò rèn, đe, tia lửa, giá kiếm */
function forge() {
  let s = `<rect y="0" width="760" height="250" fill="#2a1a14"/><path d="M0,80 H760 M0,160 H760" stroke="#3a261c" stroke-width="3"/>`;
  for (let i = 0; i < 9; i++) s += `<path d="M${i * 90},0 V250" stroke="#33211a" stroke-width="6"/>`;
  s += `<path d="M140,250 V130 Q140,70 220,70 Q300,70 300,130 V250Z" fill="#4a3a34" stroke="${INK2}" stroke-width="3"/><path d="M168,250 V140 Q168,102 220,102 Q272,102 272,140 V250Z" fill="#1b0f0a"/><ellipse cx="220" cy="170" rx="90" ry="70" fill="url(#eg-fire)"/><path d="M190,250 Q184,196 208,176 Q214,206 232,190 Q250,214 246,250Z" fill="#f0842a"/><path d="M204,250 Q200,214 218,200 Q232,222 236,250Z" fill="#ffd25a"/>`;
  s += `<path d="M420,214 H560 L548,196 H432Z" fill="#2c2c32" stroke="${INK2}" stroke-width="2"/><path d="M436,196 V176 H560 L590,186 L560,196Z" fill="#4a4a54" stroke="${INK2}" stroke-width="2"/><path d="M430,214 V232 H550 V214Z" fill="#1d1d22"/>`;
  const r = R(9); for (let i = 0; i < 28; i++) s += `<circle cx="${f(500 + (r() - .5) * 90)}" cy="${f(170 - r() * 90)}" r="${f(.8 + r() * 1.8)}" fill="${r() < .5 ? '#ffd25a' : '#ff8a3a'}" opacity="${f(.5 + r() * .5)}"/>`;
  s += `<path d="M640,40 V200" stroke="${INK2}" stroke-width="5"/><path d="M600,70 H720 M600,120 H720" stroke="#6b4a2c" stroke-width="5"/>`;
  for (let i = 0; i < 3; i++) s += `<path d="M${620 + i * 36},${66 - 2} l0,-46 M${620 + i * 36},${118} l0,-46" stroke="#c8ced4" stroke-width="5" stroke-linecap="round"/><path d="M${612 + i * 36},${72} h16" stroke="#6b4a2c" stroke-width="4"/>`;
  s += `<g transform="translate(500,176) rotate(-28)"><rect x="-4" y="-46" width="8" height="46" fill="#7a5230" stroke="${INK2}" stroke-width="1.5"/><rect x="-16" y="-62" width="32" height="16" fill="#9aa2aa" stroke="${INK2}" stroke-width="2"/></g>`;
  s += person(370, 236, 1.7, '#5a3226', '#b89868');
  return wrap(s, 'eg-sk6', SKY('eg-sk6', '#1a0f0a', '#2a1a14', '#3a241a'));
}
/* EVT-07: tuyến sông chuẩn bị: cọc ngầm, thuyền, lũy bờ */
function river() {
  let s = `<circle cx="150" cy="96" r="110" fill="url(#eg-sun)"/><circle cx="150" cy="96" r="24" fill="#fff0c0"/>` + ridge(130, 50, 71, '#b6c2c8') + `<rect y="100" width="760" height="40" fill="url(#eg-mist)"/>`;
  s += `<path d="M0,150 C200,140 500,156 760,146 L760,176 L0,184Z" fill="#7d9a5a" stroke="${INK2}" stroke-width="1.6"/><path d="M0,180 C240,168 480,190 760,172 L760,250 L0,250Z" fill="#6fa0b4" stroke="${INK2}" stroke-width="1.8"/><path d="M0,200 C240,188 480,210 760,192 L760,250 L0,250Z" fill="#5a8fa6" opacity=".7"/>`;
  for (let i = 0; i < 14; i++) s += `<path d="M${20 + i * 54},${208 + (i % 4) * 9} q8,-6 16,0 q8,6 16,0" stroke="#e8f4f4" stroke-width="2" fill="none" opacity=".75"/>`;
  for (let i = 0; i < 16; i++) { const x = 60 + i * 42, y = 200 + Math.sin(i) * 8; s += `<path d="M${x},${y + 24} L${x - 2},${y - 10} L${x + 3},${y - 14}" stroke="${INK2}" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M${x},${y + 24} L${x - 2},${y - 10}" stroke="#9b7a4b" stroke-width="3" fill="none" stroke-linecap="round"/>`; }
  s += palisade(40, 152, 12, 1.1) + palisade(560, 150, 10, 1.1) + flag(130, 150, '#2f5d73', 1.2) + flag(640, 148, '#2f5d73', 1.2);
  s += `<g transform="translate(330,238) scale(1.7)">${boat(0, 0, 1)}</g>` + `<g transform="translate(470,232) scale(1.5)">${boat(0, 0, 1)}</g>`;
  s += person(300, 150, 1.2, '#3a4a5a', '#c8ced4') + person(340, 152, 1.2, '#3a4a5a', '#c8ced4');
  return wrap(s, 'eg-sk7', SKY('eg-sk7', '#9fb8c4', '#f4dcae', '#f0c890'));
}
/* EVT-08: sứ giả cầm cờ trắng tiến về trại */
function envoy() {
  let s = `<circle cx="380" cy="100" r="120" fill="url(#eg-sun)"/><circle cx="380" cy="100" r="26" fill="#fff4c4"/>` + ridge(150, 55, 81, '#b9c3c6') + `<rect y="110" width="760" height="40" fill="url(#eg-mist)"/>`;
  s += `<path d="M0,168 C200,156 480,180 760,164 L760,250 L0,250Z" fill="#7e9a58" stroke="${INK2}" stroke-width="1.6"/><path d="M80,250 C240,214 360,200 470,188 C560,178 640,180 760,184 L760,250Z" fill="#e0cc98" stroke="${INK2}" stroke-width="1.4"/>`;
  s += tent(560, 190, 1.9, '#a33b2f') + tent(660, 196, 1.5, '#a33b2f') + palisade(520, 196, 12, 1.2) + flag(610, 158, '#a33b2f', 1.5) + fire(500, 206, 1.4);
  s += person(600, 226, 1.4, '#7a2a22', '#8a6338', -1) + person(640, 228, 1.4, '#7a2a22', '#8a6338', -1);
  s += person(250, 232, 2.0, '#efe6cc', '#c8ced4') + `<path d="M278,232 L282,128" stroke="${INK2}" stroke-width="3.4" stroke-linecap="round"/><path d="M282,130 Q312,120 340,136 Q312,146 282,156Z" fill="#fbf6e4" stroke="${INK2}" stroke-width="1.8" stroke-linejoin="round"/>`;
  s += person(180, 234, 1.6, '#3a4a5a', '#c8ced4');
  s += tree(60, 200, 1.5, 5) + tree(720, 232, 1.3, 7);
  return wrap(s, 'eg-sk8', SKY('eg-sk8', '#86b0c8', '#f6e4b0', '#f0c88a'));
}

const SCENES: Record<string, () => string> = { 'EVT-01': scout, 'EVT-02': refugees, 'EVT-03': rumor, 'EVT-04': merchant, 'EVT-05': granary, 'EVT-06': forge, 'EVT-07': river, 'EVT-08': envoy };
export function eventArtSvg(id: string): string { return (SCENES[id] ?? scout)(); }
