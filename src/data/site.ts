/**
 * Jedini izvor istine za sve što se ponavlja po stranici, meta tagovima,
 * structured dataju, robots.txt i llms.txt.
 *
 * ⚠ PROVJERITI PRIJE LANSIRANJA: `securityEmail` i `social` su pretpostavljene
 * vrijednosti - zamijeniti stvarnima (ili obrisati ako alias još ne postoji;
 * prazan niz se nigdje ne renderira).
 *
 * Kontakt e-mail je namjerno uklonjen: stranica ga ne prikazuje, ne spominje
 * ga u structured dataju ni u llms.txt. Ako se jednom vrati, dodaje se ovdje
 * i referencira iz `Seo.astro` (`Organization.email`) i `llms.txt.ts`.
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
    'T’quilo is a floating sunbed for two - a private 6 m² room on the water, with no crew and no schedule. No boating licence and no vessel registration required. Launching October 2026.',
  /** Kratki opis za Twitter card (≤ 120 znakova). */
  descriptionShort: 'A floating sunbed for two. No crew, no schedule. Launching October 2026.',

  keywords: [
    'floating sunbed',
    'floating platform',
    'private platform on water',
    'hotel water amenity',
    'resort water lounge',
    'T’quilo',
  ],

  /** Samo za /.well-known/security.txt - RFC 9116 traži kontakt, inače je
   *  datoteka nevažeća. Nigdje se ne prikazuje na stranici. */
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
    label: 'Something new is taking shape. Launching October 2026',
    /** ISO datum za structured data; dan je namjerno prvi u mjesecu. */
    date: '2026-10-01',
  },

  founded: '2026',
  country: 'HR',

  /** Pravna osoba iza proizvoda - podnožje kontakta i JSON-LD. */
  legal: {
    name: 'Arba Nautika d.o.o. za proizvodnju i trgovinu',
    vatId: 'HR00720431425',
    oib: '00720431425',
  },
} as const;

/**
 * ⚠ PREKIDAČ LANSIRANJA.
 *
 * `false` - javni korijen je coming soon stranica. Puni site se i dalje gradi
 * na /hr/ i /en/ da ga se može pregledati i pokazati klijentu, ali nosi
 * `noindex`, izostaje iz sitemapa i robots.txt ga zabranjuje.
 *
 * `true` - korijen vodi na /hr/, coming soon se povlači, sve ide u indeks.
 *
 * Mijenja se SAMO ovdje. Sve ostalo (rute, meta, sitemap, robots) to prati.
 */
export const LAUNCHED = false;

export const LANGS = ['hr', 'en'] as const;
export type Lang = (typeof LANGS)[number];

export const DEFAULT_LANG: Lang = 'hr';

export const OG_LOCALE: Record<Lang, string> = {
  hr: 'hr_HR',
  en: 'en_US',
};

/** Apsolutni URL iz relativne putanje - meta tagovi i JSON-LD traže apsolutni. */
export const absolute = (path: string): string => new URL(path, SITE.url).href;
