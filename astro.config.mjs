import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://lucawetherall.co.uk',
  base: '/',
  output: 'static',
  integrations: [sitemap()],
});
