/**
 * Jedini izvor istine za sve što se ponavlja po stranici, meta tagovima,
 * structured dataju, manifestu, robots.txt i llms.txt.
 *
 * ⚠ PROVJERITI PRIJE LANSIRANJA: `email`, `securityEmail` i `social` su
 * pretpostavljene vrijednosti - zamijeniti stvarnima (ili obrisati ako alias
 * još ne postoji; prazan niz se nigdje ne renderira).
 */

export const SITE = {
  url: 'https://tquilo.com',
  name: 'T’quilo',
  /** Tehnički zapis imena - domena, e-mail, handle, hashtag (readme §2). */
  slug: 'tquilo',
  locale: 'en',
  localeOg: 'en_US',
  themeColor: '#0B1622',

  title: 'T’quilo - Coming soon',
  titleTemplate: '%s - T’quilo',
  tagline: 'Your tranquilo place on water.',
  description:
    'T’quilo is a floating sunbed for two - a private 2.5 × 2.5 m room on the water, with no crew and no schedule. No boating licence and no vessel registration required. Soft launch October 2026.',
  /** Kratki opis za manifest i Twitter card (≤ 120 znakova). */
  descriptionShort: 'A floating sunbed for two. No crew, no schedule. Soft launch October 2026.',

  keywords: [
    'floating sunbed',
    'floating platform',
    'private platform on water',
    'hotel water amenity',
    'resort water lounge',
    'T’quilo',
  ],

  email: 'hello@tquilo.com',
  securityEmail: 'security@tquilo.com',

  /** Prazno dok profili ne postoje - `sameAs` se tada izostavlja iz JSON-LD-a. */
  social: [] as string[],

  og: {
    image: '/og/tquilo-og.png',
    width: 1200,
    height: 630,
    alt: 'T’quilo - Coming soon. Your tranquilo place on water.',
    type: 'image/png',
  },

  launch: {
    label: 'Soft launch - October 2026',
    /** ISO datum za structured data; dan je namjerno prvi u mjesecu. */
    date: '2026-10-01',
  },

  founded: '2026',
  country: 'HR',
} as const;

/** Apsolutni URL iz relativne putanje - meta tagovi i JSON-LD traže apsolutni. */
export const absolute = (path: string): string => new URL(path, SITE.url).href;
