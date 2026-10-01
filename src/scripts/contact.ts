/**
 * Kontakt forma - progresivno poboljšanje nad Web3Forms.
 *
 * Bez JS-a forma je običan POST i Web3Forms vrati vlastitu stranicu potvrde.
 * S JS-om se šalje u pozadini i javlja status, pa posjetitelj ne ispada iz
 * vodoravne prezentacije (povratak bi ga vratio na prvi ekran).
 *
 * ⚠ OTKAD JE hCAPTCHA UKLJUČENA, slanje bez JS-a više ne prolazi: Web3Forms
 * odbija zahtjev bez `h-captcha-response`, a taj token može proizvesti samo
 * skripta. To je cijena captche, ne propust - vrijedi za svaku izvedbu.
 *
 * hCAPTCHA SE UČITAVA TEK NA DODIR FORME. Službena uputa je skriptu staviti
 * u `<body>`, ali onda bi se s hcaptcha.com povlačilo na svakom učitavanju
 * stranice, i onima koji formu nikad ne otvore. Ovdje se učita na prvi fokus
 * u formi. Koristi se `render=explicit` i element BEZ klase `h-captcha`, pa
 * se ništa ne renderira samo od sebe - widget nastaje kad ga pozovemo.
 *
 * ZAŠTO VIDLJIVI CHECKBOX, A NE NEVIDLJIVA IZVEDBA
 * Prva verzija bila je `size: 'invisible'` i `hcaptcha.execute()` na slanje.
 * To je palo u praksi: posjetitelj pritisne „Pošalji upit", a zagonetka mu
 * iskoči niotkuda. Ako je zatvori ili ne riješi, `execute()` odbije obećanje
 * i poruka je neuspjelo slanje - a posjetitelj nema što poduzeti jer na
 * ekranu nema ničega što bi mogao ispraviti. Gore: ako se izazov ne uspije
 * prikazati, obećanje se ne razriješi nikad i forma zauvijek stoji na
 * „Šaljem…".
 *
 * Vidljivi checkbox rješava se PRIJE slanja, vidi mu se stanje, i do trenutka
 * pritiska na gumb token ili postoji ili ne postoji - nema trećeg ishoda.
 */

/** Web3Forms sitekey za besplatni plan (iz njihove dokumentacije). */
const SITEKEY = '50b2fe65-b00b-4b9e-ad62-3ba471098be2';

/**
 * `type=email` propušta `ime@domena` - formalno valjano, u praksi uvijek
 * tipfeler. Traži se i vršna domena. Isti izraz stoji u `pattern` atributu,
 * da provjera radi i prije nego se skripta učita.
 */
const EMAIL = /^[^@\s]+@[^@\s]+\.[A-Za-z]{2,}$/;

const MSG = {
  hr: {
    ok: 'Upit je poslan. Javit ćemo vam se uskoro.',
    fail: 'Slanje nije uspjelo. Pokušajte ponovno ili nam pišite izravno.',
    sending: 'Šaljem…',
    badMail: 'Provjerite e-mail adresu - nedostaje domena, npr. ime@tvrtka.hr',
    captchaTodo: 'Potvrdite kvadratić „nisam robot" iznad gumba.',
    captchaFail: 'Provjera protiv robota nije prošla. Pokušajte ponovno.',
  },
  en: {
    ok: 'Enquiry sent. We’ll be in touch soon.',
    fail: 'Sending failed. Please try again, or write to us directly.',
    sending: 'Sending…',
    badMail: 'Check the email address - the domain is missing, e.g. name@company.com',
    captchaTodo: 'Please tick the “I am human” box above the button.',
    captchaFail: 'The bot check did not pass. Please try again.',
  },
} as const;

type HCaptcha = {
  render(el: HTMLElement, opts: { sitekey: string; size: string; theme?: string }): string;
  getResponse(id?: string): string;
  reset(id?: string): void;
};

