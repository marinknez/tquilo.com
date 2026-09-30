/**
 * Kontakt forma - progresivno poboljšanje nad Web3Forms.
 *
 * Bez JS-a forma je običan POST i Web3Forms vrati vlastitu stranicu potvrde.
 * S JS-om se šalje u pozadini i javlja status, pa posjetitelj ne ispada iz
 * vodoravne prezentacije (povratak bi ga vratio na prvi ekran).
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
      // Web3Forms prima i JSON i multipart; JSON je ovdje jednostavniji jer
      // odgovor uvijek dolazi kao { success, message }.
      const data = Object.fromEntries(new FormData(form).entries());
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) throw new Error(json?.message || String(res.status));
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
