import { describe, expect, it } from 'vitest';
import { applyCommand } from '../src/sim/commands';
import { atkMult, fortBonus, supplyCap, warnLead } from '../src/sim/derived';
import { canChoose, describeEffects, effectTones } from '../src/sim/events';
import { deserialize, serialize } from '../src/sim/save';
import { stateJson } from '../src/sim/state';
import { endTurn } from '../src/sim/turn';
import { D, fresh, run, turns } from './helpers';

const ev = (id: string) => D.events.find((e) => e.id === id)!;
const toTurn = (n: number, s = fresh()) => turns(s, n - s.turn);

describe('CR-002 sự kiện lựa chọn — dữ liệu', () => {
  it('8 sự kiện, mỗi cái 2–3 lựa chọn, đúng 1 mặc định, có nhãn nguồn và mô tả hệ quả', () => {
    expect(D.events).toHaveLength(8);
    for (const e of D.events) {
      expect(e.choices.length).toBeGreaterThanOrEqual(2); expect(e.choices.length).toBeLessThanOrEqual(3);
      expect(e.choices.filter((c) => c.default)).toHaveLength(1);
      for (const c of e.choices) expect(describeEffects(c.effects).length).toBeGreaterThan(0);
    }
  });
  it('lựa chọn mặc định không bao giờ tốn tài nguyên ngoài Lương/Gỗ/Đá nhỏ (không làm kẹt người chơi bỏ qua)', () => {
    for (const e of D.events) {
      const c = e.choices.find((x) => x.default)!;
      expect(c.effects.res?.iron ?? 0).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('CR-002 sự kiện lựa chọn — cơ chế', () => {
  it('sự kiện xuất hiện đúng lượt và chờ quyết định', () => {
    const s1 = fresh(); expect(s1.pendingEvents).toEqual([]);
    const s2 = endTurn(D, s1); expect(s2.turn).toBe(2); expect(s2.pendingEvents).toEqual(['EVT-01']);
  });
  it('chọn áp hiệu ứng, bỏ khỏi hàng chờ, ghi nhật ký; không chọn lại được', () => {
    const s = toTurn(2);
    const g0 = s.res.grain;
    const r = run(s, { t: 'choose', event: 'EVT-01', choice: 'a' });
    expect(r.res.grain).toBe(g0 - 10); expect(r.pendingEvents).toEqual([]);
    expect(r.eventLog).toEqual([{ turn: 2, event: 'EVT-01', choice: 'a', auto: false }]);
    expect(applyCommand(D, r, { t: 'choose', event: 'EVT-01', choice: 'b' }).error).toMatch(/không còn chờ/);
  });
  it('lựa chọn không tồn tại / thiếu tài nguyên bị từ chối và không đổi state', () => {
    const s = toTurn(2);
    expect(applyCommand(D, s, { t: 'choose', event: 'EVT-01', choice: 'z' }).error).toBeTruthy();
    const poor = { ...s, res: { ...s.res, iron: 0 } };
    expect(canChoose(poor, ev('EVT-01').choices[1])).toBe(false);
    const r = applyCommand(D, poor, { t: 'choose', event: 'EVT-01', choice: 'b' });
    expect(r.error).toMatch(/Không đủ/); expect(r.state).toBe(poor);
  });
  it('không chọn → kết thúc lượt tự áp lựa chọn mặc định (đánh dấu auto)', () => {
    const s = endTurn(D, toTurn(2));
    expect(s.pendingEvents.filter((x) => x === 'EVT-01')).toEqual([]);
    expect(s.eventLog[0]).toEqual({ turn: 2, event: 'EVT-01', choice: 'c', auto: true });
  });
  it('mod có hạn: công sự +5% trong 6 lượt rồi hết', () => {
    let s = run(toTurn(2), { t: 'choose', event: 'EVT-01', choice: 'c' });
    const f0 = fortBonus(D, s, 'TIL-001');
    const base = fortBonus(D, { ...s, mods: [] }, 'TIL-001');
    expect(f0 - base).toBeCloseTo(0.05);
    s = toTurn(7, s); expect(fortBonus(D, s, 'TIL-001') - base).toBeCloseTo(0.05); // hiệu lực lượt 2..7
    s = toTurn(8, s); expect(fortBonus(D, s, 'TIL-001')).toBeCloseTo(base);
  });
  it('mod theo địa hình chỉ áp cho ô đó; trần công sự 0.40 vẫn giữ', () => {
    const s = fresh(); s.turn = 18; s.pendingEvents = ['EVT-07']; s.res.wood = 999; s.res.stone = 999;
    const r = run(s, { t: 'choose', event: 'EVT-07', choice: 'a' });
    r.tiles['TIL-007'].status = 'settled';
    expect(fortBonus(D, r, 'TIL-007') - fortBonus(D, { ...r, mods: [] }, 'TIL-007')).toBeCloseTo(0.05);
    expect(fortBonus(D, r, 'TIL-005')).toBeCloseTo(fortBonus(D, { ...r, mods: [] }, 'TIL-005'));
    r.mods.push({ kind: 'fort', value: 5 }); expect(fortBonus(D, r, 'TIL-001')).toBeLessThanOrEqual(0.4);
  });
  it('mod atk_mult / supply_cap / warn_lead đổi đúng đại lượng dẫn xuất', () => {
    const s = fresh(); s.turn = 16; s.pendingEvents = ['EVT-06']; s.res.iron = 100;
    const a = run(s, { t: 'choose', event: 'EVT-06', choice: 'a' });
    expect(atkMult(D, a)).toBeCloseTo(atkMult(D, s) + 0.05);
    const t = fresh(); t.turn = 18; t.pendingEvents = ['EVT-07'];
    expect(supplyCap(D, run(t, { t: 'choose', event: 'EVT-07', choice: 'b' }))).toBe(supplyCap(D, t) + 1);
    const w = toTurn(2); expect(warnLead(D, run(w, { t: 'choose', event: 'EVT-01', choice: 'a' }))).toBe(warnLead(D, w) + 1);
  });
  it('đợt tập kích kế tiếp: hoãn + yếu đi (EVT-01b), mạnh thêm (EVT-08c)', () => {
    const s = run(toTurn(2), { t: 'choose', event: 'EVT-01', choice: 'b' });
    expect(s.raidEdits['RAID-1']).toEqual({ delay: 1, mult: 0.9 });
    const r0 = turns(fresh(), 4).raids.find((r) => r.id === 'RAID-1');
    const r1 = turns(s, 3).raids.find((r) => r.id === 'RAID-1');
    expect(r1!.eta).toBe(r0!.eta + 1); expect(r1!.units['ENM-FOOT']).toBeLessThan(3);
    const t = fresh(); t.turn = 19; t.pendingEvents = ['EVT-08'];
    expect(run(t, { t: 'choose', event: 'EVT-08', choice: 'c' }).raidEdits['RAID-5'].mult).toBe(1.15);
  });
  it('khoản vay EVT-05c: +lương ngay, trả sau 3 lượt (Lương không âm)', () => {
    const t = fresh(); t.turn = 13; t.pendingEvents = ['EVT-05'];
    let s = run(t, { t: 'choose', event: 'EVT-05', choice: 'c' });
    expect(s.scheduled).toEqual([{ turn: 15, res: { grain: -45, dantam: -1 } }]);
    s = turns(s, 3); expect(s.scheduled).toEqual([]); expect(s.res.grain).toBeGreaterThanOrEqual(0);
  });
  it('tất định: cùng seed + cùng lựa chọn → cùng trạng thái; khác lựa chọn → khác', () => {
    const play = (c: string) => turns(run(toTurn(2), { t: 'choose', event: 'EVT-01', choice: c }), 6);
    expect(stateJson(play('a'))).toBe(stateJson(play('a')));
    expect(stateJson(play('a'))).not.toBe(stateJson(play('b')));
  });
  it('hoàn tác trong lượt khôi phục sự kiện chờ (lệnh thuần state→state)', () => {
    const s = toTurn(2); const r = run(s, { t: 'choose', event: 'EVT-01', choice: 'a' });
    expect(s.pendingEvents).toEqual(['EVT-01']); expect(r.pendingEvents).toEqual([]);
  });
});

describe('CR-002 lưu/nạp', () => {
  it('khứ hồi giữ nguyên sự kiện, mod, lịch hẹn', () => {
    let s = run(toTurn(2), { t: 'choose', event: 'EVT-01', choice: 'a' });
    s = toTurn(7, s);
    expect(stateJson(deserialize(serialize(s)))).toBe(stateJson(s));
  });
  it('migrate bản lưu RC1 (v1, không có trường sự kiện) → chạy tiếp được', () => {
    const s: any = turns(fresh(), 3);
    for (const k of ['mods', 'pendingEvents', 'eventLog', 'raidEdits', 'scheduled']) delete s[k];
    s.save_version = 1;
    const old = JSON.stringify({ save_version: 1, state: s });
    const m = deserialize(old);
    expect(m.save_version).toBe(3); expect(m.mods).toEqual([]); expect(m.pendingEvents).toEqual([]);
    expect(() => turns(m, 5)).not.toThrow();
  });
});

describe('CR-003 V2: màu hậu quả thẳng hàng với mô tả', () => {
  it('mọi lựa chọn của mọi sự kiện: số phần tử effectTones = describeEffects; trừ tài nguyên là neg, cộng là pos', () => {
    for (const ev of D.events) for (const c of ev.choices) {
      expect(effectTones(c.effects).length, `${ev.id}/${c.id}`).toBe(describeEffects(c.effects).length);
    }
    expect(effectTones({ res: { grain: -10 } })).toEqual(['neg']);
    expect(effectTones({ res: { dantam: 2 } })).toEqual(['pos']);
    expect(effectTones({})).toEqual(['neu']);
    expect(effectTones({ raid: { delay: 1, mult: 0.9 } })).toEqual(['pos', 'pos']);
    expect(effectTones({ later: [{ after: 3, res: { grain: -45 } }] })).toEqual(['neg']);
  });
});
