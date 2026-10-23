import { loadData } from '../sim/data';
import { garrisonCap, intelLevel, mobileSupplyUsed, raidIntel, supplyCap, warnLead, fortBonus } from '../sim/derived';
import { canChoose, describeEffects, eventById } from '../sim/events';
import { shortestPath } from '../sim/graph';
import type { BattleReport, Counts, GameData, TileRT } from '../sim/types';
import { Controller } from './controller';
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

function topBar() {
  const st = ctl.state;
  return h('header', { class: 'top' },
    h('h1', {}, `Dai Viet Rising — ${d.campaign.name_vi}`),
    h('div', {}, `Lượt ${Math.min(st.turn, d.campaign.rules.deadline_turn)}/${d.campaign.rules.deadline_turn}`),
    h('div', { class: 'res', 'aria-label': 'Tài nguyên' },
      ...(['grain', 'wood', 'stone', 'iron', 'dantam'] as const).map((k) => h('span', {}, `${RES_VI[k]}: ${st.res[k]}`)),
      h('span', {}, `Quân: ${mobileSupplyUsed(d, st)}/${supplyCap(d, st)}`)),
    h('div', { class: 'muted' }, `Tình báo: ${{ exact: 'chính xác', estimate: 'ước lượng', vague: 'mơ hồ' }[intelLevel(st)]} · cảnh báo ≤${warnLead(d, st)} lượt`),
  );
}

function alerts() {
  const st = ctl.state, lead = warnLead(d, st);
  const box = h('div', { role: 'status', 'aria-live': 'polite' });
  const vis = st.raids.filter((r) => r.eta <= lead);
  if (!vis.length) box.append(h('p', { class: 'muted' }, 'Chưa có cảnh báo tập kích.'));
  for (const r of vis) {
    const intel = raidIntel(d, st, r.units, r.id);
    let verdict: Child = null; let cls = 'alert';
    if (selArmy) {
      const t = travelInfo(selArmy, r.target);
      if (t) { const ok = t.turns <= r.eta; cls += ok ? ' ok' : ' late'; verdict = h('div', {}, ok ? `Đội đang chọn tới kịp sau ${t.turns} lượt.` : `Đội đang chọn cần ${t.turns} lượt — KHÔNG kịp.`); }
    }
    box.append(h('div', { class: cls }, h('b', {}, `${r.id} → ${r.target}`), ` tới sau ${r.eta} lượt. Dự báo: ${intel.text}.`, verdict));
  }
  return box;
}

