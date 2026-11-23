import { canliTut, dongu } from './tempo';
import { ucusYolu, yumusak, type Kamera, type Kutu } from './kamera';
import { bekletSahneleri, hizliSahne, ODA_DOLULUK, olcekVer, paletAl, sahneCiz, sahneleriEkle } from './sahnelik';
import { sahneBul } from './sahneler';
import { zeminKur, type Dalga, type HamCizgi } from './zemin';

interface AgacVerisi { cizgiler: HamCizgi[]; ebeveyn: Record<string, string>; etiketleri: Record<string, string[]> }

const $ = <T extends Element>(s: string, k: ParentNode = document) => k.querySelector<T>(s)!;
const tuval = $<HTMLElement>('[data-tuval]'), zemin = $<HTMLCanvasElement>('.zemin', tuval), dunya = $<HTMLElement>('.dunya', tuval);
const kap = $<HTMLElement>('[data-oda-kabi]'), ipucu = $<HTMLElement>('.ipucu'), ustKapsul = $<HTMLElement>('.ust-kapsul');
const { cizgiler: ham, ebeveyn, etiketleri } = JSON.parse($('#agac').textContent!) as AgacVerisi;
const genisEkran = matchMedia('(min-width: 68rem) and (min-height: 30rem)');
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
const derinlik = (id: string) => soy(id).length - 1;
const yaprakMi = (id: string) => dugumler.get(id)?.hasAttribute('data-kart') ?? false;

/* ---------- Durum ---------- */
let acik = false, W = 0, H = 0;
let kam: Kamera = { x: 0, y: 0, z: 0.5 };
let secili: Set<string> = new Set(), kalici: Set<string> = new Set();
let dal = 'kok', vurgulu: Set<string> = new Set(), odada: string | null = null, mesgul = false;
let buyume = sakin.matches ? 9 : -1, buyumeBasi = 0;
/** Bir dal seçilince ışık dalgası tepeden uçlara iner. */
let dalga: Dalga | null = null;
/** Geçerli görünümde dikey kaymanın sınırları ve yumuşak kaymanın hedefi. */
let kayma = { en: 0, son: 0 }, hedefY: number | null = null;
let ucus: { iptal: () => void } | null = null;

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
/** Görünüm: genişliğe sığar; boya sığmazsa tepeden başlar ve dikey kayar. */
function gorunumKur(k: Kutu, sol: number, enBuyuk: number, okunur: number): Kamera {
  const tepe = 108, dip = 60, en = W - sol - 60;
  const zEn = Math.min(en / k.w, enBuyuk), zHepsi = Math.min(zEn, (H - tepe - dip) / k.h);
  const z = zHepsi >= Math.min(okunur, zEn * 0.8) ? zHepsi : Math.min(zEn, Math.max(okunur, zHepsi));
  const x = k.x + k.w / 2 - (sol - 60) / 2 / z, sigar = k.h * z <= H - tepe - dip + 1;
  const y0 = sigar ? k.y + k.h / 2 - (tepe - dip) / 2 / z : k.y + (H / 2 - tepe) / z;
  kayma = { en: y0, son: sigar ? y0 : Math.max(y0, k.y + k.h - (H / 2 - dip) / z) };
  hedefY = null;
  return { x, y: y0, z };
}
const dalGorunumu = (id: string): Kamera => gorunumKur(kutuHesapla(altlar(id)), 60, id === 'kok' ? 0.8 : 0.95, id === 'kok' ? 0.5 : 0.7);

