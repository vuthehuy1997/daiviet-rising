// Chụp ảnh giao diện thật (CR-003 gate thị giác): node tools/shoot_visual.mjs <thư-mục-ra> [prefix]. Cần `vite preview` đang chạy ở PORT (mặc định 5199).
import { chromium, devices } from '@playwright/test';
import path from 'node:path';
const out = process.argv[2] ?? 'docs/qa/visual', pre = process.argv[3] ?? 'v1', port = process.env.PORT ?? 5199;
const url = `http://127.0.0.1:${port}/`;
const b = await chromium.launch();
async function shot(name, ctxOpts, steps) {
  const ctx = await b.newContext(ctxOpts); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', (e) => errs.push(String(e))); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await p.goto(url); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(400);
  if (steps) await steps(p);
  await p.waitForTimeout(250);
  await p.screenshot({ path: path.join(out, `${pre}_${name}.png`) });
  const ov = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  console.log(name, 'overflowX', ov, errs.length ? errs : 'no-errors'); await ctx.close();
}
const sel = async (p) => { await p.locator('[data-tile="TIL-001"]').click(); };
await shot('desktop_1600x900_chon_o', { viewport: { width: 1600, height: 900 } }, sel);
await shot('desktop_1280x800_chua_chon', { viewport: { width: 1280, height: 800 } });
await shot('desktop_1920x1080_chon_o', { viewport: { width: 1920, height: 1080 } }, sel);
await shot('mobile_412x915_chua_chon', { ...devices['Pixel 7'] });
await shot('mobile_412x915_chon_o', { ...devices['Pixel 7'] }, sel);
await shot('desktop_1600x900_nhat_ky', { viewport: { width: 1600, height: 900 } }, async (p) => { await p.getByRole('button', { name: 'Nhật ký' }).click(); });
await b.close();
