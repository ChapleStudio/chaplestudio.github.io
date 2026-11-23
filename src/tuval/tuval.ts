import { canliTut, dongu } from './tempo';
import { ucusYolu, yumusak, type Kamera, type Kutu } from './kamera';
import { bekletSahneleri, hizliSahne, ODA_DOLULUK, olcekVer, paletAl, sahneCiz, sahneleriEkle } from './sahnelik';
import { sahneBul } from './sahneler';

interface AgacVerisi { cizgiler: { cocuk: string; yol: string; renk: string }[]; ebeveyn: Record<string, string>; etiketleri: Record<string, string[]> }
interface Cizgi { kutu: [number, number, number, number]; cocuk: string; nokta: Float32Array; boy: number; renk: string; sonuk: string; gecikme: number }

const $ = <T extends Element>(s: string, k: ParentNode = document) => k.querySelector<T>(s)!;
const tuval = $<HTMLElement>('[data-tuval]'), zemin = $<HTMLCanvasElement>('.zemin', tuval), dunya = $<HTMLElement>('.dunya', tuval);
const kap = $<HTMLElement>('[data-oda-kabi]'), ipucu = $<HTMLElement>('.ipucu'), ustKapsul = $<HTMLElement>('.ust-kapsul');
const { cizgiler: ham, ebeveyn, etiketleri } = JSON.parse($('#agac').textContent!) as AgacVerisi;
const genisEkran = matchMedia('(min-width: 52rem) and (min-height: 30rem)');
const sakin = matchMedia('(prefers-reduced-motion: reduce)');
const anaBaslik = document.title;

/* ---------- Ağaç ---------- */
const dugumler = new Map<string, HTMLElement>();
const yerler = new Map<string, Kutu>();
for (const el of tuval.querySelectorAll<HTMLElement>('[data-dugum]')) {
  const id = el.dataset['dugum']!;
  const [x = 0, y = 0, w = 0, h = 0] = el.dataset['yer']!.split(' ').map(Number);
  dugumler.set(id, el);
  yerler.set(id, { x, y, w, h });
}
const cocuklar = new Map<string, string[]>();
for (const [c, e] of Object.entries(ebeveyn)) if (dugumler.has(c)) cocuklar.set(dugumler.has(e) ? e : 'kok', [...(cocuklar.get(e) ?? []), c]);
const ust = (id: string): string | undefined => { const e = ebeveyn[id]; return e === undefined ? undefined : dugumler.has(e) ? e : 'kok'; };
const soy = (id: string) => { const s: string[] = []; for (let n: string | undefined = id; n; n = ust(n)) s.push(n); return s; };
const altlar = (id: string): string[] => [id, ...(cocuklar.get(id) ?? []).flatMap(altlar)];
const yaprakMi = (id: string) => dugumler.get(id)?.hasAttribute('data-kart') ?? false;

/* ---------- Durum ---------- */
let acik = false, W = 0, H = 0;
let kam: Kamera = { x: 0, y: 0, z: 0.5 };
let secili: Set<string> = new Set(), kalici: Set<string> = new Set();
let dal = 'kok', vurgulu: Set<string> = new Set(), odada: string | null = null, mesgul = false;
let buyume = sakin.matches ? 9 : -1, buyumeBasi = 0;
/** Bir dal seçilince ışık dalgası tepeden uçlara iner. */
let dalga: { bas: number; ids: Set<string>; kat: number } | null = null;
let fare = { x: -999, y: -999 }, hiz = { x: 0, y: 0 }, ucus: { iptal: () => void } | null = null;

const uygula = () => {
  dunya.style.transform = `translate3d(${W / 2 - kam.x * kam.z}px, ${H / 2 - kam.y * kam.z}px, 0) scale(${kam.z})`;
  dunya.toggleAttribute('data-uzak', kam.z < 0.62);
  dunya.style.setProperty('--iri', String(Math.min(1.75, Math.max(1, 0.82 / kam.z))));
};
const kutuHesapla = (ids: string[]): Kutu => {
  let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity;
  for (const id of ids) { const k = yerler.get(id)!; a = Math.min(a, k.x); b = Math.min(b, k.y); c = Math.max(c, k.x + k.w); d = Math.max(d, k.y + k.h); }
  return { x: a, y: b, w: c - a, h: d - b };
};
const sigdir = (k: Kutu, enBuyuk = 1.15): Kamera => {
  const tepe = 108, dip = 40, yan = 60;
  const z = Math.min((W - yan * 2) / k.w, (H - tepe - dip) / k.h, enBuyuk);
  return { x: k.x + k.w / 2, y: k.y + k.h / 2 - (tepe - dip) / 2 / z, z: Math.max(z, 0.06) };
};
/** Dal görünümü: sığmayacak kadar uzun dalda okunur bir yakınlıkta tepeden başlar. */
const dalGorunumu = (id: string): Kamera => {
  const k = kutuHesapla(altlar(id));
  const g = sigdir(k, 0.95);
  const okunur = id === 'kok' ? 0.3 : 0.62;
  if (g.z >= okunur) return g;
  const z = Math.min(okunur, (W - 120) / Math.min(k.w, 1900));
  const tepe = yerler.get(id)!;
  return { x: tepe.x + tepe.w / 2, y: k.y + (H / 2 - 100) / z, z };
};
const enAz = () => Math.min(sigdir(kutuHesapla([...yerler.keys()])).z * 0.7, 0.3);

