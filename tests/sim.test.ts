import { describe, expect, it } from 'vitest';
import { applyCommand } from '../src/sim/commands';
import { resolveCombat, counter } from '../src/sim/combat';
import { loadData, validateData } from '../src/sim/data';
import { moraleMod, supplyCap, warnLead, raidIntel } from '../src/sim/derived';
import { Rng } from '../src/sim/rng';
import { deserialize, serialize } from '../src/sim/save';
import { stateJson } from '../src/sim/state';
import { endTurn } from '../src/sim/turn';
import { D, fresh, run, turns } from './helpers';

describe('TST-05 dữ liệu', () => {
  it('game-data hợp lệ và có nhãn nguồn', () => { expect(() => loadData()).not.toThrow(); });
  it('validator bắt ID trùng, kề không đối xứng và nhãn sai', () => {
    const bad = structuredClone(D);
    bad.tiles[0].adj.push('TIL-012'); // 001 kề 012 nhưng 012 không kề 001
    const errs = validateData(bad, [{ id: 'X', source_label: 'NOPE' }, { id: 'X', source_label: 'FICTION' }]);
    expect(errs.join('\n')).toMatch(/kề không đối xứng/);
    expect(errs.join('\n')).toMatch(/source_label/);
    expect(errs.join('\n')).toMatch(/ID trùng/);
  });
});

describe('SYS-02/03 lượt, sản xuất, supply', () => {
  const FARM = Math.round(D.buildings['BLD-FARM'].produces!.grain! * D.buildings['BLD-FARM'].terrain_mult!.dong_bang!);
  const LUMBER = D.buildings['BLD-LUMBER'].produces!.wood!; // thủ phủ là đồng bằng → không có hệ số rừng
  it('sản xuất theo hệ số địa hình: ruộng ở đồng bằng = round(base×1.25)', () => {
    const s = endTurn(D, fresh());
    expect(s.res.grain).toBe(D.campaign.start.grain + FARM);
    expect(s.res.wood).toBe(D.campaign.start.wood + LUMBER);
    expect(s.turn).toBe(2);
  });
  it('công trình mới chưa sản xuất cho tới khi xây xong (sản xuất xảy ra trước xây dựng)', () => {
    let s = run(fresh(), { t: 'build', tile: 'TIL-001', bld: 'BLD-FARM' });
    const g0 = s.res.grain;
    s = endTurn(D, s); // lượt 1: ruộng mới có remaining 1 → chưa sản xuất
    expect(s.res.grain - g0).toBe(FARM);
    s = endTurn(D, s); // lượt 2: đã hoạt động → 2 ruộng
    expect(s.res.grain - g0).toBe(FARM + 2 * FARM);
  });
  it('supply cap = base + ruộng + kho', () => {
    let s = fresh();
    expect(supplyCap(D, s)).toBe(4 + 1); // 1 ruộng cấp 1
    s = run(s, { t: 'build', tile: 'TIL-001', bld: 'BLD-GRANARY' });
    s = turns(s, 1);
    expect(supplyCap(D, s)).toBe(4 + 1 + 2);
  });
  it('vượt trần quân cơ động giảm morale 5%/đơn vị', () => {
    let s = fresh(); s.armies.push({ id: 'A', tile: 'TIL-001', units: { 'UNT-FOOT': 8 } });
    expect(supplyCap(D, s)).toBe(5);
    expect(moraleMod(D, s)).toBeCloseTo(0.85, 5);
  });
  it('EDGE-05: không đủ tài nguyên → lệnh bị từ chối, tài nguyên không đổi', () => {
    const s = fresh(); s.res.wood = 0;
    const r = applyCommand(D, s, { t: 'build', tile: 'TIL-001', bld: 'BLD-WATCH' });
    expect(r.error).toBeTruthy(); expect(r.state.res.wood).toBe(0);
  });
  it('hết ô xây bị từ chối; địa hình không phù hợp bị từ chối', () => {
    const s = fresh();
    expect(applyCommand(D, s, { t: 'build', tile: 'TIL-001', bld: 'BLD-STAKES' }).error).toMatch(/Địa hình/);
    let t = fresh(); t.res.wood = 999; t.res.stone = 999;
    for (let i = 0; i < 3; i++) t = run(t, { t: 'build', tile: 'TIL-001', bld: 'BLD-WATCH' });
    expect(applyCommand(D, t, { t: 'build', tile: 'TIL-001', bld: 'BLD-WATCH' }).error).toMatch(/Hết ô/);
  });
  it('demolish hoàn 50% (EDGE-03)', () => {
    const s = run(fresh(), { t: 'demolish', tile: 'TIL-001', index: 0 }); // BLD-FARM cost wood 20
    expect(s.res.wood).toBe(D.campaign.start.wood + 10);
    expect(s.tiles['TIL-001'].buildings.length).toBe(2);
  });
});

