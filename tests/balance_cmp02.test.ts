import { writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { batch2, type Strategy2 } from './bots2';

const seeds = Array.from({ length: 40 }, (_, i) => i + 1);

/** TST-11 (CR-005 M4): cân bằng thô CMP-02 bằng bot. Mục tiêu và giới hạn của phép đo: docs/qa/BALANCE_CMP02.md. */
describe('TST-11 cân bằng CMP-02 (bot)', { timeout: 60000 }, () => {
  const R = new Map<Strategy2, ReturnType<typeof batch2>>();
  for (const s of ['idle', 'turtle', 'basic', 'tide-aware', 'lurer'] as Strategy2[]) R.set(s, batch2(s, seeds));
  const rate = (s: Strategy2) => R.get(s)!.wins / seeds.length;
  it('ghi kết quả (bằng chứng)', () => { writeFileSync('docs/qa/balance_cmp02_last.json', JSON.stringify([...R.values()], null, 1)); });
  it('bỏ mặc và chỉ cố thủ Thủ phủ luôn thua', () => { expect(R.get('idle')!.wins).toBe(0); expect(R.get('turtle')!.wins).toBe(0); });
  it('bot cơ bản thắng được nhưng không áp đảo (30%–60%)', () => { expect(rate('basic')).toBeGreaterThanOrEqual(0.3); expect(rate('basic')).toBeLessThanOrEqual(0.6); });
  it('bot dùng thủy triều + nhử khá hơn bot cơ bản nhưng không quá 90%', () => {
    expect(rate('lurer')).toBeGreaterThan(rate('basic')); expect(rate('lurer')).toBeLessThanOrEqual(0.9);
  });
  it('không chiến thuật nào thống trị (>90%)', () => { for (const r of R.values()) expect(r.wins / r.n).toBeLessThanOrEqual(0.9); });
});
