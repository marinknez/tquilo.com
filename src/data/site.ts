/**
 * Jedini izvor istine za sve što se ponavlja po stranici, meta tagovima,
 * structured dataju, robots.txt i llms.txt.
 *
 * ⚠ PROVJERITI PRIJE LANSIRANJA: `securityEmail` i `social` su pretpostavljene
 * vrijednosti - zamijeniti stvarnima (ili obrisati ako alias još ne postoji;
 * prazan niz se nigdje ne renderira).
 *
 * Kontakt e-mail (`SITE.email`) prikazuje se na ekranu Kontakt i u politici
 * privatnosti. U structured data i llms.txt NE ide - ondje bi ga ubirali
 * skupljači adresa, a ovdje je dovoljno da ga vidi čovjek.
 */

export const SITE = {
  url: 'https://tquilo.com',
  name: 'T’quilo',
  email: 'aboard@tquilo.com',
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

  /** Pravna osoba iza proizvoda - podnožje kontakta, PDF i JSON-LD. */
  legal: {
    /** Tvrtka se ne prevodi - ni naziv ni pravni oblik („d.o.o."). */
    name: 'Arba Nautika d.o.o.',
    /** PDV broj = HR + OIB. Vrijedi samo ako je tvrtka u sustavu PDV-a. */
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

/**
 * Primarni jezik je EN i ne ovisi o postavkama preglednika.
 * Nigdje se ne čita `navigator.language` - posjetitelj koji dođe bez jezika
 * u putanji dobiva EN, a HR bira sam.
 */
export const DEFAULT_LANG: Lang = 'en';

export const OG_LOCALE: Record<Lang, string> = {
  hr: 'hr_HR',
  en: 'en_US',
};

/**
 * Pravna crta u dva retka, po jeziku.
 *
 * Razlikuje se samo naziv države - tvrtka i pravni oblik se ne prevode, a
 * oznaka broja ostaje OIB u oba jezika. (PDV broj je isti broj s prefiksom
 * `HR`; stoji u `SITE.legal.vatId` i ide u structured data, ali se na
 * stranici ne prikazuje.)
 */
export const legalLines = (lang: Lang): [string, string] => [
  `${SITE.legal.name}, ${lang === 'hr' ? 'Hrvatska' : 'Croatia'}`,
  `OIB: ${SITE.legal.oib}`,
];

/** Apsolutni URL iz relativne putanje - meta tagovi i JSON-LD traže apsolutni. */
export const absolute = (path: string): string => new URL(path, SITE.url).href;
