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

/** Putanja stranice za dani jezik. `page` je bez vodeće kose crte. */
export const localePath = (lang: Lang, page = ''): string =>
  page ? `/${lang}/${page}` : `/${lang}`;

/** Sve jezične varijante jedne stranice - za hreflang i jezični prekidač. */
export const alternates = (page = ''): { lang: Lang; path: string }[] =>
  LANGS.map((lang) => ({ lang, path: localePath(lang, page) }));

export { LANGS, DEFAULT_LANG };
export type { Lang };
