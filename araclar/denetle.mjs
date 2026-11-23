// Derlenmiş siteyi gerçek Chrome'da denetler: kırık bağlantı, konsol hatası, dış istek, yatay taşma, erişilebilirlik.
import { createServer } from 'node:http';
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import puppeteer from 'puppeteer-core';

const kok = new URL('../dist/', import.meta.url).pathname;
const axe = readFileSync(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8');
const tipler = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.jpeg': 'image/jpeg', '.png': 'image/png', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain' };
const dosyaBul = (yol) => {
  const tam = normalize(join(kok, decodeURIComponent(yol)));
  if (!tam.startsWith(kok)) return null;
  if (existsSync(tam) && statSync(tam).isFile()) return tam;
  const dizin = join(tam, 'index.html');
  return yol.endsWith('/') && existsSync(dizin) ? dizin : null;
};
const sunucu = createServer((istek, yanit) => {
  const d = dosyaBul(new URL(istek.url, 'http://x').pathname);
  yanit.writeHead(d ? 200 : 404, { 'content-type': d ? (tipler[extname(d)] ?? 'application/octet-stream') : 'text/plain' });
  d ? createReadStream(d).pipe(yanit) : yanit.end('yok');
}).listen(0, '127.0.0.1');
await new Promise((r) => sunucu.once('listening', r));
const taban = `http://127.0.0.1:${sunucu.address().port}`;

const dosyalar = (await readdir(kok, { recursive: true })).filter((d) => d.endsWith('.html'));
const sayfalar = dosyalar.map((d) => '/' + d.replace(/(^|\/)index\.html$/, '$1'));
const sorunlar = [];
const sorun = (yer, ne) => sorunlar.push(`${yer}: ${ne}`);

// 1) Durağan: iç bağlantı, kimlik ve tek başlık
const kimlikler = new Map(sayfalar.map((s, i) => [s, new Set([...readFileSync(join(kok, dosyalar[i]), 'utf8').matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))]));
for (const [i, s] of sayfalar.entries()) {
  const h = readFileSync(join(kok, dosyalar[i]), 'utf8');
  if ((h.match(/<h1[\s>]/g) ?? []).length !== 1 && !h.includes('http-equiv="refresh"')) sorun(s, 'tek h1 yok');
  for (const [, adres] of h.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|mailto:|data:)/.test(adres)) { if (adres.startsWith('http:')) sorun(s, `güvensiz bağlantı ${adres}`); continue; }
    const u = new URL(adres, taban + s);
    if (!dosyaBul(u.pathname)) sorun(s, `kırık bağlantı ${adres}`);
    else if (u.hash && !kimlikler.get(u.pathname)?.has(decodeURIComponent(u.hash.slice(1)))) sorun(s, `olmayan çapa ${adres}`);
  }
}

// 2) Canlı: her sayfa × genişlik × tema
const yol = process.env.CHROME_YOLU ?? ['/usr/bin/google-chrome-stable', '/usr/bin/google-chrome', '/usr/bin/chromium'].find(existsSync);
if (!yol) throw new Error('Chrome bulunamadı; CHROME_YOLU ver');
const tarayici = await puppeteer.launch({ executablePath: yol, args: ['--no-sandbox', '--force-prefers-reduced-motion'] });
let deneme = 0;
const genislikler = [320, 390, 768, 1280, 1920];
const axeGenislikleri = new Set([390, 1280]);

