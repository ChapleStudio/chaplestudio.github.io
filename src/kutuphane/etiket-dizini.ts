import { etiketGruplari, etiketKimlikleri, etiketBul, type Etiket, type EtiketGrubu, type EtiketKimligi } from '../etiketler';
import { tumKayitlar, type Kayit } from './kayit';

export interface DizinSatiri { etiket: Etiket; kayitlar: Kayit[] }
/** Kullanılan etiketler ve taşıyan kayıtlar, sözlük sırasıyla. */
export async function etiketDizini(): Promise<DizinSatiri[]> {
  const harita = new Map<EtiketKimligi, Kayit[]>();
  for (const k of await tumKayitlar()) for (const e of k.etiketler) harita.set(e.id, [...(harita.get(e.id) ?? []), k]);
  return etiketKimlikleri.filter((id) => harita.has(id)).map((id) => ({ etiket: etiketBul(id), kayitlar: harita.get(id)! }));
}
export async function gruplanmisDizin(): Promise<{ grup: EtiketGrubu; ad: string; soru: string; satirlar: DizinSatiri[] }[]> {
  const dizin = await etiketDizini();
  return (Object.keys(etiketGruplari) as EtiketGrubu[])
    .map((grup) => ({ grup, ...etiketGruplari[grup], satirlar: dizin.filter((s) => s.etiket.grup === grup).sort((a, b) => b.kayitlar.length - a.kayitlar.length || a.etiket.ad.localeCompare(b.etiket.ad, 'tr')) }))
    .filter((g) => g.satirlar.length > 0);
}
