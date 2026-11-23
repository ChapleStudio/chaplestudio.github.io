/**
 * Ana sayfanın davranışı. Her şey bağlantıdır: betik yoksa da çalışır, orta tuş ve Ctrl ile yeni sekmede açılır.
 * Animasyonlar Element.animate ile başlatılır; durum farkına bağlı olmadıkları için her tıklamada baştan oynar.
 * Sürekli çizim döngüsü yoktur, kimse dokunmuyorsa işlemci harcanmaz.
 */
import { DONUS } from './donus';

const bul = <T extends HTMLElement = HTMLElement>(s: string) => {
  const e = document.querySelector<T>(s);
  if (!e) throw new Error(`ana sayfada ${s} yok`);
  return e;
};
const hepsi = <T extends HTMLElement = HTMLElement>(s: string, kok: ParentNode = document) => [...kok.querySelectorAll<T>(s)];
const kok = bul('[data-kok]'), sahne = bul('[data-sahne]'), plaka = bul('[data-plaka]');
const afisler = new Map(hepsi('[data-afis]').map((e) => [e.dataset['afis']!, e]));
const soylesiler = new Map(hepsi('[data-soz]').map((e) => [e.dataset['soz']!, e]));
const adlar = new Map(hepsi<HTMLAnchorElement>('[data-sec]').map((e) => [e.dataset['sec']!, e]));
const gruplar = new Map(hepsi('[data-grup]').map((e) => [e.dataset['grup']!, e]));
const dilimKutulari = new Map(hepsi('[data-dilimler]').map((e) => [e.dataset['dilimler']!, e]));
const kumesi = new Map([...gruplar].flatMap(([k, g]) => hepsi('[data-sec]', g).map((a) => [a.dataset['sec']!, k] as const)));

