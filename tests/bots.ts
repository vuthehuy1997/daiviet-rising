import { applyCommand } from '../src/sim/commands';
import { mobileSupplyUsed, supplyCap, warnLead } from '../src/sim/derived';
import { endTurn } from '../src/sim/turn';
import type { Cmd, GameState } from '../src/sim/types';
import { D, fresh } from './helpers';

/** Cách bot chọn ở sự kiện: 'default' = để tự áp mặc định; 'a'|'b'|'c' = luôn chọn đó nếu có (không thì mặc định); 'mix' = xoay vòng theo seed. */
export type Pick = 'default' | 'a' | 'b' | 'c' | 'mix' | Record<string, string>; // Record: sự kiện → lựa chọn (còn lại mặc định)
export type Strategy = 'idle' | 'turtle' | 'sprawl' | 'expand' | 'expand-strike';

function tryCmd(s: GameState, c: Cmd): GameState {
  const r = applyCommand(D, s, c);
  return r.error ? s : r.state;
}

const settledIds = (s: GameState) => Object.values(s.tiles).filter((t) => t.status === 'settled').map((t) => t.id);
const front = (s: GameState) => settledIds(s).sort((a, b) => D.tiles.find((t) => t.id === a)!.y - D.tiles.find((t) => t.id === b)!.y)[0];

/** Bot tham lam đơn giản dùng để kiểm tra cân bằng thô (không phải người chơi tối ưu). */
export function playBot(seed: number, strat: Strategy, pick: Pick = 'default'): GameState {
  let s = fresh(seed);
  for (let guard = 0; guard < 60 && s.outcome === 'playing'; guard++) {
    if (strat !== 'idle') s = botTurn(s, strat, pick, seed);
    s = endTurn(D, s);
  }
  return s;
}

function chooseEvents(s: GameState, pick: Pick, seed: number): GameState {
  for (const id of [...s.pendingEvents]) {
    const ev = D.events.find((e) => e.id === id)!;
    const want = typeof pick === 'object' ? pick[id] : pick === 'default' ? undefined : pick === 'mix' ? 'abc'[(seed + s.turn) % 3] : pick;
    const c = ev.choices.find((x) => x.id === want);
    if (c) s = tryCmd(s, { t: 'choose', event: id, choice: c.id });
  }
  return s;
}

function botTurn(s: GameState, strat: Strategy, pick: Pick, seed: number): GameState {
  s = chooseEvents(s, pick, seed);
  s = tryCmd(s, { t: 'negotiate' });
  if (s.outcome !== 'playing') return s;
  for (const p of ['POL-LUY-BIEN', 'POL-NONG-HAU', 'POL-TIEN-PHONG']) s = tryCmd(s, { t: 'research', policy: p });

  if (strat !== 'turtle') {
    const order = strat === 'sprawl' ? ['TIL-005', 'TIL-002', 'TIL-003', 'TIL-006', 'TIL-007', 'TIL-008', 'TIL-004'] : ['TIL-005', 'TIL-004', 'TIL-003'];
    for (const id of order) s = tryCmd(s, { t: 'settle', tile: id });
  }
  // danh mục công trình mục tiêu theo ô (đếm sẵn có, không xây lặp vô hạn)
  const cap = D.campaign.capital;
  const fr = front(s);
  const want = (tileId: string): [string, number][] => tileId === cap
    ? [['BLD-LUMBER', 2], ['BLD-GRANARY', 1], ['BLD-PALISADE', 1]]
    : tileId === fr ? [['BLD-PALISADE', 3], ['BLD-LUMBER', 1]] : [['BLD-LUMBER', 1], ['BLD-FARM', 1]];
  for (const tileId of [fr, cap, ...settledIds(s).filter((x) => x !== fr && x !== cap)]) {
    for (const [type, n] of want(tileId)) {
      const have = s.tiles[tileId].buildings.filter((b) => b.type === type).length;
      for (let k = have; k < n; k++) s = tryCmd(s, { t: 'build', tile: tileId, bld: type });
    }
  }
  // nâng cấp theo ưu tiên: kho/ruộng (trần quân) → lũy ở tiền tuyến → chòi canh
  for (const tileId of [fr, cap, ...settledIds(s).filter((x) => x !== fr && x !== cap)]) {
    for (const type of ['BLD-GRANARY', 'BLD-LUMBER', 'BLD-PALISADE', 'BLD-FARM']) {
      s.tiles[tileId].buildings.forEach((b, i) => { if (b.type === type) s = tryCmd(s, { t: 'upgrade', tile: tileId, index: i }); });
    }
  }

  // huấn luyện
  const room = () => supplyCap(D, s) - mobileSupplyUsed(D, s);
  for (let i = 0; i < 12 && room() > 0; i++) {
    const u = i % 2 === 0 ? 'UNT-FOOT' : 'UNT-ARCHER';
    const next = tryCmd(s, { t: 'train', tile: cap, unit: u, count: 1 });
    if (next === s) break;
    s = next;
  }
  for (let i = 0; i < 6; i++) { const n = tryCmd(s, { t: 'train', tile: fr, unit: 'UNT-MILITIA', count: 1 }); if (n === s) break; s = n; }

  // tập trung quân tới ô bị nhắm khi có cảnh báo; nếu không, về ô tiền tuyến
  const lead = warnLead(D, s);
  const threatened = s.raids.filter((r) => r.eta <= lead + 1).sort((a, b) => a.eta - b.eta)[0];
  const dest = threatened ? threatened.target : fr;
  for (const a of s.armies.filter((x) => !x.move && x.tile !== dest)) s = tryCmd(s, { t: 'move', army: a.id, to: dest });

  if (strat === 'expand-strike' && s.turn >= 6) {
    // tiến chiếm ô địch kề khi đủ quân, rồi tiến dần về hậu cứ biên (TIL-012)
    const order = ['TIL-007', 'TIL-008', 'TIL-010', 'TIL-012'];
    for (const target of order) {
      const t = s.tiles[target];
      if (t.status !== 'hostile') continue;
      const army = s.armies.filter((a) => !a.move).sort((a, b) => Object.values(b.units).reduce((x, y) => x + y, 0) - Object.values(a.units).reduce((x, y) => x + y, 0))[0];
      const defN = Object.values(t.defenders).reduce((x, y) => x + y, 0);
      const have = army ? Object.values(army.units).reduce((x, y) => x + y, 0) : 0;
      if (army && have >= defN * 2 && !s.raids.some((r) => r.eta <= lead + 1) && !threatened) s = tryCmd(s, { t: 'attack', army: army.id, to: target });
      break;
    }
  }
  return s;
}

export interface Stats { pick: Pick; strat: Strategy; n: number; wins: number; lostReasons: Record<string, number>; avgRepelled: number }
export function batch(strat: Strategy, seeds: number[], pick: Pick = 'default'): Stats {
  const st: Stats = { pick, strat, n: seeds.length, wins: 0, lostReasons: {}, avgRepelled: 0 };
  for (const sd of seeds) {
    const r = playBot(sd, strat, pick);
    if (r.outcome === 'won') st.wins++; else st.lostReasons[r.outcomeReason ?? '?'] = (st.lostReasons[r.outcomeReason ?? '?'] ?? 0) + 1;
    st.avgRepelled += r.repelled / seeds.length;
  }
  return st;
}