const ucusuDurdur = () => { ucus?.iptal(); ucus = null; };
function uc(hedef: Kamera, sure?: number, her?: (p: number) => void): Promise<void> {
  ucus?.iptal();
  hiz = { x: 0, y: 0 };
  const yol = ucusYolu(kam, hedef, W);
  const ms = sakin.matches ? 0 : (sure ?? Math.min(1500, Math.max(520, yol.uzunluk * 620)));
  return canliTut(new Promise<void>((bitti) => {
    let iptal = false;
    const bas = performance.now();
    ucus = { iptal: () => { iptal = true; bitti(); } };
    const adim = (an: number) => {
      if (iptal) return;
      const p = ms ? Math.min(1, Math.max(0, (an - bas) / ms)) : 1;
      kam = p === 1 ? { ...hedef } : yol.yer(yumusak(p));
      uygula();
      her?.(p);
      if (p < 1) requestAnimationFrame(adim);
      else { ucus = null; olcekVer(kam.z); bitti(); }
    };
    adim(bas);
  }));
}

/* ---------- Dal seçme ---------- */
const eslesenler = () => [...dugumler.keys()].filter((id) => yaprakMi(id) && [...secili].every((e) => etiketleri[id]?.includes(e)));
/** Dal ya da etiket seçimine göre hangi düğümlerin parlak kalacağını uygular. */
function karart() {
  const uyan = secili.size ? eslesenler() : [];
  const parlak = new Set(secili.size ? uyan.flatMap(soy) : dal === 'kok' ? dugumler.keys() : [...altlar(dal), ...soy(dal)]);
  parlak.add('kok');
  kalici = new Set(secili.size ? parlak : []);
  for (const [n, el] of dugumler) {
    el.toggleAttribute('data-sonuk', acik && !parlak.has(n));
    el.toggleAttribute('data-eslesen', secili.size > 0 && yaprakMi(n) && parlak.has(n));
    const li = el.closest('li');
    if (li) li.hidden = !acik && secili.size > 0 && !parlak.has(n);
  }
}
function isaretle(id: string) {
  dal = id;
  karart();
  const zincir = new Set(soy(id));
  for (const a of ustKapsul.querySelectorAll<HTMLElement>('[data-dugum-git]')) {
    const g = a.dataset['dugumGit']!;
    const secili = g === 'kok' ? id === 'kok' : zincir.has(g);
    if (secili) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
  }
}
function dalaGit(id: string, gecmis: boolean) {
  etiketSec([], false);
  if (gecmis && (location.search || (location.hash.slice(1) || 'kok') !== id)) history.pushState({ dal: id }, '', id === 'kok' ? '/' : `/#${id}`);
  isaretle(id);
  ipucu.setAttribute('data-bitti', '');
  dalga = { bas: performance.now(), ids: new Set(altlar(id).slice(1)), kat: derinlik(id) };
  void canliTut(new Promise((b) => setTimeout(b, 2500)));
  if (acik) void uc(dalGorunumu(id));
  else (id === 'kok' ? document.documentElement : document.getElementById(id))?.scrollIntoView({ behavior: sakin.matches ? 'auto' : 'smooth', block: 'start' });
}

/* ---------- Etiketle süzme ---------- */
const panel = $<HTMLElement>('#etiket-paneli'), panelAc = $<HTMLElement>('[data-etiket-ac]'), sonuc = $<HTMLElement>('[data-etiket-sonuc]'), temizle = $<HTMLElement>('[data-etiket-temizle]');
const ilkSonuc = sonuc.textContent;
const bilinen = new Set([...panel.querySelectorAll<HTMLElement>('[data-etiket-sec]')].map((b) => b.dataset['etiketSec']!));
const durum = $<HTMLElement>('[data-suzgec-durumu]');
/** Panel kapalıyken seçili etiketleri ve sonucu gösterir; etikete basınca kalkar. */
function durumCiz(sayi: number) {
  durum.hidden = !secili.size || !panel.hidden;
  durum.replaceChildren(`${sayi} proje`, ...[...secili].map((id) => {
    const b = document.createElement('button'), ad = panel.querySelector(`[data-etiket-sec="${id}"]`)!.firstChild!.textContent!;
    b.type = 'button';
    b.className = 'etiket';
    b.dataset['etiketSec'] = id;
    b.textContent = `${ad} ×`;
    b.setAttribute('aria-label', `${ad} etiketini kaldır`);
    return b;
  }));
}
function panelGoster(ac: boolean) {
  panel.hidden = !ac;
  durumCiz(eslesenler().length);
  panelAc.setAttribute('aria-expanded', String(ac));
  if (ac) ipucu.setAttribute('data-bitti', '');
}
/** Seçili etiketlerin hepsini taşıyan projeler kalır; kamera onlara döner. */
function etiketSec(yeni: Iterable<string>, git = true) {
  const once = secili.size;
  secili = new Set([...yeni].filter((e) => bilinen.has(e)));
  if (!secili.size && !once) return;
  const uyan = eslesenler();
  for (const b of panel.querySelectorAll<HTMLElement>('[data-etiket-sec]')) {
    const id = b.dataset['etiketSec']!, basili = secili.has(id), sayi = uyan.filter((u) => etiketleri[u]?.includes(id)).length;
    b.setAttribute('aria-pressed', String(basili));
    b.closest('li')!.hidden = !basili && sayi === 0;
    b.querySelector('.adet')!.textContent = String(sayi);
  }
  for (const g of panel.querySelectorAll<HTMLElement>('section')) g.hidden = !g.querySelector('li:not([hidden])');
  durumCiz(uyan.length);
  temizle.hidden = !secili.size;
  sonuc.textContent = secili.size ? `${uyan.length} proje` : ilkSonuc;
  if (git) {
    dal = 'kok';
    if (secili.size) for (const a of ustKapsul.querySelectorAll('[aria-current]')) a.removeAttribute('aria-current');
    else isaretle('kok');
  }
  karart();
  if (!git) return;
  history.replaceState({ etiket: [...secili] }, '', secili.size ? `/?etiket=${[...secili].join(',')}` : '/');
  if (secili.size) dalga = { bas: performance.now(), ids: kalici, kat: 0 };
  if (acik) void uc(secili.size && uyan.length ? etiketGorunumu(uyan) : dalGorunumu('kok'));
}
/** Eşleşenleri panelin sağında kalan alana sığdırır. */
function etiketGorunumu(uyan: string[]): Kamera {
  const k = kutuHesapla([...new Set(uyan.flatMap(soy))].filter((n) => n !== 'kok'));
  const sol = panel.hidden ? 60 : panel.offsetWidth + 50, en = W - sol - 60;
  const z = Math.max(0.12, Math.min(en / k.w, (H - 200) / k.h, 0.95));
  return { x: k.x + k.w / 2 - (sol - 60) / 2 / z, y: k.y + k.h / 2 - 10 / z, z };
}
const adrestekiEtiketler = () => (new URLSearchParams(location.search).get('etiket') ?? '').split(',').filter(Boolean);