const hareketsiz = matchMedia('(prefers-reduced-motion: reduce)');
const dar = matchMedia('(max-width: 860px)');
const EGRI = 'cubic-bezier(0.6, 0, 0.15, 1)';
const YUMUSAK = 'cubic-bezier(0.2, 0.7, 0.2, 1)';
const SOLDAN = [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0)' }];
const YUKARDAN = [{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0)' }];
const oynat = (e: Element, kareler: Keyframe[], duration: number, easing: string, delay = 0): Promise<unknown> =>
  hareketsiz.matches ? Promise.resolve() : e.animate(kareler, { duration, easing, delay, fill: 'backwards' }).finished.catch(() => undefined);
const sonra = (ms: number, is: () => void) => setTimeout(is, hareketsiz.matches ? 0 : ms);

let secili = sahne.dataset['is']!;
let acik: string | null = null; // dilimleri görünen kategori
let giriyor = false;
let sayac: ReturnType<typeof setTimeout> | undefined;

const goster = (id: string) => {
  const a = afisler.get(id)!;
  a.hidden = false;
  return a;
};
const grubuIsaretle = (k: string) => gruplar.forEach((g, id) => {
  g.classList.toggle('acik', id === k);
  g.querySelector('button')?.setAttribute('aria-expanded', String(id === acik));
});
const basaKaydir = () => { if (dar.matches && scrollY > 0) scrollTo({ top: 0, behavior: hareketsiz.matches ? 'auto' : 'smooth' }); };

function dilimleriKaldir() {
  clearTimeout(sayac);
  acik = null;
  delete sahne.dataset['kat'];
  for (const d of dilimKutulari.values()) {
    d.hidden = true;
    delete d.dataset['buyu'];
    for (const x of d.children) x.classList.remove('buyuk', 'kucuk');
  }
}
/** Açık dilimleri yukarı çekerek kapatır. */
function dilimleriKapat() {
  const d = acik === null ? undefined : dilimKutulari.get(acik);
  clearTimeout(sayac);
  acik = null;
  if (!d || hareketsiz.matches) return dilimleriKaldir();
  for (const x of d.children) x.animate([...YUKARDAN].reverse(), { duration: 360, easing: EGRI, fill: 'forwards' });
  sayac = setTimeout(() => { dilimleriKaldir(); for (const x of d.children) for (const a of x.getAnimations()) a.cancel(); }, 370);
}

type Gecis = 'sil' | 'sessiz';
function sec(id: string, gecis: Gecis) {
  const once = secili;
  secili = id;
  for (const [k, a] of afisler) {
    a.classList.toggle('secili', k === id);
    a.classList.toggle('onceki', k === once && k !== id);
  }
  const a = goster(id);
  sahne.dataset['is'] = id;
  soylesiler.forEach((s, k) => { s.hidden = k !== id; });
  adlar.forEach((x, k) => (k === id ? x.setAttribute('aria-current', 'true') : x.removeAttribute('aria-current')));
  if (gecis === 'sil') void oynat(a, SOLDAN, 750, 'cubic-bezier(0.7, 0, 0.15, 1)');
  void oynat(soylesiler.get(id)!, [{ transform: 'translateY(26px)' }, { transform: 'none' }], 550, YUMUSAK, 120);
  history.replaceState(history.state, '', `#isler/${id}`);
  onHazirla(id);
}

function projeyeGec(id: string) {
  if (giriyor) return;
  basaKaydir();
  if (id === secili && acik === null) return gir(id);
  if (acik !== null) {
    // Yeni afiş altta hazır durur, dilimler çekilip onu gösterir.
    sec(id, 'sessiz');
    dilimleriKapat();
  } else sec(id, 'sil');
  grubuIsaretle(kumesi.get(id)!);
}

function kategoriAc(k: string) {
  if (giriyor) return;
  basaKaydir();
  if (acik === k) {
    dilimleriKapat();
    return grubuIsaretle(kumesi.get(secili)!);
  }
  dilimleriKaldir();
  const d = dilimKutulari.get(k)!;
  for (const x of d.children) for (const a of x.getAnimations()) a.cancel();
  acik = k;
  sahne.dataset['kat'] = '';
  d.hidden = false;
  [...d.children].forEach((x, i) => void oynat(x, YUKARDAN, 500, EGRI, i * 60));
  grubuIsaretle(k);
}

function dilimSec(id: string) {
  const d = acik === null ? undefined : dilimKutulari.get(acik);
  if (giriyor || !d || d.dataset['buyu'] !== undefined) return;
  goster(id);
  d.dataset['buyu'] = '';
  for (const x of hepsi('[data-dilim]', d)) x.classList.add(x.dataset['dilim'] === id ? 'buyuk' : 'kucuk');
  clearTimeout(sayac);
  sayac = sonra(580, () => {
    sec(id, 'sessiz');
    dilimleriKaldir();
    grubuIsaretle(kumesi.get(id)!);
    adlar.get(id)!.focus({ preventScroll: true });
  });
}

/** Afişin içine yakınlaşır, sonra projenin sayfasına geçer. */
function gir(id: string) {
  if (giriyor) return;
  const yol = adlar.get(id)!.href;
  giriyor = true;
  dilimleriKaldir();
  sessionStorage.setItem(DONUS, id);
  kok.style.setProperty('--plaka-boy', `${plaka.offsetHeight}px`);
  kok.dataset['giriyor'] = '';
  sonra(620, () => { location.assign(yol); });
}

/** İçeriden dönünce yakınlaşmış afişten geri çekilir. */
function donus() {
  giriyor = false;
  if (kok.dataset['giriyor'] === undefined) {
    kok.dataset['ani'] = '';
    kok.style.setProperty('--plaka-boy', `${plaka.offsetHeight}px`);
    kok.dataset['giriyor'] = '';
    void kok.offsetHeight;
    delete kok.dataset['ani'];
  }
  requestAnimationFrame(() => requestAnimationFrame(() => { delete kok.dataset['giriyor']; }));
}

const hazirlanan = new Set<string>();
/** Seçilen projenin sayfası önceden iner, içine girince beklenmez. */
function onHazirla(id: string) {
  const yol = adlar.get(id)!.href;
  if (hazirlanan.has(yol)) return;
  hazirlanan.add(yol);
  const l = document.createElement('link');
  l.rel = 'prefetch';
  l.href = yol;
  document.head.append(l);
}

const duzTik = (e: MouseEvent) => e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
document.addEventListener('click', (e) => {
  if (!(e.target instanceof Element) || !duzTik(e)) return;
  const h = e.target.closest<HTMLElement>('[data-sec], [data-dilim], [data-gir], [data-kategori]');
  if (!h) return;
  e.preventDefault();
  const { sec: s, dilim: d, gir: g, kategori: k } = h.dataset;
  if (s !== undefined) projeyeGec(s);
  else if (d !== undefined) dilimSec(d);
  else if (g !== undefined) gir(g);
  else if (k !== undefined) kategoriAc(k);
});
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape' || acik === null) return;
  const dugme = gruplar.get(acik)?.querySelector('button');
  kategoriAc(acik);
  dugme?.focus();
});

function adrestenOku() {
  const id = decodeURIComponent(location.hash).replace(/^#isler\//, '');
  if (id !== secili && afisler.has(id)) {
    sec(id, 'sessiz');
    grubuIsaretle(kumesi.get(id)!);
  }
}
adrestenOku();
document.documentElement.classList.remove('bekle');
// Proje sayfası "buradan girildi" notunu dönüşte yerine getirir.
if (sessionStorage.getItem(DONUS) === secili && performance.getEntriesByType('navigation')[0] instanceof PerformanceNavigationTiming) donus();
sessionStorage.removeItem(DONUS);
addEventListener('hashchange', () => { adrestenOku(); });
addEventListener('pageshow', (e) => {
  if (!e.persisted) return;
  sessionStorage.removeItem(DONUS);
  donus();
});

// Öteki afişler ve yazı tipleri ana sayfa oturduktan sonra iner; ilk tıklamada hazır olurlar.
const bosta = (is: () => void) => ('requestIdleCallback' in window ? requestIdleCallback(is, { timeout: 2500 }) : setTimeout(is, 600));
const hazirla = () => bosta(() => {
  onHazirla(secili);
  for (const id of afisler.keys()) {
    const resim = goster(id).querySelector('img');
    if (resim) { resim.loading = 'eager'; resim.decode().catch(() => undefined); }
    const s = getComputedStyle(soylesiler.get(id)!);
    void document.fonts.load(`${s.getPropertyValue('--kalin')} 40px ${s.getPropertyValue('--tip')}`, adlar.get(id)!.textContent ?? '');
  }
});
if (document.readyState === 'complete') hazirla();
else addEventListener('load', hazirla, { once: true });
