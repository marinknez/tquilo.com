/**
 * i18n - HR je default, EN je ravnopravna ruta (ne query, ne localStorage).
 *
 * Prijevodi su statični JSON uvezen u build: nema runtime dohvata, nema
 * flasha nepreveden teksta, i svaki jezik je zasebna HTML datoteka koju
 * tražilica može indeksirati.
 */
import hr from './hr.json';
import en from './en.json';
import { LANGS, DEFAULT_LANG, type Lang } from '../data/site';

export type Copy = typeof hr;

const DICT: Record<Lang, Copy> = { hr, en: en as Copy };

export const t = (lang: Lang): Copy => DICT[lang] ?? DICT[DEFAULT_LANG];

/**
 * Drugi jezik. Treba za mjerenje: mobilni naslov mora biti jednake veličine
 * u HR i EN, a svaka je ruta zaseban dokument - bez ovoga bi svaki jezik
 * dobio vlastiti minimum i stranice se ne bi poklapale.
 */
export const altLang = (lang: Lang): Lang => (lang === 'hr' ? 'en' : 'hr');

/**
 * Putanja stranice za dani jezik. `page` je bez vodeće kose crte.
 *
 * PRIMARNI JEZIK NEMA PREFIKS. EN je `/`, `/konfigurator`, `/privacy`;
 * HR je `/hr`, `/hr/konfigurator`, `/hr/privacy`. Jedno mjesto odlučuje -
 * rute, hreflang, sitemap, prekidač jezika i poveznice sve čitaju odavde.
 *
 * Stare adrese `/en/...` i dalje postoje kao 301 u `.htaccess`.
 */
export const localePath = (lang: Lang, page = ''): string => {
  const prefix = lang === DEFAULT_LANG ? '' : `/${lang}`;
  return page ? `${prefix}/${page}` : prefix || '/';
};

/** Sve jezične varijante jedne stranice - za hreflang i jezični prekidač. */
export const alternates = (page = ''): { lang: Lang; path: string }[] =>
  LANGS.map((lang) => ({ lang, path: localePath(lang, page) }));

export { LANGS, DEFAULT_LANG };
export type { Lang };
