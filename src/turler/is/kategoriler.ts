/**
 * Kategori işin NE olduğunu söyler ve ana sayfadaki büyük kelimedir. Sıra soldan sağadır.
 * Platform, dil ve araç kategori olamaz; onlar etikettir (src/etiketler.ts) ve proje sayfasında görünür.
 */
export const kategoriler = {
  oyun: { ad: 'Oyunlar', tekil: 'Oyun' },
  'oyun-yapimi': { ad: 'Oyun yapımı', tekil: 'Oyun yapımı' },
  'yapay-zeka': { ad: 'Yapay zekâ', tekil: 'Yapay zekâ' },
  arac: { ad: 'Araçlar', tekil: 'Araç' },
} as const satisfies Record<string, { ad: string; tekil: string }>;

export type Kategori = keyof typeof kategoriler;
export const kategoriKimlikleri = Object.keys(kategoriler) as [Kategori, ...Kategori[]];
