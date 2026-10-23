import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/** Sự kiện lựa chọn (CR-002) mở hộp thoại modal sau khi kết thúc lượt; các luồng không quan tâm thì “Để sau”. */
async function dismissEvent(page: import('@playwright/test').Page) {
  const later = page.getByRole('button', { name: 'Để sau' });
  if (await later.isVisible().catch(() => false)) await later.click();
}

test.beforeEach(async ({ page }) => {
  page.on('pageerror', (e) => { throw e; });
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('TST-07 tải trang: 12 ô, không lỗi console, tiếng Việt', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.reload();
  await expect(page.locator('[data-tile]')).toHaveCount(12);
  await expect(page.getByText('Lượt 1/28')).toBeVisible();
  expect(errors).toEqual([]);
});

test('chọn ô → xây → huấn luyện → kết thúc lượt (chuột/chạm)', async ({ page }) => {
  await page.locator('[data-tile="TIL-001"]').click();
  await expect(page.getByText('Thủ phủ (TIL-001)')).toBeVisible();
  const wood = async () => Number((await page.locator('header.top .res').innerText()).match(/Gỗ-tre: (\d+)/)![1]);
  const w0 = await wood();
  await page.getByRole('button', { name: 'Chòi canh' }).click();
  expect(await wood()).toBeLessThan(w0);
  await page.getByRole('button', { name: '+1 Bộ binh' }).click();
  await page.getByRole('button', { name: 'Kết thúc lượt' }).click();
  await expect(page.getByText('Lượt 2/28')).toBeVisible();
  await dismissEvent(page);
  await expect(page.getByText(/Quân tại ô/)).toBeVisible();
});

test('hoàn tác trong lượt', async ({ page }) => {
  await page.locator('[data-tile="TIL-001"]').click();
  const res = () => page.locator('header.top .res').innerText();
  const r0 = await res();
  await page.getByRole('button', { name: 'Chòi canh' }).click();
  expect(await res()).not.toBe(r0);
  await page.getByRole('button', { name: 'Hoàn tác' }).click();
  expect(await res()).toBe(r0);
});

test('bàn phím: Tab tới ô và Enter chọn', async ({ page, isMobile }) => {
  test.skip(isMobile, 'bàn phím chỉ kiểm tra trên desktop');
  await page.locator('[data-tile="TIL-001"]').focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('Thủ phủ (TIL-001)')).toBeVisible();
});

test('tự lưu: tải lại trang giữ nguyên lượt', async ({ page }) => {
  await page.getByRole('button', { name: 'Kết thúc lượt' }).click();
  await dismissEvent(page);
  await page.getByRole('button', { name: 'Kết thúc lượt' }).click();
  await page.reload();
  await dismissEvent(page);
  await expect(page.getByText('Lượt 3/28')).toBeVisible();
});

test('lập khu định cư rồi điều quân tới ô mới (luồng điều quân bằng UI)', async ({ page }) => {
  await page.locator('[data-tile="TIL-001"]').click();
  await page.getByRole('button', { name: '+1 Bộ binh' }).click();
  await page.getByRole('button', { name: 'Kết thúc lượt' }).click();
  await dismissEvent(page);
  await page.locator('[data-tile="TIL-005"]').click();
  await page.getByRole('button', { name: /Lập khu định cư/ }).click();
  await page.locator('[data-tile="TIL-001"]').click();
  await page.getByRole('button', { name: 'Điều quân' }).click();
  await page.locator('[data-tile="TIL-005"]').click();
  await expect(page.getByRole('heading', { name: 'Quân đang hành quân' })).toBeVisible();
});

test('bỏ mặc cả chiến dịch qua UI → hộp thoại Thất bại', async ({ page }) => {
  for (let i = 0; i < 40; i++) {
    const dlg = page.getByRole('button', { name: 'Đóng' });
    if (await dlg.isVisible().catch(() => false)) await dlg.click();
    await dismissEvent(page);
    const end = page.getByRole('button', { name: 'Kết thúc lượt' });
    if (await end.isDisabled()) break;
    await end.click();
  }
  await expect(page.getByRole('heading', { name: 'Thất bại' })).toBeVisible();
  await expect(page.locator('dialog')).toContainText('Thủ phủ thất thủ');
});

