import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { acikBolumler } from './site';
import { semalar } from './turler/semalar';

/** Koleksiyonlar bölüm listesinden üretilir; elle eklenmez. `_` ile başlayan dosyalar atlanır. */
export const collections = Object.fromEntries(
  acikBolumler.map((b) => [
    b.id,
    defineCollection({
      loader: glob({ base: `./src/content/${b.id}`, pattern: '**/[^_]*.md' }),
      schema: (baglam) => semalar[b.tur](baglam),
    }),
  ]),
);
