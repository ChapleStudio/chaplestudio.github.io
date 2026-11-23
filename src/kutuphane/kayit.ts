import { getCollection, type CollectionEntry, type CollectionKey } from 'astro:content';
import { acikBolumler, type Bolum } from '../site';
import type { IsVerisi, TurKimligi, YaziVerisi } from '../turler/semalar';
import { cesitler } from '../turler/is/cesitler';

export type Girdi = CollectionEntry<CollectionKey>;
export type Renk = (typeof cesitler)[keyof typeof cesitler]['renk'] | 'kagit';

interface VeriTipleri {
  is: IsVerisi;
  yazi: YaziVerisi;
}

interface RafBilgisi {
  sirtAdi: string;
  /** Sıralama tarihi: en yeni başta. */
  tarih: Date;
  renk: Renk;
  ikon: string;
  turAdi: string;
  kapsam: 1 | 2 | 3 | 4;
}

interface OrtakKayit extends RafBilgisi {
  bolum: Bolum;
  id: string;
  yol: string;
  baslik: string;
  ozet: string;
  eskiAdresler: string[];
  girdi: Girdi;
}

/** Raf, liste, akış ve site haritasının bildiği tek biçim. `tur` alanı `veri`nin tipini belirler. */
export type Kayit = { [T in TurKimligi]: OrtakKayit & { tur: T; veri: VeriTipleri[T] } }[TurKimligi];
export type IsKaydi = Extract<Kayit, { tur: 'is' }>;
export type YaziKaydi = Extract<Kayit, { tur: 'yazi' }>;

export const isMi = (k: Kayit): k is IsKaydi => k.tur === 'is';
export const yaziMi = (k: Kayit): k is YaziKaydi => k.tur === 'yazi';

/** Her içerik türü kendini rafa nasıl koyacağını burada söyler. */
const rafBilgisi: { [T in TurKimligi]: (v: VeriTipleri[T]) => RafBilgisi } = {
  is: (v) => {
    const c = cesitler[v.cesit];
    return { sirtAdi: v.sirtAdi ?? v.baslik, tarih: v.guncelleme, renk: c.renk, ikon: c.ikon, turAdi: c.ad, kapsam: v.kapsam as RafBilgisi['kapsam'] };
  },
  yazi: (v) => ({ sirtAdi: v.baslik, tarih: v.tarih, renk: 'kagit', ikon: 'yazi', turAdi: 'Yazı', kapsam: 1 }),
};

function kaydaCevir<T extends TurKimligi>(bolum: Bolum, tur: T, girdi: Girdi): OrtakKayit & { tur: T; veri: VeriTipleri[T] } {
  // Tek tip sınırı: içerik, content.config.ts içinde aynı türün şemasıyla doğrulanmış olarak gelir.
  const veri = girdi.data as VeriTipleri[T];
  const { baslik, ozet, eskiAdresler } = veri;
  return { tur, veri, bolum, girdi, id: girdi.id, yol: `/${bolum.id}/${girdi.id}/`, baslik, ozet, eskiAdresler, ...rafBilgisi[tur](veri) };
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

const ayYil = new Intl.DateTimeFormat('tr', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const gunAyYil = new Intl.DateTimeFormat('tr', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
export const ayYilYaz = (t: Date) => ayYil.format(t);
export const tarihYaz = (t: Date) => gunAyYil.format(t);
export const isoGun = (t: Date) => t.toISOString().slice(0, 10);
