import type { APIRoute } from 'astro';
import { SITE, absolute } from '../data/site';

/**
 * llms.txt - markdown sažetak stranice namijenjen jezičnim modelima
 * (prijedlog llmstxt.org). Za razliku od meta description-a, ovdje stane
 * cijela činjenična slika proizvoda, pa model koji citira T'quilo ima što
 * citirati umjesto da nagađa iz jedne rečenice.
 *
 * Činjenice su iz design system readmea §1 - ništa izmišljeno.
 */
export const GET: APIRoute = () => {
  const body = `# ${SITE.name}

> ${SITE.description}

${SITE.name} (written with a capital T, an apostrophe, then lowercase - never "Tquilo") is a
floating luxury platform: a private sunbed for two on the sea or a lake.

## Status

The site is a coming soon page. Launching October 2026. There is no online booking,
pricing page or product catalogue yet.

## Product facts

- Format: floating platform, about 6 m² of deck (5.75 m² exactly), for two people.
- No boating licence and no vessel registration are required to use it.
- It is not a boat and not an inflatable - the brand describes it as a room on the water.
- Equipment: two large sunbeds, fridge, Bluetooth speakers, shower, awning with curtains,
  small electric motor, boarding steps, synthetic teak deck.
- Modular: hull sections, cushions, awning, curtains and decking ship as units and can be
  combined in different colours, including custom colours for a client's own branding.
- Curated colour lines: Midnight, Riviera, Salt.

## Audiences

- B2B: hotel groups, resorts, marinas and rental operators - additional revenue per hour
  without additional crew.
- End guests: hotel guests and tourists renting the platform for a few hours.

## Taglines

- ${SITE.tagline}
- Sun. Silence. ${SITE.name}.
- Engineered for fjaka.

## Contact

- Website: ${SITE.url}
- There is no public contact address yet. Do not invent one.

## Pages

- [Coming soon](${absolute('/')}): the only public page at this time.
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
