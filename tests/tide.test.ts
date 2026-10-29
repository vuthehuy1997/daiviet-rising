import { describe, expect, it } from 'vitest';
import { applyCommand } from '../src/sim/commands';
import { loadData, validateData } from '../src/sim/data';
import { stakesPenalty, tideForecast, tidePhase } from '../src/sim/derived';
import { stateJson } from '../src/sim/state';
import { endTurn } from '../src/sim/turn';
import type { GameState } from '../src/sim/types';
import { D, D2, fresh, fresh2 } from './helpers';

const withStakes = (s: GameState, tile: string): GameState => {
  const c = structuredClone(s);
  c.tiles[tile].buildings.push({ type: 'BLD-STAKES', level: 1, remaining: 0 });
  c.tiles[tile].status = 'settled';
  return c;
};

describe('SYS-11 thủy triều', () => {
  it('chu kỳ 3 lượt: lên → đầy → rút, lặp lại; có xem trước', () => {
    expect([1, 2, 3, 4, 5, 6].map((t) => tidePhase(D2, t))).toEqual(['rising', 'high', 'ebb', 'rising', 'high', 'ebb']);
    expect(tideForecast(D2, 2, 3)).toEqual(['high', 'ebb', 'rising']);
  });
  it('CMP-01 không có thủy triều và hành vi không đổi', () => {
    expect(tidePhase(D, 3)).toBeNull();
    expect(tideForecast(D, 1, 3)).toEqual([]);
    const s = withStakes(fresh(), 'TIL-007');
    s.turn = 2; const a = stakesPenalty(D, s, 'TIL-007'); s.turn = 3;
    expect(stakesPenalty(D, s, 'TIL-007')).toBe(a);
    expect(a).toBeCloseTo(0.12);
  });
  it('cọc ngầm mạnh nhất khi nước rút, yếu khi nước đầy', () => {
    const s = withStakes(fresh2(), 'TIL-203');
    const at = (turn: number) => { s.turn = turn; return stakesPenalty(D2, s, 'TIL-203'); };
    expect(at(3)).toBeCloseTo(0.12);        // rút
    expect(at(1)).toBeCloseTo(0.12 * 0.5);  // lên
    expect(at(2)).toBeCloseTo(0.12 * 0.25); // đầy
    expect(at(3)).toBeGreaterThan(at(2));
  });
  it('thuyền địch mắc cạn: ETA dài hơn khi nước rút; quân bộ không bị ảnh hưởng', () => {
    const spawn = (d: typeof D2, raidId: string, turn: number) => {
      const s = fresh2(); s.turn = turn; s.tiles['TIL-204'].status = 'settled'; // khu định cư ở sông: đường thuyền đi qua 2 ô sông
      return endTurn(d, s).raids.find((r) => r.id === raidId)!.eta;
    };
    const lunar = structuredClone(D2); lunar.campaign.tide!.phase_offset = 1; // lượt 3 → pha 'lên' thay vì 'rút'
    expect(tidePhase(lunar, 3)).toBe('rising');
    const ebb = spawn(D2, 'RAID-B1', 3), notEbb = spawn(lunar, 'RAID-B1', 3);
    expect(ebb).toBeGreaterThan(notEbb);
    // quân bộ (RAID-B2 sinh ở lượt 7 = 'lên' (7-1)%3=0; đổi offset để lượt 7 là 'rút') → ETA không đổi
    const shift = structuredClone(D2); shift.campaign.tide!.phase_offset = 2; // (7-1+2)%3=2 → rút
    expect(tidePhase(shift, 7)).toBe('ebb');
    expect(spawn(shift, 'RAID-B2', 7)).toBe(spawn(D2, 'RAID-B2', 7));
  });
  it('validator bắt cấu hình thủy triều sai', () => {
    const bad = structuredClone(D2);
    bad.campaign.tide = { period: 9, phase_offset: 0.5, stakes_mult: { rising: 2, high: 0, ebb: 1 }, naval_ebb_cost_mult: 0.5 };
    const e = validateData(bad, []).join('\n');
    expect(e).toMatch(/tide\.period/); expect(e).toMatch(/phase_offset/); expect(e).toMatch(/stakes_mult\.rising/); expect(e).toMatch(/naval_ebb_cost_mult/);
  });
});

describe('CMP-02 dữ liệu & luật', () => {
  it('dữ liệu hợp lệ, 10 ô, ENM-BOAT tồn tại', () => {
    expect(() => loadData('CMP-02')).not.toThrow();
    expect(D2.tiles).toHaveLength(10);
    expect(D2.units['ENM-BOAT'].class).toBe('thuy_binh');
  });
  it('không có đàm phán; sống sót tới hết thời hạn = thắng', () => {
    expect(applyCommand(D2, fresh2(), { t: 'negotiate' }).error).toMatch(/không có đàm phán/);
    const s = fresh2(); s.turn = D2.campaign.rules.deadline_turn; s.res.dantam = 50;
    const n = endTurn(D2, s);
    expect(n.outcome).toBe('won');
  });
  it('EDGE-07: cùng seed + cùng lệnh → cùng kết quả (CMP-02)', () => {
    const play = () => { let s = fresh2(1288); for (let i = 0; i < 12 && s.outcome === 'playing'; i++) s = endTurn(D2, s); return stateJson(s); };
    expect(play()).toBe(play());
  });
});