async function sayfayiDenetle(s) {
  const sayfa = await tarayici.newPage();
  let yer = s;
  sayfa.on('console', (m) => m.type() === 'error' && sorun(yer, `konsol: ${m.text()}`));
  sayfa.on('pageerror', (e) => sorun(yer, `betik: ${e.message}`));
  sayfa.on('request', (r) => !r.url().startsWith(taban) && !r.url().startsWith('data:') && sorun(yer, `dış istek ${r.url()}`));
  for (const tema of ['light', 'dark']) {
    await sayfa.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: tema }]);
    for (const en of genislikler) {
      yer = `${s} ${en}px ${tema}`;
      await sayfa.setViewport({ width: en, height: 900 });
      // CSP açıkken yüklenir: engellenen her şey konsol hatası olarak yakalanır.
      await sayfa.goto(taban + s, { waitUntil: 'load' });
      await sayfa.evaluate(() => document.fonts.ready.then(() => undefined));
      const tasma = await sayfa.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      if (tasma > 0) sorun(yer, `yatay taşma ${tasma}px`);
      const tasanKutular = await sayfa.$$eval('.kutu', (kutular) =>
        kutular.filter((k) => {
          const d = k.getBoundingClientRect();
          return [...k.querySelectorAll('.sirt, .isaret, .yil')].some((c) => {
            const r = c.getBoundingClientRect();
            return r.top < d.top - 1 || r.bottom > d.bottom + 1 || r.left < d.left - 1 || r.right > d.right + 1 || c.scrollHeight > c.clientHeight + 4 && getComputedStyle(c).writingMode !== 'horizontal-tb';
          });
        }).map((k) => k.dataset.baslik));
      if (tasanKutular.length) sorun(yer, `kutudan taşan yazı: ${tasanKutular.slice(0, 4).join(', ')}`);
      if (axeGenislikleri.has(en)) {
        await sayfa.evaluate(axe); // CDP ile çalışır, CSP'ye takılmaz
        const sonuc = await sayfa.evaluate(() => axe.run({ runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] }));
        for (const v of sonuc.violations) sorun(yer, `erişilebilirlik ${v.id} (${v.nodes.length}): ${v.nodes[0].target} ${v.nodes[0].any[0]?.message ?? ''}`);
      }
      deneme++;
    }
  }
  await sayfa.close();
}
const yonlendirme = (s) => readFileSync(join(kok, dosyalar[sayfalar.indexOf(s)]), 'utf8').includes('http-equiv="refresh"');
const kuyruk = sayfalar.filter((s) => !yonlendirme(s));
for (const [i, s] of sayfalar.entries()) {
  const hedef = readFileSync(join(kok, dosyalar[i]), 'utf8').match(/http-equiv="refresh" content="0;url=([^"]+)"/)?.[1];
  if (hedef && !dosyaBul(hedef)) sorun(s, `yönlendirme hedefi yok ${hedef}`);
}
await Promise.all(Array.from({ length: 4 }, async () => {
  for (let s = kuyruk.shift(); s; s = kuyruk.shift()) await sayfayiDenetle(s);
}));

// 3) Süzgeç
const p = await tarayici.newPage();
await p.goto(`${taban}/isler/`, { waitUntil: 'networkidle0' });
const gorunen = () => p.$$eval('[data-liste] > li:not([hidden])', (l) => l.length);
const hepsi = await gorunen();
await p.type('input[name=ara]', 'gorsel');
if (!((await gorunen()) >= 1 && (await gorunen()) < hepsi)) sorun('/isler/', 'arama "gorsel" ile "görsel"i bulmuyor');
await p.goto(`${taban}/isler/?cesit=oyun`, { waitUntil: 'networkidle0' });
const oyun = await gorunen();
if (!(oyun > 0 && oyun < hepsi)) sorun('/isler/', 'adresten süzme çalışmıyor');
await p.type('input[name=ara]', 'zzzz');
if ((await gorunen()) !== 0 || !(await p.$eval('[data-bos]', (e) => !e.hidden))) sorun('/isler/', 'boş sonuç mesajı yok');
await p.click('[data-temizle]');
if ((await gorunen()) !== hepsi) sorun('/isler/', 'temizle çalışmıyor');
await tarayici.close();
sunucu.close();

console.log(`${sayfalar.length} sayfa, ${deneme} görünüm denendi.`);
if (sorunlar.length) {
  const tekil = [...new Set(sorunlar)];
  console.error(`${tekil.length} sorun:\n` + tekil.slice(0, 60).map((x) => ' - ' + x).join('\n'));
  process.exit(1);
}
console.log('Sorun yok.');
