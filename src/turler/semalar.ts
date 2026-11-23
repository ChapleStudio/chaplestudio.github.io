import { z } from 'astro/zod';
import type { SchemaContext } from 'astro:content';
import { etiketBul, etiketKimlikleri } from '../etiketler';
import { kategoriKimlikleri } from './is/kategoriler';
import { tipKimlikleri } from '../temalar/tipler';
import { kontrast } from '../temalar/kontrast';

const httpsAdres = z.url({ protocol: /^https$/ });
const adresParcasi = z.string().regex(/^[a-z0-9-]+(\/[a-z0-9-]+)*$/, 'Yalnız küçük harf, rakam, tire ve / kullan');
const renk = z.string().regex(/^#[0-9a-f]{6}$/, 'Renk #rrggbb biçiminde, küçük harfle yazılır');
const yuzde = z.number().min(0).max(100);

/** Her içerikte ortak alanlar. */
const ortak = {
  baslik: z.string().min(2).max(60),
  ozet: z.string().min(20).max(180),
  /** Adres değişirse eskisi buraya yazılır, ziyaretçi yeni adrese yönlenir. */
  eskiAdresler: z.array(adresParcasi).default([]),
  /** Kendi sitesi varsa adresi (public/<yol>/). İçine girilince o açılır, sayfa üretilmez. */
  kendiSitesi: z.string().regex(/^\/[a-z0-9-]+\/$/).optional(),
  taslak: z.boolean().default(false),
};

/** Projenin kendi dünyası. Okunurluk burada denetlenir, düşük karşıtlık derlemeyi durdurur. */
const gorunum = z
  .object({
    zemin: renk,
    yazi: renk,
    vurgu: renk,
    vurguYazi: renk,
    tip: z.enum(tipKimlikleri),
    /** Başlık boyu (px, 1440 ekranda). Verilmezse yazı tipinin kendi boyu. */
    boy: z.int().min(40).max(220).optional(),
    /** Başlığı iki satıra kırmak için en büyük genişlik (px). */
    en: z.int().min(200).max(900).optional(),
    /** Dar dilimde afişin hangi parçası görünsün: 0 sol, 100 sağ. */
    odak: yuzde.default(70),
    /** İçine girerken yakınlaşılan nokta. */
    merkez: z.tuple([yuzde, yuzde]).default([70, 50]),
    /** Proje sayfasının üstünde afişin dikey yeri: 0 üst, 100 alt. */
    kafa: yuzde.default(45),
  })
  .strict()
  .superRefine((g, c) => {
    for (const [a, b, ad] of [[g.zemin, g.yazi, 'yazi'], [g.vurgu, g.vurguYazi, 'vurguYazi']] as const)
      if (kontrast(a, b) < 4.5) c.addIssue({ code: 'custom', path: [ad], message: `okunmuyor, karşıtlık ${kontrast(a, b).toFixed(2)}, en az 4.5 olmalı` });
  });

export const semalar = {
  is: ({ image }: SchemaContext) =>
    z
      .object({
        ...ortak,
        /** Ana sayfada adın altındaki iki üç kelime: ne yapıyor? */
        kisa: z.string().min(6).max(30),
        /** İş ne? src/turler/is/kategoriler.ts */
        kategori: z.enum(kategoriKimlikleri),
        /** Kategorideki yeri. Verilmeyenler en sona, yeniden eskiye dizilir. */
        sira: z.int().min(1).optional(),
        /** Neyle, nerede? src/etiketler.ts */
        etiketler: z.array(z.enum(etiketKimlikleri)).min(3),
        /** 1920×900 afiş. Konu sağda, sol yarı sakin (üstüne ad gelir). */
        afis: image(),
        gorunum,
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
        /** Sayfanın ortasındaki geniş çizim ve altındaki adımlar. */
        serit: z.object({ gorsel: image(), alt: z.string().min(10), adimlar: z.array(z.object({ ad: z.string().min(2), metin: z.string().min(10) })).min(2).max(4) }).optional(),
        gorseller: z
          .array(z.object({ dosya: image(), alt: z.string().min(10), altyazi: z.string().optional() }))
          .default([]),
      })
      .strict()
      .refine((d) => d.guncelleme >= d.baslangic, { error: 'guncelleme, baslangic tarihinden önce olamaz' })
      .superRefine((d, c) => {
        for (const grup of ['tur', 'dil', 'platform'] as const)
          if (!d.etiketler.some((e) => etiketBul(e).grup === grup)) c.addIssue({ code: 'custom', path: ['etiketler'], message: `en az bir "${grup}" etiketi gerekli` });
        if (new Set(d.etiketler).size !== d.etiketler.length) c.addIssue({ code: 'custom', path: ['etiketler'], message: 'aynı etiket iki kez yazılmış' });
        if (d.afis.width < 1600 || d.afis.width / d.afis.height < 1.9) c.addIssue({ code: 'custom', path: ['afis'], message: 'afiş en az 1600 px geniş ve yatay (yaklaşık 1920×900) olmalı' });
      }),
  yazi: (_: SchemaContext) =>
    z
      .object({ ...ortak, tarih: z.coerce.date(), guncelleme: z.coerce.date().optional(), etiketler: z.array(z.enum(etiketKimlikleri)).default([]) })
      .strict(),
} as const;

export type TurKimligi = keyof typeof semalar;
export type IsVerisi = z.infer<ReturnType<typeof semalar.is>>;
export type YaziVerisi = z.infer<ReturnType<typeof semalar.yazi>>;