/* ---------- Düğümün içine girme ---------- */
const onbellek = new Map<string, Promise<Document>>();
const getir = (yol: string) => {
  let s = onbellek.get(yol);
  if (!s) {
    s = fetch(yol).then(async (y) => { if (!y.ok) throw new Error(String(y.status)); return new DOMParser().parseFromString(await y.text(), 'text/html'); });
    s.catch(() => onbellek.delete(yol));
    onbellek.set(yol, s);
  }
  return s;
};
const kartBul = (yol: string) => [...tuval.querySelectorAll<HTMLAnchorElement>('[data-kart]')].find((k) => k.pathname === yol);
const gorselDunyasi = (kart: HTMLElement): Kutu => {
  const k = yerler.get(kart.dataset['dugum']!)!, g = $<HTMLElement>('.gorsel', kart);
  return { x: k.x + g.offsetLeft, y: k.y + g.offsetTop, w: g.offsetWidth, h: g.offsetHeight };
};
const kaplayan = (g: Kutu): Kamera => ({ x: g.x + g.w / 2, y: g.y + g.h / 2, z: Math.max(W / g.w, H / g.h) });
const ekranda = (g: Kutu): Kutu => ({ x: (g.x - kam.x) * kam.z + W / 2, y: (g.y - kam.y) * kam.z + H / 2, w: g.w * kam.z, h: g.h * kam.z });

