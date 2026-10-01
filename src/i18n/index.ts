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

/**
 * Ekrani vodoravne prezentacije.
 *
 * `SCENE_KEYS` su UNUTARNJI ključevi - njima su imenovani `data-scene`
 * atributi i CSS/JS selektori, i oni se NE prevode. Mijenjati ih znači
 * mijenjati selektore po cijelom projektu.
 *
 * `SCENE_SLUGS` je ono što posjetitelj vidi u adresi. Engleska verzija je
 * imala hrvatske sidrene linkove (`/#mir`, `/#kontakt`) - adresna traka je
 * govorila hrvatski na engleskoj stranici.
 */
export const SCENE_KEYS = [
  'mir',
  'voda',
  'kvaliteta',
  'partneri',
  'boje',
  'izvedbe',
  'fjaka',
  'kontakt',
] as const;

export type SceneKey = (typeof SCENE_KEYS)[number];

const SCENE_SLUGS: Record<Lang, Record<SceneKey, string>> = {
  hr: {
    mir: 'mir',
    voda: 'voda',
    kvaliteta: 'kvaliteta',
    partneri: 'partneri',
    boje: 'boje',
    izvedbe: 'izvedbe',
    fjaka: 'fjaka',
    kontakt: 'kontakt',
  },
  en: {
    mir: 'quiet',
    voda: 'water',
    kvaliteta: 'quality',
    partneri: 'partners',
    boje: 'colours',
    izvedbe: 'versions',
    // „Fjaka" ostaje fjaka - to je brendirani pojam, ne riječ za prijevod.
    fjaka: 'fjaka',
    kontakt: 'contact',
  },
};

/** Slugovi svih ekrana, redoslijedom, za dani jezik. */
export const sceneSlugs = (lang: Lang): string[] => SCENE_KEYS.map((k) => SCENE_SLUGS[lang][k]);

/** Sidro jednog ekrana, npr. `#kontakt` / `#contact`. */
export const sceneHash = (lang: Lang, key: SceneKey): string => `#${SCENE_SLUGS[lang][key]}`;

/**
 * Slugovi po jezicima - treba jezičnom prekidaču. Prekidač nosi trenutni
 * ekran sa sobom, pa mora znati kako se taj ekran zove u DRUGOM jeziku;
 * inače bi s `/#water` odveo na `/hr#water`, sidro koje ne postoji.
 */
export const sceneSlugsByLang = (): Record<Lang, string[]> =>
  Object.fromEntries(LANGS.map((l) => [l, sceneSlugs(l)])) as Record<Lang, string[]>;

/** Sve jezične varijante jedne stranice - za hreflang i jezični prekidač. */
export const alternates = (page = ''): { lang: Lang; path: string }[] =>
  LANGS.map((lang) => ({ lang, path: localePath(lang, page) }));

export { LANGS, DEFAULT_LANG };
export type { Lang };