test('TST-09 không cuộn ngang trên màn hình hẹp, vùng chạm ≥44px', async ({ page }) => {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  for (const b of await page.locator('button').all()) {
    const box = await b.boundingBox(); if (!box) continue;
    expect(box.height, await b.innerText()).toBeGreaterThanOrEqual(43.5);
  }
  for (const tile of await page.locator('[data-tile]').all()) {
    const box = await tile.boundingBox();
    expect(Math.min(box!.width, box!.height), (await tile.getAttribute('data-tile'))!).toBeGreaterThanOrEqual(43.5);
  }
});

test('TST-09 axe: không vi phạm nghiêm trọng/cực kỳ nghiêm trọng', async ({ page }) => {
  await page.locator('[data-tile="TIL-001"]').click();
  const r = await new AxeBuilder({ page }).analyze();
  const bad = r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ') + ' <' + n.any.map((a: any) => a.message).join('/') + '>').slice(0, 3).join(' ; ')}`)).toEqual([]);
});

test('FEAT-018 màn Bối cảnh & nguồn nêu rõ nhãn FICTION/SOURCED', async ({ page }) => {
  await page.getByRole('button', { name: 'Bối cảnh & nguồn' }).click();
  const dlg = page.getByRole('dialog');
  await expect(dlg).toContainText('FICTION');
  await expect(dlg).toContainText('SOURCED');
  await expect(dlg.getByRole('link').first()).toHaveAttribute('href', /^https:\/\//);
  await dlg.getByRole('button', { name: 'Đóng' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('CR-002 sự kiện lựa chọn: hiện ở lượt 2, nêu hệ quả, chọn bằng chuột/chạm, trừ đúng tài nguyên', async ({ page }) => {
  await page.getByRole('button', { name: 'Kết thúc lượt' }).click();
  const dlg = page.getByRole('dialog', { name: /Sự kiện/ });
  await expect(dlg).toBeVisible();
  await expect(dlg).toContainText('Tin tình báo từ phía Bắc');
  await expect(dlg).toContainText('SOURCED');
  await expect(dlg).toContainText('Hệ quả:');
  await expect(dlg.locator('[data-choice]')).toHaveCount(3);
  const grain = async () => Number((await page.locator('header.top .res').innerText()).match(/Lương: (-?\d+)/)![1]);
  const g0 = await grain();
  await dlg.locator('[data-choice="a"]').click(); // −10 Lương
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(await grain()).toBe(g0 - 10);
  await expect(page.locator('ul.log')).toContainText('Cử trinh sát qua biên');
});

test('CR-002 sự kiện: “Để sau”/Esc không chọn hộ; kết thúc lượt tự áp mặc định; có thể mở lại', async ({ page, isMobile }) => {
  await page.getByRole('button', { name: 'Kết thúc lượt' }).click();
  if (!isMobile) await page.keyboard.press('Escape'); else await page.getByRole('button', { name: 'Để sau' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByText('Sự kiện chờ quyết định')).toBeVisible();
  await page.getByRole('button', { name: 'Xem & quyết định' }).click();
  await expect(page.getByRole('dialog', { name: /Sự kiện/ })).toBeVisible();
  await page.getByRole('button', { name: 'Để sau' }).click();
  await page.getByRole('button', { name: 'Kết thúc lượt' }).click();
  await expect(page.locator('ul.log')).toContainText('chưa quyết nên tự chọn');
});

test('CR-002 axe với hộp thoại sự kiện đang mở; tải lại trang giữ sự kiện đang chờ', async ({ page }) => {
  await page.getByRole('button', { name: 'Kết thúc lượt' }).click();
  await expect(page.getByRole('dialog', { name: /Sự kiện/ })).toBeVisible();
  const r = await new AxeBuilder({ page }).analyze();
  const bad = r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' ; ')}`)).toEqual([]);
  for (const b of await page.getByRole('dialog').getByRole('button').all()) {
    const box = await b.boundingBox();
    expect(box!.height, await b.innerText()).toBeGreaterThanOrEqual(43.5);
  }
  await page.reload();
  await expect(page.getByRole('dialog', { name: /Sự kiện/ })).toBeVisible();
});