/** Kartın sahnesini ekranla kart arasında taşıyan geçit. `oran` 0 kart, 1 tam ekran. */
function gecitKur(kart: HTMLElement) {
  const kaynak = $<HTMLCanvasElement>('canvas', kart), gecit = document.createElement('canvas');
  gecit.className = 'gecit';
  gecit.setAttribute('aria-hidden', 'true');
  gecit.setAttribute('data-renk', kart.dataset['renk'] ?? '');
  const cizici = sahneBul(kaynak.dataset['sahne'], kaynak.dataset['kayit'] ?? ''), palet = paletAl(kaynak);
  const sabit = $<HTMLElement>('.gorsel', kart).getBoundingClientRect();
  document.body.append(gecit);
  return {
    koy(oran: number) {
      const g = acik ? ekranda(gorselDunyasi(kart)) : { x: sabit.x, y: sabit.y, w: sabit.width, h: sabit.height };
      const en = innerWidth, boy = innerHeight, k = oran;
      const x = g.x * (1 - k), y = g.y * (1 - k), w = g.w + (en - g.w) * k, h = g.h + (boy - g.h) * k;
      Object.assign(gecit.style, { left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px`, borderRadius: `${14 * (1 - k)}px` });
      sahneCiz(gecit, cizici, palet, w, h, Math.min(devicePixelRatio, 1.5, 2200 / Math.max(w, 1)), 1 - (1 - ODA_DOLULUK) * k);
    },
    kaldir: () => gecit.remove(),
  };
}

function odayiDoldur(sayfa: Document) {
  const ic = sayfa.querySelector('#icerik');
  if (!ic) throw new Error('içerik yok');
  kap.replaceChildren(...[...ic.children].map((c) => document.importNode(c, true)));
  kap.scrollTop = 0;
  kap.hidden = false;
  document.title = sayfa.title;
  document.documentElement.setAttribute('data-oda', '');
  tuval.inert = ustKapsul.inert = panel.inert = durum.inert = true;
  sahneleriEkle(kap);
  const b = kap.querySelector<HTMLElement>('h1');
  if (b) { b.tabIndex = -1; b.focus({ preventScroll: true }); }
}

async function gir(yol: string, gecmis: boolean) {
  const kart = kartBul(yol);
  if (mesgul) return;
  if (!kart) { location.assign(yol); return; }
  mesgul = true;
  const bekleyen = getir(yol);
  if (gecmis) history.pushState({ oda: yol }, '', yol);
  try {
    if (odada) { odayiDoldur(await bekleyen); odada = yol; return; }
    if (sakin.matches) { odayiDoldur(await bekleyen); odada = yol; return; }
    buyume = 9;
    for (const el of dugumler.values()) el.removeAttribute('data-kapali');
    bekletSahneleri(true);
    const gecit = gecitKur(kart);
    if (acik) {
      vurgula(kart.dataset['dugum']!);
      await uc(kaplayan(gorselDunyasi(kart)), 1050, (p) => {
        gecit.koy(yumusak(Math.max(0, (p - 0.35) / 0.65)));
        dunya.style.opacity = String(Math.max(0, 1 - Math.max(0, p - 0.45) * 2.6));
      });
    } else await sure(620, (p) => gecit.koy(yumusak(p)));
    gecit.koy(1);
    odayiDoldur(await bekleyen);
    odada = yol;
    await ikiKare();
    gecit.kaldir();
  } catch { location.assign(yol); }
  finally { mesgul = false; bekletSahneleri(false); }
}

async function cik(hedefDal: string, etiketler: string[] = []) {
  const yol = odada;
  if (!yol || mesgul) return;
  mesgul = true;
  const kart = kartBul(yol);
  odada = null;
  document.title = anaBaslik;
  const kapat = () => {
    kap.hidden = true;
    kap.replaceChildren();
    kap.removeAttribute('data-cikiyor');
    document.documentElement.removeAttribute('data-oda');
    tuval.inert = ustKapsul.inert = panel.inert = durum.inert = false;
  };
  if (!kart || sakin.matches) { kapat(); if (acik) kam = dalGorunumu(hedefDal); uygula(); dunya.style.opacity = ''; }
  else {
    bekletSahneleri(true);
    if (acik) { kam = kaplayan(gorselDunyasi(kart)); uygula(); dunya.style.opacity = '0'; }
    const gecit = gecitKur(kart);
    gecit.koy(1);
    kap.setAttribute('data-cikiyor', '');
    await sure(170, () => gecit.koy(1));
    kapat();
    isaretle(hedefDal);
    if (acik) await uc(dalGorunumu(hedefDal), 1050, (p) => {
      gecit.koy(1 - yumusak(Math.min(1, p / 0.7)));
      dunya.style.opacity = String(Math.min(1, Math.max(0, p - 0.25) * 2.2));
    });
    else await sure(520, (p) => gecit.koy(1 - yumusak(p)));
    gecit.kaldir();
    dunya.style.opacity = '';
    bekletSahneleri(false);
  }
  isaretle(hedefDal);
  vurgula(null);
  mesgul = false;
  if (etiketler.length) { panelGoster(false); etiketSec(etiketler); }
  kart?.focus({ preventScroll: acik });
}
const sure = (ms: number, her: (p: number) => void) => canliTut(new Promise<void>((bitti) => {
  const bas = performance.now();
  const adim = (an: number) => { const p = Math.min(1, Math.max(0, (an - bas) / ms)); her(p); if (p < 1) requestAnimationFrame(adim); else bitti(); };
  adim(bas);
}));
const ikiKare = () => new Promise<void>((b) => requestAnimationFrame(() => requestAnimationFrame(() => b())));
const dalAdi = (yol: string) => { const k = kartBul(yol); return k ? (ust(k.dataset['dugum']!) ?? 'kok') : 'kok'; };

/* ---------- Zemin: noktalar, dallar, ışık ---------- */
const renkCoz = (ad: string) => getComputedStyle(document.documentElement).getPropertyValue(`--${ad}`).trim();
const soldur = (r: string, o: number) => { const n = parseInt(r.slice(1), 16); return `rgb(${[n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(v * o + 11 * (1 - o))).join(',')})`; };
const cizgiler: Cizgi[] = ham.map((c) => {
  const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  p.setAttribute('d', c.yol);
  const boy = p.getTotalLength(), n = Math.max(16, Math.min(420, Math.round(boy / 5))), nokta = new Float32Array((n + 1) * 2);
  for (let i = 0; i <= n; i++) { const q = p.getPointAtLength((boy * i) / n); nokta[i * 2] = q.x; nokta[i * 2 + 1] = q.y; }
  let kx0 = Infinity, ky0 = Infinity, kx1 = -Infinity, ky1 = -Infinity;
  for (let i = 0; i <= n; i++) { const x = nokta[i * 2]!, y = nokta[i * 2 + 1]!; kx0 = Math.min(kx0, x); kx1 = Math.max(kx1, x); ky0 = Math.min(ky0, y); ky1 = Math.max(ky1, y); }
  const renk = renkCoz(c.renk);
  return { kutu: [kx0, ky0, kx1, ky1], cocuk: c.cocuk, nokta, boy, renk, sonuk: soldur(renk, 0.42), gecikme: yaprakMi(c.cocuk) ? 0.55 : 0 };
});
const derinlik = (id: string) => soy(id).length - 1;
for (const c of cizgiler) c.gecikme = Math.max(0, derinlik(c.cocuk) - 1) * 0.6 + (yaprakMi(c.cocuk) ? Math.min(0.5, ((yerler.get(c.cocuk)!.y) / 2600) * 0.5) : 0);

function vurgula(id: string | null) { vurgulu = new Set(id ? soy(id) : []); }
const c2d = zemin.getContext('2d')!;
const X = (x: number) => (x - kam.x) * kam.z + W / 2, Y = (y: number) => (y - kam.y) * kam.z + H / 2;

const mercan = renkCoz('mercan');
const karo = document.createElement('canvas');
karo.width = karo.height = 64;
{ const k = karo.getContext('2d')!; k.fillStyle = '#e9e3d8'; k.fillRect(31, 31, 2, 2); }
const desen = c2d.createPattern(karo, 'repeat')!;
/** Sabit noktalar tek desenle boyanır; yalnız farenin çevresindekiler tek tek çizilir. */
function noktaCiz(aralik: number, derin: number, parlaklik: number) {
  let adim = aralik * kam.z * derin;
  while (adim < 24) adim *= 2;
  while (adim > 66) adim /= 2;
  const ox = (((W / 2 - kam.x * kam.z * derin) % adim) + adim) % adim, oy = (((H / 2 - kam.y * kam.z * derin) % adim) + adim) % adim;
  const o = adim / 64;
  desen.setTransform(new DOMMatrix([o, 0, 0, o, ox - 32 * o, oy - 32 * o]));
  c2d.globalAlpha = parlaklik;
  c2d.fillStyle = desen;
  c2d.fillRect(0, 0, W, H);
  if (derin === 1) {
    c2d.fillStyle = mercan;
    const R = 180, bx = Math.ceil((fare.x - R - ox) / adim) * adim + ox, by = Math.ceil((fare.y - R - oy) / adim) * adim + oy;
    for (let x = bx; x < fare.x + R; x += adim) for (let y = by; y < fare.y + R; y += adim) {
      const dx = x - fare.x, dy = y - fare.y, u = Math.hypot(dx, dy);
      if (u > R) continue;
      const g = 1 - u / R, it = g * g * 9, r = 1 + g * 1.9;
      c2d.globalAlpha = g * 0.85;
      c2d.fillRect(x + (dx / (u || 1)) * it - r / 2, y + (dy / (u || 1)) * it - r / 2, r, r);
    }
  }
  c2d.globalAlpha = 1;
}
function izCiz(n: Float32Array, bas: number, son: number) {
  // Uzaktan bakınca her noktaya gerek yok.
  const m = n.length / 2 - 1, a = bas * m, b = son * m, atla = Math.max(1, Math.floor(1.6 / kam.z));
  const ara = (t: number): [number, number] => { const i = Math.min(m - 1, Math.floor(t)), k = t - i; return [n[i * 2]! * (1 - k) + n[i * 2 + 2]! * k, n[i * 2 + 1]! * (1 - k) + n[i * 2 + 3]! * k]; };
  const [x0, y0] = ara(a);
  c2d.beginPath();
  c2d.moveTo(X(x0), Y(y0));
  for (let i = Math.floor(a) + 1; i < b; i += atla) c2d.lineTo(X(n[i * 2]!), Y(n[i * 2 + 1]!));
  const [x1, y1] = ara(b);
  c2d.lineTo(X(x1), Y(y1));
  c2d.stroke();
  return [X(x1), Y(y1)] as const;
}
/** Her dalın arkasında kendi renginde yumuşak bir ışık; dünya ile birlikte yakınlaşır. */
const isiklar = [...dugumler.keys()].filter((id) => id !== 'kok' && !yaprakMi(id) && (cocuklar.get(id) ?? []).some(yaprakMi)).map((id) => {
  const k = kutuHesapla(altlar(id)), renk = getComputedStyle(dugumler.get(id)!).getPropertyValue('--dal').trim();
  const leke = document.createElement('canvas');
  leke.width = leke.height = 256;
  const l = leke.getContext('2d')!, g = l.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, renk + '30');
  g.addColorStop(0.5, renk + '14');
  g.addColorStop(1, renk + '00');
  l.fillStyle = g;
  l.fillRect(0, 0, 256, 256);
  return { id, leke, x: k.x + k.w / 2, y: k.y + k.h * 0.42, r: Math.max(k.w, Math.min(k.h, 1400)) * 0.95 };
});
function isikCiz(t: number) {
  isiklar.forEach((i, n) => {
    const x = X(i.x), y = Y(i.y), r = i.r * kam.z * (1 + 0.05 * Math.sin(t * 0.5 + n * 1.7));
    if (x + r < 0 || x - r > W || y + r < 0 || y - r > H) return;
    const parlak = kalici.size ? kalici.has(i.id) : dal === 'kok' || soy(dal).includes(i.id) || soy(i.id).includes(dal);
    c2d.globalAlpha = Math.min(1, Math.max(0, buyume * 0.6)) * (parlak ? 1 : 0.2);
    c2d.drawImage(i.leke, x - r, y - r, r * 2, r * 2);
  });
  c2d.globalAlpha = 1;
}
/** Derinlik veren, farklı hızlarda süzülen tozlar. */
const tozlar = Array.from({ length: 70 }, (_, i) => { const r = (k: number) => { const s = Math.sin((i + 1) * k) * 43758.5453; return s - Math.floor(s); }; return { x: r(12.9) * 2400, y: r(78.2) * 1600, d: 0.25 + r(37.7) * 0.6, b: 0.6 + r(5.3) * 1.5, f: r(91.1) * 7 }; });
function tozCiz(t: number) {
  const en = W + 80, boy = H + 80, olc = Math.sqrt(kam.z);
  for (const p of tozlar) {
    const x = (((p.x - kam.x * kam.z * p.d + t * 9 * p.d) % en) + en) % en - 40, y = (((p.y - kam.y * kam.z * p.d - t * 14 * p.d) % boy) + boy) % boy - 40;
    c2d.globalAlpha = 0.12 + 0.3 * p.d * (0.5 + 0.5 * Math.sin(t * 1.3 + p.f));
    c2d.fillStyle = '#e9e3d8';
    c2d.beginPath();
    c2d.arc(x, y, p.b * Math.min(2.2, 0.7 + olc * 0.6), 0, 7);
    c2d.fill();
  }
  c2d.globalAlpha = 1;
}
/** Gölge bulanıklığı yerine üst üste saydam çizgilerle parlama. */
function parlakIz(n: Float32Array, a: number, b: number, kalin: number, alfa: number) {
  for (const [kat, o] of [[5, 0.1], [2.6, 0.2], [1, 1]] as const) { c2d.globalAlpha = alfa * o; c2d.lineWidth = kalin * kat; izCiz(n, a, b); }
}
function zeminCiz(an: number) {
  const d = Math.min(devicePixelRatio, 1.25);
  if (zemin.width !== Math.round(W * d) || zemin.height !== Math.round(H * d)) { zemin.width = Math.round(W * d); zemin.height = Math.round(H * d); }
  c2d.setTransform(d, 0, 0, d, 0, 0);
  c2d.clearRect(0, 0, W, H);
  const t0 = sakin.matches ? 2 : an / 1000;
  isikCiz(t0);
  noktaCiz(74, 0.55, 0.07);
  noktaCiz(56, 1, 0.2);
  tozCiz(t0);
  const dalSoyu = kalici.size ? kalici : dal === 'kok' ? null : new Set([...altlar(dal), ...soy(dal)]);
  c2d.lineCap = c2d.lineJoin = 'round';
  const t = sakin.matches ? 0 : an / 1000;
  const gorunur = cizgiler.filter(({ kutu: [a, b, c, e] }) => X(c) > -30 && X(a) < W + 30 && Y(e) > -30 && Y(b) < H + 30);
  const ilerleme = (c: Cizgi) => Math.min(1, Math.max(0, (buyume - c.gecikme) / 0.75));
  for (const c of gorunur) {
    const p = yumusak(ilerleme(c));
    if (p <= 0) continue;
    c2d.globalAlpha = dalSoyu && !dalSoyu.has(c.cocuk) ? 0.18 : 1;
    c2d.strokeStyle = c.sonuk;
    c2d.lineWidth = Math.max(1.2, 2.4 * Math.min(1, kam.z * 1.2));
    const [x, y] = izCiz(c.nokta, 0, p);
    if (p < 1) { c2d.fillStyle = c.renk; c2d.beginPath(); c2d.arc(x, y, 4, 0, 7); c2d.fill(); }
  }
  for (const c of gorunur) {
    const parlak = vurgulu.has(c.cocuk) || kalici.has(c.cocuk);
    if (ilerleme(c) < 1 || (dalSoyu && !dalSoyu.has(c.cocuk) && !parlak)) continue;
    c2d.strokeStyle = c.renk;
    if (parlak) {
      parlakIz(c.nokta, 0, 1, Math.max(2, 3.6 * Math.min(1, kam.z * 1.2)), 1);
    }
    if (!sakin.matches) {
      const tur = c.boy + 900, yer = ((t * (parlak ? 620 : 250) + c.cocuk.length * 173) % tur) / c.boy;
      if (yer < 1) {
        const kuyruk = Math.min(yer, 90 / c.boy);
        parlakIz(c.nokta, yer - kuyruk, yer, Math.max(2, 4 * Math.min(1, kam.z * 1.2)), 0.95);
      }
    }
  }
  if (dalga && !sakin.matches) {
    const gecen = (an - dalga.bas) / 1000;
    for (const c of gorunur) {
      if (!dalga.ids.has(c.cocuk)) continue;
      const p = (gecen - Math.max(0, derinlik(c.cocuk) - dalga.kat - 1) * 0.18 - 0.25) / 0.75;
      if (p <= 0 || p >= 1.4) continue;
      c2d.strokeStyle = c.renk;
      parlakIz(c.nokta, Math.max(0, Math.min(1, p) - 0.45), Math.min(1, p), Math.max(2.5, 5 * Math.min(1, kam.z)), Math.min(1, (1.4 - p) * 2.5));
    }
    if (gecen > 2.4) dalga = null;
  }
  c2d.globalAlpha = 1;
}
function kare(an: number) {
  if (acik && kap.hidden) {
    if (buyume < 9) {
      if (!buyumeBasi) buyumeBasi = an;
      buyume = (an - buyumeBasi) / 1000 - 0.15;
      for (const c of cizgiler) if (buyume > c.gecikme + 0.45) dugumler.get(c.cocuk)?.removeAttribute('data-kapali');
      if (buyume > 3.2) buyume = 9;
    }
    if (!ucus && !tutulan && (Math.abs(hiz.x) > 0.05 || Math.abs(hiz.y) > 0.05)) {
      kam = { ...kam, x: kam.x - hiz.x / kam.z, y: kam.y - hiz.y / kam.z };
      hiz = { x: hiz.x * 0.92, y: hiz.y * 0.92 };
      sinirla();
      uygula();
    }
    zeminCiz(an);
  }
}

/* ---------- Girdi ---------- */
function sinirla() {
  const k = kutuHesapla([...yerler.keys()]);
  kam = { z: Math.min(2.4, Math.max(enAz(), kam.z)), x: Math.min(k.x + k.w, Math.max(k.x, kam.x)), y: Math.min(k.y + k.h, Math.max(k.y, kam.y)) };
}
const yakinlas = (kat: number, px: number, py: number) => {
  const z = Math.min(2.4, Math.max(enAz(), kam.z * kat)), wx = (px - W / 2) / kam.z + kam.x, wy = (py - H / 2) / kam.z + kam.y;
  kam = { x: wx - (px - W / 2) / z, y: wy - (py - H / 2) / z, z };
  sinirla();
  uygula();
  olcekVer(kam.z);
};
let tutulan: { x: number; y: number; kx: number; ky: number; yol: number; son: number } | null = null, surukledi = false;
const parmaklar = new Map<number, { x: number; y: number }>();
let kistirma = 0;
tuval.addEventListener('pointerdown', (e) => {
  if (!acik || e.button !== 0) return;
  ucusuDurdur();
  parmaklar.set(e.pointerId, { x: e.clientX, y: e.clientY });
  tutulan = { x: e.clientX, y: e.clientY, kx: kam.x, ky: kam.y, yol: 0, son: performance.now() };
  surukledi = false;
  hiz = { x: 0, y: 0 };
});
addEventListener('pointermove', (e) => {
  if (!acik) return;
  fare = { x: e.clientX, y: e.clientY };
  if (!tutulan) return;
  if (parmaklar.has(e.pointerId)) parmaklar.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (parmaklar.size === 2) {
    const [a, b] = [...parmaklar.values()] as [{ x: number; y: number }, { x: number; y: number }];
    const m = Math.hypot(a.x - b.x, a.y - b.y);
    if (kistirma) yakinlas(m / kistirma, (a.x + b.x) / 2, (a.y + b.y) / 2);
    kistirma = m;
    surukledi = true;
    return;
  }
  const dx = e.clientX - tutulan.x, dy = e.clientY - tutulan.y;
  if (!surukledi && Math.hypot(dx, dy) > 5) { surukledi = true; tuval.setAttribute('data-tutuldu', ''); ipucu.setAttribute('data-bitti', ''); }
  if (!surukledi) return;
  const onceki = { x: kam.x, y: kam.y };
  kam = { ...kam, x: tutulan.kx - dx / kam.z, y: tutulan.ky - dy / kam.z };
  sinirla();
  hiz = { x: (onceki.x - kam.x) * kam.z, y: (onceki.y - kam.y) * kam.z };
  uygula();
});
const birak = (e: PointerEvent) => { parmaklar.delete(e.pointerId); kistirma = 0; if (!parmaklar.size) { tutulan = null; tuval.removeAttribute('data-tutuldu'); } else { const p = [...parmaklar.values()][0]!; tutulan = { x: p.x, y: p.y, kx: kam.x, ky: kam.y, yol: 0, son: 0 }; } };
addEventListener('pointerup', birak);
addEventListener('pointercancel', birak);
tuval.addEventListener('dragstart', (e) => e.preventDefault());
tuval.addEventListener('wheel', (e) => {
  if (!acik) return;
  e.preventDefault();
  ucusuDurdur();
  ipucu.setAttribute('data-bitti', '');
  yakinlas(Math.exp(-Math.max(-240, Math.min(240, e.deltaY * (e.deltaMode ? 20 : 1))) * 0.0016), e.clientX, e.clientY);
}, { passive: false });

tuval.addEventListener('pointerover', (e) => {
  const d = e.target instanceof Element ? e.target.closest<HTMLElement>('[data-dugum]') : null;
  if (mesgul) return;
  vurgula(d && d.dataset['dugum'] !== 'kok' ? d.dataset['dugum']! : null);
  hizliSahne(d?.querySelector('canvas') ?? null);
  if (d instanceof HTMLAnchorElement && d.hasAttribute('data-kart')) void getir(d.pathname).catch(() => undefined);
});
tuval.addEventListener('focusin', (e) => {
  const d = e.target instanceof Element ? e.target.closest<HTMLElement>('[data-dugum]') : null;
  if (!d || !acik || mesgul || !d.matches(':focus-visible')) return;
  tuval.scrollTo(0, 0);
  const id = d.dataset['dugum']!;
  vurgula(id);
  const s = ekranda(yerler.get(id)!);
  if (s.x < 40 || s.y < 90 || s.x + s.w > W - 40 || s.y + s.h > H - 40) { const k = yerler.get(id)!; void uc({ x: k.x + k.w / 2, y: k.y + k.h / 2, z: Math.max(kam.z, 0.6) }); }
});

const sadeTik = (e: MouseEvent) => e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey;
document.addEventListener('click', (e) => {
  if (!(e.target instanceof Element)) return;
  const yakin = e.target.closest<HTMLElement>('[data-yakin]');
  if (yakin) { void uc({ ...kam, z: Math.min(2.4, Math.max(enAz(), kam.z * Number(yakin.dataset['yakin']))) }, 320); return; }
  if (e.target.closest('[data-etiket-ac]')) { panelGoster(Boolean(panel.hidden)); if (!panel.hidden) panel.querySelector<HTMLElement>('[data-etiket-sec]')?.focus(); return; }
  if (e.target.closest('[data-etiket-kapat]')) { panelGoster(false); panelAc.focus(); return; }
  if (e.target.closest('[data-etiket-temizle]')) { etiketSec([]); panel.querySelector<HTMLElement>('[data-etiket-sec]')?.focus(); return; }
  const sec = e.target.closest<HTMLElement>('[data-etiket-sec]');
  if (sec) {
    const id = sec.dataset['etiketSec']!;
    etiketSec(secili.has(id) ? [...secili].filter((x) => x !== id) : [...secili, id]);
    return;
  }
  const a = e.target.closest<HTMLAnchorElement>('a[href]');
  if (surukledi && tuval.contains(e.target)) { e.preventDefault(); surukledi = false; return; }
  if (!a || !sadeTik(e) || a.origin !== location.origin) return;
  if (a.hasAttribute('data-dal')) { e.preventDefault(); if (!mesgul) dalaGit(a.hash.slice(1), true); return; }
  if (a.hasAttribute('data-cik') && odada) { e.preventDefault(); const d = dalAdi(odada); history.pushState({ dal: d }, '', d === 'kok' ? '/' : `/#${d}`); void cik(d); return; }
  if (odada && a.dataset['etiket']) {
    e.preventDefault();
    const id = a.dataset['etiket'];
    history.pushState({ etiket: [id] }, '', `/?etiket=${id}`);
    void cik('kok', [id]);
    return;
  }
  if (a.hasAttribute('data-kart') || (kap.contains(a) && kartBul(a.pathname))) { e.preventDefault(); void gir(a.pathname, true); }
});
addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey || (e.target instanceof Element && e.target.closest('input, select, textarea'))) return;
  if (e.key === 'Escape') {
    if (odada) { const d = dalAdi(odada); history.pushState({ dal: d }, '', d === 'kok' ? '/' : `/#${d}`); void cik(d); }
    else if (secili.size) etiketSec([]);
    else if (!panel.hidden) { panelGoster(false); panelAc.focus(); }
    else if (dal !== 'kok') dalaGit(ust(dal) ?? 'kok', true);
    return;
  }
  if (!acik || odada) return;
  const id = document.activeElement instanceof HTMLElement ? document.activeElement.closest<HTMLElement>('[data-dugum]')?.dataset['dugum'] : undefined;
  if (!e.key.startsWith('Arrow')) return;
  e.preventDefault();
  const bura = yerler.get(id ?? 'kok')!, mx = bura.x + bura.w / 2, my = bura.y + bura.h / 2;
  const yon = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[e.key] as [number, number] | undefined;
  if (!yon) return;
  let eniyi: string | null = null, puan = Infinity;
  for (const [n, k] of yerler) {
    if (n === (id ?? 'kok') || n === 'kok') continue;
    const dx = k.x + k.w / 2 - mx, dy = k.y + k.h / 2 - my, ileri = dx * yon[0] + dy * yon[1], yan = Math.abs(dx * yon[1]) + Math.abs(dy * yon[0]);
    if (ileri > 20 && ileri + yan * 2.2 < puan) { puan = ileri + yan * 2.2; eniyi = n; }
  }
  if (eniyi) dugumler.get(eniyi)!.focus({ preventScroll: true });
});
addEventListener('popstate', () => {
  if (location.pathname === '/') {
    const id = decodeURIComponent(location.hash.slice(1)) || 'kok';
    const hedef = dugumler.has(id) ? (yaprakMi(id) ? (ust(id) ?? 'kok') : id) : 'kok';
    const etiketler = adrestekiEtiketler();
    if (odada) void cik(hedef, etiketler);
    else if (etiketler.length) etiketSec(etiketler);
    else dalaGit(hedef, false);
  } else if (kartBul(location.pathname)) void gir(location.pathname, false);
  else location.reload();
});

