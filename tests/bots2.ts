import { applyCommand } from '../src/sim/commands';
import { mobileSupplyUsed, supplyCap, warnLead } from '../src/sim/derived';
import { lureForecast } from '../src/sim/lure';
import { endTurn } from '../src/sim/turn';
import type { Cmd, GameState } from '../src/sim/types';
import { D2, fresh2 } from './helpers';

/** CR-005 M4: bot cho CMP-02. 'basic' bỏ qua thủy triều/nhử; 'tide-aware' xây cọc ngầm + trạm canh; 'lurer' thêm nhử. */
export type Strategy2 = 'idle' | 'turtle' | 'basic' | 'tide-aware' | 'lurer';

const tryCmd = (s: GameState, c: Cmd): GameState => { const r = applyCommand(D2, s, c); return r.error ? s : r.state; };
const settledIds = (s: GameState) => Object.values(s.tiles).filter((t) => t.status === 'settled').map((t) => t.id);
const cnt = (s: GameState, tile: string, type: string) => s.tiles[tile].buildings.filter((b) => b.type === type).length;

export function playBot2(seed: number, strat: Strategy2, trace?: (s: GameState) => void): GameState {
  let s = fresh2(seed);
  for (let guard = 0; guard < 40 && s.outcome === 'playing'; guard++) {
    if (strat !== 'idle') s = botTurn2(s, strat);
    trace?.(s);
    s = endTurn(D2, s);
  }
  return s;
}

function botTurn2(s: GameState, strat: Strategy2): GameState {
  const cap = D2.campaign.capital;
  const bait = 'TIL-203';
  // nhử: cử 1 lính ra ô sông có cọc, rồi đặt mồi (chỉ khi dự báo nói sẽ dụ được đợt kế)
  if (strat === 'lurer' && !s.lure && s.tiles[bait].status === 'settled') {
    const home = s.armies.find((a) => a.tile === cap && !a.move);
    const there = s.armies.some((a) => a.tile === bait && !a.move);
    if (!there && home && Object.keys(home.units).length && s.tiles[bait].buildings.some((b) => b.type === 'BLD-STAKES')) {
      const u = Object.keys(home.units).find((x) => !D2.units[x].garrison);
      if (u && lureForecast(D2, s, bait)?.divert) s = tryCmd(s, { t: 'move', army: home.id, to: bait, units: { [u]: 1 } });
    }
    s = tryCmd(s, { t: 'lure', tile: bait });
  }

  // dành tài nguyên cho mồi nhử khi cọc đã xong và còn đợt để nhử
  const saving = strat === 'lurer' && !s.lure && s.tiles[bait].status === 'settled' && s.tiles[bait].buildings.some((b) => b.type === 'BLD-STAKES') && D2.raids.some((r) => r.turn >= s.turn);
  for (const p of ['POL-LUY-BIEN', 'POL-NONG-HAU', 'POL-TIEN-PHONG']) s = tryCmd(s, { t: 'research', policy: p });
  // tide-aware dồn về tuyến sông (có cọc) để địch phải đánh vào chỗ cọc; các bot khác lấy ô bãi nội địa TIL-202
  const order = strat === 'tide-aware' ? ['TIL-203', 'TIL-204', 'TIL-205'] : ['TIL-203', 'TIL-204', 'TIL-202'];
  if (strat !== 'turtle') for (const id of order) s = tryCmd(s, { t: 'settle', tile: id });

  const smart = strat === 'tide-aware' || strat === 'lurer';
  const want = (id: string): [string, number][] => id === cap
    ? [['BLD-LUMBER', 2], ['BLD-GRANARY', 1], ['BLD-PALISADE', 1], ...(smart ? [['BLD-WATCH', 2] as [string, number]] : [])]
    : D2.tiles.find((t) => t.id === id)!.terrain === 'song'
      ? [...(smart ? [['BLD-STAKES', 1] as [string, number]] : []), ['BLD-PALISADE', 2], ['BLD-LUMBER', 1]]
      : [['BLD-LUMBER', 1], ['BLD-FARM', 1]];
  if (!saving) for (const id of [cap, ...settledIds(s).filter((x) => x !== cap)]) {
    for (const [type, n] of want(id)) for (let k = cnt(s, id, type); k < n; k++) s = tryCmd(s, { t: 'build', tile: id, bld: type });
  }
  if (!saving) for (const id of settledIds(s)) for (const type of ['BLD-GRANARY', 'BLD-LUMBER', 'BLD-PALISADE', 'BLD-FARM']) {
    s.tiles[id].buildings.forEach((b, i) => { if (b.type === type) s = tryCmd(s, { t: 'upgrade', tile: id, index: i }); });
  }

  const room = () => supplyCap(D2, s) - mobileSupplyUsed(D2, s);
  for (let i = 0; i < 12 && room() > 0; i++) {
    const n = tryCmd(s, { t: 'train', tile: cap, unit: i % 2 === 0 ? 'UNT-FOOT' : 'UNT-ARCHER', count: 1 });
    if (n === s) break; s = n;
  }
  // dân binh đồn trú: ở ô đang bị nhắm (nếu có cảnh báo), không thì ở thủ phủ
  const hot = s.raids.sort((a, b) => a.eta - b.eta)[0]?.target ?? cap;
  for (const at of [hot, cap]) for (let i = 0; i < 6; i++) { const n = tryCmd(s, { t: 'train', tile: at, unit: 'UNT-MILITIA', count: 1 }); if (n === s) break; s = n; }

  const lead = warnLead(D2, s);
  const threatened = s.raids.filter((r) => r.eta <= lead + 1).sort((a, b) => a.eta - b.eta)[0];
  const dest = threatened ? threatened.target : strat === 'tide-aware' && s.tiles['TIL-205'].status === 'settled' ? 'TIL-205' : cap;
  for (const a of s.armies.filter((x) => !x.move && x.tile !== dest && !(strat === 'lurer' && x.tile === bait && !threatened))) s = tryCmd(s, { t: 'move', army: a.id, to: dest });
  return s;
}

export interface Stats2 { strat: Strategy2; n: number; wins: number; lostReasons: Record<string, number>; avgRepelled: number }
export function batch2(strat: Strategy2, seeds: number[]): Stats2 {
  const st: Stats2 = { strat, n: seeds.length, wins: 0, lostReasons: {}, avgRepelled: 0 };
  for (const sd of seeds) {
    const r = playBot2(sd, strat);
    if (r.outcome === 'won') st.wins++; else st.lostReasons[r.outcomeReason ?? '?'] = (st.lostReasons[r.outcomeReason ?? '?'] ?? 0) + 1;
    st.avgRepelled += r.repelled / seeds.length;
  }
  return st;
}
