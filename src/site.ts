import type { TurKimligi } from './turler/semalar';

export const site = {
  ad: 'Chaple Studio',
  aciklama: 'Yaptığım oyunlar, motorlar ve araçlar.',
  dil: 'tr',
  /** Ana sayfa açılınca görünen iş (src/content/isler/ içindeki dosya adı). */
  vitrin: 'rowl-engine',
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

const ayrilmis = ['404', 'ilk', 'projeler'];
for (const b of bolumler) if (ayrilmis.includes(b.id)) throw new Error(`"${b.id}" adı ayrılmış, bölüm adı olamaz`);

export const acikBolumler = bolumler.filter((b) => b.acik);