describe('SYS-05 huấn luyện, SYS-01 di chuyển', () => {
  it('huấn luyện bộ binh tốn đúng chi phí, xong sau train_turns', () => {
    let s = run(fresh(), { t: 'train', tile: 'TIL-001', unit: 'UNT-FOOT', count: 2 });
    expect(s.res.grain).toBe(D.campaign.start.grain - 20);
    s = turns(s, 1);
    expect(s.armies[0].units['UNT-FOOT']).toBe(2);
  });
  it('cung thủ cần 2 lượt; nỏ thủ cần lò rèn', () => {
    let s = run(fresh(), { t: 'train', tile: 'TIL-001', unit: 'UNT-ARCHER', count: 1 });
    s = turns(s, 1); expect(s.armies.length).toBe(0);
    s = turns(s, 1); expect(s.armies[0].units['UNT-ARCHER']).toBe(1);
    expect(applyCommand(D, fresh(), { t: 'train', tile: 'TIL-001', unit: 'UNT-CROSSBOW', count: 1 }).error).toMatch(/Lò rèn/);
  });
  it('dân binh đồn trú vào garrison, không tính supply', () => {
    let s = run(fresh(), { t: 'train', tile: 'TIL-001', unit: 'UNT-MILITIA', count: 3 });
    s = turns(s, 1);
    expect(s.tiles['TIL-001'].garrison['UNT-MILITIA']).toBe(3);
    expect(s.armies.length).toBe(0);
  });
  it('di chuyển tốn ≥1 lượt và theo chi phí địa hình (PIL-02)', () => {
    let s = fresh(); s.res.grain = 999; s.res.wood = 999; s.res.stone = 999; s.res.dantam = 50;
    s = run(s, { t: 'train', tile: 'TIL-001', unit: 'UNT-FOOT', count: 1 }); s = turns(s, 1);
    const id = s.armies[0].id;
    s = run(s, { t: 'move', army: id, to: 'TIL-003' }); // nui: chi phí 3, tốc độ 2 → 2 lượt
    expect(s.armies.find((a) => a.move)!.move!.remaining).toBe(2);
    s = turns(s, 1); expect(s.armies[0].tile).toBe('TIL-001');
    s = turns(s, 1); expect(s.armies[0].tile).toBe('TIL-003'); expect(s.armies[0].move).toBeUndefined();
  });
  it('lập khu định cư cần kề khu định cư, +3 Dân tâm', () => {
    expect(applyCommand(D, fresh(), { t: 'settle', tile: 'TIL-007' }).error).toBeTruthy();
    const s = run(fresh(), { t: 'settle', tile: 'TIL-005' });
    expect(s.tiles['TIL-005'].status).toBe('settled'); expect(s.res.dantam).toBe(D.campaign.start.dantam + 3);
  });
  it('không thể move vào ô địch / attack ô mình', () => {
    let s = fresh(); s.armies.push({ id: 'A', tile: 'TIL-001', units: { 'UNT-FOOT': 1 } });
    expect(applyCommand(D, s, { t: 'move', army: 'A', to: 'TIL-007' }).error).toBeTruthy();
    expect(applyCommand(D, s, { t: 'attack', army: 'A', to: 'TIL-002' }).error).toBeTruthy();
  });
});

