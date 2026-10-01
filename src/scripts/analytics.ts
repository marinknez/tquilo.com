/**
 * Google Analytics 4.
 *
 * NE UČITAVA SE DOK PRISTANAK NE POSTOJI. Službeni gtag isječak ide u
 * `<head>` i radi odmah; ovdje se ne može tako iz dva razloga:
 *
 *  1. CSP je `script-src 'self'` bez `unsafe-inline`, pa inline bootstrap
 *     (`window.dataLayer = ...`) preglednik ne bi izvršio. Zato je bootstrap
 *     ovdje, u paketu sa `self` izvora, a vanjska skripta se ubacuje preko
 *     `createElement` - za nju je u `.htaccess` otvoren googletagmanager.com.
 *  2. GA postavlja `_ga` kolačić. Postaviti ga prije pristanka znači da traka
 *     nije pristanak nego obavijest.
 *
 * `stopAnalytics()` koristi `ga-disable-<ID>` - službeni GA prekidač koji
 * zaustavlja slanje bez ponovnog učitavanja stranice - i briše kolačiće koje
 * je GA već postavio. Bez toga bi "Samo nužno" nakon "Prihvaćam" bio prazan
 * gumb: skripta je u tom trenutku već u stranici i ne može se odučitati.
 */
const GA_ID = 'G-ST8X7GLQSB';
const OPT_OUT = `ga-disable-${GA_ID}`;

type W = Window & { dataLayer?: unknown[] } & Record<string, unknown>;
const w = window as unknown as W;

/**
 * GA očekuje baš `arguments`, ne polje - `push([...])` se tiho ignorira.
 * Zato funkcija nema deklarirane parametre (u strict načinu `arguments` i
 * rest parametri ne idu zajedno), pa se tip dodaje castom.
 */
function push() {
  // eslint-disable-next-line prefer-rest-params
  (w.dataLayer = w.dataLayer || []).push(arguments);
}
const gtag = push as (...args: unknown[]) => void;

let started = false;

export function startAnalytics() {
  w[OPT_OUT] = false;
  if (started) return;
  started = true;

  gtag('js', new Date());
  gtag('config', GA_ID);

  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
}

export function stopAnalytics() {
  w[OPT_OUT] = true;

  // `_ga` je na vršnoj domeni, `_ga_<ID>` i `_gid` mogu biti na host-u ili na
  // domeni s točkom. Briše se na sve tri varijante jer se ne zna koja je.
  const parts = location.hostname.split('.');
  const root = parts.length > 1 ? '.' + parts.slice(-2).join('.') : location.hostname;
  const scopes = ['', `; domain=${location.hostname}`, `; domain=.${location.hostname}`, `; domain=${root}`];

  for (const pair of document.cookie.split(';')) {
    const k = pair.split('=')[0].trim();
    if (k !== '_ga' && k !== '_gid' && !k.startsWith('_ga_')) continue;
    for (const scope of scopes) document.cookie = `${k}=; Max-Age=0; path=/${scope}`;
  }
}
