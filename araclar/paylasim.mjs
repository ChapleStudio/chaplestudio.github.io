// Bağlantı paylaşılınca görünen görseli ana sayfanın kendisinden üretir: önce `npm run onizle`, sonra `npm run paylasim`.
import { existsSync } from 'node:fs';
import puppeteer from 'puppeteer-core';
const yol = process.env.CHROME_YOLU ?? ['/usr/bin/google-chrome-stable', '/usr/bin/google-chrome', '/usr/bin/chromium'].find(existsSync);
const t = await puppeteer.launch({ executablePath: yol, args: ['--no-sandbox'] });
const s = await t.newPage();
await s.setViewport({ width: 1200, height: 630 });
await s.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
await s.goto('http://localhost:4322/', { waitUntil: 'load' });
await s.evaluate(() => document.fonts.ready.then(() => undefined));
await new Promise((r) => setTimeout(r, 600));
await s.screenshot({ path: new URL('../public/paylasim.png', import.meta.url).pathname });
await t.close();