const ucusuDurdur = () => { ucus?.iptal(); ucus = null; };
function uc(hedef: Kamera, sure?: number, her?: (p: number) => void): Promise<void> {
  ucus?.iptal();
  hedefY = null;
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
  // Telefon: yalnız seçili dal açık durur; süzerken eşleşen bütün dallar açılır.
  const zincir = new Set([...soy(dal), ...(dal === 'kok' ? [] : altlar(dal))]);
  for (const a of tuval.querySelectorAll<HTMLElement>('[data-dal][data-dugum]')) {
    const n = a.dataset['dugum']!, derin = derinlik(n);
    const ac = acik || (secili.size ? parlak.has(n) : zincir.has(n) || (derin > 1 && soy(n).some((u) => u !== 'kok' && u !== n && zincir.has(u))));
    a.closest('li')!.toggleAttribute('data-kapali-dal', !ac);
    if (acik) a.removeAttribute('aria-expanded');
    else a.setAttribute('aria-expanded', String(ac));
  }
}
function isaretle(id: string) {
  dal = id;
  karart();
  const zincir = new Set(soy(id));
  for (const a of ustKapsul.querySelectorAll<HTMLElement>('[data-dugum-git]')) {
    const g = a.dataset['dugumGit']!;
    const secili = g === 'kok' ? id === 'kok' : zincir.has(g);
    if (secili) {
      a.setAttribute('aria-current', 'true');
      const k = a.parentElement!;
      k.scrollTo({ left: a.offsetLeft - (k.clientWidth - a.offsetWidth) / 2, behavior: 'smooth' });
    } else a.removeAttribute('aria-current');
  }
}
function dalaGit(id: string, gecmis: boolean) {
  // Telefonda açık dala bir daha dokunmak onu kapatır.
  if (!acik && gecmis && id === dal && id !== 'kok') id = ust(id) ?? 'kok';
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
  return gorunumKur(kutuHesapla([...new Set(uyan.flatMap(soy))].filter((n) => n !== 'kok')), panel.hidden ? 60 : panel.offsetWidth + 50, 0.9, 0.5);
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

/** Odanın tema stilini yükler; bitmeden içerik gösterilmez. */
async function temaYukle(sayfa: Document) {
  await Promise.all([...sayfa.querySelectorAll<HTMLLinkElement>('link[data-tema-stili]')].map((l) => {
    const adres = new URL(l.getAttribute('href')!, location.origin).href;
    if ([...document.querySelectorAll<HTMLLinkElement>('link[data-tema-stili]')].some((x) => x.href === adres)) return undefined;
    const yeni = document.createElement('link');
    yeni.rel = 'stylesheet';
    yeni.href = adres;
    yeni.setAttribute('data-tema-stili', '');
    return new Promise<void>((b) => { yeni.onload = yeni.onerror = () => b(); document.head.append(yeni); });
  }));
  return sayfa;
}
function odayiDoldur(sayfa: Document) {
  const ic = sayfa.querySelector('#icerik');
  if (!ic) throw new Error('içerik yok');
  kap.replaceChildren(...[...ic.children].map((c) => document.importNode(c, true)));
  kap.hidden = false;
  kap.scrollTop = 0;
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
  const kendi = kart.hasAttribute('data-kendi');
  const bekleyen = kendi ? null : getir(yol).then(temaYukle);
  if (gecmis && bekleyen) history.pushState({ oda: yol }, '', yol);
  try {
    if (!bekleyen && sakin.matches) { location.assign(yol); return; }
    if (odada) { odayiDoldur(await bekleyen!); odada = yol; return; }
    if (sakin.matches) { odayiDoldur(await bekleyen!); odada = yol; return; }
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
    // Kendi sitesi olan proje: geçit ekranı kaplayınca o site açılır.
    if (!bekleyen) { history.replaceState(null, '', `/#${kart.dataset['dugum']}`); location.assign(yol); return; }
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

/* ---------- Zemin: toprak ve kökler ---------- */
const renkCoz = (ad: string) => getComputedStyle(document.documentElement).getPropertyValue(`--${ad}`).trim();
const toprakAlti = zeminKur(zemin, ham, renkCoz, derinlik, yaprakMi, yerler);
function vurgula(id: string | null) { vurgulu = new Set(id ? soy(id) : []); }
function zeminCiz(an: number) {
  if (dalga && an - dalga.bas > 2600) dalga = null;
  toprakAlti.ciz(an, {
    kam, W, H, buyume, dalga, sakin: sakin.matches,
    parlak: kalici.size ? kalici : dal === 'kok' ? null : new Set([...altlar(dal), ...soy(dal)]),
    boyali: new Set([...vurgulu, ...kalici]),
  });
}
function kare(an: number) {
  if (acik && kap.hidden) {
    if (buyume < 9) {
      if (!buyumeBasi) buyumeBasi = an;
      buyume = (an - buyumeBasi) / 1000 - 0.15;
      for (const c of toprakAlti.cocuklar) if (toprakAlti.buyumeBitti(c, buyume)) dugumler.get(c)?.removeAttribute('data-kapali');
      if (buyume > 3.2) buyume = 9;
    }
    if (!ucus && hedefY !== null) {
      const fark = hedefY - kam.y;
      kam = { ...kam, y: Math.abs(fark) * kam.z < 0.4 ? hedefY : kam.y + fark * 0.2 };
      if (kam.y === hedefY) hedefY = null;
      uygula();
    }
    zeminCiz(an);
  }
}

/* ---------- Girdi ---------- */
/** Dikey kaydırma. Yakınlaştırma yoktur; tarayıcının kendi yakınlaştırmasına (Ctrl) karışılmaz. */
function kaydir(piksel: number, aninda = false) {
  if (ucus || kayma.son <= kayma.en) return;
  const y = Math.min(kayma.son, Math.max(kayma.en, (hedefY ?? kam.y) + piksel / kam.z));
  ipucu.setAttribute('data-bitti', '');
  if (aninda || sakin.matches) { kam = { ...kam, y }; hedefY = null; uygula(); }
  else hedefY = y;
}
let parmak: { y: number; toplam: number; hiz: number } | null = null, surukledi = false;
tuval.addEventListener('pointerdown', (e) => {
  surukledi = false;
  if (acik && e.pointerType !== 'mouse') parmak = { y: e.clientY, toplam: 0, hiz: 0 };
});
addEventListener('pointermove', (e) => {
  if (!acik || !parmak) return;
  const dy = parmak.y - e.clientY;
  parmak = { y: e.clientY, toplam: parmak.toplam + Math.abs(dy), hiz: dy };
  if (parmak.toplam > 6) { surukledi = true; kaydir(dy, true); }
});
const birak = () => { if (parmak && surukledi) kaydir(parmak.hiz * 9); parmak = null; };
addEventListener('pointerup', birak);
addEventListener('pointercancel', birak);
tuval.addEventListener('dragstart', (e) => e.preventDefault());
tuval.addEventListener('wheel', (e) => {
  if (!acik || e.ctrlKey) return;
  e.preventDefault();
  kaydir(e.deltaY * (e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? H : 1));
}, { passive: false });

tuval.addEventListener('pointerover', (e) => {
  const d = e.target instanceof Element ? e.target.closest<HTMLElement>('[data-dugum]') : null;
  if (mesgul) return;
  vurgula(d && d.dataset['dugum'] !== 'kok' ? d.dataset['dugum']! : null);
  hizliSahne(d?.querySelector('canvas') ?? null);
  if (d instanceof HTMLAnchorElement && d.hasAttribute('data-kart') && !d.hasAttribute('data-kendi')) void getir(d.pathname).catch(() => undefined);
});
tuval.addEventListener('focusin', (e) => {
  const d = e.target instanceof Element ? e.target.closest<HTMLElement>('[data-dugum]') : null;
  if (!d || !acik || mesgul || !d.matches(':focus-visible')) return;
  tuval.scrollTo(0, 0);
  const id = d.dataset['dugum']!;
  vurgula(id);
  if (d.hasAttribute('data-sonuk') && !secili.size) { isaretle(yaprakMi(id) ? (ust(id) ?? 'kok') : id); void uc(dalGorunumu(dal)); return; }
  const s = ekranda(yerler.get(id)!);
  if (s.y < 100) kaydir(s.y - 120);
  else if (s.y + s.h > H - 60) kaydir(s.y + s.h - H + 80);
});

const sadeTik = (e: MouseEvent) => e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey;
document.addEventListener('click', (e) => {
  if (!(e.target instanceof Element)) return;
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
  const sayfa = { PageDown: H * 0.8, PageUp: -H * 0.8, Home: -1e6, End: 1e6 }[e.key];
  if (sayfa) { e.preventDefault(); kaydir(sayfa); return; }
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
  tuval.setAttribute('data-hazir', '');
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
tuval.setAttribute('data-kuruluyor', '');
kur();
requestAnimationFrame(() => requestAnimationFrame(() => tuval.removeAttribute('data-kuruluyor')));
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
  for (const c of toprakAlti.cocuklar) dugumler.get(c)!.setAttribute('data-kapali', '');
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
