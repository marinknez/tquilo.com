// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

import { SITE, LAUNCHED } from './src/data/site';

// https://astro.build/config
export default defineConfig({
  site: SITE.url,
  trailingSlash: 'never',
  compressHTML: true,

  build: {
    // CSP na produkciji je `style-src 'self'` - inlineani <style> bi zahtijevao
    // 'unsafe-inline'. Stylesheet zato uvijek ostaje zasebna datoteka.
    inlineStylesheets: 'never',
    assets: '_assets',
  },

  integrations: [
    sitemap({
      changefreq: 'weekly',
      priority: 1,
      lastmod: new Date(),
      // 404 nikad ne ide u sitemap, `/pregled/*` su interne stranice za
      // odluku (nose i `noindex`), a dok site nije lansiran - ništa.
      filter: (page) => LAUNCHED && !page.includes('/404') && !page.includes('/pregled/'),
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
    build: {
      // Dugoročni cache u .htaccessu vrijedi samo za hashirane nazive.
      assetsInlineLimit: 0,
    },
  },
});
