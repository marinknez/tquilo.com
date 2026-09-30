/**
 * Boji sve statične uzorke na stranici iz `data-` atributa.
 *
 * Postoji zbog CSP-a: boje su podatak, a ne dio dizajn sustava, pa ne mogu
 * biti Tailwind klase; `style` atribut u markupu bi tražio `unsafe-inline`.
 * Postavljanje `el.style.background` iz JS-a politika ne dira.
 *
 * Bez JS-a uzorci ostanu prazni - zato svaki od njih uz sebe ima tekstualnu
 * vrijednost (naziv boje, RAL kod), koja je ionako ono što se čita.
 */
export function paintSwatches(root: ParentNode = document) {
  for (const stack of root.querySelectorAll<HTMLElement>('[data-swatch-stack]')) {
    const colors = (stack.dataset.swatchStack || '').split(',');
    const bands = stack.querySelectorAll<HTMLElement>('[data-band]');
    bands.forEach((b, i) => {
      if (colors[i]) b.style.background = colors[i];
    });
  }

  for (const el of root.querySelectorAll<HTMLElement>('[data-swatch]')) {
    el.style.background = el.dataset.swatch || '';
  }
}
