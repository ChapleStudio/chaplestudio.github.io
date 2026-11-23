import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { site } from '../site';
import { tumKayitlar } from '../kutuphane/kayit';

export async function GET(baglam: APIContext) {
  return rss({
    title: site.ad,
    description: site.aciklama,
    site: baglam.site!,
    trailingSlash: true,
    customData: `<language>${site.dil}</language>`,
    items: (await tumKayitlar()).map((k) => ({ title: k.baslik, description: k.ozet, link: k.yol, pubDate: k.tarih, categories: [k.bolum.ad, k.turAdi] })),
  });
}
