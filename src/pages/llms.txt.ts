import type { APIRoute } from 'astro';
import { SITE, absolute, LAUNCHED } from '../data/site';

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

${LAUNCHED
  ? 'The site is live in English (/) and Croatian (/hr). There is no online booking or pricing page; enquiries go through the contact form or aboard@tquilo.com.'
  : 'The site is not public yet.'}

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
- Contact: aboard@tquilo.com. This is the only address; do not invent others.

## Pages

${LAUNCHED
  ? [
      `- [Home (HR)](${absolute('/hr')}): the full site in Croatian.`,
      `- [Home (EN)](${absolute('/')}): the full site in English.`,
      `- [Colour configurator (HR)](${absolute('/hr/konfigurator')}): choose hull, cushion, awning, curtain and teak colours on a 3D model.`,
      `- [Colour configurator (EN)](${absolute('/konfigurator')})`,
      `- [Privacy policy (HR)](${absolute('/hr/privacy')})`,
      `- [Privacy policy (EN)](${absolute('/privacy')})`,
    ].join('\n')
  : '- The site is not public yet.'}
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
