import { R, blob, boat, bamboo, deadTree, dock, field, fire, flag, house, mountain, pagoda, palisade, spears, tent, tree, tuft, INK2 } from './art_base';

export { banner, chip, alertBadge, SYMBOLS, endDisc } from './art_base';

export type SettleKind = 'settled' | 'open' | 'hostile' | 'lost';
export interface SettleArt { id: string; x: number; y: number; kind: SettleKind; terrain: string; capital: boolean; foes: number }

/** Cụm minh họa địa điểm theo trạng thái ô (chuỗi SVG). Đất nền đã nướng sẵn trong ảnh bản đồ; ở đây chỉ phủ màu phe + công trình. */
export function settlementSvg(a: SettleArt): string {
  const { x, y, kind, terrain, capital } = a, sd = Number(a.id.slice(4)) * 7, r = R(sd);
  const foe = kind === 'hostile' || kind === 'lost';
  let g = `<path d="${blob(x + 8, y + 10, 84, 42, sd, 14, .1)}" fill="rgba(40,30,15,.28)" filter="url(#soft)"/>`;
  const tintFill = kind === 'settled' ? 'rgba(244,226,160,.55)' : foe ? 'rgba(86,54,34,.5)' : 'rgba(230,214,168,.28)';
  g += `<path d="${blob(x, y + 2, 80, 40, sd, 14, .1)}" fill="${tintFill}" stroke="${INK2}" stroke-width="1.5" stroke-opacity=".6"/>`;
  for (let i = 0; i < 9; i++) { const t = r() * 6.283, d = .8 + r() * .12; g += tuft(x + Math.cos(t) * 72 * d, y + 4 + Math.sin(t) * 34 * d, 1, foe ? '#8a7648' : '#6f9440'); }
  if (kind === 'settled') {
    if (capital) {
      g += `<path d="M${x - 72},${y + 2} Q${x},${y - 56} ${x + 72},${y + 2}" stroke="${INK2}" stroke-width="13" fill="none" stroke-linecap="round"/><path d="M${x - 72},${y + 2} Q${x},${y - 56} ${x + 72},${y + 2}" stroke="#b9ad92" stroke-width="9" fill="none" stroke-linecap="round"/>`;
      g += field(x - 14, y + 22, .8, false) + field(x + 24, y + 26, .7, true) + pagoda(x + 2, y - 16, 1.05) + house(x - 40, y + 6, 1.05) + house(x + 44, y + 10, 1) + palisade(x - 28, y + 30, 8, .9) + flag(x - 74, y - 2, '#2f5d73', .8) + flag(x + 76, y + 2, '#2f5d73', .75);
    } else g += field(x - 46, y + 10, .95) + house(x + 6, y, 1.1) + house(x - 16, y - 12, .8, '#9f5a3c') + palisade(x - 26, y + 26, 7, .9) + flag(x + 34, y - 6, '#2f5d73', .85);
  } else if (kind === 'open') {
    g += `<path d="M${x - 34},${y + 8} q34,-14 68,0" stroke="${INK2}" stroke-width="1.5" fill="none" stroke-dasharray="3 5" opacity=".55"/><path d="M${x - 9},${y - 4} h18 M${x},${y - 13} v18" stroke="#c0762b" stroke-width="3.4" stroke-linecap="round" opacity=".9"/>`;
    if (terrain === 'rung') g += tree(x - 44, y + 8, 1.1, 5) + tree(x + 42, y + 12, 1, 8) + tree(x + 12, y + 22, .85, 11) + tree(x - 18, y - 14, .8, 14);
    if (terrain === 'ven_bien') g += boat(x + 46, y + 14, .9) + tree(x - 46, y + 10, .9, 3);
    if (terrain === 'nui') g += mountain(x - 24, y + 16, .45, 3, 1);
    if (terrain === 'dong_bang') g += house(x + 30, y + 8, .8, '#9f5a3c') + field(x - 40, y + 10, .75);
    if (terrain === 'song') g += dock(x - 40, y + 18, .8) + boat(x + 44, y + 14, .8);
  } else {
    const n = Math.max(2, Math.min(4, Math.ceil(a.foes / 3)));
    g += `<path d="M${x - 70},${y + 4} Q${x},${y - 46} ${x + 70},${y + 4}" stroke="${INK2}" stroke-width="3" fill="none" stroke-dasharray="3 4" opacity=".5"/>`;
    const tents: number[][] = [];
    for (let i = 0; i < n; i++) tents.push([x - 48 + i * (96 / (n - 1)), y + 4 - (i % 2) * 12, 1 - (i % 2) * .12]);
    tents.sort((p, q) => p[1] - q[1]);
    for (const [tx, ty, ts] of tents) g += tent(tx, ty, ts);
    g += tent(x + 2, y + 14, 1.18, '#8f2d24') + fire(x + 38, y + 18, 1) + spears(x - 58, y + 20, .85) + flag(x - 8, y - 12, '#a33b2f', 1) + palisade(x - 36, y + 34, 9, .85);
    if (terrain === 'song') g += dock(x - 66, y + 18, .8);
    if (kind === 'lost') g += deadTree(x + 60, y + 20, .9);
  }
  return g;
}

/** Cây/tre trang trí do ảnh nền đã có; hàm này chỉ để dành cho vật thể sống (V2). */
export const decor = { tree, bamboo };
