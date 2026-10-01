/**
 * Logika konfiguratora: stanje, URL hash, ručni unos boje, sažetak, dijeljenje
 * i PDF. 3D modul se učitava lijeno - three.js je najteži dio stranice i nema
 * razloga da blokira prvi prikaz panela.
 */
import { paintSwatches } from '../swatch';
import { parseColor, nearestRal } from '../../data/ral';
import type { Config, SegmentKey } from '../../data/palette';
import type { ModelHandle } from './model';

type Labels = Record<string, string>;
type Boot = { lang: 'hr' | 'en'; defaults: Config; labels: Labels };

const KEYS: SegmentKey[] = ['lower', 'upper', 'fender', 'cushion', 'awning', 'curtain', 'teak', 'fill'];

export function initConfigurator() {
  const boot: Boot | null = (() => {
    const el = document.querySelector('script[data-config]');
    try { return el ? JSON.parse(el.textContent || '') : null; } catch { return null; }
  })();
  if (!boot) return;

  const { defaults, labels } = boot;
  const state: Config = { ...defaults };
  /** Nazivi/RAL kodovi uz trenutne vrijednosti - samo za ispis, ne za model. */
  const meta: Partial<Record<SegmentKey, { name?: string; ral?: string; custom?: boolean }>> = {};

  let model: ModelHandle | null = null;

  /* ---------------------------------------------------------- hash <-> stanje */

  const readHash = () => {
    const h = location.hash.replace(/^#/, '');
    if (!h) return;
    for (const part of h.split('&')) {
      const [k, raw] = part.split('=');
      if (!KEYS.includes(k as SegmentKey) || !raw) continue;
      // `~RAL` sufiks čuva kod prilagođene boje, npr. 383E42~7016
      const [hex, ral] = raw.split('~');
      if (!/^[0-9a-fA-F]{6}$/.test(hex)) continue;
      const key = k as SegmentKey;
      state[key] = '#' + hex.toUpperCase();
      if (ral) {
        meta[key] = { ral, custom: true };
      } else {
        // Boja iz palete zadržava naziv; samo prilagođene ostaju "po narudžbi".
        const sw = document.querySelector<HTMLElement>(
          `[data-segment="${key}"] [data-pick="${state[key]}"]`,
        );
        meta[key] = sw
          ? { name: sw.dataset.name, ral: sw.dataset.ral, custom: false }
          : { custom: true };
      }
    }
  };

  const writeHash = () => {
    const h = KEYS.map((k) => {
      const m = meta[k];
      return `${k}=${state[k].replace('#', '')}${m?.custom && m.ral ? '~' + m.ral : ''}`;
    }).join('&');
    history.replaceState(null, '', '#' + h);
  };

  /* ----------------------------------------------------------------- ispis */

  const valueText = (k: SegmentKey): string => {
    const hex = state[k];
    const m = meta[k] || {};
    if (k === 'teak' || k === 'fill') return m.name || hex;
    if (m.custom) {
      const near = m.ral ? { code: m.ral, exact: true } : nearestRal(hex);
      return `${near.code ? (near.exact ? '' : '≈ ') + 'RAL ' + near.code + ' · ' : ''}${hex} · ${labels.byOrder}`;
    }
    if (m.ral) return `RAL ${m.ral} - ${m.name} · ${hex}`;
    return `${m.name ?? ''} · ${hex}`.replace(/^ · /, '');
  };

  const segmentEls = Array.from(document.querySelectorAll<HTMLElement>('[data-segment]'));

  const render = () => {
    for (const sec of segmentEls) {
      const k = sec.dataset.segment as SegmentKey;
      const out = sec.querySelector<HTMLElement>('[data-value]');
      if (out) out.textContent = valueText(k);
      for (const b of sec.querySelectorAll<HTMLElement>('[data-pick]')) {
        b.setAttribute('aria-pressed', String(b.dataset.pick!.toUpperCase() === state[k].toUpperCase() && !meta[k]?.custom));
      }
    }

    // Presetsi su "odabrani" samo ako se cijela kombinacija podudara.
    const same = (cfg: Config) => KEYS.every((k) => cfg[k].toUpperCase() === state[k].toUpperCase());
    for (const b of document.querySelectorAll<HTMLElement>('[data-line],[data-scheme]')) {
      const cfg = JSON.parse(b.dataset.line || b.dataset.scheme || '{}') as Config;
      b.setAttribute('aria-pressed', String(same(cfg)));
    }

    const dl = document.querySelector<HTMLElement>('[data-summary]');
    if (dl) {
      dl.textContent = '';
      for (const sec of segmentEls) {
        const k = sec.dataset.segment as SegmentKey;
        const title = sec.querySelector('span')?.textContent ?? k;
        const row = document.createElement('div');
        row.className = 'grid grid-cols-[0.9fr_1.3fr] items-center gap-3 border-b border-trench pb-2';
        const dt = document.createElement('dt');
        dt.className = 'text-mist';
        dt.textContent = title;
        const dd = document.createElement('dd');
        dd.className = 'm-0 flex items-center gap-2 tabular-nums';
        const chip = document.createElement('span');
        chip.className = 'inline-block h-[14px] w-[14px] flex-none border border-trench';
        chip.style.background = state[k];
        const txt = document.createElement('span');
        txt.textContent = valueText(k);
        dd.append(chip, txt);
        row.append(dt, dd);
        dl.appendChild(row);
      }
    }

    model?.set(state);
    writeHash();
  };

  /** Vraća sve segmente na polazne vrijednosti (`DEFAULT_CONFIG` s poslužitelja). */
  const resetColours = () => {
    for (const k of KEYS) {
      state[k] = defaults[k];
      // Naziv/RAL se čita iz uzorka u paleti; polazna kombinacija je uvijek
      // iz palete, pa `custom` otpada.
      const sw = document.querySelector<HTMLElement>(
        `[data-segment="${k}"] [data-pick="${defaults[k]}"]`,
      );
      meta[k] = sw ? { name: sw.dataset.name, ral: sw.dataset.ral, custom: false } : {};
    }
    for (const input of document.querySelectorAll<HTMLInputElement>('[data-custom]')) {
      input.value = '';
    }
    render();
  };

  /* ------------------------------------------------------------- interakcija */

  for (const sec of segmentEls) {
    const k = sec.dataset.segment as SegmentKey;

    for (const b of sec.querySelectorAll<HTMLElement>('[data-pick]')) {
      b.addEventListener('click', () => {
        state[k] = b.dataset.pick!;
        meta[k] = { name: b.dataset.name, ral: b.dataset.ral, custom: false };
        sec.querySelector<HTMLElement>('[data-error]')?.classList.add('hidden');
        render();
      });
    }

    const input = sec.querySelector<HTMLInputElement>('[data-custom]');
    const err = sec.querySelector<HTMLElement>('[data-error]');
    if (input) {
      const apply = () => {
        const parsed = parseColor(input.value);
        if (!parsed) {
          err?.classList.remove('hidden');
          return;
        }
        err?.classList.add('hidden');
        state[k] = parsed.hex;
        meta[k] = { ral: parsed.ral, custom: true };
        input.value = '';
        render();
      };
      sec.querySelector<HTMLElement>('[data-apply]')?.addEventListener('click', apply);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); apply(); }
      });
    }
  }

  const applyPreset = (cfg: Config) => {
    for (const k of KEYS) {
      state[k] = cfg[k];
      // Naziv se preuzima iz uzorka iste boje, ako postoji u paleti.
      const swatch = document.querySelector<HTMLElement>(
        `[data-segment="${k}"] [data-pick="${cfg[k]}"]`,
      );
      meta[k] = swatch
        ? { name: swatch.dataset.name, ral: swatch.dataset.ral, custom: false }
        : { custom: true };
    }
    render();
  };

  for (const b of document.querySelectorAll<HTMLElement>('[data-line],[data-scheme]')) {
    b.addEventListener('click', () => applyPreset(JSON.parse(b.dataset.line || b.dataset.scheme!) as Config));
  }

  /* ------------------------------------------------------------------ toast */

  const toastEl = document.querySelector<HTMLElement>('[data-toast]');
  let toastTimer: ReturnType<typeof setTimeout>;
  const toast = (msg: string) => {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.style.opacity = '1';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (toastEl.style.opacity = '0'), 3000);
  };

  document.querySelector<HTMLElement>('[data-copy]')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      toast(labels.copied);
    } catch {
      // Clipboard traži sigurni kontekst i dopuštenje; prompt je pouzdan fallback.
      window.prompt(labels.copy, location.href);
    }
  });

  /**
   * "Preuzmi PDF" bez servera i bez biblioteke: popuni se blok za ispis i
   * pozove `window.print()`. Korisnik u dijalogu bira "Spremi kao PDF".
   * Za pravi PDF s prijeloma bi trebao server - vidi README.
   */
  for (const b of document.querySelectorAll<HTMLElement>('[data-pdf]')) {
    b.addEventListener('click', async () => {
      // 3D se učitava tek kad uđe u vidno polje. Gumb uz sažetak je niže na
      // stranici i zna biti kliknut prije toga - bez ovoga bi isti PDF iz
      // jednog gumba imao sliku, a iz drugog ne.
      await loadModel();

      const shot = model?.snapshot();
      const img = document.querySelector<HTMLImageElement>('[data-print-shot]');
      if (img && shot) {
        img.src = shot;
        // Ispis bez čekanja uhvati praznu sliku, pa se čeka dekodiranje.
        // ALI: blok je `display: none`, a `decode()` na neprikazanoj slici u
        // Chromiumu zna ostati vječno neriješen - tada se `print()` nikad ne
        // pozove i gumb izgleda kao da ne radi. Zato utrka s rokom.
        await Promise.race([
          img.decode().catch(() => undefined),
          new Promise((r) => setTimeout(r, 600)),
        ]);
      }

      const date = document.querySelector<HTMLElement>('[data-print-date]');
      if (date) {
        date.textContent =
          (boot.lang === 'en' ? 'Configuration · ' : 'Konfiguracija · ') +
          new Date().toLocaleDateString(boot.lang === 'en' ? 'en-GB' : 'hr-HR');
      }

      // Ispis preuzima isti jezik kao sažetak na ekranu: naziv segmenta,
      // mrlja boje, pa vrijednost. Klase su u `@media print` bloku; stilovi
      // se postavljaju preko `style` samo za samu boju (CSP ne dopušta
      // inline `style` atribut u markupu, ali `element.style` iz skripte da).
      const dl = document.querySelector<HTMLElement>('[data-print-summary]');
      if (dl) {
        dl.textContent = '';
        for (const sec of segmentEls) {
          const k = sec.dataset.segment as SegmentKey;
          const row = document.createElement('div');
          row.className = 'p-row';

          const dt = document.createElement('dt');
          dt.textContent = sec.querySelector('span')?.textContent ?? k;

          const dd = document.createElement('dd');
          const chip = document.createElement('span');
          chip.className = 'p-chip';
          chip.style.background = state[k];
          const val = document.createElement('span');
          val.className = 'p-val';
          val.textContent = valueText(k);
          dd.append(chip, val);

          row.append(dt, dd);
          dl.appendChild(row);
        }
      }

      window.print();
    });
  }

  /* -------------------------------------------------------------- 3D modul */

  const host = document.querySelector<HTMLElement>('[data-viewport]');
  const status = document.querySelector<HTMLElement>('[data-viewport-status]');

  const loadModel = async () => {
    if (!host || model) return;
    try {
      const { mount } = await import('./model');
      model = mount(host, state);
      status?.remove();
      const rotate = document.querySelector<HTMLElement>('[data-rotate]');
      rotate?.addEventListener('click', () => {
        const on = rotate.getAttribute('aria-pressed') !== 'true';
        rotate.setAttribute('aria-pressed', String(on));
        model?.setAutoRotate(on);
      });
      // „Resetiraj prikaz" vraća i kut kamere I boje na polaznu liniju
      // (Midnight). Gumb koji vraća samo kameru ostavlja korisnika s pola
      // vraćenog stanja, a drugog puta natrag na početak nema.
      document.querySelector<HTMLElement>('[data-reset]')?.addEventListener('click', () => {
        model?.reset();
        resetColours();
      });
    } catch (e) {
      if (status) status.textContent = boot.lang === 'en'
        ? 'The 3D view could not be loaded. The colour list below still works.'
        : 'Nije moguće učitati 3D prikaz. Popis boja ispod i dalje radi.';
    }
  };

  if (host) {
    // Učitaj kad prikaz uđe u vidno polje - three.js je najveći paket na
    // stranici, a na mobitelu je panel ono što se prvo čita.
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        loadModel();
      }
    }, { rootMargin: '200px' });
    io.observe(host);
    // Sigurnosna mreža: IntersectionObserver zna ne okinuti kad je stranica
    // u skaliranom ili skrivenom okviru. Bez ovoga prikaz zauvijek ostane na
    // "Učitavam…", a to je jedini sadržaj lijevog stupca.
    setTimeout(() => { io.disconnect(); loadModel(); }, 1500);
  }

  readHash();
  paintSwatches();
  render();
}