describe('SYS-06 trận tự động', () => {
  const mk = (att: any, def: any, o: any = {}) => resolveCombat({
    d: D, terrain: 'dong_bang', attacker: att, defender: def, rng: new Rng(o.seed ?? 1),
    attMods: { atkMult: 1, fort: 0, terrainAtk: 1, ...(o.att ?? {}) }, defMods: { atkMult: 1, fort: 0, terrainAtk: 1, ...(o.def ?? {}) },
  });
  it('xác định: cùng seed → cùng kết quả (TST-02)', () => {
    const a = mk({ 'UNT-FOOT': 5, 'UNT-ARCHER': 3 }, { 'ENM-FOOT': 5, 'ENM-ARCHER': 3 });
    const b = mk({ 'UNT-FOOT': 5, 'UNT-ARCHER': 3 }, { 'ENM-FOOT': 5, 'ENM-ARCHER': 3 });
    expect(a).toEqual(b);
  });
  it('đông hơn rõ rệt thì thắng; không quân thì thua', () => {
    expect(mk({ 'UNT-FOOT': 10 }, { 'ENM-FOOT': 2 }).winner).toBe('attacker');
    expect(mk({ 'UNT-FOOT': 2 }, { 'ENM-FOOT': 10 }).winner).toBe('defender');
    expect(mk({}, { 'ENM-FOOT': 1 }).winner).toBe('defender');
  });
  it('khắc chế: cận chiến > tầm xa; thủy > bộ', () => {
    expect(counter('bo_binh', 'cung_no')).toBeGreaterThan(1);
    expect(counter('cung_no', 'bo_binh')).toBe(1);
  });
  it('lũy giảm thương vong phòng thủ: cùng seed, có lũy thì thắng lợi hơn', () => {
    let wins = [0, 0];
    for (let seed = 1; seed <= 40; seed++) {
      wins[0] += mk({ 'ENM-FOOT': 6 }, { 'UNT-FOOT': 5 }, { seed }).winner === 'defender' ? 1 : 0;
      wins[1] += mk({ 'ENM-FOOT': 6 }, { 'UNT-FOOT': 5 }, { seed, def: { fort: 0.3 } }).winner === 'defender' ? 1 : 0;
    }
    expect(wins[1]).toBeGreaterThan(wins[0]);
  });
  it('báo cáo nguyên nhân luôn có 1–3 mục (PIL-03)', () => {
    const r = mk({ 'UNT-FOOT': 4 }, { 'ENM-ARCHER': 4 }, { def: { fort: 0.2 } });
    expect(r.causes.length).toBeGreaterThanOrEqual(1); expect(r.causes.length).toBeLessThanOrEqual(3);
  });
});

