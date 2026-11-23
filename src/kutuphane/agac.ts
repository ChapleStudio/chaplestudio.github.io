import { acikBolumler, site } from '../site';
import { bolumKayitlari, type Kayit, type Renk } from './kayit';

/** Ağacın bir düğümü. Kök → (bölüm) → kategori → (alt dal) → kayıt. Tek bölüm açıkken bölüm katı atlanır. */
export interface Dugum {
  id: string;
  tur: 'kok' | 'bolum' | 'dal' | 'kayit';
  ad: string;
  renk: Renk;
  ikon: string;
  kayit?: Kayit;
  cocuklar: Dugum[];
}

export interface Yer { x: number; y: number; w: number; h: number }
/** Ağaç çizgisi: `cocuk` düğümüne giden eğri, dünya koordinatında SVG yolu. */
export interface Cizgi { cocuk: string; yol: string; renk: Renk }
export interface Yerlesim { yerler: Map<string, Yer>; cizgiler: Cizgi[] }

export const OLCU = {
  kok: { w: 1180, h: 300 },
  dal: { w: 372, h: 88 },
  kart: { w: 272, h: 250 },
  genis: { w: 520, h: 350 },
  oluk: 72,
  satir: 44,
  kat: 120,
  aralik: 84,
  /** Dal yana değil aşağı büyür: sayfa dikey kayar. */
  govde: Infinity,
  /** Bu kadar kayda kadar tek sütun, fazlası iki sütun. */
  tekSutun: 3,
} as const;

export async function agacKur(): Promise<Dugum> {
  const bolumler: Dugum[] = [];
  for (const bolum of acikBolumler) {
    const dallar = new Map<string, Dugum & { sira: number }>();
    for (const k of await bolumKayitlari(bolum)) {
      const dalId = `${bolum.id}-${k.dal.id}`;
      let dal = dallar.get(dalId);
      if (!dal) dallar.set(dalId, (dal = { id: dalId, tur: 'dal', ad: k.dal.ad, renk: k.dal.renk, ikon: k.dal.ikon, sira: k.dal.sira, cocuklar: [] }));
      let hedef: Dugum = dal;
      if (k.altDal) {
        const altId = `${dalId}-${k.altDal.id}`;
        let alt = dal.cocuklar.find((c) => c.id === altId) as (Dugum & { sira: number }) | undefined;
        if (!alt) dal.cocuklar.push((alt = { id: altId, tur: 'dal', ad: k.altDal.ad, renk: k.dal.renk, ikon: 'alt', sira: k.altDal.sira, cocuklar: [] } as Dugum & { sira: number }));
        hedef = alt;
      }
      hedef.cocuklar.push({ id: `${bolum.id}/${k.id}`, tur: 'kayit', ad: k.baslik, renk: k.dal.renk, ikon: k.dal.ikon, kayit: k, cocuklar: [] });
    }
    const cocuklar = [...dallar.values()].sort((a, b) => a.sira - b.sira);
    const diz = (d: Dugum) => {
      d.cocuklar.sort((a, b) => (a.kayit && b.kayit ? Number(b.kayit.genis) - Number(a.kayit.genis) : ((a as { sira?: number }).sira ?? 0) - ((b as { sira?: number }).sira ?? 0)));
      d.cocuklar.forEach(diz);
    };
    cocuklar.forEach(diz);
    if (cocuklar.length) bolumler.push({ id: bolum.id, tur: 'bolum', ad: bolum.ad, renk: 'kemik', ikon: 'bolum', cocuklar });
  }
  return { id: 'kok', tur: 'kok', ad: site.ad, renk: 'kemik', ikon: '', cocuklar: bolumler.length === 1 ? bolumler[0]!.cocuklar : bolumler };
}

interface Blok { w: number; h: number; koy: (x: number, y: number) => { tepe: { x: number; y: number } } }

