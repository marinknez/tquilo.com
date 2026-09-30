/**
 * Kontakt forma - progresivno poboljšanje.
 *
 * Bez JS-a forma je običan POST na PHP endpoint, koji vrati HTML potvrdu.
 * S JS-om se šalje u pozadini i javlja status, pa posjetitelj ne ispada iz
 * vodoravne prezentacije (povratak na ekran 08 bi ga vratio na početak).
 */
const MSG = {
  hr: {
    ok: 'Upit je poslan. Javit ćemo vam se uskoro.',
    fail: 'Slanje nije uspjelo. Pokušajte ponovno ili nam pišite izravno.',
    sending: 'Šaljem…',
  },
  en: {
    ok: 'Enquiry sent. We’ll be in touch soon.',
    fail: 'Sending failed. Please try again, or write to us directly.',
    sending: 'Sending…',
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

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;

    const button = form.querySelector<HTMLButtonElement>('button[type=submit]');
    if (button) button.disabled = true;
    clearTimeout(timer);
    say(m.sending, 'idle');

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      say(m.ok, 'ok');
    } catch {
      say(m.fail, 'fail');
    } finally {
      if (button) button.disabled = false;
      timer = setTimeout(() => say('', 'idle'), 8000);
    }
  });
}
