import { sahneBul, type Cizici, type Palet } from './sahneler';

interface Oyuncu { tuval: HTMLCanvasElement; cizici: Cizici; palet: Palet; gorunur: boolean; kirli: boolean }
const oyuncular = new Map<HTMLCanvasElement, Oyuncu>();
const sakin = matchMedia('(prefers-reduced-motion: reduce)');
let olcek = 1;
let hizli: HTMLCanvasElement | null = null;
let bekle = false;

/** Sayfalar arasında aynı fazda kalsın diye duvar saati kullanılır. */
export const sahneZamani = () => (sakin.matches ? 2.4 : (Date.now() % 3_600_000) / 1000);
export const olcekVer = (z: number) => { olcek = z; };
export const bekletSahneleri = (b: boolean) => { bekle = b; };
export const hizliSahne = (c: HTMLCanvasElement | null) => { hizli = c; };

const karis = (renk: string, oran: number) => {
  const n = parseInt(renk.slice(1), 16), z = [20, 19, 18];
  const k = [n >> 16, (n >> 8) & 255, n & 255].map((v, i) => Math.round(v * oran + z[i]! * (1 - oran)));
  return `rgb(${k.join(',')})`;
};
export function paletAl(el: Element): Palet {
  const s = getComputedStyle(el), v = (ad: string) => s.getPropertyValue(ad).trim();
  const vurgu = v('--dal');
  return { zemin: '#0f0e0e', kemik: v('--kemik'), soluk: '#8d867c', vurgu, koyu: karis(vurgu, 0.24) };
}

const gozcu = new IntersectionObserver((g) => g.forEach((e) => {
  const o = oyuncular.get(e.target as HTMLCanvasElement);
  if (o) { o.gorunur = e.isIntersecting; o.kirli = true; }
}), { rootMargin: '80px' });

/** Sahneler hep 200 birim yüksekliğinde çizilir; yakınlaşınca gerçekten büyürler. `doluluk` sahnenin kapladığı yükseklik oranıdır. */
export const ODA_DOLULUK = 0.7;
export function sahneCiz(tuval: HTMLCanvasElement, cizici: Cizici, palet: Palet, w: number, h: number, kat: number, doluluk = 1) {
  const W = Math.round(w * kat), H = Math.round(h * kat);
  if (!W || !H) return;
  if (tuval.width !== W || tuval.height !== H) { tuval.width = W; tuval.height = H; }
  const c = tuval.getContext('2d')!;
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.clearRect(0, 0, W, H);
  // Dar ekranda sahne sıkışmasın diye en az 1,15 en-boy oranı korunur.
  const ust = Math.min(h * doluluk, w / 1.15), bosluk = (h * doluluk - ust) / 2, s = ust / 200;
  c.setTransform(kat * s, 0, 0, kat * s, 0, kat * bosluk);
  cizici(c, w / s, 200, sahneZamani(), palet);
}

export function sahneleriEkle(kok: ParentNode) {
  for (const t of kok.querySelectorAll<HTMLCanvasElement>('canvas[data-sahne]')) {
    if (oyuncular.has(t)) continue;
    oyuncular.set(t, { tuval: t, cizici: sahneBul(t.dataset['sahne'], t.dataset['kayit'] ?? ''), palet: paletAl(t), gorunur: true, kirli: true });
    gozcu.observe(t);
  }
}

let sayac = 0;
function kare() {
  sayac++;
  let sira = 0;
  for (const [t, o] of oyuncular) {
    if (!t.isConnected) { oyuncular.delete(t); gozcu.unobserve(t); continue; }
    sira++;
    const buyuk = t.classList.contains('oda-sahne');
    if (!o.gorunur || (bekle && !buyuk)) continue;
    if (sakin.matches ? !o.kirli : !(buyuk || t === hizli || (sayac + sira) % 3 === 0 || o.kirli)) continue;
    const d = Math.min(devicePixelRatio, 2);
    const kat = buyuk ? Math.min(d, 1.5) : Math.min(2.5, Math.max(0.5, Math.ceil(d * olcek * 2) / 2));
    sahneCiz(t, o.cizici, o.palet, t.clientWidth, t.clientHeight, kat, buyuk ? ODA_DOLULUK : 1);
    o.kirli = false;
  }
  requestAnimationFrame(kare);
}
addEventListener('resize', () => oyuncular.forEach((o) => { o.kirli = true; }));
sahneleriEkle(document);
requestAnimationFrame(kare);
