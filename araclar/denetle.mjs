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
      // Görünen yazı kendi kutusundan ya da ekrandan taşmamalı
      const tasan = await sayfa.$$eval('.soz, .dilim, .ad, .govde, .komsular a', (kutular) =>
        kutular.filter((k) => k.checkVisibility() && [...k.querySelectorAll('h1, h2, h3, p, b, span:not(.gizli), i, dd')].some((c) => {
          const r = c.getBoundingClientRect();
          return c.checkVisibility() && r.width > 0 && (r.left < -1 || r.right > innerWidth + 1 || (c.scrollWidth > c.clientWidth + 2 && getComputedStyle(c).display === 'block'));
        })).map((k) => k.textContent.trim().slice(0, 30)));
      if (tasan.length) sorun(yer, `taşan yazı: ${tasan.slice(0, 4).join(', ')}`);
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

// 3) Arama
const p = await tarayici.newPage();
await p.goto(`${taban}/isler/`, { waitUntil: 'networkidle0' });
const gorunen = () => p.$$eval('[data-metin]', (l) => l.filter((x) => x.checkVisibility()).length);
const hepsi = await gorunen();
await p.type('input[name=ara]', 'gorsel');
if (!((await gorunen()) >= 1 && (await gorunen()) < hepsi)) sorun('/isler/', 'arama "gorsel" ile "görsel"i bulmuyor');
await p.goto(`${taban}/isler/?ara=unity`, { waitUntil: 'networkidle0' });
const unity = await gorunen();
if (!(unity > 0 && unity < hepsi)) sorun('/isler/', 'adresten arama çalışmıyor');
await p.type('input[name=ara]', 'zzzz');
if ((await gorunen()) !== 0 || !(await p.$eval('[data-bos]', (e) => e.checkVisibility()))) sorun('/isler/', 'boş sonuç mesajı yok');
await p.click('[data-temizle]');
if ((await gorunen()) !== hepsi) sorun('/isler/', 'temizle çalışmıyor');

// 3b) Her projenin başlığı ve dilimi, her genişlikte, sahnede okunur mu: taşma ve erişilebilirlik
for (const [en, boy] of [[320, 640], [390, 844], [1024, 640], [1366, 640], [1280, 800], [1920, 800], [1920, 1000]]) {
  const t = await tarayici.newPage();
  await t.setViewport({ width: en, height: boy });
  await t.goto(`${taban}/`, { waitUntil: 'networkidle0' });
  for (const id of await t.$$eval('[data-sec]', (l) => l.map((x) => x.dataset.sec))) {
    await t.$eval(`[data-sec="${id}"]`, (a) => { if (!a.hasAttribute('aria-current')) a.click(); });
    const s = await t.evaluate((id) => {
      const soz = document.querySelector(`[data-soz="${id}"]`), sahne = document.querySelector('[data-sahne]').getBoundingClientRect(), marka = document.querySelector('.marka').getBoundingClientRect(), r = soz.getBoundingClientRect();
      return { gorunuyor: soz.checkVisibility(), tasma: document.documentElement.scrollWidth - innerWidth, ust: r.top - marka.bottom, alt: sahne.bottom - r.bottom, genis: [...soz.children].some((c) => c.getBoundingClientRect().right > innerWidth || c.scrollWidth > c.clientWidth + 2) };
    }, id);
    if (!s.gorunuyor) sorun(`/ ${en}×${boy}`, `${id} seçilince yazısı görünmüyor`);
    if (s.tasma > 0 || s.genis) sorun(`/ ${en}×${boy}`, `${id} taşıyor`);
    if (s.ust < 0 || s.alt < 0) sorun(`/ ${en}×${boy}`, `${id} yazısı sahneye sığmıyor (üst ${Math.round(s.ust)}, alt ${Math.round(s.alt)})`);
  }
  await t.evaluate(axe);
  for (const k of await t.$$eval('[data-kategori]', (l) => l.map((x) => x.dataset.kategori))) {
    await t.$eval(`[data-kategori="${k}"]`, (b) => b.click());
    const tasan = await t.$$eval(`[data-dilimler="${k}"] b`, (l) => l.filter((b) => b.scrollWidth > b.clientWidth + 1 || b.getBoundingClientRect().height > b.parentElement.getBoundingClientRect().height).map((b) => b.textContent));
    if (tasan.length) sorun(`/ ${en}×${boy} ${k}`, `dilimden taşan ad: ${tasan.join(', ')}`);
    const hiza = await t.$$eval('.grup.acik .ad', (l) => l.map((a) => [a.offsetTop, a.querySelector('span').offsetTop - a.offsetTop, a.querySelector('i').offsetTop - a.offsetTop]));
    if (en >= 861 && new Set(hiza.map((h) => `${h[1]} ${h[2]}`)).size > 1) sorun(`/ ${en}×${boy} ${k}`, 'adlar aynı çizgide değil');
    const sonuc = await t.evaluate(() => axe.run({ runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] }));
    for (const v of sonuc.violations) sorun(`/ ${en}×${boy} ${k}`, `erişilebilirlik ${v.id}: ${v.nodes[0].target} ${v.nodes[0].any[0]?.message ?? ''}`);
    deneme++;
  }
  await t.close();
}

