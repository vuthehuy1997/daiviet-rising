// Chụp lớp công trình trong suốt: node render_sprites.mjs  -> ../build/sprites.png (3200x1800)
import { chromium } from '/data/yuu/ai-data/yuu/self/dev/daiviet-rising/node_modules/@playwright/test/index.mjs';
import { fileURLToPath } from 'node:url'; import path from 'node:path';
const dir = path.dirname(fileURLToPath(import.meta.url));
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: Number(process.env.S || 2) })).newPage();
const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
await p.goto('file://' + path.join(dir, 'sprites.html'));
await p.screenshot({ path: path.join(dir, process.env.S && process.env.S !== '2' ? '../build/sprites_s' + process.env.S + '.png' : '../build/sprites.png'), omitBackground: true });
console.log('sprites', errs.length ? errs : 'ok'); await b.close();
