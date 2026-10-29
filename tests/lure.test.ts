import { describe, expect, it } from 'vitest';
import { applyCommand } from '../src/sim/commands';
import { validateData } from '../src/sim/data';
import { lureForecast } from '../src/sim/lure';
import { deserialize, serialize } from '../src/sim/save';
import { endTurn } from '../src/sim/turn';
import type { Cmd, GameState } from '../src/sim/types';
import { D, D2, fresh, fresh2 } from './helpers';

/** CMP-02: 203 là ô mồi (sông, kề 204 và 201); 204 là ô sông tiền tuyến; cả hai có cọc + 1 bộ binh; `watch` chòi canh quyết định mức tình báo. */
function setup(watch = 2): GameState {
  const s = fresh2();
  for (const id of ['TIL-203', 'TIL-204']) {
    const t = s.tiles[id]; t.status = 'settled';
    t.buildings.push({ type: 'BLD-STAKES', level: 1, remaining: 0 });
    s.armies.push({ id: `ARM-${id}`, tile: id, units: { 'UNT-FOOT': 2 } });
  }
  for (let i = 0; i < watch; i++) s.tiles['TIL-201'].buildings.push({ type: 'BLD-WATCH', level: 1, remaining: 0 });
  s.res = { grain: 500, wood: 500, stone: 100, iron: 50, dantam: 20 };
  s.turn = 2; // RAID-B1 sinh ở lượt 3
  return s;
}
const ok = (s: GameState, c: Cmd) => { const r = applyCommand(D2, s, c); if (r.error) throw new Error(r.error); return r.state; };
const armyUnits = (s: GameState, tile: string) => s.armies.find((a) => a.tile === tile && !a.move)?.units['UNT-FOOT'] ?? 0;

describe('CR-005 lệnh nhử', () => {
  it('trừ kho và 1 đơn vị, ghi mồi', () => {
    const s = ok(setup(), { t: 'lure', tile: 'TIL-203' });
    expect(s.lure).toEqual({ tile: 'TIL-203', unit: 'UNT-FOOT' });
    expect(s.res.grain).toBe(470); expect(s.res.wood).toBe(470);
    expect(armyUnits(s, 'TIL-203')).toBe(1);
  });
  it('bị từ chối đúng lý do', () => {
    const e = (s: GameState, tile = 'TIL-203') => applyCommand(D2, s, { t: 'lure', tile }).error ?? '';
    expect(applyCommand(D, fresh(), { t: 'lure', tile: 'TIL-007' }).error).toMatch(/không có nhử/);
    expect(e(setup(), 'TIL-201')).toMatch(/ô sông/);
    const noStakes = setup(); noStakes.tiles['TIL-203'].buildings = []; expect(e(noStakes)).toMatch(/cọc ngầm/);
    const noUnit = setup(); noUnit.armies = []; expect(e(noUnit)).toMatch(/đơn vị quân cơ động/);
    const poor = setup(); poor.res.grain = 0; expect(e(poor)).toMatch(/tài nguyên/);
    const twice = ok(setup(), { t: 'lure', tile: 'TIL-203' }); expect(e(twice, 'TIL-204')).toMatch(/đang hoạt động/);
    const late = setup(); late.turn = 18; expect(e(late)).toMatch(/Không còn đợt/);
  });
});

describe('CR-005 dự báo & phân giải nhử', () => {
  it('tình báo chính xác: dự báo dụ được đợt thuyền; mơ hồ: không', () => {
    expect(lureForecast(D2, setup(2), 'TIL-203')).toMatchObject({ raidId: 'RAID-B1', divert: true });
    const f = lureForecast(D2, setup(0), 'TIL-203')!;
    expect(f.divert).toBe(false); expect(f.reason).toMatch(/mơ hồ/);
  });
  it('tình báo ước lượng chỉ dụ được đợt nhỏ', () => {
    const s = setup(1); // RAID-B1 = 3 quân
    expect(lureForecast(D2, s, 'TIL-203')!.divert).toBe(true);
    s.turn = 17; const big = lureForecast(D2, s, 'TIL-203')!; // RAID-B5 = 19 quân
    expect(big.raidId).toBe('RAID-B5'); expect(big.divert).toBe(false); expect(big.reason).toMatch(/ước lượng/);
  });
  it('đợt kế tiếp bị dụ về ô mồi; khi trận xong mồi hết hiệu lực và đơn vị trở về', () => {
    let s = ok(setup(), { t: 'lure', tile: 'TIL-203' });
    s = endTurn(D2, s); // lượt 2 → 3
    s = endTurn(D2, s); // sinh RAID-B1 ở lượt 3
    const raid = s.raids.find((r) => r.id === 'RAID-B1')!;
    expect(raid.target).toBe('TIL-203'); expect(s.lure?.raidId).toBe('RAID-B1');
    for (let i = 0; i < 8 && s.raids.some((r) => r.id === 'RAID-B1'); i++) s = endTurn(D2, s);
    expect(s.lure).toBeNull();
    if (s.tiles['TIL-203'].status === 'settled') expect(armyUnits(s, 'TIL-203')).toBe(2); // đơn vị nhử trở về
    expect(s.log.join('\n')).toMatch(/Mồi nhử/);
  });
  it('mồi thất bại (không đủ tình báo): hết hiệu lực ngay khi đợt sinh ra, đơn vị trở về, đợt đi đường tự nhiên', () => {
    let s = ok(setup(0), { t: 'lure', tile: 'TIL-203' });
    s = endTurn(D2, s); s = endTurn(D2, s);
    expect(s.lure).toBeNull();
    expect(s.raids.find((r) => r.id === 'RAID-B1')!.target).toBe('TIL-201'); // hòa chi phí lúc nước rút → ID nhỏ hơn
    expect(armyUnits(s, 'TIL-203')).toBe(2);
  });
  it('ô mồi thất thủ → mất đơn vị nhử', () => {
    let s = ok(setup(), { t: 'lure', tile: 'TIL-203' });
    s.tiles['TIL-203'].garrison = {}; s.armies = s.armies.filter((a) => a.tile !== 'TIL-203');
    s.raids.push({ id: 'X', origin: 'TIL-209', target: 'TIL-203', eta: 1, units: { 'ENM-BOAT': 30 } });
    s = endTurn(D2, s);
    expect(s.tiles['TIL-203'].status).toBe('lost'); expect(s.lure).toBeNull();
  });
});

describe('CR-005 save v3', () => {
  it('serialize/deserialize giữ mồi nhử; save v2 được migrate với lure=null', () => {
    const s = ok(setup(), { t: 'lure', tile: 'TIL-203' });
    expect(deserialize(serialize(s)).lure).toEqual(s.lure);
    const v2: any = structuredClone(s); delete v2.lure; v2.save_version = 2;
    const m = deserialize(JSON.stringify({ save_version: 2, state: v2 }));
    expect(m.lure).toBeNull(); expect(m.save_version).toBe(3);
  });
  it('validator bắt cấu hình nhử sai', () => {
    const bad = structuredClone(D2); bad.campaign.lure = { cost: { gold: 1 } as any, range: -1, max_detour: -1, estimate_max_units: -1 };
    const e = validateData(bad, []).join('\n');
    expect(e).toMatch(/tài nguyên lạ/); expect(e).toMatch(/lure\.range/); expect(e).toMatch(/max_detour/); expect(e).toMatch(/estimate_max_units/);
  });
});