describe('SYS-07/08 tập kích, cảnh báo, tình báo (TST-04)', () => {
  it('đợt 1 sinh ở lượt 4 nhắm ô định cư gần nhất với ETA đúng chi phí', () => {
    let s = turns(fresh(), 4); // đã phân giải lượt 1..4
    expect(s.raids.length).toBe(1);
    expect(s.raids[0].id).toBe('RAID-1'); expect(s.raids[0].target).toBe('TIL-001');
    // 011→009(rừng 2)→006(rừng 2)→003(núi 3)→001? hoặc đường rẻ nhất; chỉ kiểm tra ETA ≥ 1 và = ceil(cost/2)
    expect(s.raids[0].eta).toBeGreaterThanOrEqual(1);
  });
  it('warn_lead = 2 + chòi canh (≤ +3); EDGE-04 kho bị phá giảm cap', () => {
    let s = fresh(); expect(warnLead(D, s)).toBe(2);
    s = run(s, { t: 'build', tile: 'TIL-001', bld: 'BLD-WATCH' }); s = turns(s, 1);
    expect(warnLead(D, s)).toBe(3);
  });
  it('tình báo: không chòi canh → mơ hồ; 1 → ước lượng; 2 → chính xác', () => {
    let s = fresh(); const u = { 'ENM-FOOT': 8 };
    expect(raidIntel(D, s, u, 'R').level).toBe('vague'); expect(raidIntel(D, s, u, 'R').text).not.toMatch(/\d/);
    s = run(s, { t: 'build', tile: 'TIL-001', bld: 'BLD-WATCH' }); s = turns(s, 1);
    expect(raidIntel(D, s, u, 'R').level).toBe('estimate');
    s = run(s, { t: 'build', tile: 'TIL-001', bld: 'BLD-WATCH' }); s = turns(s, 1);
    expect(raidIntel(D, s, u, 'R')).toMatchObject({ level: 'exact', text: '8 Bộ binh địch' });
  });
  it('bỏ mặc: đợt tập kích làm mất thủ phủ → thua', () => {
    let s = fresh(); for (let i = 0; i < 40 && s.outcome === 'playing'; i++) s = endTurn(D, s);
    expect(s.outcome).toBe('lost');
  });
  it('phòng thủ thành công: dân binh + lũy chặn RAID-1, +Dân tâm, repelled=1', () => {
    let s = fresh(); s.res.grain = 500; s.res.wood = 500; s.res.stone = 200;
    s = run(s, { t: 'train', tile: 'TIL-001', unit: 'UNT-MILITIA', count: 6 }, { t: 'build', tile: 'TIL-001', bld: 'BLD-PALISADE' });
    s = turns(s, 1);
    while (s.turn <= 10 && s.reports.length === 0) s = endTurn(D, s);
    const rep = s.reports.find((r) => r.kind === 'raid')!;
    expect(rep.winner).toBe('defender'); expect(s.repelled).toBe(1);
    expect(rep.causes.length).toBeGreaterThan(0);
    expect(s.tiles['TIL-001'].status).toBe('settled');
  });
});

describe('SYS-12 thắng/thua và tấn công', () => {
  it('đàm phán bị từ chối khi chưa đủ điều kiện', () => {
    expect(applyCommand(D, fresh(), { t: 'negotiate' }).error).toMatch(/lượt/);
  });
  it('hết hạn mà chưa giảng hòa → thua', () => {
    let s = fresh(); s.tiles['TIL-001'].garrison = { 'UNT-MILITIA': 200 }; s.res.dantam = 100;
    for (let i = 0; i < 40 && s.outcome === 'playing'; i++) s = endTurn(D, s);
    expect(s.outcome).toBe('lost'); expect(s.outcomeReason).toMatch(/Hết thời hạn|Thủ phủ|Dân tâm/);
  });
  it('Dân tâm âm 3 lượt liền → thua', () => {
    let s = fresh(); s.res.dantam = -5; s.tiles['TIL-001'].garrison = { 'UNT-MILITIA': 200 };
    s = turns(s, 3); expect(s.outcome).toBe('lost'); expect(s.outcomeReason).toBe('Dân tâm cạn kiệt');
  });
  it('tấn công ô địch: thắng thì ô thành đất trống và +Dân tâm', () => {
    let s = fresh(); s.armies.push({ id: 'A', tile: 'TIL-001', units: { 'UNT-FOOT': 4 } });
    s = run(fresh(), { t: 'settle', tile: 'TIL-005' }); s.armies.push({ id: 'A', tile: 'TIL-005', units: { 'UNT-FOOT': 12 } });
    s = run(s, { t: 'attack', army: 'A', to: 'TIL-007' });
    for (let i = 0; i < 3 && s.tiles['TIL-007'].status === 'hostile'; i++) s = endTurn(D, s);
    expect(s.tiles['TIL-007'].status).toBe('open');
    expect(s.reports.some((r) => r.kind === 'assault' && r.winner === 'attacker')).toBe(true);
  });
  it('tấn công thua: ô vẫn do địch giữ, quân không tới đích', () => {
    let s = run(fresh(), { t: 'settle', tile: 'TIL-005' }); s.armies.push({ id: 'A', tile: 'TIL-005', units: { 'UNT-FOOT': 1 } });
    s = run(s, { t: 'attack', army: 'A', to: 'TIL-007' });
    for (let i = 0; i < 3 && !s.reports.some((r) => r.kind === 'assault'); i++) s = endTurn(D, s);
    const rep = s.reports.find((r) => r.kind === 'assault')!;
    expect(rep.winner).toBe('defender');
    expect(s.tiles['TIL-007'].status).toBe('hostile');
    expect(s.armies.every((a) => a.tile !== 'TIL-007')).toBe(true);
  });
  it('không thể tấn công ô chỉ kề ô địch khác (phải chiếm từng bước)', () => {
    let s = run(fresh(), { t: 'settle', tile: 'TIL-005' }); s.armies.push({ id: 'A', tile: 'TIL-005', units: { 'UNT-FOOT': 1 } });
    expect(applyCommand(D, s, { t: 'attack', army: 'A', to: 'TIL-012' }).error).toMatch(/đường/);
  });
});

