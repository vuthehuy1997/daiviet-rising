// Chụp mockup v4: node render.mjs  (cần @playwright/test + chromium của repo)
import { chromium } from '/data/yuu/ai-data/yuu/self/dev/daiviet-rising/node_modules/@playwright/test/index.mjs';
import { fileURLToPath } from 'node:url'; import path from 'node:path';
const dir = path.dirname(fileURLToPath(import.meta.url)); const out = path.resolve(dir, '..');
const b = await chromium.launch();
for (const [h, w, ht, name] of [['map', 1600, 900, '01_map_desktop_v4'], ['free', 1600, 900, '01b_map_no_selection_v4'], ['zoom', 1280, 800, '02_zoom_detail_v4'], ['zoomhi', 1280, 800, '02_zoom_detail_v4_hi']]) {
  const p = await (await b.newContext({ viewport: { width: w, height: ht }, deviceScaleFactor: 1 })).newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(String(e))); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await p.goto('file://' + path.join(dir, 'map.html') + '#' + h); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  await p.screenshot({ path: path.join(out, name + '.png') }); console.log(name, errs.length ? errs : 'ok');
}
await b.close();
