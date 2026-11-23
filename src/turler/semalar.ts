import { z } from 'astro/zod';
import type { SchemaContext } from 'astro:content';
import { etiketBul, etiketKimlikleri } from '../etiketler';
import { kategoriKimlikleri, kategoriler, altAdi } from './is/kategoriler';
import { sahneKimlikleri } from '../tuval/sahne-kimlikleri';

const httpsAdres = z.url({ protocol: /^https$/ });
const adresParcasi = z.string().regex(/^[a-z0-9-]+(\/[a-z0-9-]+)*$/, 'Yalnız küçük harf, rakam, tire ve / kullan');

/** Her içerikte ortak alanlar. */
const ortak = {
  baslik: z.string().min(2).max(60),
  ozet: z.string().min(20).max(180),
  /** Düğümdeki canlı sahnenin adı (src/tuval/sahneler.ts). Boşsa ada özgü bir desen çizilir. */
  sahne: z.enum(sahneKimlikleri).optional(),
  /** Adres değişirse eskisi buraya yazılır, ziyaretçi yeni adrese yönlenir. */
  eskiAdresler: z.array(adresParcasi).default([]),
  taslak: z.boolean().default(false),
};

export const semalar = {
  is: ({ image }: SchemaContext) =>
    z
      .object({
        ...ortak,
        /** İş ne? src/turler/is/kategoriler.ts */
        kategori: z.enum(kategoriKimlikleri),
        alt: z.string().optional(),
        /** Neyle, nerede, nasıl? src/etiketler.ts */
        etiketler: z.array(z.enum(etiketKimlikleri)).min(3),
        /** 1 küçük deneme, 4 büyük proje. 4 olanın düğümü geniştir. */
        kapsam: z.int().min(1).max(4),
        baslangic: z.coerce.date(),
        guncelleme: z.coerce.date(),
        suruyor: z.boolean().default(false),
        lisans: z.string().optional(),
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
      .superRefine((d, c) => {
        const altlar = Object.keys(kategoriler[d.kategori].altlar);
        if (altlar.length ? altAdi(d.kategori, d.alt) === undefined : d.alt !== undefined)
          c.addIssue({ code: 'custom', path: ['alt'], message: altlar.length ? `bu kategoride alt dal gerekli: ${altlar.join(', ')}` : 'bu kategorinin alt dalı yok' });
        for (const grup of ['tur', 'dil', 'platform'] as const)
          if (!d.etiketler.some((e) => etiketBul(e).grup === grup)) c.addIssue({ code: 'custom', path: ['etiketler'], message: `en az bir "${grup}" etiketi gerekli` });
        if (new Set(d.etiketler).size !== d.etiketler.length) c.addIssue({ code: 'custom', path: ['etiketler'], message: 'aynı etiket iki kez yazılmış' });
      }),
  yazi: (_: SchemaContext) =>
    z
      .object({ ...ortak, tarih: z.coerce.date(), guncelleme: z.coerce.date().optional(), etiketler: z.array(z.enum(etiketKimlikleri)).default([]) })
      .strict(),
} as const;

export type TurKimligi = keyof typeof semalar;
export type IsVerisi = z.infer<ReturnType<typeof semalar.is>>;
export type YaziVerisi = z.infer<ReturnType<typeof semalar.yazi>>;
