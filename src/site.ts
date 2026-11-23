import type { TurKimligi } from './turler/semalar';

export const site = {
  ad: 'Chaple Studio',
  aciklama: 'Yaptığım oyunlar, motorlar ve araçlar.',
  dil: 'tr',
} as const;

export interface Bolum {
  /** Adresteki ve src/content/ altındaki klasör adı. Yayınlandıktan sonra değiştirme. */
  id: string;
  ad: string;
  aciklama: string;
  /** İçerik türü: src/turler/ altındaki klasör. */
  tur: TurKimligi;
  /** false ise bölüm derlenmez: sayfası, menüsü, akışı olmaz. */
  acik: boolean;
}

/** Sitedeki raflar. Yeni bölüm açmak için buraya bir satır ekle. */
export const bolumler: readonly Bolum[] = [
  {
    id: 'isler',
    ad: 'İşler',
    aciklama: 'Oyunlar, motorlar, masaüstü ve mobil araçlar.',
    tur: 'is',
    acik: true,
  },
  {
    id: 'gunluk',
    ad: 'Günlük',
    aciklama: 'Yaparken tuttuğum notlar.',
    tur: 'yazi',
    acik: false,
  },
];

export const acikBolumler = bolumler.filter((b) => b.acik);
