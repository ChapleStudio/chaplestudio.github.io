/** İş çeşitleri. Renk ve ikon buradan gelir; yeni çeşit eklemek için buraya ve stil/renkler.css'e bak. */
export const cesitler = {
  oyun: { ad: 'Oyun', renk: 'zinober', ikon: 'oyun' },
  motor: { ad: 'Motor ve altyapı', renk: 'lacivert', ikon: 'motor' },
  masaustu: { ad: 'Masaüstü aracı', renk: 'cam', ikon: 'masaustu' },
  mobil: { ad: 'Mobil ve tarayıcı', renk: 'hardal', ikon: 'mobil' },
} as const;

export type Cesit = keyof typeof cesitler;
export const cesitKimlikleri = Object.keys(cesitler) as [Cesit, ...Cesit[]];
