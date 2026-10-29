// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

const click = (el: Element) => el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
const btn = (label: string) => [...document.querySelectorAll('button')].find((b) => b.textContent!.includes(label)) as HTMLButtonElement;

describe('CR-005 M3 UI CMP-02 (jsdom)', () => {
  beforeEach(() => {
    try { localStorage.clear(); } catch { /* */ }
    document.body.innerHTML = '<div id="app"></div>'; vi.resetModules();
    history.pushState({}, '', '/?campaign=cmp02');
  });

  it('chọn chiến dịch qua ?campaign=cmp02: 10 ô, thời hạn 20 lượt, thẻ thủy triều + xem trước 3 lượt, không có nút giảng hòa', async () => {
    await import('../src/ui/main');
    expect(document.querySelectorAll('[data-tile]').length).toBe(10);
    expect(document.body.textContent).toContain('Lượt 1/20');
    const tide = document.querySelector('[data-tide]')!;
    expect(tide.getAttribute('data-tide')).toBe('rising');
    expect(tide.textContent).toContain('Nước lên');
    expect(document.querySelector('[data-tide-forecast]')!.getAttribute('data-tide-forecast')).toBe('high,ebb,rising');
    click(btn('Mục tiêu')); // thẻ mục tiêu thu gọn trên màn nhỏ
    expect(document.body.textContent).toContain('Chặn các đợt tập kích');
    expect(document.body.textContent).not.toContain('Đàm phán giảng hòa');
    click(btn('Kết thúc lượt'));
    expect(document.querySelector('[data-tide]')!.getAttribute('data-tide')).toBe('high');
    expect(document.body.textContent).toContain('Lượt 2/20');
  });

  it('CMP-01 (mặc định) không có thẻ thủy triều', async () => {
    history.pushState({}, '', '/');
    await import('../src/ui/main');
    expect(document.querySelector('[data-tide]')).toBeNull();
    expect(document.querySelectorAll('[data-tile]').length).toBe(12);
  });

  it('ô sông có cọc: hiện hiệu lực cọc theo triều + dự báo nhử; đặt mồi qua nút', async () => {
    await import('../src/ui/main');
    const g = (window as any).__game;
    const t = g.state.tiles['TIL-203']; t.status = 'settled'; t.buildings.push({ type: 'BLD-STAKES', level: 1, remaining: 0 });
    g.state.armies.push({ id: 'ARM-T', tile: 'TIL-203', units: { 'UNT-FOOT': 2 } });
    g.state.tiles['TIL-201'].buildings.push({ type: 'BLD-WATCH', level: 1, remaining: 0 }, { type: 'BLD-WATCH', level: 1, remaining: 0 });
    click(document.querySelector('[data-tile="TIL-203"]')!);
    expect(document.querySelector('[data-stakes-fc]')!.getAttribute('data-stakes-fc')).toBe('50% · 25% · 100%');
    const fc = document.querySelector('[data-lure-forecast]')!;
    expect(fc.getAttribute('data-lure-forecast')).toBe('yes'); expect(fc.textContent).toMatch(/RAID-B1.*SẼ bị dụ/);
    click(btn('Đặt mồi nhử'));
    expect(g.state.lure).toEqual({ tile: 'TIL-203', unit: 'UNT-FOOT' });
    expect(document.querySelector('[data-lure-state="active"]')!.textContent).toContain('chờ đợt tập kích');
    expect(document.querySelector('.lurechip')).not.toBeNull();
  });

  it('bản lưu tách theo chiến dịch', async () => {
    await import('../src/ui/main');
    click(btn('Kết thúc lượt'));
    const keys = Object.keys(localStorage);
    expect(keys.some((k) => k.endsWith('.CMP-02'))).toBe(true);
  });
});
