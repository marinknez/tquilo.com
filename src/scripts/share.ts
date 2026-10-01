/**
 * Dijeljenje stranice.
 *
 * `navigator.share` otvara SISTEMSKI izbornik za dijeljenje - isti koji
 * posjetitelj već zna iz ostatka uređaja, s njegovim aplikacijama i
 * kontaktima. Nema ikona Facebooka i X-a, nema tuđih skripti, nema kolačića.
 *
 * ⚠ POSTOJI SAMO NA MOBITELU I U DIJELU DESKTOP PREGLEDNIKA. Na Chromeu za
 * Windows i Mac postoji, na Firefoxu za desktop ne. Zato zamjena: kopiranje
 * adrese u međuspremnik, pa `prompt()` ako je i to blokirano. Nešto se dogodi
 * uvijek - gumb koji ponekad ne radi gori je od nikakvog.
 *
 * Dijeli se `location.href`, dakle i sidro trenutnog ekrana: tko dijeli s
 * ekrana Boje, šalje poveznicu koja otvara Boje.
 */
type ShareLabels = {
  /** Poruka nakon kopiranja, kad sistemskog izbornika nema. */
  copied: string;
  /** Naslov `prompt()` prozora kad je i međuspremnik blokiran. */
  copy: string;
};

export type ShareResult = 'shared' | 'copied' | 'prompted' | 'cancelled' | 'failed';

export function initShare(
  root: ParentNode = document,
  labels: ShareLabels,
  onResult?: (r: ShareResult) => void,
) {
  const buttons = root.querySelectorAll<HTMLElement>('[data-share]');
  if (!buttons.length) return;

  const say = (r: ShareResult) => onResult?.(r);

  for (const btn of buttons) {
    btn.addEventListener('click', async () => {
      const data = {
        title: document.title,
        text: document.querySelector<HTMLMetaElement>('meta[name=description]')?.content ?? '',
        url: location.href,
      };

      if (navigator.share) {
        try {
          await navigator.share(data);
          say('shared');
          return;
        } catch (e) {
          // Posjetitelj je zatvorio izbornik - to nije greška i ne smije
          // pasti u zamjenu, inače mu nakon odustajanja adresa tiho završi
          // u međuspremniku.
          if (e instanceof DOMException && e.name === 'AbortError') {
            say('cancelled');
            return;
          }
        }
      }

      try {
        await navigator.clipboard.writeText(location.href);
        say('copied');
        return;
      } catch {
        /* međuspremnik traži sigurni kontekst, dopuštenje i fokus */
      }

      // ⚠ `prompt()` nije svugdje dostupan - u dijelu ugrađenih webviewa i u
      // automatiziranim preglednicima BACA. Bez ovog hvatanja cijeli rukovatelj
      // padne na neuhvaćenoj iznimci i posjetitelj ne dobije baš nikakvu
      // povratnu informaciju; gumb izgleda kao da ne radi.
      try {
        window.prompt(labels.copy, location.href);
        say('prompted');
      } catch {
        say('failed');
      }
    });
  }

  return labels;
}
