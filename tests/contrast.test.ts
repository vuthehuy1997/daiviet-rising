import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/** CR-003: kiểm tra tương phản AA (WCAG 2.1, chữ thường ≥ 4.5:1) cho các cặp màu chữ/nền của giao diện giấy dó,
 *  gồm cả chữ trong SVG (bảng tên, chip) mà axe không quét tin cậy. Màu chữ lấy trực tiếp từ style.css / art_base.ts. */
const css = readFileSync('src/ui/style.css', 'utf8');
const art = readFileSync('src/ui/art_base.ts', 'utf8');
const tok = (name: string) => { const m = css.match(new RegExp(`--${name}:(#[0-9a-fA-F]{6})`)); if (!m) throw new Error('thiếu token ' + name); return m[1]; };
const lum = (hex: string) => { const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4)); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
const ratio = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + .05) / (y + .05); };

// nền giấy: hai đầu gradient của .parch (sáng nhất / tối nhất) và thẻ lựa chọn
const PAPER = ['#efdfb4', '#dcc790', '#f3ead0', '#e3d3a6', '#f9f1d8', '#e9dab0'];
describe('tương phản AA — chữ trên giấy dó', () => {
  for (const t of ['ink', 'mut', 'gold', 'ok', 'bad', 'cham']) {
    for (const bg of PAPER) it(`--${t} trên ${bg}`, () => expect(ratio(tok(t), bg), `${tok(t)} / ${bg}`).toBeGreaterThanOrEqual(4.5));
  }
  it('chữ trắng trên nút chính (son)', () => { for (const bg of ['#c0463a', '#8f2e24']) expect(ratio('#ffffff', bg), bg).toBeGreaterThanOrEqual(4.5); });
  it('chữ hậu quả ▼ đỏ / ▲ xanh trên thẻ lựa chọn', () => { for (const bg of ['#f3ead0', '#e3d3a6']) { expect(ratio('#8f2e24', bg)).toBeGreaterThanOrEqual(4.5); expect(ratio(tok('ok'), bg)).toBeGreaterThanOrEqual(4.5); } });
  it('chữ trắng trên huy hiệu chàm (Cấp N, số lượng)', () => expect(ratio('#ffffff', tok('cham'))).toBeGreaterThanOrEqual(4.5));
});

describe('tương phản AA — chữ trong SVG bản đồ (bảng tên ruy-băng, chip)', () => {
  const m = art.match(/const pal = \{ own: \[([^\]]+)\], open: \[([^\]]+)\], enemy: \[([^\]]+)\] \}/);
  it('đọc được bảng màu banner', () => expect(m).toBeTruthy());
  const hexes = (s: string) => s.match(/#[0-9a-fA-F]{6}/g) as string[];
  for (const [i, name] of ['own', 'open', 'enemy'].entries()) {
    it(`banner ${name}: chữ / nền`, () => { const [bg, , fg] = hexes(m![i + 1]); expect(ratio(fg, bg), `${fg}/${bg}`).toBeGreaterThanOrEqual(4.5); });
  }
  it('chip: chữ mực trên nền chip ta/địch', () => { for (const bg of ['#f7edcf', '#f3d9cd']) expect(ratio('#3b2a1c', bg)).toBeGreaterThanOrEqual(4.5); });
});
