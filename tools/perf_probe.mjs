// Đo hiệu năng giao diện (CR-003 V3): node tools/perf_probe.mjs  (cần vite preview ở PORT, mặc định 5199). CPU giả lập chậm gấp CPU=4.
import { chromium, devices } from '@playwright/test';
const port = process.env.PORT ?? 5199, url = `http://127.0.0.1:${port}/`, cpu = Number(process.env.CPU ?? 4);
const b = await chromium.launch();
for (const [name, opts] of [['desktop 1600x900', { viewport: { width: 1600, height: 900 } }], ['Pixel 7', { ...devices['Pixel 7'] }]]) {
  const ctx = await b.newContext(opts), p = await ctx.newPage(), cdp = await ctx.newCDPSession(p);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu });
  const t0 = Date.now(); await p.goto(url, { waitUntil: 'load' }); await p.evaluate(() => document.fonts.ready);
  await p.waitForSelector('[data-tile="TIL-001"]'); const tLoad = Date.now() - t0;
  const nav = await p.evaluate(() => { const n = performance.getEntriesByType('navigation')[0]; const bytes = performance.getEntriesByType('resource').reduce((a, r) => a + (r.transferSize || r.encodedBodySize || 0), 0); return { dcl: Math.round(n.domContentLoadedEventEnd), load: Math.round(n.loadEventEnd), kb: Math.round(bytes / 1024) }; });
  // độ trễ chọn ô: từ click tới khung hình kế tiếp
  const click = await p.evaluate(async () => { const el = document.querySelector('[data-tile="TIL-001"]'); const t = performance.now(); el.dispatchEvent(new MouseEvent('click', { bubbles: true })); await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); return Math.round(performance.now() - t); });
  // kéo bản đồ: ghi lại khoảng cách giữa các khung hình
  await p.evaluate(() => { window.__d = []; let last = performance.now(); const f = (t) => { window.__d.push(t - last); last = t; window.__raf = requestAnimationFrame(f); }; window.__raf = requestAnimationFrame(f); });
  const box = await p.locator('svg.map').boundingBox(); const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
  await p.mouse.move(cx, cy); await p.mouse.down(); for (let i = 0; i < 40; i++) { await p.mouse.move(cx - i * 6, cy - i * 3); await p.waitForTimeout(16); } await p.mouse.up();
  const fr = await p.evaluate(() => { cancelAnimationFrame(window.__raf); const d = window.__d.slice(2).sort((a, b) => a - b); return { n: d.length, p50: Math.round(d[Math.floor(d.length * .5)]), p95: Math.round(d[Math.floor(d.length * .95)]), max: Math.round(d[d.length - 1]) }; });
  const endTurn = await p.evaluate(async () => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent === 'Kết thúc lượt'); const t = performance.now(); b.click(); await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); return Math.round(performance.now() - t); });
  console.log(JSON.stringify({ name, cpu, loadMs: tLoad, ...nav, clickToFrameMs: click, endTurnToFrameMs: endTurn, panFrameMs: fr }));
  await ctx.close();
}
await b.close();
