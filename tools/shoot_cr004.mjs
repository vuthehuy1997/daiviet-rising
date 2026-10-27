// CR-004: ảnh zoom 1x/2x/4x (desktop + điện thoại) và đo khung hình khi kéo ở zoom 4x. Cần vite preview ở PORT (mặc định 5231). CPU giả lập CPU=4.
import { chromium, devices } from '@playwright/test';
const port = process.env.PORT ?? 5231, url = `http://127.0.0.1:${port}/`, cpu = Number(process.env.CPU ?? 4), out = 'docs/qa/visual/';
const b = await chromium.launch();
for (const [name, opts, clicks] of [['desk', { viewport: { width: 1600, height: 900 } }, [0, 3, 6]], ['phone', { ...devices['Pixel 7'] }, [0, 3, 6]]]) {
  const ctx = await b.newContext(opts), p = await ctx.newPage(), cdp = await ctx.newCDPSession(p);
  const reqs = []; p.on('request', (r) => { if (/hi_\d_\d/.test(r.url())) reqs.push(r.url().split('/').pop().split('-')[0]); });
  await p.goto(url); await p.waitForSelector('[data-tile="TIL-001"]'); await p.waitForTimeout(600);
  if (name === 'phone') await p.getByRole('button', { name: 'Vừa màn hình' }).click();
  const shot = async (tag) => { await p.waitForTimeout(900); await p.screenshot({ path: `${out}cr004_${name}_${tag}.png` }); };
  let z = 0;
  for (const c of clicks) { while (z < c) { await p.getByRole('button', { name: 'Phóng to' }).click(); z++; } await shot(`z${c}`); }
  // zoom 4x nhìn vào dãy núi tây
  const w = Number((await p.locator('svg.map').getAttribute('viewBox')).split(' ')[2]);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu });
  await p.evaluate(() => { window.__d = []; let last = performance.now(); const f = (t) => { window.__d.push(t - last); last = t; window.__raf = requestAnimationFrame(f); }; window.__raf = requestAnimationFrame(f); });
  const box = await p.locator('svg.map').boundingBox(); const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
  await p.mouse.move(cx, cy); await p.mouse.down(); for (let i = 0; i < 60; i++) { await p.mouse.move(cx + i * 8, cy + i * 3); await p.waitForTimeout(16); } await p.mouse.up();
  const fr = await p.evaluate(() => { cancelAnimationFrame(window.__raf); const d = window.__d.slice(2).sort((a, b) => a - b); return { n: d.length, p50: Math.round(d[Math.floor(d.length * .5)]), p95: Math.round(d[Math.floor(d.length * .95)]), max: Math.round(d[d.length - 1]) }; });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  const imgs = await p.locator('svg.map image').count();
  await shot('pan4');
  console.log(JSON.stringify({ name, vbWidthAt4x: w, cpu, panFrameMs: fr, imagesInDom: imgs, hiRequests: [...new Set(reqs)].length, hiTiles: [...new Set(reqs)] }));
  await ctx.close();
}
await b.close();
