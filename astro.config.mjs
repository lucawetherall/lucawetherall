import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://lucawetherall.co.uk',
  base: '/',
  output: 'static',
  devToolbar: { enabled: false },
  integrations: [sitemap()],
});
