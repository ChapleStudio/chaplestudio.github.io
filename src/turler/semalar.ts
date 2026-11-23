import { z } from 'astro/zod';
import type { SchemaContext } from 'astro:content';
import { cesitKimlikleri } from './is/cesitler';

const httpsAdres = z.url({ protocol: /^https$/ });
const adresParcasi = z.string().regex(/^[a-z0-9-]+(\/[a-z0-9-]+)*$/, 'Yalnız küçük harf, rakam, tire ve / kullan');

/** Kutu sırtına en küçük yazı boyunda bile sığan karakter sayısı. */
export const SIRT_SINIRI = 22;
const sirtaSigar = (d: { baslik: string; sirtAdi?: string | undefined }) => d.sirtAdi !== undefined || d.baslik.length <= SIRT_SINIRI;
const sirtHatasi = { error: `başlık ${SIRT_SINIRI} karakterden uzun: kutu sırtı için kısa bir sirtAdi yaz`, path: ['sirtAdi'] };

/** Her içerikte ortak alanlar. */
const ortak = {
  baslik: z.string().min(2).max(60),
  ozet: z.string().min(20).max(180),
  /** Kutu sırtındaki ad. Başlık SIRT_SINIRI'nı aşıyorsa zorunlu. */
  sirtAdi: z.string().max(SIRT_SINIRI).optional(),
  /** Adres değişirse eskisi buraya yazılır, ziyaretçi yeni adrese yönlenir. */
  eskiAdresler: z.array(adresParcasi).default([]),
  taslak: z.boolean().default(false),
};

export const semalar = {
  is: ({ image }: SchemaContext) =>
    z
      .object({
        ...ortak,
        cesit: z.enum(cesitKimlikleri),
        /** Kutunun kalınlığı: 1 küçük deneme, 4 büyük proje. */
        kapsam: z.int().min(1).max(4),
        baslangic: z.coerce.date(),
        guncelleme: z.coerce.date(),
        suruyor: z.boolean().default(false),
        teknoloji: z.array(z.string().min(1)).min(1),
        platform: z.array(z.string().min(1)).min(1),
        lisans: z.string().optional(),
        /** Ana sayfadaki "Masamda" sırası. */
        masada: z.int().positive().optional(),
        baglantilar: z
          .array(
            z.object({
              tur: z.enum(['oyna', 'indir', 'kaynak', 'site']),
              ad: z.string().min(2),
              adres: httpsAdres,
              not: z.string().optional(),
            }),
          )
          .default([]),
        gorseller: z
          .array(z.object({ dosya: image(), alt: z.string().min(10), altyazi: z.string().optional() }))
          .default([]),
      })
      .strict()
      .refine((d) => d.guncelleme >= d.baslangic, { error: 'guncelleme, baslangic tarihinden önce olamaz' })
      .refine(sirtaSigar, sirtHatasi),
  yazi: (_: SchemaContext) =>
    z
      .object({ ...ortak, tarih: z.coerce.date(), guncelleme: z.coerce.date().optional(), etiketler: z.array(z.string()).default([]) })
      .strict()
      .refine(sirtaSigar, sirtHatasi),
} as const;

export type TurKimligi = keyof typeof semalar;
export type IsVerisi = z.infer<ReturnType<typeof semalar.is>>;
export type YaziVerisi = z.infer<ReturnType<typeof semalar.yazi>>;
