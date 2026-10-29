import { fieldArmy } from './commands';
import { enterCost, ENEMY_SPEED, nearestSettled, shortestPath, tileDistance } from './graph';
import { intelLevel, tidePhase } from './derived';
import type { Counts, GameData, GameState, Terrain } from './types';

export interface LureCheck { divert: boolean; reason: string; target?: { tile: string; cost: number } }

/** SYS-11: khi nước rút, quân thuyền địch mắc cạn — chi phí ô sông tăng (chỉ đợt có thủy binh, chỉ chiến dịch có thủy triều). */
export function raidCostFn(d: GameData, s: GameState, units: Counts): ((t: Terrain) => number) | undefined {
  const tide = d.campaign.tide;
  if (!tide || tidePhase(d, s.turn) !== 'ebb') return undefined;
  if (!Object.keys(units).some((u) => d.units[u].class === 'thuy_binh')) return undefined;
  return (t) => enterCost(d, t) * (t === 'song' ? tide.naval_ebb_cost_mult : 1);
}

/**
 * CR-005 nhử: đợt tập kích (origin, units) có bị dụ về ô mồi không? Tất định, không RNG:
 * (1) tình báo: chính xác → luôn; ước lượng → chỉ đợt nhỏ (≤ estimate_max_units); mơ hồ → không;
 * (2) ô mồi nằm trong `range` bước của đường đi tự nhiên; (3) đường vòng không quá `max_detour` lượt.
 */
export function lureCheck(d: GameData, s: GameState, origin: string, units: Counts, costOf?: (t: Terrain) => number): LureCheck {
  const L = d.campaign.lure, lure = s.lure;
  if (!L || !lure) return { divert: false, reason: 'chưa đặt mồi nhử' };
  const nat = nearestSettled(d, s, origin, costOf);
  if (!nat) return { divert: false, reason: 'không còn mục tiêu' };
  const level = intelLevel(s);
  const size = Object.values(units).reduce((a, n) => a + n, 0);
  if (level === 'vague') return { divert: false, reason: 'tình báo mơ hồ — địch không mắc mưu' };
  if (level === 'estimate' && size > L.estimate_max_units) return { divert: false, reason: `tình báo ước lượng chỉ đủ dụ đợt ≤ ${L.estimate_max_units} quân (đợt này ${size})` };
  const lp = shortestPath(d, s, origin, lure.tile, undefined, costOf);
  if (!lp) return { divert: false, reason: 'địch không có đường tới ô mồi' };
  if (nat.tile === lure.tile) return { divert: true, reason: 'đợt này vốn nhắm ô mồi', target: { tile: lure.tile, cost: lp.cost } };
  const np = shortestPath(d, s, origin, nat.tile, undefined, costOf)!;
  const near = Math.min(...np.path.map((p) => tileDistance(s, p, lure.tile)));
  if (near > L.range) return { divert: false, reason: `ô mồi cách đường tiến của địch ${near} bước (tối đa ${L.range})` };
  const detour = Math.ceil(lp.cost / ENEMY_SPEED) - Math.ceil(nat.cost / ENEMY_SPEED);
  if (detour > L.max_detour) return { divert: false, reason: `đường vòng thêm ${detour} lượt (tối đa ${L.max_detour})` };
  return { divert: true, reason: 'địch bị dụ', target: { tile: lure.tile, cost: lp.cost } };
}

/** Dự báo trước khi đặt mồi: nếu đặt mồi ở `tile` bây giờ, đợt kế tiếp sẽ ra sao (theo trạng thái hiện tại). */
export function lureForecast(d: GameData, s: GameState, tile: string): { raidId: string; turn: number } & LureCheck | null {
  const next = [...d.raids].filter((r) => r.turn >= s.turn).sort((a, b) => a.turn - b.turn || (a.id < b.id ? -1 : 1))[0];
  if (!next || !d.campaign.lure) return null;
  const h = structuredClone(s);
  h.turn = next.turn; h.lure = { tile, unit: '?' };
  return { raidId: next.id, turn: next.turn, ...lureCheck(d, h, next.origin, next.units, raidCostFn(d, h, next.units)) };
}

/** Hết hiệu lực mồi: đơn vị nhử trở về đội đứng yên ở ô mồi (nếu ô còn của ta; ngược lại mất). */
export function releaseLure(s: GameState) {
  const l = s.lure;
  if (!l) return;
  if (s.tiles[l.tile].status === 'settled') fieldArmy(s, l.tile).units[l.unit] = (fieldArmy(s, l.tile).units[l.unit] ?? 0) + 1;
  s.lure = null;
}
