import { loadData } from '../sim/data';
import { garrisonCap, intelLevel, mobileSupplyUsed, raidIntel, supplyCap, warnLead, fortBonus } from '../sim/derived';
import { canChoose, describeEffects, effectTones, eventById } from '../sim/events';
import { shortestPath } from '../sim/graph';
import type { BattleReport, Counts, GameData, TileRT } from '../sim/types';
import { Controller } from './controller';
import { SYMBOLS, alertBadge, banner, chip, endDisc, settlementSvg } from './art';
import { eventArtSvg } from './eventart';
import bgUrl from './assets/map_bg.webp';
import roadsRaw from './assets/roads.json';
import './style.css';

const SVGNS = 'http://www.w3.org/2000/svg';
type Child = Node | string | null | undefined | false;

function h<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, any> = {}, ...kids: Child[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === false) continue;
    if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'class') el.className = v;
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of kids) if (c) el.append(c);
  return el;
}
function s(tag: string, attrs: Record<string, any> = {}, ...kids: Child[]): SVGElement {
  const el = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k.startsWith('on')) el.addEventListener(k.slice(2), v); else el.setAttribute(k, String(v));
  }
  for (const c of kids) if (c) el.append(c);
  return el;
}

const TERRAIN_VI: Record<string, string> = { dong_bang: 'đồng bằng', song: 'sông', nui: 'núi', ven_bien: 'ven biển', rung: 'rừng' };
const STATUS_VI: Record<string, string> = { hostile: 'địch chiếm', open: 'đất trống', settled: 'khu định cư', lost: 'đã mất' };
const INTEL_VI: Record<string, string> = { exact: 'chính xác', estimate: 'ước lượng', vague: 'mơ hồ' };
const CLASS_VI: Record<string, string> = { bo_binh: 'bộ binh', cung_no: 'cung nỏ', dan_binh: 'dân binh', thuy_binh: 'thủy binh' };
const viText = (t: string) => t.replace(/\b(bo_binh|cung_no|dan_binh|thuy_binh)\b/g, (m) => CLASS_VI[m]);
const RES_VI: Record<string, string> = { grain: 'Lương', wood: 'Gỗ-tre', stone: 'Đá', iron: 'Sắt', dantam: 'Dân tâm' };

const d: GameData = loadData();
const ctl = new Controller(d);
ctl.loadAutosave();

let selTile: string | null = null;
let selArmy: string | null = null;
let msg = '';
let reportQueue: BattleReport[] = [];

const root = document.getElementById('app')!;
const countsText = (c: Counts) => Object.entries(c).filter(([, n]) => n > 0).map(([u, n]) => `${n} ${d.units[u].name_vi}`).join(', ') || '—';
const costText = (c: Record<string, number | undefined>) => Object.entries(c).map(([k, v]) => `${v} ${RES_VI[k]}`).join(', ');

function act(cmd: Parameters<Controller['dispatch']>[0]) { msg = ctl.dispatch(cmd) ?? ''; render(); }

function travelInfo(armyId: string, target: string): { turns: number } | null {
  const st = ctl.state;
  const a = st.armies.find((x) => x.id === armyId);
  if (!a || a.move) return null;
  const p = shortestPath(d, st, a.tile, target, (id) => st.tiles[id].status === 'settled' || st.tiles[id].status === 'open');
  if (!p) return null;
  const sp = Math.min(...Object.keys(a.units).map((u) => d.units[u].speed).filter((v) => v > 0));
  return { turns: Math.max(1, Math.ceil(p.cost / sp)) };
}

const ic = (id: string, cls = 'ic') => s('svg', { class: cls, 'aria-hidden': 'true', focusable: 'false' }, s('use', { href: `#${id}` }));

/* ---------- HUD ---------- */
const RES_ICON: Record<string, string> = { grain: 'i-grain', wood: 'i-wood', stone: 'i-stone', iron: 'i-iron', dantam: 'i-lotus' };
function titleBanner() {
  const st = ctl.state;
  return h('header', { class: 'title' }, h('h1', {}, h('span', { class: 't1' }, d.campaign.name_vi),
    h('span', { class: 't2' }, `Dai Viet Rising · 1075–1077 · Lượt ${Math.min(st.turn, d.campaign.rules.deadline_turn)}/${d.campaign.rules.deadline_turn}`)));
}
function resPill() {
  const st = ctl.state;
  const item = (k: keyof typeof RES_VI, v: string | number) => h('span', { class: 'rv', 'data-res': k, title: RES_VI[k] }, ic(RES_ICON[k]), h('b', {}, String(v)), h('span', { class: 'vh' }, RES_VI[k]));
  return h('div', { class: 'res respill parch', role: 'group', 'aria-label': 'Tài nguyên' },
    ...(['grain', 'wood', 'stone', 'iron', 'dantam'] as const).map((k) => item(k, st.res[k])),
    h('i', { class: 'sep' }),
    h('span', { class: 'rv', 'data-res': 'supply', title: 'Quân cơ động / trần' }, ic('i-helm'), h('b', {}, `${mobileSupplyUsed(d, st)}/${supplyCap(d, st)}`), h('span', { class: 'vh' }, 'Quân')));
}

let objOpen = typeof window === 'undefined' || (window.innerWidth > 1500 && window.innerHeight > 700); // màn nhỏ: thu gọn để không che bản đồ
function objective() {
  const st = ctl.state, r = d.campaign.rules;
  const settled = Object.values(st.tiles).filter((t) => t.status === 'settled').length;
  const rows: [string, string, boolean][] = [
    ['Chặn đợt tập kích', `${st.repelled}/${r.negotiate_min_repelled}`, st.repelled >= r.negotiate_min_repelled],
    [`Giữ ≥${r.negotiate_min_settled} khu định cư`, `${settled}/${r.negotiate_min_settled}`, settled >= r.negotiate_min_settled],
    [`Dân tâm ≥${r.negotiate_min_dantam}`, `${st.res.dantam}/${r.negotiate_min_dantam}`, st.res.dantam >= r.negotiate_min_dantam],
    ['Thời hạn chiến dịch', `${Math.min(st.turn, r.deadline_turn)}/${r.deadline_turn}`, st.turn >= r.negotiate_from_turn],
  ];
  const met = rows.slice(0, 3).filter((x) => x[2]).length;
  const card = h('section', { class: 'obj parch', 'aria-label': 'Mục tiêu' },
    h('div', { class: 'obj-h' }, h('button', { 'aria-expanded': objOpen, 'aria-controls': objOpen ? 'obj-body' : undefined, onclick: () => { objOpen = !objOpen; render(); } },
      h('span', {}, 'Mục tiêu'), h('span', { class: 'muted' }, objOpen ? '▾' : `${met}/3 ▸`))));
  if (objOpen) card.append(h('div', { id: 'obj-body' },
    ...rows.map(([t, v, ok]) => h('div', { class: `obj-r${ok ? ' ok' : ''}` }, h('span', { class: 'd' }, ok ? '✔' : '◆'), h('span', { class: 't' }, t), h('b', {}, v))),
    h('p', { class: 'obj-n' }, `Giảng hòa mở từ lượt ${r.negotiate_from_turn} khi đủ cả ba điều kiện trên (nút “Kế sách”).`)));
  return card;
}

