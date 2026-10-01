/**
 * Pristanak na kolačiće i lokalnu pohranu.
 *
 * `tquilo.consent`: `all` (Google Analytics + pamćenje pozicije) ili
 * `essential` (ništa od toga).
 *
 * `tquilo.consent.ui`: je li traka skupljena u kap. To NIJE pristanak nego
 * stanje same trake - dio mehanizma pristanka, pa se sprema bez obzira na
 * odluku. Bez toga bi se traka otvarala na svakoj stranici iznova.
 *
 * `canStore()` je jedino mjesto koje ostatak koda pita smije li spremati.
 *
 * ODLUKA SE MOŽE PROMIJENITI. Kap ostaje na ekranu i nakon izbora. Dok nije
 * bilo analitike to je bilo svejedno; s njom nije - povlačenje pristanka mora
 * biti jednako dostupno kao davanje, inače pristanak pravno ne stoji.
 */
import { startAnalytics, stopAnalytics } from './analytics';

const KEY = 'tquilo.consent';
const UI_KEY = 'tquilo.consent.ui';

export type Consent = 'all' | 'essential';

const read = (k: string) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};

const write = (k: string, v: string) => {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* pohrana blokirana - odluka vrijedi samo za ovu sesiju */
  }
};

export function getConsent(): Consent | null {
  const v = read(KEY);
  if (v === 'all' || v === 'essential') return v;
  // Blokirana pohrana (privatni prozor): ništa se ne može spremiti, pa se
  // ništa i ne traži - ponaša se kao „samo nužno".
  try {
    localStorage.getItem(KEY);
  } catch {
    return 'essential';
  }
  return null;
}

/** Smije li se spremati ono što nije nužno za rad stranice. */
export function canStore(): boolean {
  return getConsent() === 'all';
}

function apply(value: Consent) {
  if (value === 'all') {
    startAnalytics();
    return;
  }
  stopAnalytics();
  try {
    localStorage.removeItem('tquilo.D2.x');
  } catch {
    /* nema što obrisati */
  }
}

function decide(value: Consent) {
  write(KEY, value);
  apply(value);
  document.dispatchEvent(new CustomEvent('tquilo:consent', { detail: value }));
}

export function initConsent(root: ParentNode = document) {
  // Analitika kreće i prije nego se nađe traka: odluka je već donesena u
  // ranijem posjetu, a traka na nekoj stranici može i ne postojati.
  const decided = getConsent();
  if (decided === 'all') startAnalytics();

  const el = root.querySelector<HTMLElement>('[data-consent]');
  if (!el) return;

  const panel = el.querySelector<HTMLElement>('[data-consent-panel]');
  const drop = el.querySelector<HTMLElement>('[data-consent-open]');
  if (!panel || !drop) return;

  const state = el.querySelector<HTMLElement>('[data-consent-state]');
  const labels = {
    all: state?.dataset.all ?? '',
    essential: state?.dataset.essential ?? '',
  };

  const paintState = () => {
    if (!state) return;
    const v = getConsent();
    state.hidden = !v;
    if (v) state.textContent = labels[v];
  };

  const show = (minimised: boolean) => {
    el.hidden = false;
    panel.hidden = minimised;
    drop.hidden = !minimised;
  };

  paintState();
  // S donesenom odlukom vidi se samo kap; bez nje traka, osim ako ju je
  // posjetitelj već skupio.
  show(decided ? true : read(UI_KEY) === 'min');

  el.querySelector<HTMLElement>('[data-consent-min]')?.addEventListener('click', () => {
    write(UI_KEY, 'min');
    show(true);
    drop.focus();
  });

  drop.addEventListener('click', () => {
    write(UI_KEY, 'open');
    paintState();
    show(false);
  });

  const close = (value: Consent) => {
    decide(value);
    write(UI_KEY, 'min');
    paintState();
    show(true);
  };

  el.querySelector<HTMLElement>('[data-consent-accept]')?.addEventListener('click', () => close('all'));
  el.querySelector<HTMLElement>('[data-consent-reject]')?.addEventListener('click', () => close('essential'));

  /**
   * Prvi pomak skuplja traku u kap.
   *
   * Tko krene gledati stranicu, traku je pročitao ili ju je odlučio
   * preskočiti - u oba slučaja mu smeta. To NIJE odluka o pristanku: kap
   * ostaje, do izbora vrijedi „samo nužno", i sprema se isto što i klik na ×
   * (`tquilo.consent.ui`), pa se traka ne otvara ponovo na svakoj stranici.
   *
   * Naslovnica je vodoravna prezentacija i ne skrola se, pa `scroll` na njoj
   * nikad ne okine - otuda `wheel`, `touchmove` i tipke. Podstranice se
   * skrolaju normalno, pa ondje radi `scroll`.
   *
   * `setTimeout` prije prijave: preglednik pri učitavanju zna sam okinuti
   * `scroll` (vraćanje pozicije, skok na sidro), a to nije pomak posjetitelja.
   */
  const NAV_KEYS = ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'PageDown', 'PageUp', 'Home', 'End', ' '];
  const EVENTS = ['scroll', 'wheel', 'touchmove'] as const;

  const minimise = () => {
    off();
    if (panel.hidden) return;
    write(UI_KEY, 'min');
    show(true);
  };

  const onKey = (e: KeyboardEvent) => {
    if (NAV_KEYS.includes(e.key)) minimise();
  };

  function off() {
    for (const type of EVENTS) window.removeEventListener(type, minimise);
    window.removeEventListener('keydown', onKey);
  }

  setTimeout(() => {
    if (panel.hidden) return;
    for (const type of EVENTS) window.addEventListener(type, minimise, { passive: true });
    window.addEventListener('keydown', onKey);
  }, 400);
}