// 4) Sahne: hareket açıkken her tıklama bir animasyon başlatmalı; girme, çıkma, geri tuşu
await tarayici.close();
const hareketli = await puppeteer.launch({ executablePath: yol, args: ['--no-sandbox'] });
const bekle = (ms) => new Promise((r) => setTimeout(r, ms));
for (const [ad, gorunum] of [['masaüstü', { width: 1440, height: 900 }], ['telefon', { width: 390, height: 844, isMobile: true, hasTouch: true }]]) {
  const y = `sahne ${ad}`, t = await hareketli.newPage();
  t.on('pageerror', (e) => sorun(y, `betik: ${e.message}`));
  t.on('console', (m) => m.type() === 'error' && sorun(y, `konsol: ${m.text()}`));
  await t.setViewport(gorunum);
  await t.goto(`${taban}/`, { waitUntil: 'networkidle0' });
  await bekle(800);
  const bekleKi = (ne, f, ...arg) => t.waitForFunction(f, { timeout: 6000 }, ...arg).catch(() => sorun(y, ne));
  const tikla = (s) => t.$eval(s, (e) => e.click());
  const durum = () => t.evaluate(() => ({ secili: document.querySelector('[data-sahne]').dataset.is, baslik: document.querySelector('.soz:not([hidden]) h2').textContent, kat: [...document.querySelectorAll('[data-dilimler]:not([hidden])')].map((d) => d.dataset.dilimler).join(), adres: location.hash }));
  /** Tıklar ve o anda bu seçiciyle eşleşen bir animasyonun oynadığını doğrular. */
  const oynamali = async (ne, sec, animasyon, sure = 1300) => {
    await tikla(sec);
    await bekle(90);
    const oynayan = await t.evaluate((a) => document.getAnimations().filter((x) => x.playState === 'running' && x.effect.target.closest(a)).length, animasyon);
    if (!oynayan) sorun(y, `animasyon yok: ${ne}`);
    await bekle(sure);
  };
  // üstüne gelmek ve odaklanmak hiçbir şeyi değiştirmez
  const once = JSON.stringify(await durum());
  await t.hover('[data-kategori=arac]');
  await t.focus('[data-kategori=arac]');
  await bekle(400);
  if (JSON.stringify(await durum()) !== once) sorun(y, 'üstüne gelince değişti');
  await oynamali('kategori açılışı', '[data-kategori=oyun]', '.dilim');
  if ((await durum()).kat !== 'oyun') sorun(y, 'kategori açılmadı');
  await oynamali('açıkken başka kategori', '[data-kategori=arac]', '.dilim');
  await oynamali('açıkken üçüncü kategori', '[data-kategori=yapay-zeka]', '.dilim');
  await oynamali('kategoriyi kapatma', '[data-kategori=yapay-zeka]', '.dilim');
  if ((await durum()).kat !== '') sorun(y, 'aynı kategoriye basınca kapanmadı');
  await tikla('[data-kategori=oyun]');
  await bekle(900);
  await oynamali('dilimler açıkken proje', '[data-sec=pong]', '.dilim, .soz');
  if ((await durum()).kat !== '' || (await durum()).secili !== 'pong') sorun(y, 'dilimler açıkken proje seçilmedi');
  for (const id of ['clone-combat', 'pong', 'fairy-of-light', 'pong', 'fairy-of-light']) await oynamali(`${id} geçişi`, `[data-sec=${id}]`, '.afis.secili');
  if ((await durum()).adres !== '#isler/fairy-of-light') sorun(y, 'seçilen proje adrese yazılmadı');
  // hızlı üç tık: sonuncusu kazanır
  for (const id of ['pong', 'booble-jump', 'clone-combat']) { await tikla(`[data-sec=${id}]`); await bekle(120); }
  await bekle(1200);
  if ((await durum()).secili !== 'clone-combat') sorun(y, 'hızlı tıklamada son seçilen gelmedi');
  // dilim büyürken başka kategoriye basmak sonradan projeye atmamalı
  await tikla('[data-kategori=oyun]');
  await bekle(800);
  await oynamali('dilim büyümesi', '[data-dilim=pong]', '.dilim', 150);
  await tikla('[data-kategori=arac]');
  await bekle(1400);
  if ((await durum()).kat !== 'arac' || (await durum()).secili !== 'clone-combat') sorun(y, 'dilim büyürken basılan kategori bozuldu');
  await tikla('[data-dilim=snowdesk]');
  await bekle(1300);
  if ((await durum()).secili !== 'snowdesk' || (await durum()).kat !== '') sorun(y, 'dilim projeye dönüşmedi');
  // içine girme, çıkma, geri
  await oynamali('içine girme', '[data-gir=snowdesk]', '.kok', 0);
  await bekleKi('projeye girilmedi', () => location.pathname === '/isler/snowdesk/' && document.readyState === 'complete');
  await bekle(800);
  await tikla('[data-cik]');
  await bekleKi('çıkılmadı', () => location.pathname === '/' && document.querySelector('[data-sahne]')?.dataset.is === 'snowdesk' && document.querySelector('[data-kok]').dataset.giriyor === undefined);
  await bekle(1100);
  if (await t.evaluate(() => Math.abs(new DOMMatrix(getComputedStyle(document.querySelector('.afis.secili')).transform).a - 1) > 0.01)) sorun(y, 'dönünce afiş yakın kaldı');
  await tikla('[data-sec=snowdesk]');
  await bekleKi('ikinci tık içine girmedi', () => location.pathname === '/isler/snowdesk/' && document.readyState === 'complete');
  await bekle(500);
  await t.keyboard.press('Escape');
  await bekleKi('Esc ile çıkılmadı', () => location.pathname === '/' && document.querySelector('[data-kok]')?.dataset.giriyor === undefined);
  await bekle(900);
  // doğrudan açılan proje sayfasından da aynı projeye dönülür
  await t.goto(`${taban}/isler/pc-eye/`, { waitUntil: 'networkidle0' });
  await tikla('[data-cik]');
  await bekleKi('doğrudan girilen sayfadan dönülmedi', () => location.pathname === '/' && document.querySelector('[data-sahne]')?.dataset.is === 'pc-eye');
  await bekle(1200);
  await tikla('[data-kategori=oyun]');
  await bekle(700);
  await t.keyboard.press('Escape');
  await bekle(700);
  if ((await durum()).kat !== '') sorun(y, 'Esc dilimleri kapatmadı');
  // boşta sürekli çalışan animasyon yok
  await bekle(1500);
  const bosta = await t.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').length);
  if (bosta) sorun(y, `boşta ${bosta} animasyon çalışıyor`);
  await t.close();
}
// 5) İlk kare: adresteki proje yerine ilk proje görünmemeli; betiksiz tarayıcıda bütün işler görünmeli
{
  const t = await hareketli.newPage();
  await t.setViewport({ width: 1262, height: 800 });
  await (await t.createCDPSession()).send('Emulation.setCPUThrottlingRate', { rate: 6 });
  await t.evaluateOnNewDocument(() => {
    window.__yanlis = 0;
    const bak = () => {
      const s = document.querySelector('.soz:not([hidden])');
      if (s && s.dataset.soz !== 'snowdesk' && s.checkVisibility({ visibilityProperty: true })) window.__yanlis++;
      if (performance.now() < 2500) requestAnimationFrame(bak);
    };
    requestAnimationFrame(bak);
  });
  await t.goto(`${taban}/#isler/snowdesk`, { waitUntil: 'load' });
  await bekle(2600);
  const yanlis = await t.evaluate(() => window.__yanlis);
  if (yanlis) sorun('/#isler/snowdesk', `${yanlis} karede yanlış proje göründü`);
  if (!(await t.evaluate(() => document.querySelector('[data-soz=snowdesk]').checkVisibility({ visibilityProperty: true })))) sorun('/#isler/snowdesk', 'proje görünmedi');
  await t.close();
  const b = await hareketli.newPage();
  await b.setJavaScriptEnabled(false);
  await b.setViewport({ width: 1262, height: 800 });
  await b.goto(`${taban}/`, { waitUntil: 'load' });
  let eksik = 0;
  for (const a of await b.$$('[data-sec]')) if (!(await a.isVisible())) eksik++;
  if (eksik) sorun('/', `betiksiz tarayıcıda ${eksik} iş görünmüyor`);
  await b.close();
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
