// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Controller } from '../src/ui/controller';
import { D } from './helpers';

class MemStore implements Storage {
  m = new Map<string, string>();
  get length() { return this.m.size; }
  clear() { this.m.clear(); } getItem(k: string) { return this.m.get(k) ?? null; }
  key(i: number) { return [...this.m.keys()][i] ?? null; } removeItem(k: string) { this.m.delete(k); }
  setItem(k: string, v: string) { this.m.set(k, v); }
}

describe('UXD-06/UXD-SAVE controller', () => {
  it('hoàn tác khôi phục đúng trạng thái trong lượt; end turn xóa lịch sử', () => {
    const c = new Controller(D, new MemStore());
    const w0 = c.state.res.wood;
    expect(c.dispatch({ t: 'build', tile: 'TIL-001', bld: 'BLD-WATCH' })).toBeUndefined();
    expect(c.state.res.wood).toBeLessThan(w0); expect(c.canUndo).toBe(true);
    c.undo(); expect(c.state.res.wood).toBe(w0); expect(c.canUndo).toBe(false);
    c.dispatch({ t: 'build', tile: 'TIL-001', bld: 'BLD-WATCH' }); c.endTurn(); expect(c.canUndo).toBe(false);
  });
  it('lệnh lỗi trả thông báo và không đổi state/lịch sử', () => {
    const c = new Controller(D, new MemStore());
    expect(c.dispatch({ t: 'build', tile: 'TIL-007', bld: 'BLD-FARM' })).toBeTruthy(); expect(c.canUndo).toBe(false);
  });
  it('autosave rồi nạp lại ở controller mới', () => {
    const st = new MemStore();
    const a = new Controller(D, st); a.endTurn(); a.endTurn();
    const b = new Controller(D, st); expect(b.loadAutosave()).toBe(true); expect(b.state.turn).toBe(3);
  });
  it('xuất/nhập JSON; bản lưu hỏng bị từ chối và state giữ nguyên', () => {
    const a = new Controller(D, new MemStore()); a.endTurn();
    const json = a.exportJson();
    const b = new Controller(D, new MemStore()); expect(b.importJson(json)).toBeUndefined(); expect(b.state.turn).toBe(2);
    expect(b.importJson('{"x":1}')).toBeTruthy(); expect(b.state.turn).toBe(2);
  });
  it('localStorage bị chặn → vẫn chơi được, storageOk=false', () => {
    const bad = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } } as unknown as Storage;
    const c = new Controller(D, bad); c.endTurn(); expect(c.storageOk).toBe(false); expect(c.loadAutosave()).toBe(false);
  });
});

describe('UI smoke (jsdom) — không thay thế E2E trình duyệt thật', () => {
  beforeEach(() => { try { localStorage.clear(); } catch { /* */ } document.body.innerHTML = '<div id="app"></div>'; vi.resetModules(); });
  it('render bản đồ 12 ô (role=button, tên truy cập từ chữ hiển thị), nút Kết thúc lượt chạy được', async () => {
    await import('../src/ui/main');
    const tiles = document.querySelectorAll('[data-tile]');
    expect(tiles.length).toBe(12);
    tiles.forEach((t) => { expect(t.getAttribute('role')).toBe('button'); expect(t.textContent!.trim().length).toBeGreaterThan(5); expect(t.getAttribute('tabindex')).toBe('0'); expect(t.hasAttribute('aria-label')).toBe(false); });
    const end = [...document.querySelectorAll('button')].find((b) => b.textContent === 'Kết thúc lượt')!;
    expect(document.body.textContent).toContain('Lượt 1/28');
    end.click();
    expect(document.body.textContent).toContain('Lượt 2/28');
  });
  it('chọn ô mở panel; xây công trình qua nút làm giảm Gỗ-tre', async () => {
    await import('../src/ui/main');
    (document.querySelector('[data-tile="TIL-001"]') as SVGElement).dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(document.body.textContent).toContain('Thủ phủ (TIL-001)');
    const wood = () => document.querySelector('[data-res="wood"] b')!.textContent;
    const before = wood();
    [...document.querySelectorAll('button')].find((b) => b.textContent?.startsWith('Chòi canh'))!.click();
    expect(wood()).not.toBe(before);
  });
  it('CR-002: hết lượt 1 → hộp thoại EVT-01 với 3 lựa chọn kèm hệ quả; chọn xong hộp thoại biến mất', async () => {
    await import('../src/ui/main');
    [...document.querySelectorAll('button')].find((b) => b.textContent === 'Kết thúc lượt')!.click();
    const dlg = document.querySelector('dialog[data-event="EVT-01"]')!;
    expect(dlg).toBeTruthy();
    expect(dlg.querySelectorAll('[data-choice]').length).toBe(3);
    expect(dlg.textContent).toContain('Hệ quả:');
    (dlg.querySelector('[data-choice="a"]') as HTMLElement).click();
    expect(document.querySelector('dialog[data-event]')).toBeNull();
    (document.querySelector('button[aria-label="Nhật ký"]') as HTMLElement).click();
    expect(document.querySelector('ul.log')!.textContent).toContain('Cử trinh sát qua biên');
  });
});
