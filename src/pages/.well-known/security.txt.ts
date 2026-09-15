import type { APIRoute } from 'astro';
import { SITE, absolute } from '../../data/site';

/**
 * security.txt po RFC 9116.
 *
 * Generira se, a ne piše ručno, zbog `Expires`: RFC traži datum isteka, a
 * statična datoteka s ručno upisanim datumom nečujno zastari. Ovako se rok
 * pomiče na svaki build — godinu dana od zadnjeg deploya.
 */
export const GET: APIRoute = () => {
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);

  const body = `# Sigurnosni kontakt za ${SITE.url}
# https://securitytxt.org / RFC 9116

Contact: mailto:${SITE.securityEmail}
Expires: ${expires.toISOString().replace(/\.\d{3}Z$/, 'Z')}
Preferred-Languages: hr, en
Canonical: ${absolute('/.well-known/security.txt')}
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
