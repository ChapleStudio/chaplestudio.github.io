/**
 * Proje adlarında kullanılabilen yazı tipleri. Yeni tip: paketi kur (@fontsource/...), src/stil/yazilar.css'e ekle, buraya bir satır yaz.
 * `boy` 1440 px ekrandaki başlık boyu (px); uzun adlarda içerikte `gorunum.boy` ile küçültülür.
 */
export const tipler = {
  rakkas: { aile: 'Rakkas', kalin: 400, ara: '-0.01em', boy: 158 },
  caprasimo: { aile: 'Caprasimo', kalin: 400, ara: '-0.01em', boy: 112 },
  saira: { aile: 'Saira Extra Condensed', kalin: 900, ara: '-0.01em', boy: 178 },
  unbounded: { aile: 'Unbounded', kalin: 800, ara: '-0.03em', boy: 76 },
  bowlby: { aile: 'Bowlby One', kalin: 400, ara: '-0.02em', boy: 176 },
  chango: { aile: 'Chango', kalin: 400, ara: '-0.01em', boy: 100 },
  lilita: { aile: 'Lilita One', kalin: 400, ara: '0', boy: 92 },
  shrikhand: { aile: 'Shrikhand', kalin: 400, ara: '-0.01em', boy: 112 },
  krona: { aile: 'Krona One', kalin: 400, ara: '-0.04em', boy: 100 },
  stencil: { aile: 'Saira Stencil One', kalin: 400, ara: '-0.01em', boy: 130 },
  alfa: { aile: 'Alfa Slab One', kalin: 400, ara: '-0.01em', boy: 94 },
  fredoka: { aile: 'Fredoka', kalin: 700, ara: '-0.03em', boy: 138 },
  abril: { aile: 'Abril Fatface', kalin: 400, ara: '-0.015em', boy: 104 },
  grandstander: { aile: 'Grandstander', kalin: 800, ara: '-0.02em', boy: 104 },
  grenze: { aile: 'Grenze Gotisch', kalin: 700, ara: '0', boy: 128 },
  hanken: { aile: 'Hanken Grotesk Variable', kalin: 800, ara: '-0.035em', boy: 112 },
} as const satisfies Record<string, { aile: string; kalin: number; ara: string; boy: number }>;

export type Tip = keyof typeof tipler;
export const tipKimlikleri = Object.keys(tipler) as [Tip, ...Tip[]];
