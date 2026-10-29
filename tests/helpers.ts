import { applyCommand } from '../src/sim/commands';
import { loadData } from '../src/sim/data';
import { newGame } from '../src/sim/state';
import { endTurn } from '../src/sim/turn';
import type { Cmd, GameData, GameState } from '../src/sim/types';

export const D: GameData = loadData();

/** Áp lệnh, ném lỗi nếu bị từ chối (test phải dùng lệnh hợp lệ). */
export function run(s: GameState, ...cmds: Cmd[]): GameState {
  for (const c of cmds) {
    const r = applyCommand(D, s, c);
    if (r.error) throw new Error(`${JSON.stringify(c)} bị từ chối: ${r.error}`);
    s = r.state;
  }
  return s;
}
export function turns(s: GameState, n: number): GameState { for (let i = 0; i < n; i++) s = endTurn(D, s); return s; }
export const fresh = (seed?: number) => newGame(D, seed);

/** CMP-02 (CR-005): chiến dịch có thủy triều. */
export const D2: GameData = loadData('CMP-02');
export const fresh2 = (seed?: number) => newGame(D2, seed);
