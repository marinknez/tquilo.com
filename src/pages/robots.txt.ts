import type { APIRoute } from 'astro';
import { SITE, absolute } from '../data/site';

/**
 * robots.txt se generira, ne piše ručno - sitemap URL i host moraju pratiti
 * `SITE.url` iz jednog mjesta.
 *
 * Politika: sve je dopušteno, uključujući AI crawlere. Coming soon stranica
 * nema što skrivati, a brend je nov - indeksiranje u LLM-ovima (ChatGPT,
 * Perplexity, Claude, Gemini) je ovdje korist, ne rizik. AI botovi su
 * ispisani poimence umjesto da se oslone na `User-agent: *`, jer neki od njih
 * čitaju samo vlastito pravilo - i da se politika kasnije mijenja po botu.
 */

const AI_CRAWLERS = [
  // Trening i indeks
  'GPTBot',
  'ClaudeBot',
  'Claude-Web',
  'anthropic-ai',
  'Google-Extended',
  'Applebot-Extended',
  'PerplexityBot',
  'CCBot',
  'Bytespider',
  'Meta-ExternalAgent',
  'Amazonbot',
  'cohere-ai',
  'Diffbot',
  'Timpibot',
  // Dohvat na zahtjev korisnika (odgovori s citatom)
  'ChatGPT-User',
  'OAI-SearchBot',
  'Claude-User',
  'Claude-SearchBot',
  'PerplexityBot-User',
  'DuckAssistBot',
  'MistralAI-User',
];

export const GET: APIRoute = () => {
  const body = [
    '# https://www.robotstxt.org/robotstxt.html',
    `# ${SITE.name} - ${SITE.url}`,
    '',
    'User-agent: *',
    'Allow: /',
    '',
    '# AI crawleri i asistenti - izričito dopušteni.',
    ...AI_CRAWLERS.flatMap((ua) => [`User-agent: ${ua}`, 'Allow: /', '']),
    `Sitemap: ${absolute('/sitemap-index.xml')}`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