/** Ağacı yukarıdan aşağı yerleştirir. Saf fonksiyon: aynı ağaç her zaman aynı yerleşimi verir. */
export function yerlestir(kok: Dugum): Yerlesim {
  const yerler = new Map<string, Yer>();
  const cizgiler: Cizgi[] = [];
  const yuvarla = (n: number) => Math.round(n * 10) / 10;
  const inis = (x1: number, y1: number, x2: number, y2: number) => {
    const m = (y1 + y2) / 2;
    return `M${yuvarla(x1)} ${yuvarla(y1)}C${yuvarla(x1)} ${yuvarla(m)} ${yuvarla(x2)} ${yuvarla(m)} ${yuvarla(x2)} ${yuvarla(y2)}`;
  };

  /** Tek gövdeye asılı kayıtlar: gövde ortada iner, kartlar iki yana açılır. */
  const govde = (kayitlar: Dugum[], cikis: () => { x: number; y: number }): Blok => {
    const ikili = kayitlar.length > OLCU.tekSutun, genisVar = kayitlar.some((k) => k.kayit!.genis);
    const w = ikili ? OLCU.kart.w * 2 + OLCU.oluk : genisVar ? OLCU.genis.w : OLCU.kart.w;
    const yerlesik: { d: Dugum; x: number; y: number; w: number; h: number; yan: -1 | 0 | 1 }[] = [];
    let y = 0, sol = true;
    kayitlar.forEach((d, i) => {
      if (d.kayit!.genis) {
        yerlesik.push({ d, x: 0, y, w, h: OLCU.genis.h, yan: 0 });
        y += OLCU.genis.h + OLCU.satir;
        sol = true;
        return;
      }
      const tekSon = !ikili || sol && (i === kayitlar.length - 1 || kayitlar[i + 1]!.kayit!.genis);
      const x = tekSon ? (w - OLCU.kart.w) / 2 : sol ? 0 : OLCU.kart.w + OLCU.oluk;
      yerlesik.push({ d, x, y, ...OLCU.kart, yan: tekSon ? 0 : sol ? -1 : 1 });
      if (!sol || tekSon) { y += OLCU.kart.h + OLCU.satir; sol = true; } else sol = false;
    });
    const h = Math.max(...yerlesik.map((k) => k.y + k.h));
    return {
      w, h,
      koy: (ox, oy) => {
        const orta = ox + w / 2;
        for (const k of yerlesik) {
          yerler.set(k.d.id, { x: ox + k.x, y: oy + k.y, w: k.w, h: k.h });
          const c = cikis();
          const bas = Math.abs(c.x - orta) < 1 ? `M${yuvarla(orta)} ${yuvarla(c.y)}L${yuvarla(orta)} ${yuvarla(oy - 20)}` : `${inis(c.x, c.y, orta, oy - 20)}`;
          if (k.yan === 0) cizgiler.push({ cocuk: k.d.id, renk: k.d.renk, yol: `${bas}L${yuvarla(orta)} ${yuvarla(oy + k.y)}` });
          else {
            const kenar = k.yan < 0 ? ox + k.x + k.w : ox + k.x, ky = oy + k.y + k.h * 0.36, r = 26;
            cizgiler.push({ cocuk: k.d.id, renk: k.d.renk, yol: `${bas}L${yuvarla(orta)} ${yuvarla(ky - r)}Q${yuvarla(orta)} ${yuvarla(ky)} ${yuvarla(orta + k.yan * Math.min(r, OLCU.oluk / 2 - 4))} ${yuvarla(ky)}L${yuvarla(kenar)} ${yuvarla(ky)}` });
          }
        }
        return { tepe: { x: orta, y: oy } };
      },
    };
  };

  const blok = (d: Dugum): Blok => {
    const o = d.tur === 'kok' ? OLCU.kok : OLCU.dal;
    let merkez = { x: 0, y: 0 };
    const yaprak = d.cocuklar.every((c) => c.tur === 'kayit');
    const alt: Blok[] = [];
    if (yaprak) for (let i = 0; i < d.cocuklar.length; i += OLCU.govde) alt.push(govde(d.cocuklar.slice(i, i + OLCU.govde), () => ({ x: merkez.x, y: merkez.y + o.h })));
    else for (const c of d.cocuklar) alt.push(blok(c));
    const altW = alt.reduce((t, b) => t + b.w, 0) + OLCU.aralik * Math.max(alt.length - 1, 0);
    const w = Math.max(o.w, altW), kat = OLCU.kat + (d.tur === 'kok' ? 40 : 0);
    return {
      w, h: o.h + (alt.length ? kat + Math.max(...alt.map((b) => b.h)) : 0),
      koy: (ox, oy) => {
        merkez = { x: ox + w / 2, y: oy };
        yerler.set(d.id, { x: merkez.x - o.w / 2, y: oy, ...o });
        let x = ox + (w - altW) / 2;
        alt.forEach((b, i) => {
          const { tepe } = b.koy(x, oy + o.h + kat);
          const c = d.cocuklar[i];
          if (!yaprak && c) cizgiler.push({ cocuk: c.id, renk: c.renk, yol: inis(merkez.x, oy + o.h, tepe.x, tepe.y) });
          x += b.w + OLCU.aralik;
        });
        return { tepe: { x: merkez.x, y: oy } };
      },
    };
  };
  const kokBlok = blok(kok);
  kokBlok.koy(-kokBlok.w / 2, 0);
  return { yerler, cizgiler };
}
