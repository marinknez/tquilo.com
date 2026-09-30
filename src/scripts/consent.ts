/**
 * Pristanak na lokalnu pohranu.
 *
 * Dvije vrijednosti u `localStorage` pod `tquilo.consent`:
 *   `all`       - smije se pamtiti i ono što nije nužno (pozicija u prezentaciji)
 *   `essential` - samo ono bez čega stranica ne radi
 *
 * Sam zapis o odluci je nužan i sprema se u oba slučaja - inače bi se traka
 * vraćala pri svakom učitavanju.
 *
 * `canStore()` je jedino mjesto koje ostatak koda pita smije li spremati.
 * Ako se jednom doda analitika, provjerava se ovdje i CSP se proširuje u
 * `.htaccess` - ne obrnuto.
 */
const KEY = 'tquilo.consent';

export type Consent = 'all' | 'essential';

export function getConsent(): Consent | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'all' || v === 'essential' ? v : null;
  } catch {
    // Privatni prozor ili blokirana pohrana: ništa se ne može spremiti, pa
    // se ništa i ne traži - tretira se kao "samo nužno".
    return 'essential';
  }
}

/** Smije li se spremati ono što nije nužno za rad stranice. */
export function canStore(): boolean {
  return getConsent() === 'all';
}

function set(value: Consent) {
  try {
    localStorage.setItem(KEY, value);
    if (value === 'essential') localStorage.removeItem('tquilo.D2.x');
  } catch {
    /* pohrana blokirana - odluka vrijedi samo za ovu sesiju */
  }
  document.dispatchEvent(new CustomEvent('tquilo:consent', { detail: value }));
}

export function initConsent(root: ParentNode = document) {
  const el = root.querySelector<HTMLElement>('[data-consent]');
  if (!el) return;

  // Odluka već postoji - traka se nikad ne prikaže.
  if (getConsent()) return;

  el.hidden = false;

  const close = (value: Consent) => {
    set(value);
    el.hidden = true;
  };

  el.querySelector<HTMLElement>('[data-consent-accept]')?.addEventListener('click', () => close('all'));
  el.querySelector<HTMLElement>('[data-consent-reject]')?.addEventListener('click', () => close('essential'));
}
