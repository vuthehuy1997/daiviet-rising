import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/** Sự kiện lựa chọn (CR-002) mở hộp thoại modal sau khi kết thúc lượt; các luồng không quan tâm thì “Để sau”. */
async function openLog(page: import('@playwright/test').Page) {
  if (!(await page.locator('ul.log').count())) await page.getByRole('button', { name: 'Nhật ký' }).click();
}
/** Người chơi trên điện thoại ẩn bảng ô trước khi chạm ô khác (bảng là bottom-sheet che nửa dưới bản đồ). */
async function pickTile(page: import('@playwright/test').Page, id: string) {
  const close = page.getByRole('button', { name: 'Ẩn bảng ô' });
  if (await close.isVisible().catch(() => false)) await close.click();
  await page.locator(`[data-tile="${id}"]`).click();
}
const resNum = async (page: import('@playwright/test').Page, k: string) => Number(await page.locator(`[data-res="${k}"] b`).innerText());
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
  const wood = () => resNum(page, 'wood');
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
  const res = () => page.locator('.res').innerText();
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
  await pickTile(page, 'TIL-005');
  await page.getByRole('button', { name: /Lập khu định cư/ }).click();
  await pickTile(page, 'TIL-001');
  await page.getByRole('button', { name: 'Điều quân' }).click();
  await page.locator('[data-tile="TIL-005"]').click(); // đang chọn đích: không đóng bảng
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
  const grain = () => resNum(page, 'grain');
  const g0 = await grain();
  await dlg.locator('[data-choice="a"]').click(); // −10 Lương
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(await grain()).toBe(g0 - 10);
  await openLog(page);
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
  await openLog(page);
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

// CR-003 V3 (UI-9): các cỡ màn hình điện thoại/máy tính bảng, kể cả xoay ngang
const SIZES: [string, number, number][] = [['điện thoại nhỏ 360x640', 360, 640], ['điện thoại 412x915', 412, 915], ['điện thoại ngang 915x412', 915, 412], ['máy tính bảng 768x1024', 768, 1024], ['laptop 1280x720', 1280, 720]];
for (const [name, w, h] of SIZES) {
  test(`V3 bố cục ${name}: không cuộn ngang, nút chạm ≥44px, nút Kết thúc lượt nằm trong màn hình`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.reload();
    await page.locator('[data-tile="TIL-001"]').click({ force: true });
    await expect(page.getByText('Thủ phủ (TIL-001)')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
    for (const b of await page.locator('button:visible').all()) {
      const box = await b.boundingBox(); if (!box) continue;
      expect(box.height, (await b.innerText()) || (await b.getAttribute('aria-label')) || '?').toBeGreaterThanOrEqual(43.5);
      expect(box.width, (await b.innerText()) || (await b.getAttribute('aria-label')) || '?').toBeGreaterThanOrEqual(43.5);
    }
    const end = await page.getByRole('button', { name: 'Kết thúc lượt' }).boundingBox();
    expect(end!.x).toBeGreaterThanOrEqual(0); expect(end!.y).toBeGreaterThanOrEqual(0);
    expect(end!.x + end!.width).toBeLessThanOrEqual(w + 1); expect(end!.y + end!.height).toBeLessThanOrEqual(h + 1);
  });
}

test('V3 thu phóng bản đồ: nút +/− và Vừa màn hình hoạt động, giới hạn ≤1.5x', async ({ page, isMobile }) => {
  test.skip(isMobile, 'kiểm tra trên desktop');
  const vb = async () => (await page.locator('svg.map').getAttribute('viewBox'))!.split(' ').map(Number);
  const w0 = (await vb())[2];
  for (let i = 0; i < 8; i++) await page.getByRole('button', { name: 'Phóng to' }).click();
  const w1 = (await vb())[2];
  expect(w1).toBeLessThan(w0); expect(w0 / w1).toBeLessThanOrEqual(1.51);
  await page.getByRole('button', { name: 'Vừa màn hình' }).click();
  expect((await vb())[2]).toBeCloseTo(w0, 0);
});

test('V3 axe ở điện thoại nhỏ với bảng ô mở và ở hộp thoại sự kiện', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.reload();
  await page.locator('[data-tile="TIL-001"]').click({ force: true });
  let r = await new AxeBuilder({ page }).analyze();
  expect(r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id)).toEqual([]);
  await page.getByRole('button', { name: 'Kết thúc lượt' }).click();
  await expect(page.getByRole('dialog', { name: /Sự kiện/ })).toBeVisible();
  r = await new AxeBuilder({ page }).analyze();
  expect(r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id)).toEqual([]);
});
