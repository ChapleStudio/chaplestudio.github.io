import { getCollection, type CollectionEntry, type CollectionKey } from 'astro:content';
import { acikBolumler, type Bolum } from '../site';
import type { IsVerisi, TurKimligi, YaziVerisi } from '../turler/semalar';
import { etiketleriDiz, type Etiket } from '../etiketler';
import { kategoriler, kategoriKimlikleri } from '../turler/is/kategoriler';

export type Girdi = CollectionEntry<CollectionKey>;

interface VeriTipleri {
  is: IsVerisi;
  yazi: YaziVerisi;
}

interface TureOzel {
  /** Kaydın bağlı olduğu küme: işte kategori, yazıda yıl. */
  kume: { id: string; ad: string; sira: number };
  etiketler: Etiket[];
  /** Sıralama tarihi: en yeni üstte. */
  tarih: Date;
  turAdi: string;
  /** Elle verilen sıra; yoksa en sonda. */
  sira: number;
}

interface OrtakKayit extends TureOzel {
  bolum: Bolum;
  id: string;
  yol: string;
  baslik: string;
  ozet: string;
  eskiAdresler: string[];
  kendiSitesi: boolean;
  girdi: Girdi;
}

/** Ana sayfa, liste, akış ve site haritasının bildiği tek biçim. `tur` alanı `veri`nin tipini belirler. */
export type Kayit = { [T in TurKimligi]: OrtakKayit & { tur: T; veri: VeriTipleri[T] } }[TurKimligi];
export type IsKaydi = Extract<Kayit, { tur: 'is' }>;
export type YaziKaydi = Extract<Kayit, { tur: 'yazi' }>;

export const isMi = (k: Kayit): k is IsKaydi => k.tur === 'is';
export const yaziMi = (k: Kayit): k is YaziKaydi => k.tur === 'yazi';

const gunAyYil = new Intl.DateTimeFormat('tr', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const ayYil = new Intl.DateTimeFormat('tr', { month: 'long', year: 'numeric', timeZone: 'UTC' });
export const ayYilYaz = (t: Date) => ayYil.format(t);
export const tarihYaz = (t: Date) => gunAyYil.format(t);
export const isoGun = (t: Date) => t.toISOString().slice(0, 10);

/** Her içerik türü kendini nasıl kümeleyip sıralayacağını burada söyler. */
const tureOzel: { [T in TurKimligi]: (v: VeriTipleri[T]) => TureOzel } = {
  is: (v) => ({
    kume: { id: v.kategori, ad: kategoriler[v.kategori].ad, sira: kategoriKimlikleri.indexOf(v.kategori) },
    etiketler: etiketleriDiz(v.etiketler),
    tarih: v.guncelleme,
    turAdi: kategoriler[v.kategori].tekil,
    sira: v.sira ?? Number.POSITIVE_INFINITY,
  }),
  yazi: (v) => {
    const yil = v.tarih.getUTCFullYear();
    return { kume: { id: String(yil), ad: String(yil), sira: -yil }, etiketler: etiketleriDiz(v.etiketler), tarih: v.tarih, turAdi: 'Yazı', sira: Number.POSITIVE_INFINITY };
  },
};

function kaydaCevir<T extends TurKimligi>(bolum: Bolum, tur: T, girdi: Girdi): OrtakKayit & { tur: T; veri: VeriTipleri[T] } {
  // Tek tip sınırı: içerik, content.config.ts içinde aynı türün şemasıyla doğrulanmış olarak gelir.
  const veri = girdi.data as VeriTipleri[T];
  const { baslik, ozet, eskiAdresler, kendiSitesi } = veri;
  return { tur, veri, bolum, girdi, id: girdi.id, yol: kendiSitesi ?? `/${bolum.id}/${girdi.id}/`, kendiSitesi: kendiSitesi !== undefined, baslik, ozet, eskiAdresler, ...tureOzel[tur](veri) };
}

const yenidenEskiye = (a: Kayit, b: Kayit) => b.tarih.getTime() - a.tarih.getTime() || a.baslik.localeCompare(b.baslik, 'tr');
const kumeSirasi = (a: Kayit, b: Kayit) => a.kume.sira - b.kume.sira || (a.sira === b.sira ? 0 : a.sira - b.sira) || yenidenEskiye(a, b);

/** Küme sırasıyla: önce kategori, sonra elle verilen sıra, sonra yeniden eskiye. */
export async function bolumKayitlari(bolum: Bolum): Promise<Kayit[]> {
  const girdiler: Girdi[] = await getCollection(bolum.id as CollectionKey);
  return girdiler
    .map((g) => kaydaCevir(bolum, bolum.tur, g) as Kayit)
    .filter((k) => import.meta.env.DEV || !k.veri.taslak)
    .sort(kumeSirasi);
}

/** Bütün bölümler, yeniden eskiye (RSS ve yönlendirmeler için). */
export async function tumKayitlar(): Promise<Kayit[]> {
  return (await Promise.all(acikBolumler.map(bolumKayitlari))).flat().sort(yenidenEskiye);
}

/** Açık bölümlerdeki bütün işler, küme sırasıyla. */
export async function tumIsler(): Promise<IsKaydi[]> {
  return (await Promise.all(acikBolumler.filter((b) => b.tur === 'is').map(bolumKayitlari))).flat().filter(isMi);
}

export interface Kume<K extends Kayit> { id: string; ad: string; kayitlar: K[] }
export function kumele<K extends Kayit>(kayitlar: readonly K[]): Kume<K>[] {
  const kumeler = new Map<string, Kume<K>>();
  for (const k of kayitlar) {
    const c = kumeler.get(k.kume.id) ?? { id: k.kume.id, ad: k.kume.ad, kayitlar: [] };
    c.kayitlar.push(k);
    kumeler.set(k.kume.id, c);
  }
  return [...kumeler.values()];
}
