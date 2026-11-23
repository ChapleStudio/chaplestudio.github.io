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
      const tasan = await sayfa.$$eval('.kart, .dal, .kok', (dugumler) =>
        dugumler.filter((k) => {
          const d = k.getBoundingClientRect();
          return [...k.querySelectorAll('strong, .alt, .sayi, span:not(.gizli):not(.gorsel), h1, p')].some((c) => {
            const r = c.getBoundingClientRect();
            return r.width > 0 && (r.top < d.top - 1 || r.bottom > d.bottom + 1 || r.left < d.left - 1 || r.right > d.right + 1 || c.scrollWidth > c.clientWidth + 2 && getComputedStyle(c).display === 'block');
          });
        }).map((k) => k.textContent.trim().slice(0, 30)));
      if (tasan.length) sorun(yer, `düğümden taşan yazı: ${tasan.slice(0, 4).join(', ')}`);
      const cakisan = await sayfa.evaluate(() => {
        if (!document.querySelector('[data-tuval][data-acik]')) return [];
        const k = [...document.querySelectorAll('.dunya .dugum')].map((e) => [e.dataset.dugum, e.getBoundingClientRect()]), c = [];
        for (let i = 0; i < k.length; i++) for (let j = i + 1; j < k.length; j++) { const a = k[i][1], b = k[j][1]; if (a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom) c.push(`${k[i][0]} × ${k[j][0]}`); }
        return c;
      });
      if (cakisan.length) sorun(yer, `çakışan düğümler: ${cakisan.slice(0, 3).join(', ')}`);
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
await p.goto(`${taban}/isler/?kategori=oyun`, { waitUntil: 'networkidle0' });
const oyun = await gorunen();
if (!(oyun > 0 && oyun < hepsi)) sorun('/isler/', 'adresten süzme çalışmıyor');
await p.type('input[name=ara]', 'zzzz');
if ((await gorunen()) !== 0 || !(await p.$eval('[data-bos]', (e) => !e.hidden))) sorun('/isler/', 'boş sonuç mesajı yok');
await p.click('[data-temizle]');
if ((await gorunen()) !== hepsi) sorun('/isler/', 'temizle çalışmıyor');
// 4) Tuval: hareket açıkken dala yakınlaşma, düğüme girme, çıkma, geçmiş, klavye
await tarayici.close();
const hareketli = await puppeteer.launch({ executablePath: yol, args: ['--no-sandbox'] });
const bekle = (ms) => new Promise((r) => setTimeout(r, ms));
for (const [ad, gorunum] of [['masaüstü', { width: 1440, height: 900 }], ['telefon', { width: 390, height: 844, isMobile: true, hasTouch: true }]]) {
  const y = `tuval ${ad}`, t = await hareketli.newPage();
  t.on('pageerror', (e) => sorun(y, `betik: ${e.message}`));
  t.on('console', (m) => m.type() === 'error' && sorun(y, `konsol: ${m.text()}`));
  await t.setViewport(gorunum);
  await t.goto(`${taban}/`, { waitUntil: 'load' });
  await bekle(3600);
  const bekleKi = (ne, f, ...arg) => t.waitForFunction(f, { timeout: 8000 }, ...arg).catch(() => sorun(y, ne));
  const olcek = () => t.evaluate(() => Number(/scale\(([\d.]+)/.exec(document.querySelector('.dunya').style.transform)?.[1] ?? 0));
  const z0 = await olcek();
  const dal = await t.$$eval('.ust-kapsul [data-dugum-git]', (a) => a[1].dataset.dugumGit);
  await t.$eval(`.ust-kapsul [data-dugum-git="${dal}"]`, (a) => a.click());
  await bekle(2000);
  if (!(await t.evaluate((d) => location.hash === `#${d}`, dal))) sorun(y, 'dal adrese yazılmadı');
  if (ad === 'masaüstü' && !((await olcek()) > z0 * 1.05)) sorun(y, `dala yakınlaşmadı (${z0} → ${await olcek()})`);
  const yolu = await t.$eval(`[id="${dal}"] [data-kart]`, (a) => { a.click(); return a.pathname; });
  await bekleKi('düğüme girilmedi', (p) => location.pathname === p && !document.querySelector('[data-oda-kabi]').hidden && document.activeElement?.tagName === 'H1', yolu);
  await bekle(400);
  if (await t.$('.gecit')) sorun(y, 'geçit kalıntısı');
  await t.keyboard.press('Escape');
  await bekleKi('Esc ile çıkılmadı', () => location.pathname === '/' && document.querySelector('[data-oda-kabi]').hidden);
  await bekle(1600);
  if ((await t.evaluate(() => document.activeElement?.pathname)) !== yolu) sorun(y, 'çıkınca odak düğüme dönmedi');
  await t.goBack();
  await bekleKi('geri tuşu odaya dönmedi', (p) => location.pathname === p && !document.querySelector('[data-oda-kabi]').hidden, yolu);
  await bekle(1500);
  await t.$eval('[data-oda-kabi] [data-cik]', (a) => a.click());
  await bekleKi('"Ağaca dön" çalışmadı', () => location.pathname === '/' && document.querySelector('[data-oda-kabi]').hidden);
  await bekle(1500);
  // etiketle süzme
  await t.$eval('[data-etiket-ac]', (b) => b.click());
  const [e1, adet] = await t.$eval('.etiket-paneli [data-etiket-sec]', (b) => [b.dataset.etiketSec, Number(b.querySelector('.adet').textContent)]);
  await t.$eval(`.etiket-paneli [data-etiket-sec="${e1}"]`, (b) => b.click());
  await bekle(1400);
  const eslesen = await t.$$eval('[data-eslesen]', (x) => x.length);
  if (eslesen !== adet) sorun(y, `etiket sayısı tutmuyor: ${e1} ${adet} yerine ${eslesen}`);
  if (!(await t.evaluate((e) => location.search === `?etiket=${e}`, e1))) sorun(y, 'etiket adrese yazılmadı');
  if (ad === 'telefon' && (await t.$$eval('.tuval li[data-tur="kayit"]', (l) => l.filter((x) => x.offsetParent).length)) !== adet) sorun(y, 'telefonda eşleşmeyenler gizlenmedi');
  await t.$eval('[data-etiket-kapat]', (b) => b.click());
  if (await t.$eval('[data-suzgec-durumu]', (d) => d.hidden)) sorun(y, 'panel kapanınca seçili etiket görünmüyor');
  const kartYolu = await t.$eval('[data-eslesen]', (a) => { a.click(); return a.pathname; });
  await bekleKi('süzülmüşken girilmedi', (p) => location.pathname === p && !document.querySelector('[data-oda-kabi]').hidden, kartYolu);
  await bekle(500);
  await t.$eval('[data-oda-kabi] [data-etiket]', (a) => a.click());
  await bekleKi('odadaki etiket ağacı süzmedi', () => location.pathname === '/' && location.search.startsWith('?etiket=') && document.querySelectorAll('[data-eslesen]').length > 0);
  await bekle(1600);
  await t.keyboard.press('Escape');
  await bekle(700);
  if (await t.$('[data-eslesen]')) sorun(y, 'Esc süzgeci kaldırmadı');
  if (ad === 'masaüstü') {
    const kare = await t.evaluate(() => new Promise((b) => { const s = []; let o = performance.now(); const k = (a) => { s.push(a - o); o = a; s.length < 90 ? requestAnimationFrame(k) : b(s.slice(5).sort((x, z) => x - z)[Math.floor(s.length * 0.9)]); }; requestAnimationFrame(k); }));
    console.log(`Tuval kare süresi (yüzde 90): ${kare.toFixed(1)} ms`);
    const d = await t.$$eval('[data-dal]', (a) => a.length);
    if (!d) sorun(y, 'dal yok');
    await t.goto(`${taban}${yolu.replace(/^/, '/#').replace('/#/', '/#').replace(/\/$/, '')}`, { waitUntil: 'load' });
    await bekle(1800);
    if (!(await t.evaluate(() => document.querySelector('.ust-kapsul [aria-current]')?.dataset.dugumGit !== 'kok'))) sorun(y, 'düğüm adresinden açılınca dalı seçilmedi');
  }
  await t.close();
}
await hareketli.close();
sunucu.close();

console.log(`${sayfalar.length} sayfa, ${deneme} görünüm denendi.`);
if (sorunlar.length) {
  const tekil = [...new Set(sorunlar)];
  console.error(`${tekil.length} sorun:\n` + tekil.slice(0, 60).map((x) => ' - ' + x).join('\n'));
  process.exit(1);
}
console.log('Sorun yok.');