export function initContactForm(root: ParentNode = document) {
  const form = root.querySelector<HTMLFormElement>('[data-contact]');
  if (!form) return;
  const status = form.querySelector<HTMLElement>('[data-form-status]');
  const lang = (form.querySelector<HTMLInputElement>('input[name=lang]')?.value || 'hr') as 'hr' | 'en';
  const m = MSG[lang] ?? MSG.hr;

  let timer: ReturnType<typeof setTimeout>;

  const say = (text: string, tone: 'ok' | 'fail' | 'idle') => {
    if (!status) return;
    status.textContent = text;
    status.classList.remove('text-success', 'text-warning', 'text-mist');
    status.classList.add(tone === 'ok' ? 'text-success' : tone === 'fail' ? 'text-warning' : 'text-mist');
  };

  /* ------------------------------------------------------- e-mail */

  const email = form.querySelector<HTMLInputElement>('input[name=email]');
  const checkEmail = () => {
    if (!email) return;
    const v = email.value.trim();
    // Prazno polje je posao `required` atributa, ne ovog izraza.
    email.setCustomValidity(v && !EMAIL.test(v) ? m.badMail : '');
  };
  email?.addEventListener('input', checkEmail);
  email?.addEventListener('blur', checkEmail);

  /* ------------------------------------------------------ hCaptcha */

  const host = form.querySelector<HTMLElement>('[data-captcha-host]');
  let widget: Promise<string | null> | null = null;

  const hcaptcha = () => (window as unknown as { hcaptcha?: HCaptcha }).hcaptcha;

  const loadCaptcha = () => {
    if (widget || !host) return widget;
    widget = new Promise<string | null>((resolve) => {
      const s = document.createElement('script');
      s.async = true;
      s.defer = true;
      s.src = `https://js.hcaptcha.com/1/api.js?render=explicit&hl=${lang}`;
      s.addEventListener('load', () => {
        const h = hcaptcha();
        resolve(h ? h.render(host, { sitekey: SITEKEY, size: 'normal', theme: 'dark' }) : null);
      });
      // Blokiran skriptom za blokiranje oglasa ili mrežom - šalje se bez
      // tokena, pa Web3Forms odbije i posjetitelj dobije jasnu poruku.
      s.addEventListener('error', () => resolve(null));
      document.head.appendChild(s);
    });
    return widget;
  };

  // Prvi dodir forme je i prvi trenutak u kojem captcha ima smisla.
  form.addEventListener('focusin', () => void loadCaptcha(), { once: true });

  /* -------------------------------------------------------- slanje */

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    checkEmail();
    if (!form.reportValidity()) return;

    const button = form.querySelector<HTMLButtonElement>('button[type=submit]');
    if (button) button.disabled = true;
    clearTimeout(timer);
    say(m.sending, 'idle');

    const id = (await loadCaptcha()) ?? null;
    const h = hcaptcha();
    // Token postoji samo ako je posjetitelj označio kvadratić. Provjerava se
    // PRIJE slanja, da poruka govori što treba učiniti, a ne da je nešto palo.
    const token = id && h ? h.getResponse(id) : '';
    if (!token) {
      say(id ? m.captchaTodo : m.captchaFail, 'fail');
      if (button) button.disabled = false;
      clearTimeout(timer);
      timer = setTimeout(() => say('', 'idle'), 8000);
      return;
    }

    try {
      // Web3Forms prima i JSON i multipart; JSON je ovdje jednostavniji jer
      // odgovor uvijek dolazi kao { success, message }.
      const data = Object.fromEntries(new FormData(form).entries());
      data.email = String(data.email ?? '').trim();
      data['h-captcha-response'] = token;

      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) throw new Error(json?.message || String(res.status));
      form.reset();
      say(m.ok, 'ok');
    } catch (err) {
      // Posjetitelju ide pitka poruka, a stvarni razlog u konzolu - inače se
      // kvar na Web3Forms strani ne može razlikovati od pada mreže.
      console.warn('[kontakt]', err);
      const reason = err instanceof Error ? err.message : String(err);
      say(/captcha/i.test(reason) ? m.captchaFail : m.fail, 'fail');
    } finally {
      // Token je jednokratan - bez reseta bi drugo slanje uvijek palo.
      if (id) hcaptcha()?.reset(id);
      if (button) button.disabled = false;
      timer = setTimeout(() => say('', 'idle'), 8000);
    }
  });
}