function mapView() {
  const st = ctl.state, lead = warnLead(d, st);
  const svg = s('svg', { viewBox: '0 0 600 720', role: 'group', 'aria-label': 'Bản đồ chiến dịch' },
    s('defs', {}, s('marker', { id: 'arr', viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto-start-reverse' }, s('path', { d: 'M0 0L10 5L0 10z', fill: 'currentColor' }))));
  const tdef = new Map(d.tiles.map((t) => [t.id, t]));
  const seen = new Set<string>();
  for (const t of d.tiles) for (const n of t.adj) {
    const k = [t.id, n].sort().join('|'); if (seen.has(k)) continue; seen.add(k);
    const a = t, b = tdef.get(n)!;
    svg.append(s('line', { class: 'edge', x1: a.x, y1: a.y, x2: b.x, y2: b.y }));
  }
  for (const r of st.raids.filter((x) => x.eta <= lead)) {
    const a = tdef.get(r.origin)!, b = tdef.get(r.target)!;
    svg.append(s('line', { class: 'raidline', x1: a.x, y1: a.y, x2: b.x, y2: b.y, style: 'color:var(--bad)' }));
  }
  for (const t of d.tiles) {
    const rt = st.tiles[t.id];
    const armies = st.armies.filter((a) => a.tile === t.id && !a.move);
    const n = armies.reduce((x, a) => x + Object.values(a.units).reduce((p, q) => p + q, 0), 0);
    const g = Object.values(rt.garrison).reduce((p, q) => p + q, 0);
    const dest = !!selArmy && travelInfo(selArmy, t.id) !== null;
    const stShort: Record<string, string> = { hostile: 'địch chiếm', open: 'đất trống', settled: 'định cư', lost: 'đã mất' };
    const line = (y: number, text: string) => { const e = s('text', { x: t.x, y }); e.textContent = text; return e; };
    // Không đặt aria-label riêng: tên truy cập lấy từ chính chữ hiển thị (tránh lệch nhãn – axe label-content-name-mismatch).
    const node = s('g', { class: `tile t-${rt.status}${selTile === t.id ? ' sel' : ''}${dest ? ' dest' : ''}`, tabindex: 0, role: 'button', 'data-tile': t.id,
      onclick: () => onTile(t.id), onkeydown: (e: Event) => { const k = (e as KeyboardEvent).key; if (k === 'Enter' || k === ' ') { e.preventDefault(); onTile(t.id); } } },
      s('rect', { class: 'shape', x: t.x - 52, y: t.y - 44, width: 104, height: 88, rx: 12 }),
      line(t.y - 24, t.name_vi), line(t.y - 7, TERRAIN_VI[rt.terrain]), line(t.y + 10, stShort[rt.status]),
      line(t.y + 28, [n ? `${n} quân` : '', g ? `${g} đồn trú` : ''].filter(Boolean).join(' ')));
    svg.append(node);
  }
  return h('section', { class: 'map', 'aria-label': 'Bản đồ' }, svg);
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
  selTile = id; render();
}

function tilePanel() {
  const st = ctl.state;
  if (!selTile) return h('div', { class: 'panel' }, h('h2', {}, 'Chọn một ô'), h('p', { class: 'muted' }, 'Chọn ô trên bản đồ (chuột, chạm hoặc Tab+Enter).'));
  const t: TileRT = st.tiles[selTile];
  const def = d.tiles.find((x) => x.id === selTile)!;
  const p = h('div', { class: 'panel' }, h('h2', {}, `${def.name_vi} (${selTile})`),
    h('div', { class: 'muted' }, `${TERRAIN_VI[t.terrain]} · ${STATUS_VI[t.status]}`));

  if (t.status === 'hostile' || t.status === 'lost') {
    const lvl = intelLevel(st);
    const fake: Counts = t.defenders;
    p.append(h('h3', {}, 'Lực lượng địch (xem trước)'), h('div', {}, raidIntel(d, st, fake, selTile).text),
      h('p', { class: 'muted' }, `Độ tin cậy tình báo: ${lvl}. Kết quả không được đảm bảo.`));
  }
  if (t.status === 'open') {
    const cost = d.campaign.rules.settle_cost;
    p.append(h('div', { class: 'row' }, h('button', { onclick: () => act({ t: 'settle', tile: selTile! }) }, `Lập khu định cư (${costText(cost as any)})`)));
  }
  if (t.status === 'settled') {
    p.append(h('h3', {}, `Công trình (${t.buildings.length}/${selTile === d.campaign.capital ? d.campaign.rules.capital_slots : d.campaign.rules.default_slots})`));
    t.buildings.forEach((b, i) => p.append(h('div', { class: 'row' },
      h('span', {}, `${d.buildings[b.type].name_vi} Lv${b.level}${b.remaining ? ` (xây ${b.remaining} lượt)` : ''}`),
      h('button', { onclick: () => act({ t: 'upgrade', tile: selTile!, index: i }), 'aria-label': `Nâng cấp ${d.buildings[b.type].name_vi}` }, '↑'),
      h('button', { onclick: () => act({ t: 'demolish', tile: selTile!, index: i }), 'aria-label': `Phá ${d.buildings[b.type].name_vi}` }, '🗑'))));
    p.append(h('h3', {}, 'Xây mới'));
    const bl = h('div', { class: 'row' });
    for (const b of Object.values(d.buildings).filter((x) => x.enabled !== false)) {
      bl.append(h('button', { title: costText(b.cost as any), onclick: () => act({ t: 'build', tile: selTile!, bld: b.id }) }, b.name_vi));
    }
    p.append(bl);
    p.append(h('h3', {}, 'Huấn luyện'));
    const tl = h('div', { class: 'row' });
    for (const u of Object.values(d.units).filter((x) => x.side === 'player' && x.enabled !== false)) {
      tl.append(h('button', { title: costText((u.cost ?? {}) as any), onclick: () => act({ t: 'train', tile: selTile!, unit: u.id, count: 1 }) }, `+1 ${u.name_vi}`));
    }
    p.append(tl);
    const gSum = Object.values(t.garrison).reduce((a, b) => a + b, 0);
    p.append(h('div', { class: 'muted' }, `Đồn trú: ${countsText(t.garrison)} (${gSum}/${garrisonCap(d, st, selTile)}) · Công sự: -${Math.round(fortBonus(d, st, selTile) * 100)}% sát thương`));
    const q = st.queue.filter((j) => j.tile === selTile);
    if (q.length) p.append(h('div', { class: 'muted' }, 'Hàng đợi: ' + q.map((j) => `${j.count} ${d.units[j.unit].name_vi} (${j.remaining})`).join(', ')));
  }
  const here = st.armies.filter((a) => a.tile === selTile);
  if (here.length) {
    p.append(h('h3', {}, 'Quân tại ô'));
    for (const a of here) {
      p.append(h('div', { class: 'row' }, h('span', {}, a.move ? `${countsText(a.units)} — đang hành quân (${a.move.remaining} lượt)` : countsText(a.units)),
        !a.move && h('button', { 'aria-pressed': selArmy === a.id, onclick: () => { selArmy = selArmy === a.id ? null : a.id; msg = selArmy ? 'Chọn ô đích trên bản đồ.' : ''; render(); } }, selArmy === a.id ? 'Bỏ chọn' : 'Điều quân'),
      ));
    }
  }
  return p;
}

function movingPanel() {
  const st = ctl.state;
  const mv = st.armies.filter((a) => a.move);
  if (!mv.length) return null;
  return h('div', { class: 'panel', 'aria-label': 'Quân đang hành quân' }, h('h2', {}, 'Quân đang hành quân'),
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
  const dlg = h('dialog', { 'aria-label': `Sự kiện: ${ev.name_vi}`, 'data-event': ev.id },
    h('h2', {}, ev.name_vi),
    h('p', {}, ev.text_vi),
    h('p', { class: 'muted' }, `Nhãn nội dung: ${ev.source_label}${ev.source_ids.length ? ' · nguồn ' + ev.source_ids.join(', ') : ''}`),
    ...ev.choices.map((c) => {
      const ok = canChoose(st, c);
      return h('div', { class: 'choice' },
        h('button', { class: c.default ? '' : 'primary', 'data-choice': c.id, disabled: !ok, onclick: () => { try { dlg.close(); } catch { /* jsdom */ } act({ t: 'choose', event: ev.id, choice: c.id }); } },
          c.label_vi + (c.default ? ' (mặc định)' : '')),
        h('div', { class: 'muted' }, `Hệ quả: ${describeEffects(c.effects).join('; ')}${ok ? '' : ' — không đủ tài nguyên'}`));
    }),
    h('p', { class: 'muted' }, 'Nếu chưa chọn khi kết thúc lượt, trò chơi tự áp lựa chọn mặc định.'),
    h('div', { class: 'row' }, h('button', { 'data-act': 'later', onclick: () => { eventDismissed = true; try { dlg.close(); } catch { /* jsdom */ } render(); } }, 'Để sau')));
  dlg.addEventListener('cancel', () => { eventDismissed = true; });
  queueMicrotask(() => { try { dlg.showModal(); } catch { /* jsdom */ } });
  return dlg;
}

function eventsPanel() {
  const st = ctl.state;
  if (!st.pendingEvents.length || st.outcome !== 'playing') return null;
  return h('div', { class: 'alert late', role: 'status' },
    h('b', {}, 'Sự kiện chờ quyết định: '), st.pendingEvents.map((id) => eventById(d, id)?.name_vi).join(', '), ' ',
    h('button', { 'data-act': 'open-event', onclick: () => { eventDismissed = false; render(); } }, 'Xem & quyết định'));
}

function logPanel() {
  const st = ctl.state;
  return h('div', { class: 'panel' }, h('h2', {}, 'Nhật ký'), h('ul', { class: 'log' }, ...st.log.slice(-12).reverse().map((l) => h('li', {}, l))));
}

function controls() {
  const st = ctl.state;
  const neg = h('button', { onclick: () => act({ t: 'negotiate' }) }, 'Đàm phán giảng hòa');
  return h('div', { class: 'panel' },
    h('div', { class: 'row' },
      h('button', { class: 'primary', disabled: st.outcome !== 'playing', onclick: onEndTurn }, 'Kết thúc lượt'),
      h('button', { disabled: !ctl.canUndo, onclick: () => { ctl.undo(); msg = ''; render(); } }, 'Hoàn tác'), neg),
    h('div', { class: 'row' },
      h('span', { class: 'muted' }, 'Kế sách:'),
      ...Object.values(d.policies).map((p) => st.policies.includes(p.id)
        ? h('span', { class: 'muted' }, `✓ ${p.name_vi}`)
        : h('button', { title: `${p.cost_dantam} Dân tâm`, onclick: () => act({ t: 'research', policy: p.id }) }, p.name_vi))),
    h('div', { class: 'row' },
      h('button', { onclick: onExport }, 'Xuất JSON'),
      h('button', { onclick: () => fileInput.click() }, 'Nhập JSON'),
      h('button', { onclick: () => { showAbout = true; render(); } }, 'Bối cảnh & nguồn'),
      h('button', { onclick: () => { if (confirm('Bắt đầu lại chiến dịch?')) { ctl.newGame(); eventDismissed = false; selTile = null; selArmy = null; msg = ''; render(); } } }, 'Chơi lại')),
    !ctl.storageOk && h('p', { class: 'muted' }, 'Không lưu được vào trình duyệt — hãy dùng “Xuất JSON”.'),
    msg && h('p', { role: 'alert', style: 'color:var(--bad)' }, msg));
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

function reportDialog() {
  if (!reportQueue.length && ctl.state.outcome === 'playing') return null;
  const dlg = h('dialog', { 'aria-label': 'Báo cáo' });
  if (ctl.state.outcome !== 'playing') {
    dlg.append(h('h2', {}, ctl.state.outcome === 'won' ? 'Chiến thắng' : 'Thất bại'), h('p', {}, ctl.state.outcomeReason ?? ''));
  }
  for (const r of reportQueue) {
    const win = r.winner === (r.kind === 'raid' ? 'defender' : 'attacker');
    dlg.append(h('h3', {}, `${r.kind === 'raid' ? 'Phòng thủ' : 'Tấn công'} tại ${r.tile}: ${win ? 'THẮNG' : 'THUA'} (${r.rounds} vòng)`),
      h('div', {}, `Phe tấn công: ${countsText(r.attacker)} → còn ${countsText(r.attackerLeft)}`),
      h('div', {}, `Phe phòng thủ: ${countsText(r.defender)} → còn ${countsText(r.defenderLeft)}`),
      h('b', {}, 'Nguyên nhân chính:'), h('ul', {}, ...r.causes.map((c) => h('li', {}, c))));
  }
  dlg.append(h('div', { class: 'row' }, h('button', { class: 'primary', onclick: () => { reportQueue = []; dlg.close(); render(); } }, 'Đóng')));
  queueMicrotask(() => { try { dlg.showModal(); } catch { /* môi trường không hỗ trợ dialog */ } });
  return dlg;
}

function render() {
  const focused = (document.activeElement as HTMLElement | null)?.getAttribute?.('data-tile');
  const main = h('main', {}, h('div', {}, alerts(), eventsPanel(), mapView()), h('div', {}, controls(), movingPanel(), tilePanel(), logPanel()));
  root.replaceChildren(topBar(), main, fileInput);
  const dlg = reportDialog(); if (dlg) root.append(dlg);
  const ev = eventDialog(); if (ev) root.append(ev);
  const ab = aboutDialog(); if (ab) root.append(ab);
  if (focused) (root.querySelector(`[data-tile="${focused}"]`) as HTMLElement | null)?.focus();
}

render();
(window as any).__game = ctl; // phục vụ kiểm thử E2E/debug
