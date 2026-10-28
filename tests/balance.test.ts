import { writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { batch, type Strategy } from './bots';

const seeds = Array.from({ length: 40 }, (_, i) => i + 1);

/** TST-08: kiểm tra cân bằng thô bằng bot. Ngưỡng là mục tiêu thiết kế, xem docs/qa/BALANCE_NOTES.md. */
describe('TST-08 cân bằng (bot)', () => {
  const results = new Map<Strategy, ReturnType<typeof batch>>();
  for (const s of ['idle', 'turtle', 'sprawl', 'expand', 'expand-strike'] as Strategy[]) results.set(s, batch(s, seeds));
  it('ghi kết quả (bằng chứng)', () => { writeFileSync('docs/qa/balance_last.json', JSON.stringify([...results.values()], null, 1)); });
  it('bỏ mặc luôn thua', () => { expect(results.get('idle')!.wins).toBe(0); });
  it('chiến thuật thông minh thắng được nhưng không áp đảo (30%–90%)', () => {
    const w = results.get('expand')!.wins / seeds.length;
    expect(w).toBeGreaterThanOrEqual(0.3); expect(w).toBeLessThanOrEqual(0.9);
  });
  it('không chiến thuật nào thống trị (>95%)', () => {
    for (const r of results.values()) expect(r.wins / r.n).toBeLessThanOrEqual(0.95);
  });
});

/** CR-002: sự kiện không được mở đường thắng cho chiến thuật vô vọng; kết quả chi tiết ở docs/qa/EVENTS_BALANCE.md. */
describe('TST-08 cân bằng với sự kiện lựa chọn', { timeout: 30000 }, () => {
  const picks = ['a', 'b', 'c', 'mix'] as const;
  it('turtle không bao giờ thắng dù chọn kiểu nào', () => {
    for (const p of picks) expect(batch('turtle', seeds, p).wins, `turtle/${p}`).toBe(0);
  });
  it('bỏ mặc (idle) không thắng; để sự kiện tự chọn mặc định giữ nguyên dải cân bằng', () => {
    expect(batch('idle', seeds, 'b').wins).toBe(0);
    const w = batch('expand', seeds, 'default').wins / seeds.length;
    expect(w).toBeGreaterThanOrEqual(0.3); expect(w).toBeLessThanOrEqual(0.9);
  });
  it('chọn xoay vòng ngẫu nhiên không thắng áp đảo (≤95%)', () => {
    expect(batch('expand', seeds, 'mix').wins / seeds.length).toBeLessThanOrEqual(0.95);
  });
});

