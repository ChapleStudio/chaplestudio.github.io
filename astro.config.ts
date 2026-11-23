import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { acikBolumler } from './src/site';

export default defineConfig({
  site: 'https://chaplestudio.github.io',
  trailingSlash: 'always',
  // Yönlendirme sayfaları haritaya girmez: yalnız ana sayfa ve açık bölümler.
  integrations: [sitemap({ filter: (sayfa) => { const yol = new URL(sayfa).pathname; return yol === '/' || acikBolumler.some((b) => yol.startsWith(`/${b.id}/`)); } })],
  image: { layout: 'constrained' },
  security: { csp: true },
  devToolbar: { enabled: false },
});