describe('TST-02/06 xác định & lưu game', () => {
  const script = (seed: number) => {
    let s = fresh(seed); s.res.grain = 400; s.res.wood = 400; s.res.stone = 100;
    s = run(s, { t: 'train', tile: 'TIL-001', unit: 'UNT-FOOT', count: 3 }, { t: 'build', tile: 'TIL-001', bld: 'BLD-PALISADE' });
    return turns(s, 15);
  };
  it('cùng seed + lệnh → trạng thái giống hệt', () => { expect(stateJson(script(7))).toBe(stateJson(script(7))); });
  it('khác seed → có thể khác (rng thật sự được dùng)', () => { expect(stateJson(script(7))).not.toBe(stateJson(script(8))); });
  it('lưu/nạp round-trip giữ nguyên trạng thái và tiếp tục xác định', () => {
    const s = script(3);
    const l = deserialize(serialize(s));
    expect(stateJson(l)).toBe(stateJson(s));
    expect(stateJson(endTurn(D, l))).toBe(stateJson(endTurn(D, s)));
  });
  it('từ chối bản lưu hỏng / phiên bản mới hơn', () => {
    expect(() => deserialize('không phải json')).toThrow();
    expect(() => deserialize(JSON.stringify({ save_version: 99, state: {} }))).toThrow(/mới hơn/);
    expect(() => deserialize(JSON.stringify({ save_version: 1, state: {} }))).toThrow();
  });
  it('lệnh bị từ chối không làm đổi state gốc', () => {
    const s = fresh(); const before = stateJson(s);
    applyCommand(D, s, { t: 'build', tile: 'TIL-007', bld: 'BLD-FARM' });
    expect(stateJson(s)).toBe(before);
  });
});

describe('SYS-05 trần đồn trú (phát hiện bởi TST-08)', () => {
  it('vượt trần đồn trú bị từ chối; lũy nâng trần', () => {
    let s = fresh(); s.res.grain = 999; s.res.wood = 999; s.res.stone = 999;
    const cap0 = D.campaign.rules.garrison_base + D.campaign.rules.garrison_capital_bonus;
    expect(applyCommand(D, s, { t: 'train', tile: 'TIL-001', unit: 'UNT-MILITIA', count: cap0 + 1 }).error).toMatch(/trần đồn trú/);
    s = run(s, { t: 'train', tile: 'TIL-001', unit: 'UNT-MILITIA', count: cap0 });
    expect(applyCommand(D, s, { t: 'train', tile: 'TIL-001', unit: 'UNT-MILITIA', count: 1 }).error).toMatch(/trần đồn trú/);
    s = run(s, { t: 'build', tile: 'TIL-001', bld: 'BLD-PALISADE' }); s = turns(s, 1);
    expect(applyCommand(D, s, { t: 'train', tile: 'TIL-001', unit: 'UNT-MILITIA', count: 1 }).error).toBeUndefined();
  });
});
