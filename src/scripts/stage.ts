/**
 * Stage engine - vodoravna "prezentacija" od osam ekrana, bez scrollbara.
 *
 * Port ponašanja iz `design/TQuilo Web.dc.html` (React referenca) u vanilla TS.
 * Bez frameworka: sve je čitanje/pisanje DOM-a u jednom rAF loopu.
 *
 * Tri stvari koje engine radi:
 *   1. Pomicanje trake - `cur` juri za `target` s faktorom 0,08 po frameu.
 *   2. Koreografija točke - točka na kraju naslova raste dok ne prekrije
 *      ekran, tada se fotografija vidi cijela.
 *   3. Fitanje naslova - binarna pretraga najveće veličine koja stane.
 *
 * Stil se postavlja isključivo preko `element.style` iz JS-a. To CSP
 * `style-src 'self'` ne blokira (blokira samo `style` atribut u markupu i
 * <style> blokove), pa politika ostaje stroga bez `unsafe-inline`.
 */

import { canStore } from './consent';

const HEADER = 76;
const BOTTOM = 56;

type Scene = {
  el: HTMLElement;
  left: number;
  width: number;
  media: HTMLElement | null;
  legend: HTMLElement | null;
  side: HTMLElement | null;
  dot: HTMLElement | null;
  fill: HTMLElement | null;
  fimg: (HTMLElement & { __f0?: [number, number]; __fs?: string }) | null;
  exp: number;
  cx: number;
  cy: number;
  r0: number;
};

