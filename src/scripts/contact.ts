/**
 * Kontakt forma - progresivno poboljšanje nad Web3Forms.
 *
 * Bez JS-a forma je običan POST i Web3Forms vrati vlastitu stranicu potvrde.
 * S JS-om se šalje u pozadini i javlja status, pa posjetitelj ne ispada iz
 * vodoravne prezentacije (povratak bi ga vratio na prvi ekran).
 *
 * ZAŠTO NEMA CAPTCHE
 * hCaptcha je bila ugrađena i uklonjena: Web3Forms na besplatnom planu vraća
 * `"You are trying to use a Pro feature, Please Upgrade to use reCaptcha"` -
 * prekidač za captchu u njihovoj nadzornoj ploči je Pro značajka, bez obzira
 * što je sama hCaptcha dokumentirana kao besplatna. Protiv robota ostaje
 * honeypot (`botcheck`), koji Web3Forms provjerava na svom kraju.
 */

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
  },
  en: {
    ok: 'Enquiry sent. We’ll be in touch soon.',
    fail: 'Sending failed. Please try again, or write to us directly.',
    sending: 'Sending…',
    badMail: 'Check the email address - the domain is missing, e.g. name@company.com',
  },
} as const;

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

  const email = form.querySelector<HTMLInputElement>('input[name=email]');
  const checkEmail = () => {
    if (!email) return;
    const v = email.value.trim();
    // Prazno polje je posao `required` atributa, ne ovog izraza.
    email.setCustomValidity(v && !EMAIL.test(v) ? m.badMail : '');
  };
  email?.addEventListener('input', checkEmail);
  email?.addEventListener('blur', checkEmail);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    checkEmail();
    if (!form.reportValidity()) return;

    const button = form.querySelector<HTMLButtonElement>('button[type=submit]');
    if (button) button.disabled = true;
    clearTimeout(timer);
    say(m.sending, 'idle');

    try {
      // Web3Forms prima i JSON i multipart; JSON je ovdje jednostavniji jer
      // odgovor uvijek dolazi kao { success, message }.
      const data = Object.fromEntries(new FormData(form).entries());
      data.email = String(data.email ?? '').trim();

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
      say(m.fail, 'fail');
    } finally {
      if (button) button.disabled = false;
      timer = setTimeout(() => say('', 'idle'), 8000);
    }
  });
}
