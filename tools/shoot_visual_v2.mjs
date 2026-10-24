// Ảnh chụp V2 (bảng ô lưới, thẻ sự kiện, báo cáo trận, Kế sách): node tools/shoot_visual_v2.mjs docs/qa/visual v2   (cần vite preview ở PORT, mặc định 5199)
import { chromium, devices } from '@playwright/test';
import path from 'node:path';
const out = process.argv[2] ?? 'docs/qa/visual', pre = process.argv[3] ?? 'v2', port = process.env.PORT ?? 5199, url = `http://127.0.0.1:${port}/`;
const b = await chromium.launch();
async function shot(name, ctxOpts, steps) {
  const ctx = await b.newContext(ctxOpts), p = await ctx.newPage(), errs = [];
  p.on('pageerror', (e) => errs.push(String(e))); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await p.goto(url); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.evaluate(() => document.fonts.ready);
  await steps(p); await p.waitForTimeout(350);
  await p.screenshot({ path: path.join(out, `${pre}_${name}.png`) });
  const ov = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  console.log(name, 'overflowX', ov, errs.length ? errs : 'no-errors'); await ctx.close();
}
const D = { viewport: { width: 1600, height: 900 } }, M = { ...devices['Pixel 7'] };
const tile = (id) => async (p) => { await p.locator(`[data-tile="${id}"]`).click(); };
const prep = async (p) => { await p.locator('[data-tile="TIL-001"]').click(); for (const n of ['+1 Bộ binh', '+1 Cung thủ', 'Chòi canh']) await p.getByRole('button', { name: n }).click(); };
const event = async (p, n = 1) => { for (let i = 0; i < n; i++) { await p.getByRole('button', { name: 'Kết thúc lượt' }).click(); if (i < n - 1) { const l = p.getByRole('button', { name: 'Để sau' }); if (await l.isVisible().catch(() => false)) await l.click(); } } };
const report = async (p) => { await prep(p); for (let i = 0; i < 14; i++) { const d = p.getByRole('dialog', { name: 'Báo cáo' }); if (await d.isVisible().catch(() => false)) return; const l = p.getByRole('button', { name: 'Để sau' }); if (await l.isVisible().catch(() => false)) await l.click(); await p.getByRole('button', { name: 'Kết thúc lượt' }).click(); } };
await shot('desktop_bang_o_thu_phu', D, prep);
await shot('desktop_bang_o_dich', D, async (p) => { await p.locator('[data-tile="TIL-008"]').click(); });
await shot('desktop_bang_o_dat_trong', D, tile('TIL-005'));
await shot('desktop_su_kien_EVT01', D, (p) => event(p, 1));
// chỉ để chụp ảnh: đặt sự kiện chờ rồi bấm thẻ Mục tiêu để giao diện dựng lại (không dùng trong test/game)
const forceEvent = (id) => async (p) => { await p.evaluate((i) => { window.__game.state = { ...window.__game.state, pendingEvents: [i] }; }, id); await p.getByRole('button', { name: /Mục tiêu/ }).click(); };
for (const id of ['EVT-02', 'EVT-03', 'EVT-04', 'EVT-05', 'EVT-06', 'EVT-07', 'EVT-08']) await shot(`desktop_su_kien_${id.replace('-', '')}`, D, forceEvent(id));
await shot('desktop_bao_cao_tran', D, report);
await shot('desktop_ke_sach', D, async (p) => { await p.getByRole('button', { name: 'Kế sách' }).click(); });
await shot('mobile_bang_o_thu_phu', M, prep);
await shot('mobile_su_kien_EVT01', M, (p) => event(p, 1));
await shot('mobile_bao_cao_tran', M, report);
await shot('mobile_ke_sach', M, async (p) => { await p.getByRole('button', { name: 'Kế sách' }).click(); });
await b.close();
