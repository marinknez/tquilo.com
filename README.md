# tquilo.com — coming soon

Statična *coming soon* stranica za T'quilo, izgrađena iz priloženih design
fajlova (`ComingSoon.dc.html` + T'quilo Design System).

**Stack:** Astro 7 · Tailwind CSS 4 · bez JavaScripta na klijentu.
**Hosting:** Hostinger, auto-deploy s GitHuba (`deploy` grana = web root).

---

## Pokretanje

```bash
npm install
npm run dev        # dev server
npm run build      # produkcijski build u dist/
npm run preview    # posluži dist/ lokalno
npm run check      # astro check (TypeScript)
npm run assets     # regeneriraj fontove, logotipe, ikone i OG sliku
```

## Struktura

| Putanja | Što je |
| --- | --- |
| `src/data/site.ts` | **jedini izvor istine** — URL, naziv, opisi, e-mail, OG slika, datum lansiranja |
| `src/pages/index.astro` | coming soon stranica (port `ComingSoon.dc.html`) |
| `src/pages/404.astro` | 404, u istom brand jeziku |
| `src/pages/robots.txt.ts` · `llms.txt.ts` · `site.webmanifest.ts` · `.well-known/security.txt.ts` | generirani tekstualni resursi |
| `src/styles/global.css` | design tokeni preslikani u Tailwind `@theme` |
| `src/components/` | `Wordmark`, `Tag`, `Seo` — portovi komponenti iz design systema |
| `brand/` | **izvorni** assetovi: licencirani TTF-ovi i logo SVG-ovi |
| `public/` | ono što ide u build 1:1 — generirani fontovi, ikone, OG slika, `.htaccess` |
| `scripts/prepare-assets.mjs` | brand pipeline (`npm run assets`) |
| `_deploy.bat` | build + push na `main` i `deploy` |

`_design/` i `*.zip` su u `.gitignore` — to su originalni paketi (34 MB).
Sve što build treba iz njih kopirano je u `brand/` i commitano.

## Brand pipeline (`npm run assets`)

Pokreće se **ručno**, kad se promijene izvorni assetovi — ne pri svakom
buildu. Izlaz je commitan u `public/`, pa deploy ne ovisi o `sharp` ni
`harfbuzz` binarijima.

Što radi:

1. **Fontovi** — Marcellus + Archivo TTF → subsetirani WOFF2
   (latinica + hrvatska dijakritika + tipografski znakovi).
   **680 kB → 31 kB.** Archivo zadržava varijabilnu os `wght` 300–600,
   `wdth` je pinnan na 100 — točno raspon koji brand koristi.
2. **Logotipi** — SVG-ovi iz design systema nose ugrađen C2PA manifest
   (~8 kB base64 po datoteci) koji preglednik ignorira. Skida se:
   **13 kB → 5 kB** po datoteci.
3. **Rasterski derivati** — favicon, apple-touch-icon, maskable ikona za
   Android i 1200 × 630 OG slika (renderirana iz istih tokena i fontova
   kao stranica, bez ovisnosti o fontovima na build stroju).

## SEO, AI SEO i social

- **Meta** — title, description, canonical, `robots` s `max-image-preview:large`.
- **Open Graph + Twitter** — `summary_large_image`, apsolutni URL-ovi,
  dimenzije i alt tekst slike.
- **Structured data** — jedan JSON-LD `@graph`: `Organization` → `WebSite` →
  `WebPage`, povezani preko `@id`. Jedna koherentna tvrdnja o brendu umjesto
  tri odvojene.
- **Sitemap** — `@astrojs/sitemap`, 404 je filtriran van.
- **`robots.txt`** — generiran iz `SITE.url`; AI crawleri (GPTBot, ClaudeBot,
  PerplexityBot, Google-Extended, …) su **izričito dopušteni**, poimence.
- **`llms.txt`** — strojno čitljiv sažetak proizvoda za jezične modele.
  Činjenice su iz design system readmea §1; ako se proizvod promijeni,
  mijenja se i ovdje.
- **Ikone i manifest** — favicon (ICO + SVG), apple-touch-icon,
  192/512 + maskable, `site.webmanifest` s brand bojama.

## Sigurnost

Sve je u `public/.htaccess` (završi u `dist/` pri svakom buildu):

- **CSP** `default-src 'none'` s eksplicitnim dopuštenjima. Stranica nema
  inline skripte, inline stilove ni vanjske domene, pa je to izvedivo bez
  `unsafe-inline`. **Ako se doda analitika ili forma, mijenja se ovdje —
  ne dodavati `unsafe-inline`.**
- **HSTS** 2 godine, `includeSubDomains`, `preload`.
  ⚠ Preload lista se teško poništava — uključiti tek kad HTTPS radi na svim
  subdomenama.
- `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`,
  `X-Permitted-Cross-Domain-Policies`.
- **COOP / COEP / CORP** — izolacija konteksta. Slike imaju iznimku
  (`cross-origin`), inače ih social scraperi ne mogu dohvatiti.
- **Permissions-Policy** — svi senzori i uređaji ugašeni eksplicitno.
- Skrivene datoteke i konfiguracijski otpad blokirani; `/.well-known/` je
  iznimka (security.txt, ACME challenge).
- `/.well-known/security.txt` po RFC 9116. `Expires` se pomiče na svaki
  build — statična datoteka bi nečujno zastarjela.

## Deploy

```bash
_deploy.bat
```

1. Build **prije** pusha — ako build pukne, na GitHub ne ode ništa.
2. Izvor → `main` (bez `dist/`).
3. `dist/` → `deploy` grana, **fast-forward**, uz nastavak postojeće povijesti.
   Hostinger radi `git pull` nad kloniranim repoom; force-push bi mu razbio
   povijest i auto-deploy bi tiho prestao raditi.
4. `--allow-empty` commit i kad je build identičan — inače GitHub ne pošalje
   webhook i Hostinger ne povuče ništa.

Hostinger postavke: repo `marinknez/tquilo.com`, grana **`deploy`**,
web root = korijen grane.

## Prije lansiranja — provjeriti

- [ ] `SITE.email` (`hello@tquilo.com`) i `SITE.securityEmail`
      (`security@tquilo.com`) u `src/data/site.ts` — aliasi moraju postojati.
- [ ] `SITE.social` — dodati profile kad postoje; `sameAs` se tada pojavi u
      JSON-LD-u.
- [ ] Datum lansiranja (`SITE.launch`) — trenutno *October 2026*.
- [ ] HSTS `preload` u `.htaccess` — ostaviti samo ako HTTPS radi na svim
      subdomenama.
- [ ] Google Search Console + Bing Webmaster Tools: prijaviti sitemap.

## Licence

Marcellus i Archivo su SIL OFL 1.1; licence putuju uz binarije
(`brand/fonts/*-OFL.txt`, kopirane i u `public/fonts/`).
