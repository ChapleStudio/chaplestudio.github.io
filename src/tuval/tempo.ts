/**
 * Sitenin enerji kuralı. Bütün çizim döngüleri buradan zamanlanır.
 * canlı: etkileşim ya da uçuş var. sakin: kimse dokunmuyor. uyku: pencere arkada, gizli ya da uzun süredir boş; hiç çizilmez.
 */
export type Tempo = 'canli' | 'sakin' | 'uyku';
const CANLI_MS = 1200, UYKU_MS = 25_000;
let sonDokunus = performance.now(), zorunlu = 0;
const uyananlar = new Set<() => void>();

export function tempo(): Tempo {
  if (document.hidden) return 'uyku';
  if (zorunlu > 0) return 'canli';
  if (!document.hasFocus()) return 'uyku';
  const g = performance.now() - sonDokunus;
  return g < CANLI_MS ? 'canli' : g < UYKU_MS ? 'sakin' : 'uyku';
}
const uyandir = () => { for (const u of [...uyananlar]) u(); };
export function dokun() {
  const once = tempo();
  sonDokunus = performance.now();
  if (once !== 'canli') uyandir();
}
/** Kamera uçuşu gibi bitene kadar tam hız isteyen işler. */
export function canliTut<T>(is: Promise<T>): Promise<T> {
  zorunlu++;
  uyandir();
  return is.finally(() => { zorunlu--; sonDokunus = performance.now(); });
}
for (const o of ['pointermove', 'pointerdown', 'wheel', 'keydown', 'scroll', 'focus', 'resize']) addEventListener(o, dokun, { passive: true, capture: true });
document.addEventListener('visibilitychange', dokun);

/** `ciz` fonksiyonunu tempoya göre çağırır; yüksek yenilemeli ekranda da `canliFps` aşılmaz. Dönen fonksiyon, uykuda bile tek kare çizdirir. */
export function dongu(ciz: (an: number) => void, canliFps: () => number, sakinFps: () => number): () => void {
  let zorla = true, son = 0, zaman: ReturnType<typeof setTimeout> | undefined, bekleyen = 0;
  const kare = (an: number) => {
    bekleyen = 0;
    const t = tempo();
    if (zorla && t === 'uyku') ciz(an);
    zorla = false;
    if (t === 'uyku') return;
    const aralik = 1000 / (t === 'canli' ? canliFps() : sakinFps());
    if (an - son >= aralik - 2) { son = an; ciz(an); }
    if (t === 'canli') bekleyen = requestAnimationFrame(kare);
    else zaman = setTimeout(() => { bekleyen = requestAnimationFrame(kare); }, aralik);
  };
  const basla = () => {
    if (bekleyen) return;
    clearTimeout(zaman);
    bekleyen = requestAnimationFrame(kare);
  };
  uyananlar.add(basla);
  basla();
  return () => { zorla = true; basla(); };
}
