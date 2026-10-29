import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  page.on('pageerror', (e) => { throw e; });
  await page.goto('/?campaign=cmp02');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('CMP-02 tải trang: 10 ô, thẻ thủy triều, không lỗi console, không cuộn ngang', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  const fails: string[] = [];
  page.on('response', (r) => { if (r.status() >= 400) fails.push(`${r.status()} ${r.url()}`); });
  await page.reload();
  await expect(page.locator('[data-tile]')).toHaveCount(10);
  await expect(page.getByText('Lượt 1/20')).toBeVisible();
  await expect(page.locator('[data-tide]')).toContainText('Nước lên');
  await expect(page.locator('[data-tide-forecast]')).toContainText('nước đầy');
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)).toBe(false);
  expect(errors).toEqual([]); expect(fails).toEqual([]);
});

test('CMP-02 kết thúc lượt đổi pha triều; sự kiện không xuất hiện (chưa có sự kiện CMP-02)', async ({ page }) => {
  await page.getByRole('button', { name: 'Kết thúc lượt' }).click();
  await expect(page.getByText('Lượt 2/20')).toBeVisible();
  await expect(page.locator('[data-tide]')).toContainText('Nước đầy');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('CMP-02 chọn ô sông đã định cư có cọc: hiển thị hiệu lực cọc và dự báo nhử (axe: không vi phạm nghiêm trọng)', async ({ page }) => {
  await page.evaluate(() => {
    const g = (window as any).__game, t = g.state.tiles['TIL-203'];
    t.status = 'settled'; t.buildings.push({ type: 'BLD-STAKES', level: 1, remaining: 0 });
    g.state.armies.push({ id: 'ARM-T', tile: 'TIL-203', units: { 'UNT-FOOT': 2 } });
  });
  await page.locator('[data-tile="TIL-203"]').click();
  await expect(page.locator('[data-stakes-fc]')).toBeVisible();
  await expect(page.locator('[data-lure-forecast]')).toBeVisible();
  const r = await new AxeBuilder({ page }).analyze();
  expect(r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]); // cùng ngưỡng như TST-09
});

test('CMP-02 zoom 4x nạp mảnh nền nét riêng của chiến dịch', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'zoom bằng chuột chỉ kiểm trên máy tính');
  const hi: string[] = [];
  page.on('response', (r) => { if (/hi_\d_\d.*\.webp/.test(r.url())) hi.push(`${r.status()}`); });
  await page.mouse.move(640, 400);
  for (let i = 0; i < 25; i++) await page.mouse.wheel(0, -400);
  await page.waitForTimeout(1500);
  expect(hi.length).toBeGreaterThan(0); expect(hi.every((s) => s === '200')).toBe(true);
});