/* ---------- Kurulum ---------- */
function kur() {
  const once = acik;
  acik = genisEkran.matches;
  tuval.toggleAttribute('data-acik', acik);
  document.documentElement.toggleAttribute('data-tuval-acik', acik);
  W = tuval.clientWidth; H = tuval.clientHeight;
  for (const [id, el] of dugumler) {
    const k = yerler.get(id)!;
    Object.assign(el.style, acik ? { left: `${k.x}px`, top: `${k.y}px`, width: `${k.w}px`, height: `${k.h}px` } : { left: '', top: '', width: '', height: '' });
  }
  if (!acik) { dunya.style.transform = ''; dunya.style.opacity = ''; olcekVer(1); for (const el of dugumler.values()) { el.removeAttribute('data-kapali'); } karart(); return; }
  if (!odada && !ucus) { kam = dalGorunumu(dal); uygula(); olcekVer(kam.z); }
  if (!once) isaretle(dal);
}
const ilkKimlik = decodeURIComponent(location.hash.slice(1));
kur();
if (dugumler.has(ilkKimlik) && ilkKimlik !== 'kok') {
  buyume = 9;
  ipucu.setAttribute('data-bitti', '');
  const hedef = yaprakMi(ilkKimlik) ? (ust(ilkKimlik) ?? 'kok') : ilkKimlik;
  isaretle(hedef);
  if (acik) {
    if (yaprakMi(ilkKimlik)) { kam = kaplayan(gorselDunyasi(dugumler.get(ilkKimlik)!)); uygula(); void uc(dalGorunumu(hedef), 1200); }
    else { kam = dalGorunumu(hedef); uygula(); }
  }
} else if (acik && buyume < 9) {
  for (const c of cizgiler) dugumler.get(c.cocuk)!.setAttribute('data-kapali', '');
  kam = { ...dalGorunumu('kok') };
  const son = { ...kam };
  kam = { ...kam, z: kam.z * 1.5, y: yerler.get('kok')!.y + 260 };
  uygula();
  void uc(son, 2400);
}
const ilkEtiketler = adrestekiEtiketler();
if (ilkEtiketler.length) {
  buyume = 9;
  for (const el of dugumler.values()) el.removeAttribute('data-kapali');
  ucusuDurdur();
  if (acik) kam = dalGorunumu('kok');
  panelGoster(false);
  etiketSec(ilkEtiketler);
}
addEventListener('resize', kur);
genisEkran.addEventListener('change', kur);
// Açılış büyümesi ve dal ışığı bitene kadar tam hız.
void canliTut(new Promise((b) => setTimeout(b, buyume < 9 ? 4200 : 1500)));
const birKare = dongu(kare, () => 60, () => 12);
addEventListener('resize', () => birKare());
