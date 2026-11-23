import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://chaplestudio.github.io',
  trailingSlash: 'always',
  integrations: [sitemap()],
  image: { layout: 'constrained' },
  security: { csp: true },
  devToolbar: { enabled: false },
});
