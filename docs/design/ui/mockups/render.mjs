// Chụp mockup ra PNG: node docs/design/ui/mockups/render.mjs  (cần @playwright/test + chromium)
import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const dir = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(dir, '..');
const shots = [['map', 1600, 900, '01_map_desktop'], ['event', 1600, 900, '02_event_card'], ['battle', 1600, 900, '03_battle_report'], ['mobile', 412, 915, '04_mobile'], ['board', 1600, 1040, '00_style_board']];
const b = await chromium.launch();
for (const [h, w, ht, name] of shots) {
  const p = await (await b.newContext({ viewport: { width: w, height: ht }, deviceScaleFactor: h === 'mobile' ? 2 : 1 })).newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(String(e))); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await p.goto('file://' + path.join(dir, 'mock.html') + '#' + h);
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: path.join(out, name + '.png') });
  console.log(name, errs.length ? errs : 'ok');
}
{ // cận cảnh: phóng 2.2x vùng thủ phủ + Đồng Trung (mức zoom trong game)
  const p = await (await b.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 })).newPage();
  await p.goto('file://' + path.join(dir, 'mock.html') + '#zoom'); await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: path.join(out, '05_zoom_detail.png') }); console.log('05_zoom_detail ok');
}
await b.close();
