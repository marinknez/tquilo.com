import type { APIRoute } from 'astro';
import { SITE } from '../data/site';

/** Web app manifest - generiran da ime, boje i opis ostanu na jednom mjestu. */
export const GET: APIRoute = () => {
  const manifest = {
    name: SITE.name,
    short_name: SITE.name,
    description: SITE.descriptionShort,
    lang: SITE.locale,
    dir: 'ltr',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: SITE.themeColor,
    theme_color: SITE.themeColor,
    icons: [
      { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };

  return new Response(JSON.stringify(manifest, null, 2), {
    headers: {
      'Content-Type': 'application/manifest+json; charset=utf-8',
    },
  });
};