export function initStage(root: ParentNode = document) {
  const stage = root.querySelector<HTMLElement>('[data-stage]');
  const track = root.querySelector<HTMLElement>('[data-track]');
  if (!stage || !track) return;

  const prog = root.querySelector<HTMLElement>('[data-progress]');
  const seams = root.querySelector<HTMLElement>('[data-seams]');
  const numEl = root.querySelector<HTMLElement>('[data-scene-num]');
  const nameEl = root.querySelector<HTMLElement>('[data-scene-name]');
  const sceneNames: string[] = JSON.parse(stage.dataset.scenes || '[]');
  /** Jezično neutralni ID-evi ekrana - hash u adresi i veza između jezika. */
  const sceneIds: string[] = JSON.parse(stage.dataset.sceneIds || '[]');
  // Sidra po jezicima: isti ekran ima drugo ime u drugom jeziku.
  const langHashes: Record<string, string[]> = JSON.parse(stage.dataset.langHashes || '{}');
  const navLinks = Array.from(root.querySelectorAll<HTMLElement>('[data-nav]'));
  const langLinks = Array.from(root.querySelectorAll<HTMLAnchorElement>('[data-lang-link]'));
  const loop = stage.dataset.loop !== 'false';

  let W = window.innerWidth;
  let H = window.innerHeight;
  let G = 0.55 * W;
  let D = 0.2 * W;
  let mobile = W < 760;
  let scenes: Scene[] = [];
  let stops: number[] = [0];
  let L = 0;
  let n = 0;
  let max = 0;
  let cur = 0;
  let target = 0;
  let sc = -1;
  let lastSave = 0;
  let savedX = NaN;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /**
   * Klik u izborniku ne juri kao kotačić.
   *
   * Obično pomicanje je eksponencijalno dotjerivanje (`cur += (target-cur)*0.08`):
   * kreće naglo i dugo se smiruje - dobro za kotačić, ružno za skok preko
   * pola stranice. Zato klik na stavku izbornika ide vremenskim tweenom s
   * `ease-in-out`: mekano kreće, mekano staje, a trajanje raste s udaljenošću.
   */
  let tween: { from: number; to: number; t0: number; dur: number } | null = null;
  /** Je li se posjetitelj već pomaknuo - v. `pinHash` niže. */
  let moved = false;
  const easeInOut = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

  function glideTo(x: number) {
    moved = true;
    if (reduced) {
      cur = target = x;
      tween = null;
      return;
    }
    const dist = Math.abs(x - cur);
    tween = {
      from: cur,
      to: x,
      t0: performance.now(),
      dur: Math.min(2600, Math.max(1200, 950 + dist * 0.3)),
    };
    target = x;
  }

  // Ekran iz adrese ima prednost pred zapamćenom pozicijom: tako prebacivanje
  // jezika, dijeljenje linka i izbornik vode na točan ekran, a ne na početak.
  const hashScene = sceneIds.indexOf(location.hash.replace(/^#/, ''));

  // Pozicija se pamti samo uz pristanak - v. consent.ts.
  if (hashScene < 0 && canStore()) {
    try {
      const x = parseFloat(localStorage.getItem('tquilo.D2.x') || '');
      if (!Number.isNaN(x)) cur = target = x;
    } catch {
      /* privatni prozor ili blokirani storage - pozicija se ne pamti */
    }
  }

  /** Polumjer koji iz točke (sx, sy) prekriva cijeli viewport. */
  const cover = (sx: number, sy: number) =>
    Math.hypot(Math.max(sx, W - sx), Math.max(sy, H - sy)) + 2;

  /**
   * Visina legende za proračun - veća od vidljive i one na drugom jeziku.
   *
   * Bez toga HR i EN dobiju različitu veličinu naslova: `fit()` dijeli
   * preostalu visinu, a odlomak legende se u dva jezika lomi u različit broj
   * redaka. Nevidljiva kopija (`[data-alt-legend]`) postoji samo za ovo
   * mjerenje, pa su obje verzije stranice identične.
   */
  const legendHeight = (el: HTMLElement) =>
    Math.max(
      el.querySelector<HTMLElement>('[data-legend]')?.offsetHeight ?? 0,
      el.querySelector<HTMLElement>('[data-alt-legend]')?.offsetHeight ?? 0,
    );

  const dotOf = (el: HTMLElement) => {
    const ds = el.querySelectorAll<HTMLElement>('[data-dot]');
    for (const d of ds) if (d.getClientRects().length) return d;
    return ds[0] || null;
  };

  const fimgOf = (el: HTMLElement) => {
    const img = el.querySelector<HTMLElement & { __f0?: [number, number] }>(
      '[data-media] img, [data-media] video',
    );
    if (!img) return null;
    if (!img.__f0) {
      const [c, b] = (img.dataset.filter || '1 1').split(/\s+/).map(Number);
      img.__f0 = [c || 1, b || 1];
    }
    return img;
  };

  /**
   * Prelijeva li naslov u širinu - uključujući mjerni blok drugog jezika.
   *
   * `[data-alt-head]` je apsolutno pozicioniran, pa NE ulazi u `scrollWidth`
   * roditelja; mora se pitati zasebno. Veličinu fonta nasljeđuje od naslova,
   * pa se skalira zajedno s njim i ne treba mu ništa postavljati.
   */
  const overflows = (el: HTMLElement) => {
    if (el.scrollWidth > el.clientWidth + 1) return true;
    for (const a of el.querySelectorAll<HTMLElement>('[data-alt-head]')) {
      if (a.scrollWidth > a.clientWidth + 1) return true;
    }
    return false;
  };

  /**
   * Najveća veličina naslova koja istovremeno: stane u širinu (u OBA jezika),
   * stane u raspoloživu visinu, i ne prelazi 2 retka na desktopu (4 na
   * mobitelu). Binarna pretraga jer je odnos veličine i broja redaka
   * stepenast.
   */
  function fit(text: HTMLElement, maxH: number) {
    let lo = 16;
    let hi = H * 0.62;
    for (let k = 0; k < 14; k++) {
      const mid = (lo + hi) / 2;
      text.style.fontSize = mid + 'px';
      // Visina retka se čita iz stvarnog stila, ne iz konstante: prored je
      // token (`--lh-headline`) i mijenja se u CSS-u, a broj redaka mora
      // pratiti. S ukucanom vrijednošću bi se to tiho raziđe.
      const lineH = parseFloat(getComputedStyle(text).lineHeight) || mid;
      const lines = Math.round(text.scrollHeight / lineH);
      const ok = text.scrollHeight <= maxH && !overflows(text) && lines <= (mobile ? 4 : 2);
      if (ok) lo = mid;
      else hi = mid;
    }
    text.style.fontSize = lo + 'px';
  }

  function measure() {
    W = window.innerWidth;
    H = window.innerHeight;
    G = 0.55 * W;
    D = 0.2 * W;
    mobile = W < 760;
    stage!.style.width = W + 'px';
    stage!.style.height = H + 'px';

    const pad = H * 0.07;
    const gap = Math.max(20, H * 0.035);
    const els = Array.from(track!.querySelectorAll<HTMLElement>('[data-scene]'));

    /**
     * Mobitel: veličina naslova po SKUPINI, ne po ekranu.
     *
     * Dizajn traži jednu veličinu na svim ekranima. Ispalo je da to sve
     * povuče na najgori slučaj: najuži naslov (Za partnere, „For those who")
     * i najgušća legenda spustili su i naslovnicu na istu, sitnu veličinu.
     *
     * Zato dvije skupine:
     *   hero - naslovnica. Sama u skupini, pa je najveća koju podnosi -
     *          ona je prvo što se vidi i mora dominirati.
     *   a - Voda, Kvaliteta, Fjaka. Naslov je glavni element ekrana i
     *       dobiva najveću veličinu koju sva tri podnose.
     *   b - Za partnere, Boje, Izvedbe, Kontakt. Naslov je naslov sekcije;
     *       ovdje legenda odnosno sadržaj nosi ekran.
     *
     * Unutar skupine je veličina jednaka, pa naslov ne poskakuje pri
     * listanju, a oba jezika daju isti broj i istu veličinu redaka.
     */
    const fsBy: Record<string, number> = {};
    if (mobile) {
      const groupOf = (el: HTMLElement) => el.dataset.hgroup ?? 'b';

      /** Najveća veličina koju podnosi naslov jednog ekrana. */
      const fitOne = (el: HTMLElement) => {
        const text = el.querySelector<HTMLElement>('[data-text]');
        if (!text) return Infinity;
        const sp = el.querySelector<HTMLElement>('[data-spacer]');
        const dot = dotOf(el);
        const side = el.querySelector<HTMLElement>('[data-side]');
        if (dot) dot.style.transform = 'none';
        if (sp) sp.style.width = '0px';
        const xt = side && side.offsetHeight ? side.offsetHeight + gap : 0;
        fit(text, H - HEADER - BOTTOM - pad * 2 - xt - legendHeight(el) - gap);
        return parseFloat(text.style.fontSize);
      };

      for (const name of ['hero', 'a', 'b']) {
        const sections = els.filter(
          (el) => !el.hasAttribute('data-clone') && groupOf(el) === name,
        );
        if (!sections.length) continue;

        const sizes = sections.map(fitOne).filter(Number.isFinite);
        let fs = sizes.length ? Math.min(...sizes) : H * 0.08;

        // Naslovi sekcija (`[data-head]`) ne prolaze kroz `fit()` - nemaju
        // fotografiju ni točku - ali moraju stati u širinu, pa ulaze ovdje.
        const nodes = sections.flatMap((el) =>
          Array.from(el.querySelectorAll<HTMLElement>('[data-text],[data-head]')),
        );

        // Drugi jezik se mjeri sam od sebe: `[data-alt-head]` je apsolutno
        // pozicioniran potomak naslova, pa `overflows()` gleda i njega.
        // Veličinu fonta mu se NE smije postavljati - mora je naslijediti,
        // inače se prestane skalirati zajedno s naslovom.
        for (const t of nodes) t.style.fontSize = fs + 'px';
        for (let k = 0; k < 14 && nodes.some(overflows); k++) {
          fs *= 0.96;
          for (const t of nodes) t.style.fontSize = fs + 'px';
        }
        fsBy[name] = fs;
      }

      // Klon prvog ekrana nosi veličinu svoje skupine.
      for (const el of els) {
        if (!el.hasAttribute('data-clone')) continue;
        const fs = fsBy[groupOf(el)];
        if (!fs) continue;
        for (const t of el.querySelectorAll<HTMLElement>('[data-text],[data-head]')) {
          t.style.fontSize = fs + 'px';
        }
      }
    }

    for (const el of els) {
      const text = el.querySelector<HTMLElement>('[data-text]');
      const lg = el.querySelector<HTMLElement>('[data-legend]');
      const dot = dotOf(el);
      const sp = el.querySelector<HTMLElement>('[data-spacer]');
      for (const d of el.querySelectorAll<HTMLElement>('[data-dot]')) d.style.transform = 'none';
      if (sp) sp.style.width = '0px';
      if (!text) continue;

      const lgH = legendHeight(el);
      const side = mobile ? el.querySelector<HTMLElement>('[data-side]') : null;
      const xt = side && side.offsetHeight ? side.offsetHeight + gap : 0;
      const avail = H - HEADER - BOTTOM - pad * 2 - xt;
      const fsGroup = mobile ? fsBy[el.dataset.hgroup ?? 'b'] : 0;
      if (fsGroup) text.style.fontSize = fsGroup + 'px';
      else fit(text, avail - lgH - gap);

      const tH = text.offsetHeight;
      // Desktop centrira blok u raspoloživoj visini; mobitel ga sidri na vrh,
      // da naslov ne skače između ekrana i jezika.
      const y = HEADER + pad + xt + (mobile ? 0 : Math.max(0, (avail - (tH + gap + lgH)) / 2));
      text.style.marginTop = y + 'px';
      if (lg) lg.style.top = y + tH + gap + 'px';

      if (dot && sp) {
        const b = dot.getBoundingClientRect();
        const eb = el.getBoundingClientRect();
        const cxl = b.left - eb.left + b.width / 2;
        const cy = b.top - eb.top + b.height / 2;
        const rEnd = cover(cxl - G - D, cy);
        sp.style.width = Math.ceil(Math.max(0, cxl + rEnd + 0.2 * W - el.offsetWidth)) + 'px';
      }
    }

    scenes = els.map((el) => {
      const dot = dotOf(el);
      let cx = 0;
      let cy = 0;
      let r0 = 1;
      if (dot) {
        const b = dot.getBoundingClientRect();
        const eb = el.getBoundingClientRect();
        cx = el.offsetLeft + (b.left - eb.left + b.width / 2);
        cy = b.top - eb.top + b.height / 2;
        r0 = Math.max(1, dot.offsetWidth / 2);
      }
      return {
        el,
        left: el.offsetLeft,
        width: el.offsetWidth,
        fill: el.querySelector<HTMLElement>('[data-fill]'),
        media: el.querySelector<HTMLElement>('[data-media]'),
        legend: el.querySelector<HTMLElement>('[data-legend]'),
        side: el.querySelector<HTMLElement>('[data-side]'),
        dot,
        fimg: fimgOf(el),
        exp: el.dataset.exp ? parseFloat(el.dataset.exp) : 3,
        cx,
        cy,
        r0,
      };
    });

    // Šavovi: sekcije se preklapaju -4 px, pa se na spoju podmeće po 4 px
    // pune boje svake strane. Bez toga se na nekim zoom razinama vidi linija.
    // Elementi, ne innerHTML sa `style` atributom: CSP je `style-src 'self'`
    // bez `unsafe-inline`, pa bi atribut u markupu bio odbačen. Postavljanje
    // `el.style.*` iz JS-a politika ne dira.
    if (seams) {
      seams.textContent = '';
      seams.style.zIndex = '5';
      for (let k = 1; k < scenes.length; k++) {
        const x = scenes[k].left;
        for (const [at, bg] of [
          [x - 4, scenes[k - 1].el.dataset.bg],
          [x, scenes[k].el.dataset.bg],
        ] as [number, string | undefined][]) {
          const i = document.createElement('i');
          i.style.position = 'absolute';
          i.style.top = '0';
          i.style.height = '100%';
          i.style.width = '4px';
          i.style.left = at + 'px';
          i.style.background = bg || '#0B1622';
          seams.appendChild(i);
        }
      }
    }

    // Mobitel: poravnaj naslove ne-knockout ekrana na istu y-os.
    if (mobile) {
      const yT = HEADER + pad;
      for (const head of track!.querySelectorAll<HTMLElement>('[data-head]')) {
        const sec = head.closest<HTMLElement>('[data-scene]');
        const cont = sec?.firstElementChild as HTMLElement | null;
        if (!cont) continue;
        const now = head.getBoundingClientRect().top - sec!.getBoundingClientRect().top;
        const pt = parseFloat(getComputedStyle(cont).paddingTop) || 0;
        cont.style.paddingTop = Math.max(0, pt + (yT - now)) + 'px';
      }
    }

    // Blokovi koji se smiju smanjiti ako ne stanu u visinu (Boje, Izvedbe).
    for (const box of track!.querySelectorAll<HTMLElement>('[data-fitbox]')) {
      const inner = box.querySelector<HTMLElement>('[data-fit]');
      if (!inner) continue;
      inner.style.cssText = '';
      const availH = box.clientHeight;
      const bw = box.clientWidth;
      const need = inner.scrollHeight;
      const k = need > availH && availH > 0 ? availH / need : 1;
      if (k < 1) {
        inner.style.position = 'absolute';
        inner.style.left = '0';
        inner.style.top = '0';
        inner.style.width = bw / k + 'px';
        inner.style.transform = `scale(${k})`;
        inner.style.transformOrigin = 'top left';
      }
    }

    const cl = scenes.find((c) => c.el.hasAttribute('data-clone'));
    L = cl ? cl.left : track!.scrollWidth;
    n = scenes.length - (cl ? 1 : 0);
    max = Math.max(0, L - W);

    const st: number[] = [];
    for (const c of scenes.slice(0, n)) {
      st.push(c.left);
      if (c.dot) st.push(c.left + G + D * 0.5);
    }
    stops = st.map((v) => Math.max(0, Math.min(max, v))).sort((x, y) => x - y);

    if (!loop) {
      target = Math.min(target, max);
      cur = Math.min(cur, max);
    } else {
      target = ((target % L) + L) % L;
      cur = ((cur % L) + L) % L;
    }
  }

  const videos = () => Array.from(track!.querySelectorAll<HTMLVideoElement>('[data-media] video'));

  function tick() {
    if (!W) return;
    if (tween) {
      const p = Math.min(1, (performance.now() - tween.t0) / tween.dur);
      cur = tween.from + (tween.to - tween.from) * easeInOut(p);
      if (p >= 1) {
        cur = target = tween.to;
        tween = null;
      }
    } else {
      const diff = target - cur;
      cur = Math.abs(diff) < 0.3 ? target : cur + diff * 0.08;
    }

    if (loop && L) {
      if (cur >= L) {
        cur -= L;
        target -= L;
        const [a, b] = videos();
        if (a && b) try { a.currentTime = b.currentTime; } catch { /* medij još nije spreman */ }
      } else if (cur < 0) {
        cur += L;
        target += L;
        const [a, b] = videos();
        if (a && b) try { b.currentTime = a.currentTime; } catch { /* medij još nije spreman */ }
      }
    }

    const dpr = window.devicePixelRatio || 1;
    const px = (v: number) => Math.round(v * dpr) / dpr;
    const e0 = 0.03 * W;

    track!.style.transform = `translate3d(${px(-cur)}px,0,0)`;
    if (prog) prog.style.width = (loop ? (L ? (cur / L) * 100 : 0) : max ? (cur / max) * 100 : 0) + '%';

    let active = 0;
    for (let k = 0; k < scenes.length; k++) {
      const c = scenes[k];
      if (c.left <= cur + W * 0.5) active = k;
      const vis = c.left < cur + W && c.left + c.width > cur;
      if (!vis) continue;

      // Medij se pomiče suprotno od trake, pa fotografija stoji mirno u
      // viewportu dok sekcija klizi preko nje.
      if (c.media) c.media.style.transform = `translate3d(${px(cur) - c.left}px,0,0)`;

      if (!c.dot) continue;
      const u = cur - c.left;
      const sx = c.cx - cur;

      let r: number;
      if (reduced) r = cover(sx, c.cy); // bez animacije: fotografija odmah cijela
      else if (u <= e0) r = c.r0;
      else if (u < G) r = c.r0 + (cover(sx, c.cy) - c.r0) * Math.pow((u - e0) / (G - e0), c.exp);
      else if (u < G + D) r = cover(sx, c.cy);
      else r = cover(c.cx - c.left - G - D, c.cy);

      // Krug crta `clip-path` preko plohe pune veličine, a ne `scale()` na
      // samoj točki. Skaliranje 6 px točke na dijagonalu ekrana znači
      // uvećanje od par stotina puta - preglednik rasterizira rub jednom pa
      // ga razvlači, i rub postane nazubljen. `clip-path` se računa
      // analitički svaki frame, pa je rub oštar na svakoj veličini.
      if (c.fill) {
        c.fill.style.clipPath = `circle(${r.toFixed(2)}px at ${(c.cx - c.left).toFixed(2)}px ${c.cy.toFixed(2)}px)`;
      }

      if (c.fimg) {
        // `q` ide 0 -> 1 kako krug raste. Na 0 (snimka vidljiva samo kroz
        // slova) stoji obrada iz `data-filter`: smanjen kontrast i podignuta
        // svjetlina, inače se tamni kadar u slovima ne čita.
        //
        // Na 1 (snimka preko cijelog ekrana) filtra NEMA. Prije je i tu
        // ostajao pojačani kontrast/zasićenje - vidjelo se kao preljev preko
        // videa. Puni kadar se gleda kakav je snimljen.
        const q = reduced ? 1 : u <= e0 ? 0 : Math.min(1, (u - e0) / (G * 0.8 - e0));
        const f0 = c.fimg.__f0!;
        const fs =
          `contrast(${(f0[0] + (1 - f0[0]) * q).toFixed(3)}) ` +
          `brightness(${(f0[1] + (1 - f0[1]) * q).toFixed(3)}) ` +
          `saturate(1)`;
        if (c.fimg.__fs !== fs) {
          c.fimg.__fs = fs;
          c.fimg.style.filter = fs;
        }
      }

      if (c.legend) {
        const o = reduced ? 1 : u <= e0 ? 1 : Math.max(0, 1 - (u - e0) / (0.32 * G - e0));
        c.legend.style.opacity = String(o);
        c.legend.style.visibility = o === 0 ? 'hidden' : 'visible';
        if (c.side) {
          c.side.style.opacity = String(o);
          c.side.style.visibility = o === 0 ? 'hidden' : 'visible';
        }
      }
    }

    active = active % (n || 1);
    if (active !== sc) {
      sc = active;
      if (numEl) numEl.textContent = String(sc + 1).padStart(2, '0') + ' / 08';
      if (nameEl) nameEl.textContent = sceneNames[sc] || '';

      const id = sceneIds[sc];
      for (const a of navLinks) {
        a.setAttribute('aria-current', String(Number(a.dataset.nav) === sc));
      }
      // Prebacivanje jezika je puni odlazak na drugu rutu, pa mora ponijeti
      // ekran sa sobom - inače posjetitelj uvijek ispadne na naslovnici.
      // Sidro se prevodi: s `/#water` se ide na `/hr#voda`, ne na `/hr#water`,
      // jer to drugo sidro u hrvatskoj verziji ne postoji.
      if (id) {
        for (const a of langLinks) {
          a.hash = langHashes[a.dataset.langLink || '']?.[sc] || id;
        }
        // Tko dođe na golu adresu, neka je takvu i vidi. Prije se već na
        // prvom kadru upisivalo `#mir` / `#quiet`, pa je adresa koju
        // posjetitelj kopira ili podijeli nosila sidro koje nije tražio.
        // Sidro se upisuje tek kad ode s prvog ekrana - ili ako ga je
        // donio sam.
        if (sc !== 0 || location.hash) history.replaceState(null, '', '#' + id);
      }
    }

    const now = Date.now();
    if (canStore() && now - lastSave > 500 && savedX !== Math.round(target)) {
      lastSave = now;
      savedX = Math.round(target);
      try { localStorage.setItem('tquilo.D2.x', String(savedX)); } catch { /* storage blokiran */ }
    }
  }

  const setTarget = (x: number) => {
    moved = true;
    target = loop ? x : Math.max(0, Math.min(max, x));
  };

  function step(dir: number) {
    tween = null;
    if (!loop) {
      if (dir > 0) {
        const next = stops.find((v) => v > target + 8);
        setTarget(next === undefined ? max : next);
      } else {
        const prev = [...stops].reverse().find((v) => v < target - 8);
        setTarget(prev === undefined ? 0 : prev);
      }
      return;
    }
    const base = Math.floor(target / L) * L;
    const t = target - base;
    if (dir > 0) {
      const next = stops.find((v) => v > t + 8);
      target = base + (next === undefined ? L : next);
    } else {
      const prev = [...stops].reverse().find((v) => v < t - 8);
      target = prev === undefined ? base - L + stops[stops.length - 1] : base + prev;
    }
  }

  function goScene(k: number) {
    const c = scenes[k];
    if (!c) return;
    const to = loop ? Math.floor(target / L) * L + c.left : Math.max(0, Math.min(max, c.left));
    glideTo(to);
  }

  /* ------------------------------------------------------------- unos */

  const onWheel = (e: WheelEvent) => {
    if (e.ctrlKey) return; // zoom prstima na trackpadu ostaje zoom
    e.preventDefault();
    tween = null;
    const d = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    setTarget(target + d * (e.deltaMode === 1 ? 32 : 1) * 1.7);
  };

  const onKey = (e: KeyboardEvent) => {
    const t = e.target as HTMLElement | null;
    if (/INPUT|TEXTAREA|SELECT/.test(t?.tagName || '')) return;
    // Razmak i strelice pripadaju traci pristanka dok je otvorena, ne sceni.
    if (t?.closest?.('[data-no-nav]')) return;
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(e.key)) {
      e.preventDefault();
      step(1);
    } else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) {
      e.preventDefault();
      step(-1);
    } else if (e.key === 'Home') goScene(0);
    else if (e.key === 'End') goScene((n || 1) - 1);
  };

  let tx = 0;
  let ty = 0;
  let t0: number | undefined;
  const onTS = (e: TouchEvent) => {
    tween = null;
    tx = e.touches[0].clientX;
    ty = e.touches[0].clientY;
    t0 = target;
  };
  const onTM = (e: TouchEvent) => {
    const t = e.touches[0];
    const dx = tx - t.clientX;
    const dy = ty - t.clientY;
    tx = t.clientX;
    ty = t.clientY;
    setTarget(target + (Math.abs(dx) > Math.abs(dy) ? dx : dy) * 2);
  };
  const onTE = () => {
    if (t0 === undefined) return;
    const d = target - t0;
    target = t0;
    t0 = undefined;
    if (Math.abs(d) > 24) step(d > 0 ? 1 : -1);
  };

  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('keydown', onKey);
  window.addEventListener('touchstart', onTS, { passive: true });
  window.addEventListener('touchmove', onTM, { passive: true });
  window.addEventListener('touchend', onTE, { passive: true });
  window.addEventListener('resize', measure);

  for (const el of root.querySelectorAll<HTMLElement>('[data-go]')) {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      goScene(Number(el.dataset.go));
    });
  }
  root.querySelector<HTMLElement>('[data-next]')?.addEventListener('click', () => step(1));
  root.querySelector<HTMLElement>('[data-prev]')?.addEventListener('click', () => step(-1));

  /**
   * Postavi traku na ekran iz adrese.
   *
   * ⚠ MORA SE PONOVITI. Prva izmjera ide prije nego fontovi slegnu, pa su
   * sekcije još uske: `scenes[7].left` je tada 644 px umjesto 15392. Pin na
   * tu vrijednost završi natrag na prvom ekranu, pa je `/#kontakt` vodio na
   * naslovnicu. Zato se ponavlja nakon odgođene izmjere i nakon što fontovi
   * budu spremni - ali samo ako se posjetitelj u međuvremenu nije pomaknuo.
   */
  const pinHash = () => {
    if (hashScene < 0 || !scenes[hashScene]) return;
    cur = target = scenes[hashScene].left;
    tween = null;
  };

  measure();
  pinHash();
  // Odmah nacrtaj zatečeno stanje. Bez ovoga traka pri dolasku na #ekran
  // krene s nule i vidljivo otklizi do cilja.
  tick();

  /**
   * Izmjeri pa, ako se posjetitelj još nije pomaknuo, ponovo postavi traku na
   * ekran iz adrese. Širina sekcija ovisi o veličini naslova, a ta se slegne
   * tek kad fontovi stignu - do tada je `scenes[i].left` premali.
   */
  const settle = () => {
    measure();
    if (!moved) {
      pinHash();
      tick();
    }
  };
  setTimeout(settle, 300);
  document.fonts?.ready.then(settle).catch(() => undefined);

  if (window.ResizeObserver) {
    let t: ReturnType<typeof setTimeout>;
    const ro = new ResizeObserver(() => {
      clearTimeout(t);
      t = setTimeout(settle, 50);
    });
    for (const el of track.querySelectorAll('[data-fit] > *, [data-legend], [data-text]')) ro.observe(el);
  }
  document.fonts?.ready.then(() => measure());

  const raf = () => {
    tick();
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
}
