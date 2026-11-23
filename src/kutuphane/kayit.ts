import { getCollection, type CollectionEntry, type CollectionKey } from 'astro:content';
import { acikBolumler, type Bolum } from '../site';
import type { IsVerisi, TurKimligi, YaziVerisi } from '../turler/semalar';
import { etiketleriDiz, gruptakiler, type Etiket } from '../etiketler';
import type { Tema } from '../temalar/tema';
import { altAdi, kategoriler, kategoriKimlikleri } from '../turler/is/kategoriler';

export type Girdi = CollectionEntry<CollectionKey>;
export type Renk = (typeof kategoriler)[keyof typeof kategoriler]['renk'] | 'kemik';

interface VeriTipleri {
  is: IsVerisi;
  yazi: YaziVerisi;
}

/** Bir kaydın asılı olduğu dal. `sira` dalların soldan sağa yerini belirler. */
export interface Dal {
  id: string;
  ad: string;
  renk: Renk;
  ikon: string;
  sira: number;
}

interface DugumBilgisi {
  dal: Dal;
  /** Dalın altındaki alt dal, varsa. */
  altDal: { id: string; ad: string; sira: number } | undefined;
  etiketler: Etiket[];
  /** Sıralama tarihi: en yeni üstte. */
  tarih: Date;
  turAdi: string;
  /** Düğümde görünen en çok üç etiket. */
  vitrin: Etiket[];
  genis: boolean;
  suruyor: boolean;
  sahne: string | undefined;
}

interface OrtakKayit extends DugumBilgisi {
  bolum: Bolum;
  id: string;
  yol: string;
  baslik: string;
  ozet: string;
  eskiAdresler: string[];
  tema: Tema;
  kendiSitesi: boolean;
  girdi: Girdi;
}

/** Ağaç, liste, akış ve site haritasının bildiği tek biçim. `tur` alanı `veri`nin tipini belirler. */
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

/** Her içerik türü kendini ağaca nasıl asacağını burada söyler. */
const dugumBilgisi: { [T in TurKimligi]: (v: VeriTipleri[T]) => DugumBilgisi } = {
  is: (v) => {
    const c = kategoriler[v.kategori], etiketler = etiketleriDiz(v.etiketler), ad = altAdi(v.kategori, v.alt);
    return {
      dal: { id: v.kategori, ad: c.ad, renk: c.renk, ikon: c.ikon, sira: kategoriKimlikleri.indexOf(v.kategori) },
      altDal: v.alt !== undefined && ad !== undefined ? { id: v.alt, ad, sira: Object.keys(c.altlar).indexOf(v.alt) } : undefined,
      etiketler,
      tarih: v.guncelleme,
      turAdi: c.tekil,
      vitrin: [...gruptakiler(etiketler, 'tur').slice(0, 1), ...gruptakiler(etiketler, 'ozellik').filter((e) => e.id !== '2b').slice(0, 1), ...[...gruptakiler(etiketler, 'arac'), ...gruptakiler(etiketler, 'dil')].slice(0, 1)],
      genis: v.kapsam === 4,
      suruyor: v.suruyor,
      sahne: v.sahne,
    };
  },
  yazi: (v) => {
    const yil = v.tarih.getUTCFullYear();
    return { dal: { id: String(yil), ad: String(yil), renk: 'kemik', ikon: 'yazi', sira: -yil }, altDal: undefined, etiketler: etiketleriDiz(v.etiketler), tarih: v.tarih, turAdi: 'Yazı', vitrin: etiketleriDiz(v.etiketler).slice(0, 3), genis: false, suruyor: false, sahne: v.sahne ?? 'defter' };
  },
};

function kaydaCevir<T extends TurKimligi>(bolum: Bolum, tur: T, girdi: Girdi): OrtakKayit & { tur: T; veri: VeriTipleri[T] } {
  // Tek tip sınırı: içerik, content.config.ts içinde aynı türün şemasıyla doğrulanmış olarak gelir.
  const veri = girdi.data as VeriTipleri[T];
  const { baslik, ozet, eskiAdresler, tema, kendiSitesi } = veri;
  return { tur, veri, bolum, girdi, id: girdi.id, yol: kendiSitesi ?? `/${bolum.id}/${girdi.id}/`, kendiSitesi: kendiSitesi !== undefined, tema, baslik, ozet, eskiAdresler, ...dugumBilgisi[tur](veri) };
}

const yenidenEskiye = (a: Kayit, b: Kayit) => b.tarih.getTime() - a.tarih.getTime() || a.baslik.localeCompare(b.baslik, 'tr');

export async function bolumKayitlari(bolum: Bolum): Promise<Kayit[]> {
  const girdiler: Girdi[] = await getCollection(bolum.id as CollectionKey);
  return girdiler
    .map((g) => kaydaCevir(bolum, bolum.tur, g) as Kayit)
    .filter((k) => import.meta.env.DEV || !k.veri.taslak)
    .sort(yenidenEskiye);
}

export async function tumKayitlar(): Promise<Kayit[]> {
  return (await Promise.all(acikBolumler.map(bolumKayitlari))).flat().sort(yenidenEskiye);
}