function alerts() {
  const st = ctl.state, lead = warnLead(d, st);
  const box = h('div', { class: 'alerts', role: 'status', 'aria-live': 'polite' });
  const vis = st.raids.filter((r) => r.eta <= lead);
  if (!vis.length) box.append(h('div', { class: 'alert calm' }, 'Chưa có cảnh báo tập kích.', h('div', { class: 'muted' }, `Tình báo: ${INTEL_VI[intelLevel(st)]} · cảnh báo ≤${lead} lượt`)));
  for (const r of vis) {
    const intel = raidIntel(d, st, r.units, r.id);
    let verdict: Child = null; let cls = 'alert';
    if (selArmy) {
      const t = travelInfo(selArmy, r.target);
      if (t) { const ok = t.turns <= r.eta; cls += ok ? ' ok' : ' late'; verdict = h('div', { class: 'verdict' }, ok ? `Đội đang chọn tới kịp sau ${t.turns} lượt.` : `Đội đang chọn cần ${t.turns} lượt — KHÔNG kịp.`); }
    }
    box.append(h('div', { class: cls }, h('b', {}, `${r.id} → ${r.target}`), ` tới sau ${r.eta} lượt. Dự báo: ${viText(intel.text)}.`, verdict));
  }
  return box;
}

/* ---------- bản đồ (ảnh nền tranh + lớp SVG sống) ---------- */
const WORLD_W = 1600, WORLD_H = 900;
const ROADS = roadsRaw as Record<string, number[][]>;
const tdef = new Map(d.tiles.map((t) => [t.id, t]));
const tnum = (id: string) => Number(id.slice(4));
function roadPts(a: string, b: string): number[][] {
  const A = tnum(a), B = tnum(b), p = ROADS[A < B ? `${A}-${B}` : `${B}-${A}`];
  if (!p) return [[tdef.get(a)!.x, tdef.get(a)!.y], [tdef.get(b)!.x, tdef.get(b)!.y]];
  return A < B ? p : p.slice().reverse();
}
function routePts(tiles: string[]): number[][] { const out: number[][] = []; for (let i = 0; i + 1 < tiles.length; i++) out.push(...roadPts(tiles[i], tiles[i + 1])); return out; }
const pts2s = (p: number[][]) => p.map((q) => q.join(',')).join(' ');

const FILTERS = `<filter id="inkr" x="-5%" y="-10%" width="110%" height="130%"><feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="2" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" result="d"/><feDropShadow in="d" dx="1.5" dy="3" stdDeviation="2.2" flood-color="#1b1208" flood-opacity=".6"/></filter>
<filter id="soft" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="6"/></filter>
<radialGradient id="glow"><stop offset="0" stop-color="rgba(255,170,60,.65)"/><stop offset="1" stop-color="rgba(255,170,60,0)"/></radialGradient>
<marker id="arr" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10Z" fill="#b0372a"/></marker>`;

