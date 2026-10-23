import type { Effects, EventChoice, EventDef, GameData, GameState, Res, ResKey } from './types';

const RES_VI: Record<ResKey, string> = { grain: 'Lương', wood: 'Gỗ-tre', stone: 'Đá', iron: 'Sắt', dantam: 'Dân tâm' };
const MOD_VI = { atk_mult: 'sức mạnh quân ta', fort: 'công sự', warn_lead: 'tầm cảnh báo (lượt)', supply_cap: 'trần quân cơ động' } as const;
const TERRAIN_VI: Record<string, string> = { song: 'ô sông', dong_bang: 'đồng bằng', nui: 'núi', rung: 'rừng', ven_bien: 'ven biển' };
const sign = (n: number) => (n > 0 ? `+${n}` : `${n}`);

/** Mô tả hệ quả của một lựa chọn bằng chữ — hiện cho người chơi TRƯỚC khi bấm (minh bạch, CR-002). */
export function describeEffects(e: Effects): string[] {
  const out: string[] = [];
  const res = Object.entries(e.res ?? {}).map(([k, v]) => `${sign(v!)} ${RES_VI[k as ResKey]}`);
  if (res.length) out.push(res.join(', '));
  for (const m of e.mods ?? []) {
    const val = m.kind === 'warn_lead' || m.kind === 'supply_cap' ? sign(m.value) : `${sign(Math.round(m.value * 100))}%`;
    const where = m.terrain ? ` (${TERRAIN_VI[m.terrain]})` : '';
    out.push(`${val} ${MOD_VI[m.kind]}${where}, ${m.turns ? `trong ${m.turns} lượt` : 'vĩnh viễn'}`);
  }
  if (e.raid?.delay) out.push(`đợt tập kích kế tiếp tới muộn thêm ${e.raid.delay} lượt`);
  if (e.raid?.mult && e.raid.mult !== 1) out.push(`đợt tập kích kế tiếp ${e.raid.mult < 1 ? 'yếu đi' : 'mạnh thêm'} ${Math.abs(Math.round((e.raid.mult - 1) * 100))}%`);
  for (const l of e.later ?? []) {
    out.push(`sau ${l.after} lượt phải trả: ${Object.entries(l.res).map(([k, v]) => `${sign(v!)} ${RES_VI[k as ResKey]}`).join(', ')}`);
  }
  return out.length ? out : ['không thay đổi gì'];
}

/** Tài nguyên (trừ Dân tâm, vốn được phép âm) không được xuống dưới 0 khi trả giá. */
export function canChoose(s: GameState, c: EventChoice): boolean {
  return (Object.entries(c.effects.res ?? {}) as [ResKey, number][]).every(([k, v]) => k === 'dantam' || v >= 0 || s.res[k] + v >= 0);
}

export function eventById(d: GameData, id: string): EventDef | undefined { return d.events.find((e) => e.id === id); }

function addRes(s: GameState, res: Partial<Res>, clamp: boolean) {
  for (const [k, v] of Object.entries(res) as [ResKey, number][]) s.res[k] = clamp && k !== 'dantam' ? Math.max(0, s.res[k] + v) : s.res[k] + v;
}

/** Áp hiệu ứng lên state (đã là bản sao). Không kiểm tra điều kiện; gọi canChoose trước. */
export function applyEffects(d: GameData, s: GameState, e: Effects) {
  addRes(s, e.res ?? {}, false);
  for (const m of e.mods ?? []) s.mods.push({ kind: m.kind, value: m.value, terrain: m.terrain, until: m.turns ? s.turn + m.turns - 1 : undefined });
  if (e.raid) {
    const next = d.raids.filter((r) => r.turn >= s.turn).sort((a, b) => a.turn - b.turn)[0];
    if (next) {
      const cur = s.raidEdits[next.id] ?? { delay: 0, mult: 1 };
      s.raidEdits[next.id] = { delay: cur.delay + (e.raid.delay ?? 0), mult: cur.mult * (e.raid.mult ?? 1) };
    }
  }
  for (const l of e.later ?? []) s.scheduled.push({ turn: s.turn + l.after - 1, res: l.res });
}

export function resolveEvent(d: GameData, s: GameState, eventId: string, choiceId: string, auto: boolean): string | undefined {
  const ev = eventById(d, eventId);
  if (!ev || !s.pendingEvents.includes(eventId)) return 'Sự kiện không còn chờ quyết định';
  const c = ev.choices.find((x) => x.id === choiceId);
  if (!c) return 'Lựa chọn không tồn tại';
  if (!canChoose(s, c)) {
    if (!auto) return 'Không đủ tài nguyên cho lựa chọn này';
    s.pendingEvents = s.pendingEvents.filter((x) => x !== eventId);
    s.log.push(`[Lượt ${s.turn}] ${ev.name_vi}: không đủ tài nguyên cho lựa chọn mặc định, bỏ qua`);
    return undefined;
  }
  applyEffects(d, s, c.effects);
  s.pendingEvents = s.pendingEvents.filter((x) => x !== eventId);
  s.eventLog.push({ turn: s.turn, event: eventId, choice: choiceId, auto });
  s.log.push(`[Lượt ${s.turn}] ${ev.name_vi}: ${auto ? 'chưa quyết nên tự chọn' : 'chọn'} “${c.label_vi}”`);
  return undefined;
}

/** Đầu endTurn: sự kiện chưa chọn tự rơi về lựa chọn mặc định. */
export function autoResolvePending(d: GameData, s: GameState) {
  for (const id of [...s.pendingEvents]) {
    const def = eventById(d, id)?.choices.find((c) => c.default);
    if (def) resolveEvent(d, s, id, def.id, true); else s.pendingEvents = s.pendingEvents.filter((x) => x !== id);
  }
}

/** Khoản hẹn trả (vay lương…) đến hạn. */
export function applyScheduled(s: GameState) {
  const due = s.scheduled.filter((x) => x.turn <= s.turn);
  s.scheduled = s.scheduled.filter((x) => x.turn > s.turn);
  for (const x of due) { addRes(s, x.res, true); s.log.push(`[Lượt ${s.turn}] Đến hạn trả khoản đã hẹn`); }
}

export function openEvents(d: GameData, s: GameState) {
  for (const e of d.events) if (e.turn === s.turn) { s.pendingEvents.push(e.id); s.log.push(`[Lượt ${s.turn}] Sự kiện: ${e.name_vi}`); }
}
