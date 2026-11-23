/** İş çeşitleri ağacın dallarıdır. Sıra, dalların soldan sağa sırasıdır. Renkler stil/renkler.css içinde. */
export const cesitler = {
  oyun: { ad: 'Oyunlar', tekil: 'Oyun', renk: 'mercan', ikon: 'oyun' },
  motor: { ad: 'Motorlar', tekil: 'Motor ve altyapı', renk: 'altin', ikon: 'motor' },
  masaustu: { ad: 'Masaüstü', tekil: 'Masaüstü aracı', renk: 'adacayi', ikon: 'masaustu' },
  mobil: { ad: 'Mobil ve tarayıcı', tekil: 'Mobil ve tarayıcı', renk: 'leylak', ikon: 'mobil' },
} as const;

export type Cesit = keyof typeof cesitler;
export const cesitKimlikleri = Object.keys(cesitler) as [Cesit, ...Cesit[]];
