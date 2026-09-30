/**
 * Pristanak na lokalnu pohranu.
 *
 * `tquilo.consent`: `all` (smije se pamtiti i ono što nije nužno) ili
 * `essential` (samo ono bez čega stranica ne radi).
 *
 * `tquilo.consent.ui`: je li traka skupljena u kap. To NIJE pristanak nego
 * stanje same trake - dio mehanizma pristanka, pa se sprema bez obzira na
 * odluku. Bez toga bi se traka otvarala na svakoj stranici iznova.
 *
 * `canStore()` je jedino mjesto koje ostatak koda pita smije li spremati.
 * Ako se doda analitika, provjerava se ovdje i CSP se proširuje u
 * `.htaccess` - ne obrnuto.
 */
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

function decide(value: Consent) {
  write(KEY, value);
  if (value === 'essential') {
    try {
      localStorage.removeItem('tquilo.D2.x');
    } catch {
      /* nema što obrisati */
    }
  }
  document.dispatchEvent(new CustomEvent('tquilo:consent', { detail: value }));
}

export function initConsent(root: ParentNode = document) {
  const el = root.querySelector<HTMLElement>('[data-consent]');
  if (!el) return;

  const panel = el.querySelector<HTMLElement>('[data-consent-panel]');
  const drop = el.querySelector<HTMLElement>('[data-consent-open]');
  if (!panel || !drop) return;

  // Odluka već postoji - ni traka ni kap se ne prikazuju.
  if (getConsent()) return;

  const show = (minimised: boolean) => {
    el.hidden = false;
    panel.hidden = minimised;
    drop.hidden = !minimised;
  };

  show(read(UI_KEY) === 'min');

  el.querySelector<HTMLElement>('[data-consent-min]')?.addEventListener('click', () => {
    write(UI_KEY, 'min');
    show(true);
    drop.focus();
  });

  drop.addEventListener('click', () => {
    write(UI_KEY, 'open');
    show(false);
  });

  const close = (value: Consent) => {
    decide(value);
    el.hidden = true;
  };

  el.querySelector<HTMLElement>('[data-consent-accept]')?.addEventListener('click', () => close('all'));
  el.querySelector<HTMLElement>('[data-consent-reject]')?.addEventListener('click', () => close('essential'));
}