const cam = { z: 1, cx: 800, cy: 450 };
const Z_MAX = 4; // CR-004: nền 3200px nét tới ~1.5x; trên đó nạp mảnh 6400px (4x2) theo vùng nhìn thấy
const HI_Z = 1.6, HI_COLS = 4, HI_ROWS = 2, HI_KEEP = 6; // HI_KEEP: số mảnh giữ cùng lúc (giới hạn RAM giải mã trên điện thoại)
const hiUrls = import.meta.glob('./assets/hi/hi_*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
let dragged = false;
const mapSvg = s('svg', { class: 'map', viewBox: `0 0 ${WORLD_W} ${WORLD_H}`, preserveAspectRatio: 'none', role: 'group', 'aria-label': 'Bản đồ chiến dịch' },
  s('image', { href: bgUrl, x: 0, y: 0, width: WORLD_W, height: WORLD_H, 'aria-hidden': 'true' }));
const gHi = s('g', { 'aria-hidden': 'true' }), gRaid = s('g'), gTiles = s('g'), gTop = s('g');
mapSvg.append(gHi, gRaid, gTiles, gTop);
const hiNodes = new Map<string, { node: SVGElement; used: number }>();
let hiTick = 0;
function updateHi(vx: number, vy: number, vw: number, vh: number) { // nạp mảnh nền độ phân giải cao chạm khung nhìn khi zoom sâu
  if (cam.z < HI_Z) { gHi.replaceChildren(); hiNodes.clear(); return; }
  const tw = WORLD_W / HI_COLS, th = WORLD_H / HI_ROWS, c0 = Math.max(0, Math.floor(vx / tw)), c1 = Math.min(HI_COLS - 1, Math.floor((vx + vw) / tw)),
    r0 = Math.max(0, Math.floor(vy / th)), r1 = Math.min(HI_ROWS - 1, Math.floor((vy + vh) / th));
  hiTick++;
  for (let c = c0; c <= c1; c++) for (let r = r0; r <= r1; r++) {
    const key = `${c}_${r}`, url = hiUrls[`./assets/hi/hi_${key}.webp`];
    if (!url) continue;
    let e = hiNodes.get(key);
    if (!e) { e = { node: s('image', { href: url, x: c * tw, y: r * th, width: tw, height: th, 'aria-hidden': 'true' }), used: 0 }; hiNodes.set(key, e); gHi.append(e.node); }
    e.used = hiTick;
  }
  if (hiNodes.size > HI_KEEP) [...hiNodes.entries()].sort((a, b) => a[1].used - b[1].used).slice(0, hiNodes.size - HI_KEEP).forEach(([k, e]) => { e.node.remove(); hiNodes.delete(k); });
}
const stage = h('div', { class: 'stage' });

function camGeom() {
  const W = stage.clientWidth || WORLD_W, H = stage.clientHeight || WORLD_H, k = Math.max(W / WORLD_W, H / WORLD_H) * cam.z;
  return { W, H, k, vw: W / k, vh: H / k };
}
function applyCam() {
  const { vw, vh } = camGeom();
  const extra = vw < WORLD_W * .6 ? vh * .45 : 0; // màn hẹp: cho kéo quá mép dưới để ô được chọn không bị bảng bottom-sheet che
  cam.cx = Math.min(Math.max(cam.cx, vw / 2), WORLD_W - vw / 2); cam.cy = Math.min(Math.max(cam.cy, vh / 2), WORLD_H - vh / 2 + extra);
  mapSvg.setAttribute('viewBox', `${(cam.cx - vw / 2).toFixed(1)} ${(cam.cy - vh / 2).toFixed(1)} ${vw.toFixed(1)} ${vh.toFixed(1)}`);
  updateHi(cam.cx - vw / 2, cam.cy - vh / 2, vw, vh);
}
function zoomTo(z: number, px = .5, py = .5) { // giữ nguyên điểm thế giới đang nằm dưới (px,py) của màn hình
  const g0 = camGeom(), wx = cam.cx - g0.vw / 2 + px * g0.vw, wy = cam.cy - g0.vh / 2 + py * g0.vh;
  cam.z = Math.min(Z_MAX, Math.max(1, z));
  const g1 = camGeom(); cam.cx = wx - (px - .5) * g1.vw; cam.cy = wy - (py - .5) * g1.vh; applyCam();
}
function resetCam() { const { W, H } = camGeom(), narrow = W / H < 1.2; cam.z = narrow ? 1.5 : 1; cam.cx = narrow ? 760 : 800; cam.cy = narrow ? 600 : 450; applyCam(); }
let camSaved: { z: number; cx: number; cy: number } | null = null;
function restoreCam() { if (camSaved) { Object.assign(cam, camSaved); camSaved = null; applyCam(); } }
function clearSel() { selTile = null; selArmy = null; restoreCam(); }
function panToTile(id: string) { // bảng ô là bottom-sheet trên màn hẹp: đưa ô lên nửa trên
  const t = tdef.get(id)!, { W, vh } = camGeom();
  if (W > 900) { const g = camGeom(); if (t.x < cam.cx - g.vw / 2 + 60 || t.x > cam.cx + g.vw / 2 - 60 || t.y < cam.cy - g.vh / 2 + 40 || t.y > cam.cy + g.vh / 2 - 40) { cam.cx = t.x; cam.cy = t.y; applyCam(); } return; }
  camSaved ??= { ...cam }; cam.cx = t.x; cam.cy = t.y + vh * .2; applyCam();
}

const ptrs = new Map<number, { x: number; y: number }>();
let pinch: { d0: number; z0: number } | null = null;
const ptrDist = () => { const [a, b] = [...ptrs.values()]; return Math.hypot(a.x - b.x, a.y - b.y) || 1; };
let pdown: { x: number; y: number; cx: number; cy: number } | null = null;
mapSvg.addEventListener('pointerdown', (e) => {
  if (e.button > 0) return;
  ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (ptrs.size === 2) { pinch = { d0: ptrDist(), z0: cam.z }; dragged = true; pdown = null; return; } // hai ngón: thu/phóng
  dragged = false; pdown = { x: e.clientX, y: e.clientY, cx: cam.cx, cy: cam.cy };
});
window.addEventListener('pointermove', (e) => {
  if (ptrs.has(e.pointerId)) ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pinch && ptrs.size >= 2) { const [a, b] = [...ptrs.values()], r = mapSvg.getBoundingClientRect(); zoomTo(pinch.z0 * ptrDist() / pinch.d0, ((a.x + b.x) / 2 - r.left) / r.width, ((a.y + b.y) / 2 - r.top) / r.height); return; }
  if (!pdown) return;
  const dx = e.clientX - pdown.x, dy = e.clientY - pdown.y;
  if (!dragged && Math.hypot(dx, dy) < 6) return;
  dragged = true; mapSvg.classList.add('drag');
  const { k } = camGeom(); cam.cx = pdown.cx - dx / k; cam.cy = pdown.cy - dy / k; applyCam();
});
const endDrag = (e: PointerEvent) => { ptrs.delete(e.pointerId); if (ptrs.size < 2) pinch = null; if (!ptrs.size) { pdown = null; mapSvg.classList.remove('drag'); } };
window.addEventListener('pointerup', endDrag); window.addEventListener('pointercancel', endDrag);
mapSvg.addEventListener('wheel', (e) => { e.preventDefault(); const r = mapSvg.getBoundingClientRect(); zoomTo(cam.z * (e.deltaY < 0 ? 1.12 : 1 / 1.12), (e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height); }, { passive: false });
window.addEventListener('resize', applyCam);

function foeLabel(t: TileRT, id: string): string {
  const intel = raidIntel(d, ctl.state, t.defenders, id);
  if (intel.level === 'vague') return '?';
  const n = (intel.text.match(/\d+/g) ?? []).reduce((a, b) => a + Number(b), 0);
  return (intel.level === 'estimate' ? '≈' : '') + n;
}
const svgFrom = (cls: string, html: string, extra: Record<string, any> = {}) => { const g = s('g', { class: cls, ...extra }); g.innerHTML = html; return g; };

const tileCache = new Map<string, { key: string; node: SVGElement }>();
function mapLayers() {
  const st = ctl.state, lead = warnLead(d, st);
  const raids: SVGElement[] = [], top: SVGElement[] = [], tiles: SVGElement[] = [];
  for (const r of st.raids.filter((x) => x.eta <= lead)) {
    const route = shortestPath(d, st, r.origin, r.target)?.path ?? [r.origin, r.target];
    const p = pts2s(routePts(route));
    raids.push(s('polyline', { class: 'raidshadow', points: p, transform: 'translate(2,3)' }), s('polyline', { class: 'raidline', points: p, 'marker-end': 'url(#arr)' }));
    const t = tdef.get(r.target)!; top.push(svgFrom('raidbadge', alertBadge(t.x + 70, t.y - 52, r.eta)));
  }
  const order = [...d.tiles].sort((a, b) => a.y - b.y);
  for (const t of order) {
    const rt = st.tiles[t.id], x = t.x, y = t.y;
    const foe = rt.status === 'hostile' || rt.status === 'lost';
    const here = st.armies.filter((a) => a.tile === t.id && !a.move);
    const nUnits = here.reduce((p, a) => p + Object.values(a.units).reduce((u, v) => u + v, 0), 0);
    const gar = Object.values(rt.garrison).reduce((p, q) => p + q, 0);
    const dest = !!selArmy && travelInfo(selArmy, t.id) !== null;
    const foes = Object.values(t.defenders ?? {}).reduce((p, q) => p + q, 0);
    const label = foe ? foeLabel(rt, t.id) : '';
    const key = [rt.status, rt.terrain, selTile === t.id, dest, gar, nUnits, label, foe ? Object.values(rt.defenders).reduce((p, q) => p + q, 0) : 0].join('|');
    const cached = tileCache.get(t.id);
    if (cached && cached.key === key) { tiles.push(cached.node); continue; } // ô không đổi: dùng lại nút DOM (giữ cả tiêu điểm bàn phím)
    const node = s('g', { class: `tile t-${rt.status}${selTile === t.id ? ' sel' : ''}${dest ? ' dest' : ''}`, tabindex: 0, role: 'button', 'data-tile': t.id,
      onclick: () => { if (!dragged) onTile(t.id); },
      onfocus: () => { if (!pdown) panToTile(t.id); },
      onkeydown: (e: Event) => { const k = (e as KeyboardEvent).key; if (k === 'Enter' || k === ' ') { e.preventDefault(); onTile(t.id); } } },
      s('ellipse', { class: 'hit', cx: x, cy: y + 30, rx: 104, ry: 80 }));
    if (selTile === t.id) node.append(s('ellipse', { class: 'selring', cx: x, cy: y + 6, rx: 104, ry: 58 }));
    if (dest) node.append(s('ellipse', { class: 'destring', cx: x, cy: y + 6, rx: 104, ry: 58 }));
    node.append(svgFrom('art', settlementSvg({ id: t.id, x, y, kind: rt.status, terrain: rt.terrain, capital: t.id === d.campaign.capital, foes: foe ? Math.max(foes, Object.values(rt.defenders).reduce((p, q) => p + q, 0)) : 0 }), { filter: 'url(#inkr)' }));
    node.append(svgFrom('banner', banner(x, y + 54, t.name_vi, rt.status === 'settled' ? 'own' : foe ? 'enemy' : 'open'), { filter: 'url(#inkr)' }));
    if (rt.status === 'settled') {
      if (nUnits) node.append(svgFrom('chips', chip(x - 34, y + 80, 'i-shield', String(gar), 'own') + chip(x + 34, y + 80, 'i-banner', String(nUnits), 'own')));
      else node.append(svgFrom('chips', chip(x, y + 80, 'i-shield', String(gar), 'own')));
    } else if (foe) node.append(svgFrom('chips', chip(x, y + 80, 'i-swords', label, 'enemy')));
    else if (nUnits) node.append(svgFrom('chips', chip(x, y + 80, 'i-banner', String(nUnits), 'own')));
    tileCache.set(t.id, { key, node });
    tiles.push(node);
  }
  for (const a of st.armies.filter((q) => q.move)) { // đội đang hành quân: cờ + mũ trên đoạn đường kế tiếp
    const next = a.move!.path[0] ?? a.tile, leg = roadPts(a.tile, next), m = leg[Math.floor(leg.length / 2)] ?? [tdef.get(a.tile)!.x, tdef.get(a.tile)!.y];
    top.push(svgFrom('army', `<g transform="translate(${m[0]},${m[1]})"><ellipse cx="4" cy="14" rx="22" ry="5" fill="rgba(30,20,8,.45)"/><use href="#i-banner" x="-14" y="-34" width="34" height="34"/><use href="#i-helm" x="-12" y="-4" width="24" height="24"/></g>` + chip(m[0] + 58, m[1] + 6, 'i-hourglass', `${a.move!.remaining} lượt`, 'own')));
  }
  gRaid.replaceChildren(...raids); gTiles.replaceChildren(...tiles); gTop.replaceChildren(...top);
}

function onTile(id: string) {
  const st = ctl.state;
  if (selArmy) {
    const army = st.armies.find((a) => a.id === selArmy);
    const dest = st.tiles[id];
    if (army && id !== army.tile) {
      const enemy = dest.status === 'hostile' || dest.status === 'lost';
      msg = ctl.dispatch({ t: enemy ? 'attack' : 'move', army: selArmy, to: id }) ?? '';
      if (!msg) selArmy = null;
      selTile = id; render(); return;
    }
  }
  selTile = id; panToTile(id); render();
}

const UNIT_ICON: Record<string, string> = { 'UNT-FOOT': 'i-helm', 'UNT-ARCHER': 'i-bow', 'UNT-CROSSBOW': 'i-bow', 'UNT-MILITIA': 'i-hat', 'UNT-BOAT': 'i-boat', 'ENM-FOOT': 'i-helm', 'ENM-ARCHER': 'i-bow' };
const CLASS_ICON: Record<string, string> = { bo_binh: 'i-helm', cung_no: 'i-bow', dan_binh: 'i-hat', thuy_binh: 'i-boat' };
const BLD_ICON: Record<string, string> = { 'BLD-FARM': 'i-farm', 'BLD-LUMBER': 'i-lumber', 'BLD-QUARRY': 'i-stone', 'BLD-FORGE': 'i-iron', 'BLD-BARRACKS': 'i-barracks', 'BLD-GRANARY': 'i-grain', 'BLD-DIKE': 'i-stone', 'BLD-PALISADE': 'i-palisade', 'BLD-STAKES': 'i-spear', 'BLD-WATCH': 'i-watch', 'BLD-DOCK': 'i-boat' };
/** Chân dung tròn + huy hiệu số lượng (P-UI4/P-UI5). label chỉ dành cho trình đọc màn hình. */
function unitDot(icon: string, count: string | number, side: 'own' | 'enemy', label: string) {
  return h('div', { class: `unit ${side}`, title: label }, ic(icon), h('i', { class: 'cnt' }, String(count)), h('span', { class: 'vh' }, label));
}
const emptyDot = (locked = false) => h('div', { class: 'unit empty', 'aria-hidden': 'true' }, locked ? ic('i-lock') : null);
function costLine(c: Record<string, number | undefined>) {
  return h('small', { class: 'cost' }, ...Object.entries(c).map(([k, v]) => h('span', { class: 'c', title: RES_VI[k] }, ic(RES_ICON[k], 'ic sm'), String(v), h('span', { class: 'vh' }, ` ${RES_VI[k]}`))));
}
function canPay(c: Record<string, number | undefined>) { return Object.entries(c).every(([k, v]) => ctl.state.res[k as keyof typeof ctl.state.res] >= (v ?? 0)); }

function tileBody(): HTMLElement {
  const st = ctl.state;
  const sel: string = selTile as string; const t: TileRT = st.tiles[sel];
  const p = h('div', { class: 'tilebody' }, h('p', { class: 'sub' }, `${TERRAIN_VI[t.terrain]} · ${STATUS_VI[t.status]}`));

  if (t.status === 'hostile' || t.status === 'lost') {
    const intel = raidIntel(d, st, t.defenders, sel), entries = Object.entries(t.defenders).filter(([, n]) => n > 0);
    p.append(h('h3', {}, 'Lực lượng địch (xem trước)'));
    if (intel.level === 'vague') {
      const classes = [...new Set(entries.map(([u]) => d.units[u].class))];
      p.append(h('div', { class: 'dots' }, ...classes.map((c) => unitDot(CLASS_ICON[c] ?? 'i-swords', '?', 'enemy', `lớp quân ${CLASS_VI[c] ?? c}`))));
    } else {
      const parts = intel.text.split(', ');
      p.append(h('div', { class: 'dots' }, ...entries.map(([u, n], i) => unitDot(UNIT_ICON[u] ?? 'i-swords', intel.level === 'exact' ? n : (parts[i]?.match(/~?\d+/)?.[0] ?? '?'), 'enemy', d.units[u].name_vi))));
    }
    p.append(h('div', {}, viText(intel.text)), h('p', { class: 'muted' }, `Độ tin cậy tình báo: ${INTEL_VI[intelLevel(st)]}. Kết quả không được đảm bảo. Chọn đội quân của bạn → “Điều quân” → bấm ô này để tấn công.`));
  }
  if (t.status === 'open') {
    const cost = d.campaign.rules.settle_cost as Record<string, number>;
    p.append(h('div', { class: 'row' }, h('button', { class: 'primary', disabled: !canPay(cost) || undefined, onclick: () => act({ t: 'settle', tile: sel }) }, `Lập khu định cư (${costText(cost)})`)));
  }
  if (t.status === 'settled') {
    const slots = sel === d.campaign.capital ? d.campaign.rules.capital_slots : d.campaign.rules.default_slots;
    p.append(h('h3', {}, `Công trình (${t.buildings.length}/${slots})`));
    const grid = h('div', { class: 'slots' });
    t.buildings.forEach((b, i) => grid.append(h('div', { class: 'slot' },
      h('span', { class: 'lv' }, b.remaining ? `xây ${b.remaining} lượt` : `Cấp ${b.level}`),
      ic(BLD_ICON[b.type] ?? 'i-farm'), h('small', {}, d.buildings[b.type].name_vi),
      h('div', { class: 'mini' },
        h('button', { onclick: () => act({ t: 'upgrade', tile: sel, index: i }), 'aria-label': `Nâng cấp ${d.buildings[b.type].name_vi}`, title: 'Nâng cấp' }, '↑'),
        h('button', { onclick: () => act({ t: 'demolish', tile: sel, index: i }), 'aria-label': `Phá ${d.buildings[b.type].name_vi}`, title: 'Phá bỏ' }, '🗑')))));
    for (let i = t.buildings.length; i < slots; i++) grid.append(h('div', { class: 'slot empty', 'aria-hidden': 'true' }, ic('i-plus'), h('small', {}, 'Trống')));
    p.append(grid, h('h3', {}, 'Xây mới'));
    const bl = h('div', { class: 'tgrid b3' });
    for (const b of Object.values(d.buildings).filter((x) => x.enabled !== false)) {
      const cost = b.cost as Record<string, number>;
      bl.append(h('button', { class: `tbtn v${canPay(cost) ? '' : ' poor'}`, title: costText(cost), onclick: () => act({ t: 'build', tile: sel, bld: b.id }) }, ic(BLD_ICON[b.id] ?? 'i-farm'), h('span', {}, b.name_vi), costLine(cost)));
    }
    p.append(bl, h('h3', {}, 'Huấn luyện'));
    const tl = h('div', { class: 'tgrid' });
    for (const u of Object.values(d.units).filter((x) => x.side === 'player' && x.enabled !== false)) {
      const cost = (u.cost ?? {}) as Record<string, number>;
      tl.append(h('button', { class: `tbtn${canPay(cost) ? '' : ' poor'}`, title: costText(cost), onclick: () => act({ t: 'train', tile: sel, unit: u.id, count: 1 }) }, ic(UNIT_ICON[u.id] ?? 'i-helm'), h('span', {}, `+1 ${u.name_vi}`), costLine(cost)));
    }
    p.append(tl);
    const gSum = Object.values(t.garrison).reduce((a, b) => a + b, 0), cap = garrisonCap(d, st, sel);
    p.append(h('h3', {}, `Quân đồn trú (${gSum}/${cap})`));
    const gd = h('div', { class: 'dots' });
    for (const [u, n] of Object.entries(t.garrison)) if (n > 0) gd.append(unitDot(UNIT_ICON[u] ?? 'i-hat', n, 'own', d.units[u].name_vi));
    for (let i = 0; i < Math.min(cap - gSum, 8); i++) gd.append(emptyDot());
    p.append(gd, h('div', { class: 'muted' }, `Đồn trú: ${countsText(t.garrison)} (${gSum}/${cap}) · Công sự: -${Math.round(fortBonus(d, st, sel) * 100)}% sát thương`));
    const q = st.queue.filter((j) => j.tile === sel);
    if (q.length) p.append(h('div', { class: 'muted' }, 'Hàng đợi: ' + q.map((j) => `${j.count} ${d.units[j.unit].name_vi} (${j.remaining})`).join(', ')));
  }
  const here = st.armies.filter((a) => a.tile === sel);
  if (here.length) {
    p.append(h('h3', {}, 'Quân tại ô'));
    for (const a of here) {
      p.append(h('div', { class: 'armyrow' },
        h('div', { class: 'dots' }, ...Object.entries(a.units).filter(([, n]) => n > 0).map(([u, n]) => unitDot(UNIT_ICON[u] ?? 'i-helm', n, 'own', d.units[u].name_vi))),
        h('span', { class: 'muted' }, a.move ? `${countsText(a.units)} — đang hành quân (${a.move.remaining} lượt)` : countsText(a.units)),
        !a.move && h('button', { 'aria-pressed': selArmy === a.id, onclick: () => { selArmy = selArmy === a.id ? null : a.id; msg = selArmy ? 'Chọn ô đích trên bản đồ.' : ''; if (selArmy) restoreCam(); render(); } }, selArmy === a.id ? 'Bỏ chọn' : 'Điều quân'),
      ));
    }
  }
  return p;
}

function movingPanel() {
  const st = ctl.state;
  const mv = st.armies.filter((a) => a.move);
  if (!mv.length) return null;
  return h('div', { class: 'moving', 'aria-label': 'Quân đang hành quân' }, h('h3', {}, 'Quân đang hành quân'),
    ...mv.map((a) => h('div', {}, `${countsText(a.units)} → ${a.move!.path[a.move!.path.length - 1]} (${a.move!.remaining} lượt${a.move!.attack ? ', tấn công' : ''})`)));
}

const SOURCES: [string, string][] = [
  ['H1', 'https://en.wikipedia.org/wiki/Song%E2%80%93%C4%90%E1%BA%A1i_Vi%E1%BB%87t_war'],
  ['H2', 'https://en.wikipedia.org/wiki/Battle_of_Nh%C6%B0_Nguy%E1%BB%87t_River_(1077)'],
];
let showAbout = false;
function aboutDialog() {
  if (!showAbout) return null;
  const dlg = h('dialog', { 'aria-label': 'Bối cảnh và nguồn' },
    h('h2', {}, 'Bối cảnh & nguồn — Hộ Quốc Tuyến (1075–1077)'),
    h('p', {}, 'Khung chiến dịch lấy cảm hứng từ cuộc chiến Lý–Tống và phòng tuyến sông Như Nguyệt (đầu năm 1077) [SOURCED ở mức khung].'),
    h('p', {}, 'Địa danh, ô bản đồ, đơn vị, số lượng quân, chi phí và các đợt tập kích là trừu tượng hóa [FICTION] để làm cơ chế chơi. Chúng KHÔNG phải số liệu lịch sử.'),
    h('p', {}, 'Lực lượng đối phương là một thế lực lịch sử trừu tượng; trò chơi không đồng nhất họ với dân tộc hay quốc gia hiện đại.'),
    h('p', { class: 'muted' }, 'Nhãn nội dung: SOURCED (có nguồn) · FICTION (hư cấu) · ALT-HISTORY (lịch sử giả định). Nguồn dưới đây chưa qua thẩm định sử học chuyên môn:'),
    h('ul', {}, ...SOURCES.map(([id, u]) => h('li', {}, h('a', { href: u, rel: 'noopener', target: '_blank' }, `${id}: ${u}`)))),
    h('div', { class: 'row' }, h('button', { class: 'primary', onclick: () => { showAbout = false; dlg.close(); render(); } }, 'Đóng')));
  queueMicrotask(() => { try { dlg.showModal(); } catch { /* jsdom */ } });
  return dlg;
}

let eventDismissed = false; // Esc/“Để sau” chỉ ẩn hộp thoại, KHÔNG chọn thay người chơi
function eventDialog() {
  const st = ctl.state;
  const ev = st.pendingEvents.length && st.outcome === 'playing' && !reportQueue.length && !eventDismissed ? eventById(d, st.pendingEvents[0]) : undefined;
  if (!ev) return null;
  const art = h('div', { class: 'evt-art' }); art.innerHTML = eventArtSvg(ev.id);
  const dlg = h('dialog', { class: 'evt', 'aria-label': `Sự kiện: ${ev.name_vi}`, 'data-event': ev.id },
    art,
    h('div', { class: 'evt-tags' }, h('span', {}, `Sự kiện · Lượt ${st.turn}`), h('span', { class: 'src' }, `${ev.source_label}${ev.source_ids.length ? ' · nguồn ' + ev.source_ids.join(', ') : ''}`)),
    h('h2', {}, ev.name_vi),
    h('p', { class: 'evt-text' }, ev.text_vi),
    h('div', { class: 'choices' }, ...ev.choices.map((c) => {
      const ok = canChoose(st, c), tones = effectTones(c.effects);
      return h('div', { class: `choice${c.default ? ' dflt' : ''}` },
        c.default && h('em', { class: 'dtag' }, 'Mặc định'),
        h('h3', {}, c.label_vi),
        h('div', { class: 'eff-h' }, 'Hệ quả:'),
        h('ul', { class: 'effs' }, ...describeEffects(c.effects).map((t, i) => h('li', { class: `eff ${tones[i]}` }, t))),
        !ok && h('p', { class: 'muted' }, 'Không đủ tài nguyên.'),
        h('button', { class: c.default ? '' : 'primary', 'data-choice': c.id, disabled: !ok, onclick: () => { try { dlg.close(); } catch { /* jsdom */ } act({ t: 'choose', event: ev.id, choice: c.id }); } }, 'Chọn', h('span', { class: 'vh' }, ` — ${c.label_vi}`)));
    })),
    h('div', { class: 'evt-foot' }, h('span', { class: 'muted' }, 'Chưa chọn khi kết thúc lượt → tự áp lựa chọn Mặc định.'),
      h('button', { 'data-act': 'later', onclick: () => { eventDismissed = true; try { dlg.close(); } catch { /* jsdom */ } render(); } }, 'Để sau')));
  dlg.addEventListener('cancel', () => { eventDismissed = true; });
  queueMicrotask(() => { try { dlg.showModal(); } catch { /* jsdom */ } });
  return dlg;
}

function eventsPanel() {
  const st = ctl.state;
  if (!st.pendingEvents.length || st.outcome !== 'playing') return null;
  return h('div', { class: 'alert late evtcard', role: 'status' },
    h('b', {}, 'Sự kiện chờ quyết định: '), st.pendingEvents.map((id) => eventById(d, id)?.name_vi).join(', '), ' ',
    h('button', { 'data-act': 'open-event', onclick: () => { eventDismissed = false; render(); } }, 'Xem & quyết định'));
}

function logPanel() {
  const st = ctl.state;
  return h('div', {}, h('h2', {}, 'Nhật ký'), h('ul', { class: 'log' }, ...st.log.slice(-12).reverse().map((l) => h('li', {}, l))));
}

function sidePanel() {
  const mv = movingPanel();
  if (!selTile && !mv) return null;
  const aside = h('aside', { class: `side parch${selArmy ? ' picking' : ''}`, 'aria-label': 'Chi tiết ô' });
  if (selArmy) aside.append(h('div', { class: 'pickbar' }, h('span', {}, 'Chọn ô đích trên bản đồ.'), h('button', { onclick: () => { selArmy = null; msg = ''; render(); } }, 'Hủy điều quân')));
  if (selTile) {
    const def = tdef.get(selTile)!;
    aside.append(h('div', { class: 'rib' }, h('h2', {}, `${def.name_vi} (${selTile})`),
      h('button', { class: 'closebtn', 'aria-label': 'Ẩn bảng ô', onclick: () => { clearSel(); render(); } }, '✕')), tileBody());
  }
  if (mv) aside.append(mv);
  return aside;
}

type Pop = 'log' | 'policy' | 'settings' | null;
let openPop: Pop = null;
function togglePop(p: Exclude<Pop, null>) { openPop = openPop === p ? null : p; render(); }

function popover() {
  if (!openPop) return null;
  const st = ctl.state;
  const box = h('div', { class: 'pop parch', role: 'region', 'aria-label': { log: 'Nhật ký', policy: 'Kế sách', settings: 'Cài đặt' }[openPop] });
  if (openPop === 'log') box.append(logPanel());
  if (openPop === 'policy') {
    const POL: Record<string, { c: string; icon: string; txt: string }> = {
      'POL-NONG-HAU': { c: '#2f7a46', icon: 'i-grain', txt: '+2 trần quân cơ động' },
      'POL-LUY-BIEN': { c: '#2f5d73', icon: 'i-palisade', txt: '+10% công sự mọi ô' },
      'POL-TIEN-PHONG': { c: '#a33b2f', icon: 'i-sword', txt: '+10% sát thương' } };
    box.append(h('h2', {}, 'Kế sách'),
      h('div', { class: 'diamonds' }, ...Object.values(d.policies).map((p) => {
        const own = st.policies.includes(p.id), m = POL[p.id] ?? { c: '#2f5d73', icon: 'i-diamond', txt: '' }, poor = !own && st.res.dantam < p.cost_dantam;
        const shape = s('svg', { class: 'dshape', viewBox: '0 0 64 64', 'aria-hidden': 'true', focusable: 'false' },
          s('path', { d: 'M32 3 L61 32 L32 61 L3 32Z', fill: own ? m.c : poor ? '#a79c82' : m.c, stroke: '#e8c27a', 'stroke-width': 3.5, 'stroke-linejoin': 'round' }),
          s('path', { d: 'M32 11 L53 32 L32 53 L11 32Z', fill: 'none', stroke: 'rgba(255,255,255,.35)', 'stroke-width': 1.5 }),
          s('use', { href: `#${own ? 'i-check' : m.icon}`, x: 18, y: 18, width: 28, height: 28 }));
        return h('button', { class: `dia${own ? ' own' : ''}${poor ? ' poor' : ''}`, disabled: own || undefined, title: `${p.cost_dantam} Dân tâm`, onclick: () => act({ t: 'research', policy: p.id }) },
          shape, h('span', { class: 'dn' }, p.name_vi), h('small', {}, own ? 'Đã áp dụng' : `${p.cost_dantam} Dân tâm`), h('small', { class: 'dt' }, m.txt));
      })),
      h('p', { class: 'muted' }, 'Giảng hòa chỉ mở từ lượt ' + d.campaign.rules.negotiate_from_turn + ' khi đủ ba điều kiện ở thẻ Mục tiêu.'),
      h('div', { class: 'row' }, h('button', { onclick: () => act({ t: 'negotiate' }) }, 'Đàm phán giảng hòa')));
  }
  if (openPop === 'settings') {
    box.append(h('h2', {}, 'Cài đặt'),
      h('div', { class: 'row' }, h('button', { onclick: onExport }, 'Xuất JSON'), h('button', { onclick: () => fileInput.click() }, 'Nhập JSON'),
        h('button', { onclick: () => { if (confirm('Bắt đầu lại chiến dịch?')) { ctl.newGame(); eventDismissed = false; clearSel(); msg = ''; openPop = null; render(); } } }, 'Chơi lại')),
      ...(ctl.storageOk ? [] : [h('p', { class: 'muted' }, 'Không lưu được vào trình duyệt — hãy dùng “Xuất JSON”.')]));
  }
  return box;
}

function roundBtn(icon: string, label: string, onclick: () => void, extra: Record<string, any> = {}) {
  return h('button', { class: 'rb', 'aria-label': label, title: label, onclick, ...extra }, ic(icon));
}
function cluster() {
  const st = ctl.state, n = ctl.undoDepth;
  const undo = h('button', { class: 'rb undo', 'aria-label': n ? `Hoàn tác (${n} bước)` : 'Hoàn tác', title: 'Hoàn tác', disabled: !ctl.canUndo, onclick: () => { ctl.undo(); msg = ''; render(); } },
    ic('i-undo'), n ? h('em', {}, String(n)) : null);
  const disc = h('button', { class: 'endturn', disabled: st.outcome !== 'playing', onclick: onEndTurn });
  disc.innerHTML = endDisc(150).replace('<svg ', '<svg aria-hidden="true" focusable="false" ');
  disc.append(h('span', { class: 'lbl' }, 'Kết thúc lượt'));
  return h('div', { class: 'cluster' },
    h('div', { class: 'rbs' },
      roundBtn('i-scroll', 'Nhật ký', () => togglePop('log'), { 'aria-pressed': openPop === 'log' }),
      roundBtn('i-diamond', 'Kế sách', () => togglePop('policy'), { 'aria-pressed': openPop === 'policy' }),
      roundBtn('i-book', 'Bối cảnh & nguồn', () => { showAbout = true; render(); }),
      roundBtn('i-gear', 'Cài đặt', () => togglePop('settings'), { 'aria-pressed': openPop === 'settings' }), undo), disc);
}
function zoomControls() {
  return h('div', { class: 'zoomc', role: 'group', 'aria-label': 'Thu phóng bản đồ' },
    h('button', { class: 'rb', 'aria-label': 'Phóng to', title: 'Phóng to', onclick: () => zoomTo(cam.z * 1.25) }, s('svg', { class: 'ic', viewBox: '0 0 32 32', 'aria-hidden': 'true' }, s('path', { d: 'M16 7V25M7 16H25', stroke: '#3b2a1c', 'stroke-width': 3.4, 'stroke-linecap': 'round' }))),
    h('button', { class: 'rb', 'aria-label': 'Thu nhỏ', title: 'Thu nhỏ', onclick: () => zoomTo(cam.z / 1.25) }, s('svg', { class: 'ic', viewBox: '0 0 32 32', 'aria-hidden': 'true' }, s('path', { d: 'M7 16H25', stroke: '#3b2a1c', 'stroke-width': 3.4, 'stroke-linecap': 'round' }))),
    h('button', { class: 'rb', 'aria-label': 'Vừa màn hình', title: 'Vừa màn hình', onclick: resetCam }, s('svg', { class: 'ic', viewBox: '0 0 32 32', 'aria-hidden': 'true' }, s('path', { d: 'M5 12V5H12M20 5H27V12M27 20V27H20M12 27H5V20', stroke: '#3b2a1c', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }))));
}

const fileInput = h('input', { type: 'file', accept: 'application/json,.json', class: 'sr', 'aria-label': 'Nhập tệp lưu' });
fileInput.addEventListener('change', async () => {
  const f = fileInput.files?.[0]; if (!f) return;
  msg = ctl.importJson(await f.text()) ?? 'Đã nạp bản lưu.'; fileInput.value = ''; eventDismissed = false; render();
});
function onExport() {
  const blob = new Blob([ctl.exportJson()], { type: 'application/json' });
  const a = h('a', { href: URL.createObjectURL(blob), download: `daiviet-rising-luot${ctl.state.turn}.json` });
  document.body.append(a); a.click(); a.remove();
}

function onEndTurn() {
  reportQueue = ctl.endTurn();
  eventDismissed = false;
  selArmy = null; msg = '';
  render();
}

const CAUSE_ICON: [RegExp, string][] = [[/lũy|công sự|cọc|đồn/i, 'i-palisade'], [/cung|nỏ|tầm|bắn/i, 'i-bow'], [/dân tâm/i, 'i-lotus'], [/địa hình|sông|núi|rừng/i, 'i-stone']];
const sumC = (c: Counts) => Object.values(c).reduce((a, b) => a + b, 0);
function reportSide(title: string, icon: string, before: Counts, left: Counts, side: 'own' | 'enemy') {
  const b0 = sumC(before), b1 = sumC(left), pct = b0 ? Math.round((b1 / b0) * 100) : 0;
  return h('div', { class: 'col' }, h('h4', {}, ic(icon), title),
    h('div', { class: 'urs' }, ...Object.entries(before).filter(([, n]) => n > 0).map(([u, n]) => h('div', { class: `ur ${side}` },
      unitDot(UNIT_ICON[u] ?? 'i-helm', n, side, d.units[u].name_vi), h('span', {}, '→ còn ', h('b', {}, String(left[u] ?? 0)))))),
    h('div', { class: `bar${side === 'enemy' ? ' foe' : ''}`, role: 'img', 'aria-label': `Còn ${pct}% lực lượng` }, h('i', { style: `width:${pct}%` })),
    h('small', { class: 'muted' }, b1 === 0 ? 'Bị đánh tan' : `Còn ${pct}% lực lượng`));
}
function reportDialog() {
  if (!reportQueue.length && ctl.state.outcome === 'playing') return null;
  const dlg = h('dialog', { class: 'rep', 'aria-label': 'Báo cáo' });
  if (ctl.state.outcome !== 'playing') {
    const won = ctl.state.outcome === 'won';
    dlg.append(h('div', { class: `ribbon ${won ? 'win' : 'lose'}` }, h('h2', {}, won ? 'Chiến thắng' : 'Thất bại')), h('p', { class: 'rep-reason' }, ctl.state.outcomeReason ?? ''));
  }
  for (const r of reportQueue) {
    const raid = r.kind === 'raid', win = r.winner === (raid ? 'defender' : 'attacker');
    const ours = raid ? [r.defender, r.defenderLeft] : [r.attacker, r.attackerLeft], foe = raid ? [r.attacker, r.attackerLeft] : [r.defender, r.defenderLeft];
    dlg.append(h('div', { class: `ribbon ${win ? 'win' : 'lose'}` }, h('h3', {}, `${raid ? 'Phòng thủ' : 'Tấn công'} ${win ? 'thành công' : 'thất bại'}`)),
      h('p', { class: 'bat-sub' }, `${tdef.get(r.tile)?.name_vi ?? r.tile} (${r.tile}) · ${r.rounds} vòng · ${win ? 'THẮNG' : 'THUA'}`),
      h('div', { class: 'bat-cols' }, reportSide('Quân ta', 'i-shield', ours[0], ours[1], 'own'), h('div', { class: 'vs' }, ic('i-swords', 'ic big')), reportSide(raid ? 'Phe tấn công' : 'Phe phòng thủ', 'i-swords', foe[0], foe[1], 'enemy')),
      h('h4', { class: 'cz' }, 'Nguyên nhân chính'),
      h('ul', { class: 'causes' }, ...r.causes.map((c) => h('li', {}, ic(CAUSE_ICON.find(([re]) => re.test(c))?.[1] ?? 'i-scroll'), h('span', {}, c)))));
  }
  dlg.append(h('div', { class: 'row end' }, h('button', { class: 'primary', onclick: () => { reportQueue = []; try { dlg.close(); } catch { /* jsdom */ } render(); } }, 'Đóng')));
  queueMicrotask(() => { try { dlg.showModal(); } catch { /* môi trường không hỗ trợ dialog */ } });
  return dlg;
}

const sprite = s('svg', { width: 0, height: 0, style: 'position:absolute', 'aria-hidden': 'true', focusable: 'false' });
sprite.innerHTML = `<defs>${SYMBOLS}${FILTERS}</defs>`;
const hud = h('div', { class: 'hud' });
const colL = h('div', { class: 'col-l' }), colR = h('div', { class: 'col-r' });
hud.append(colL, colR);
const dyn = h('div', { class: 'dyn' }); // cụm nút, hộp nổi, thông báo: dựng lại mỗi lượt render
stage.append(mapSvg, hud, dyn);
root.append(sprite, stage, fileInput);

function render() {
  const focused = (document.activeElement as HTMLElement | null)?.getAttribute?.('data-tile');
  mapLayers();
  const side = sidePanel();
  colL.replaceChildren(titleBanner(), alerts(), ...[eventsPanel(), side].filter(Boolean) as Node[]);
  colR.replaceChildren(resPill(), objective());
  dyn.replaceChildren(...[msg ? h('p', { class: 'toast', role: 'alert' }, msg) : null, popover(), zoomControls(), cluster()].filter(Boolean) as Node[]);
  stage.classList.toggle('sheet', !!side && !selArmy);
  stage.classList.toggle('sheetpick', !!side && !!selArmy);
  root.querySelectorAll('dialog').forEach((x) => x.remove());
  const dlg = reportDialog(); if (dlg) root.append(dlg);
  const ev = eventDialog(); if (ev) root.append(ev);
  const ab = aboutDialog(); if (ab) root.append(ab);
  if (focused) (root.querySelector(`[data-tile="${focused}"]`) as HTMLElement | null)?.focus({ preventScroll: true });
}

resetCam();
render();
(window as any).__game = ctl; // phục vụ kiểm thử E2E/debug
