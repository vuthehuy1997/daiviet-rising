import type { Counts, GameData, GameState, ModKind, Terrain, TileRT } from './types';

export const MAX_FORT = 0.40;
export const MAX_WARN_BONUS = 3;

export function activeBuildings(t: TileRT) { return t.buildings.filter((b) => b.remaining === 0); }
export function hasActive(t: TileRT, type: string) { return activeBuildings(t).some((b) => b.type === type); }
export function anyActive(s: GameState, type: string) {
  return Object.values(s.tiles).some((t) => t.status === 'settled' && hasActive(t, type));
}

/** Tổng hiệu chỉnh tạm/vĩnh viễn từ sự kiện (CR-002); lọc theo địa hình nếu có. */
export function modSum(s: GameState, kind: ModKind, terrain?: Terrain): number {
  return s.mods.reduce((a, m) => a + (m.kind === kind && (m.until === undefined || s.turn <= m.until) && (!m.terrain || m.terrain === terrain) ? m.value : 0), 0);
}

function policyEffect(d: GameData, s: GameState, key: 'supply_cap' | 'fort_bonus' | 'atk_mult'): number {
  return s.policies.reduce((a, p) => a + (d.policies[p].effect[key] ?? 0), 0);
}

/** SYS-03: trần quân cơ động. */
export function supplyCap(d: GameData, s: GameState): number {
  let cap = d.campaign.rules.base_supply_cap + policyEffect(d, s, 'supply_cap') + modSum(s, 'supply_cap');
  for (const t of Object.values(s.tiles)) {
    if (t.status !== 'settled') continue;
    for (const b of activeBuildings(t)) cap += (d.buildings[b.type].supply_cap ?? 0) * b.level;
  }
  return Math.max(0, cap);
}

export function countSupply(d: GameData, units: Counts): number {
  return Object.entries(units).reduce((a, [u, n]) => a + d.units[u].supply * n, 0);
}

/** Quân cơ động (không tính dân binh đồn trú) – SYS-03. */
export function mobileSupplyUsed(d: GameData, s: GameState): number {
  return s.armies.reduce((a, ar) => a + countSupply(d, ar.units), 0) +
    s.queue.reduce((a, j) => a + (d.units[j.unit].garrison ? 0 : d.units[j.unit].supply * j.count), 0);
}

/** Hệ số morale: -5%/đơn vị vượt trần (tối thiểu 0.5) – SYS-03. */
export function moraleMod(d: GameData, s: GameState): number {
  const excess = Math.max(0, s.armies.reduce((a, ar) => a + countSupply(d, ar.units), 0) - supplyCap(d, s));
  return Math.max(0.5, 1 - 0.05 * excess);
}

export function fortBonus(d: GameData, s: GameState, tile: string): number {
  const t = s.tiles[tile];
  let f = policyEffect(d, s, 'fort_bonus') + modSum(s, 'fort', t.terrain);
  for (const b of activeBuildings(t)) f += (d.buildings[b.type].fort_bonus ?? 0) * b.level;
  return Math.min(MAX_FORT, f);
}

export function stakesPenalty(d: GameData, s: GameState, tile: string): number {
  const t = s.tiles[tile];
  let p = 0;
  for (const b of activeBuildings(t)) p += (d.buildings[b.type].attacker_penalty ?? 0) * b.level;
  return Math.min(0.4, p);
}

export function atkMult(d: GameData, s: GameState): number { return 1 + policyEffect(d, s, 'atk_mult') + modSum(s, 'atk_mult'); }

/** SYS-07: cảnh báo hiện khi eta <= warn_lead = base + chòi canh (tối đa +3). */
export function warnLead(d: GameData, s: GameState): number {
  let bonus = 0;
  for (const t of Object.values(s.tiles)) {
    if (t.status !== 'settled') continue;
    for (const b of activeBuildings(t)) bonus += (d.buildings[b.type].warn_lead_bonus ?? 0) * b.level;
  }
  return Math.max(0, d.campaign.rules.base_warn_lead + Math.min(MAX_WARN_BONUS, bonus) + modSum(s, 'warn_lead'));
}

export function watchCount(s: GameState): number {
  let n = 0;
  for (const t of Object.values(s.tiles)) if (t.status === 'settled') n += activeBuildings(t).filter((b) => b.type === 'BLD-WATCH').length;
  return n;
}

export type IntelLevel = 'exact' | 'estimate' | 'vague';
export function intelLevel(s: GameState): IntelLevel {
  const w = watchCount(s);
  return w >= 2 ? 'exact' : w === 1 ? 'estimate' : 'vague';
}

/** SYS-08: thông tin hiển thị cho người chơi về một đợt tập kích (không lộ số chính xác khi thiếu tình báo). */
export function raidIntel(d: GameData, s: GameState, units: Counts, raidId: string): { level: IntelLevel; text: string } {
  const level = intelLevel(s);
  if (level === 'exact') return { level, text: Object.entries(units).map(([u, n]) => `${n} ${d.units[u].name_vi}`).join(', ') };
  if (level === 'estimate') {
    // sai số ±25% xác định theo raidId + loại quân (không dùng RNG chính để không làm lệch trạng thái)
    const txt = Object.entries(units).map(([u, n]) => {
      const h = [...(raidId + u)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
      const f = 0.75 + (h % 51) / 100;
      return `~${Math.max(1, Math.round(n * f))} ${d.units[u].name_vi}`;
    }).join(', ');
    return { level, text: txt };
  }
  const classes = [...new Set(Object.keys(units).map((u) => d.units[u].class))];
  return { level, text: 'lớp quân: ' + classes.join(', ') };
}

/** SYS-05: trần dân binh đồn trú theo ô – tăng nhờ lũy (chống 'spam' đồn trú không giới hạn, phát hiện qua TST-08). */
export function garrisonCap(d: GameData, s: GameState, tile: string): number {
  const r = d.campaign.rules;
  let cap = r.garrison_base + (tile === d.campaign.capital ? r.garrison_capital_bonus : 0);
  for (const b of activeBuildings(s.tiles[tile])) if (d.buildings[b.type].fort_bonus) cap += r.garrison_per_fort_level * b.level;
  return cap;
}
