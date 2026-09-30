# tquilo.com

**Stack:** Astro 7 · Tailwind CSS 4 · three.js · TypeScript.
**Hosting:** Hostinger, auto-deploy s GitHuba (`deploy` grana = web root).

Dvije stvari u jednom repozitoriju:

1. **Coming soon** stranica na korijenu - trenutno jedino što je javno.
2. **Puni site** na `/hr` i `/en`: vodoravna prezentacija od osam ekrana +
   konfigurator boja s 3D modelom. Izgrađen, ali još ne javan.

---

## ⚠ Prekidač lansiranja

```ts
// src/data/site.ts
export const LAUNCHED = false;
```

| | `false` (sada) | `true` |
| --- | --- | --- |
| `/` | coming soon | puni site |
| `/hr`, `/en` | grade se, ali `noindex, nofollow` | u indeksu |
| `sitemap.xml` | samo `/` | sve rute |
| `robots.txt` | `Disallow: /hr` i `/en` | sve dopušteno |
| `llms.txt` | opisuje coming soon | popisuje stranice |

Mijenja se **samo ta jedna varijabla**. Sve ostalo je prati.

## Pokretanje

```bash
npm install
npm run dev          # dev server
npm run build        # produkcijski build u dist/
npm run preview      # posluži dist/ lokalno
npm run check        # astro check (TypeScript)
npm run assets       # regeneriraj SVE assete (brand + web)
npm run assets:web   # samo fotografije, video, ikone, logotipi
```

## Struktura

| Putanja | Što je |
| --- | --- |
| `src/data/site.ts` | **izvor istine** - URL, naziv, opisi, pravna osoba, `LAUNCHED` |
| `src/data/palette.ts` | boje proizvoda: segmenti, linije, partnerske sheme |
| `src/data/ral.ts` | RAL Classic → hex (213 kodova) + najbliži RAL |
| `src/i18n/hr.json` · `en.json` | sav copy, uključujući mobilne prijelome (`mh`) |
| `src/pages/index.astro` | coming soon |
| `src/pages/[lang]/index.astro` | puni site, osam ekrana |
| `src/pages/[lang]/konfigurator.astro` | konfigurator boja |
| `src/scripts/stage.ts` | engine vodoravne prezentacije |
| `src/scripts/configurator/` | logika konfiguratora + 3D model |
| `src/components/scenes/` | osam ekrana |
| `src/components/Knockout.astro` | naslov kao prozor na fotografiju |
| `brand/` · `images/` · `_design/` | izvorni materijali (`_design` je u gitignoreu) |
| `src/scripts/contact.ts` | slanje kontakt forme na Web3Forms |

## Vodoravna prezentacija

Port ponašanja iz `design/TQuilo Web.dc.html` u vanilla TS, bez frameworka.
Stranica se ne skrola - `body` je fiksan, a traka se pomiče transformom.

- **Pomicanje:** `cur += (target - cur) · 0.08` po frameu.
- **Točka:** završna točka naslova je pravi element. Raste od svog polumjera
  do onog koji prekrije viewport (ease `p³`), zadrži se, pa otplovi.
- **Knockout:** foto/video preko crne plohe s `mix-blend-multiply`, pa Abyss
  preko svega s `mix-blend-lighten`. Slika se vidi samo kroz slova.
  Svijetli ekran (Za partnere) okreće logiku: `screen` + `darken`.
- **Fit naslova:** binarna pretraga najveće veličine koja stane u širinu i
  visinu i ne prelazi 2 retka (desktop) / 4 (mobitel).
- **Petlja:** klon prvog ekrana iza osmog; na granici se oduzme duljina trake
  i sinkronizira vrijeme dvaju hero videa.

### Zamke na koje sam naletio

- **`z-index` na tekstualnom bloku ubija knockout.** Redoslijed slaganja mora
  ostati redoslijed u DOM-u: tekst < medij < tint < legenda.
- **Točka mora biti UNUTAR zadnjeg retka naslova.** Retci su na mobitelu
  `block`; točka izvan njih pada u vlastiti red, fit misli da naslov ima redak
  više i smanji ga do minimuma (16 px umjesto 52 px).
- **Legenda se pozicionira prema sekciji, a sekcija je šira od ekrana** (zbog
  spacera za točku). Bez `w-[84vw]` legenda se rastegne na 2660 px.
- **Šavovi moraju biti iznad sekcija** (`z-index: 5`), a traka mora biti
  `position: relative` da se računaju u njezinim koordinatama. Inače se na
  spoju, gdje se sekcije preklapaju -4 px, vidi tamna traka.

### Dvije skupine veličine naslova (mobitel)

Dizajn traži jednu veličinu naslova na svim ekranima. U praksi to sve povuče
na najgori slučaj: najuži naslov (Za partnere, „For those who") i najgušća
legenda spustili su i naslovnicu na istu, sitnu veličinu - naslov je prestao
dominirati.

Zato su na mobitelu tri skupine (`data-hgroup` na sekciji):

| Skupina | Ekrani | 390×844 |
| --- | --- | --- |
| **hero** - naslovnica | Mir | **82,6 px** |
| **a** - naslov nosi ekran | Voda, Kvaliteta, Fjaka | **66,9 px** |
| **b** - naslov je naslov sekcije | Za partnere, Boje, Izvedbe, Kontakt | 52,6 px |

Unutar skupine je veličina jednaka, pa naslov ne poskakuje pri listanju.
Naslovnica je sama u skupini jer je prvo što se vidi i mora dominirati.
Skupinu **a** ograničava Fjaka: „Engineered" se ne da prelomiti, a u 328 px
sadržaja stane do 66,9 px.

Prijelomi u `mh` prilagođeni su tome - Kvaliteta je s 2 retka na 4, Fjaka s 2
na 3. **Broj redaka mora biti jednak u HR i EN** (provjereno za sve ključeve),
inače se dvije verzije razilaze.

### HR i EN moraju biti identični

Svaki je jezik zasebna ruta, pa se drugi jezik mora izmjeriti na skrivenim
kopijama:

- `[data-alt-head]` - prijelomi naslova drugog jezika (`Headline.astro`).
- `[data-alt-legend]` - legenda drugog jezika (`legends/Legend.astro`).
  Legenda se lomi u različit broj redaka, a `fit()` dijeli preostalu visinu,
  pa bez ovoga naslov dobije različito prostora u HR i EN.

**Prored** je token `--lh-headline` (1,06), a ne dizajnovih 0,98: na hrvatskoj
dijakritici (č, ž, š) i pri 80+ px kvačice gornjeg retka dodiruju verzale
donjeg. Engine broj redaka računa iz **stvarnog** `line-height`-a elementa, pa
se vrijednost mijenja samo u CSS-u i ne može se raziči s proračunom.

**Tri zamke pri mjerenju, sve tri koštale su sat vremena:**

1. **Ne `overflow: hidden` na mjernom bloku.** Preljev se odsiječe i
   `scrollWidth` zauvijek ostane jednak `clientWidth`. Koristi se
   `visibility: hidden` + `height: 0`.
2. **Ne postavljati mu `font-size`.** Mora naslijediti od naslova, inače se
   prestane skalirati zajedno s njim i od druge `measure()` nadalje mjeri
   krivu veličinu.
3. **Točka mora biti u mjernom bloku, pripijena uz zadnje slovo.** Bez nje je
   zadnji redak uži za ~0,15 em; s novim redom u markupu ispred nje - širi za
   jedan razmak. Oboje daje krivu veličinu.

Izmjereno, HR i EN **identično** po veličini i broju redaka na svakom ekranu,
bez okomitog preljeva sadržaja na 360×740, 375×812, 390×844 i 412×915.
Na desktopu se svaki naslov fita zasebno, kako dizajn i traži.

## Konfigurator

Osam segmenata (trup gore/dolje, zaštita, jastuci, tenda, zavjese, tikovina,
ispuna), tri linije boja, pet partnerskih shema **bez imena partnera**.

- **Ručni unos:** `#RRGGBB`, `RRGGBB`, `RAL 7016`, `ral7016` ili `7016`.
  HEX prikaže najbliži RAL. Nepoznat unos vrati grešku, ne krivu boju.
- **Dijeljenje:** cijela konfiguracija je u hashu, `~RAL` sufiks čuva kod
  prilagođene boje. `history.replaceState` na svaku promjenu.
- **PDF:** nema servera ni biblioteke - popuni se blok za ispis (snimka 3D
  prikaza + tablica + URL) i pozove `window.print()`. Za pravi PDF s
  prijelomom trebao bi server.

### 3D model

**Parametarski, ne GLB - i to je svjesno odstupanje od handoffa.** Jedini
postojeći 3D izvori (`zen-*.glb`, 2,6-32 MB) su jednomrežni scanovi **bez
ijednog materijala**; iz njih se ne mogu izdvojiti osam nezavisno obojivih
grupa, a bez toga konfigurator nema što bojati. Parametarski model nema mrežu
za skinuti, svaka grupa ima svoj materijal, a geometrija je izvedena iz
fotografija u `images/`.

three.js se učitava lijeno (`IntersectionObserver` + sigurnosni timeout) jer
je najveći paket na stranici.

## Brand pipeline

Pokreće se ručno; izlaz je commitan, pa deploy ne ovisi o `sharp`, `ffmpeg`
ni `harfbuzz`.

| Što | Prije | Poslije |
| --- | --- | --- |
| Fontovi (subset → WOFF2) | 680 kB | **31 kB** |
| Fotografije (izvori za Astro `<Image>`) | 44 MB | **4,9 MB** |
| Hero video (H.264 + VP9) | 15,6 MB | **1,17 + 0,96 MB** |
| Ikone (strip C2PA → inline TS) | 105 kB | **3 kB** |
| Logotipi (strip C2PA) | 13 kB | 5 kB |

Astro iz commitanih izvora gradi AVIF u četiri širine.

## SEO, AI SEO i social

- Meta, canonical, `robots` s `max-image-preview:large`.
- **`hreflang`** za `hr`, `en` i `x-default` na svim jezičnim rutama.
- Open Graph + Twitter `summary_large_image`, `og:locale` prati jezik.
- JSON-LD `@graph`: `Organization` (s `legalName` i `vatID`) → `WebSite` →
  `WebPage`, povezani preko `@id`.
- `robots.txt` s poimence dopuštenim AI crawlerima; `llms.txt` sa strojno
  čitljivim sažetkom proizvoda.

## Pristanak na pohranu

Stranica nema kolačiće, analitiku ni piksele. Jedino što sprema je pozicija u
vodoravnoj prezentaciji (`tquilo.D2.x`) - korisno, ali nije nužno za rad, pa
traži pristanak.

`„Samo nužno"` nije ukrasni gumb: ako se odabere, engine **prestaje pamtiti
poziciju** i briše već spremljenu. Traka bez stvarne posljedice ne bi bila
pristanak nego kulisa.

- `src/scripts/consent.ts` - `canStore()` je jedino mjesto koje ostatak koda
  pita smije li spremati. Ako se doda analitika, provjerava se **ondje**, a
  domena se dodaje u CSP - ne obrnuto.
- Odluka je u `localStorage` pod `tquilo.consent` (`all` | `essential`).
- Traka se ne renderira dok skripta ne provjeri postoji li već odluka, pa ne
  bljesne posjetitelju koji se vraća.
- Pozicija: dolje desno (kao DS `Toast`), iznad fiksne donje trake. Na
  mobitelu se razvlači preko obje margine jer bi inače bila pretijesna.
- Blokirana pohrana (privatni prozor) tretira se kao „samo nužno".

⚠ **Nedostaje stranica o privatnosti.** Traka je točna i minimalna, ali bez
poveznice na politiku privatnosti jer ta stranica još ne postoji. Kad nastane,
dodaje se poveznica u `Consent.astro`.

## Sigurnost

Sve je u `public/.htaccess`:

- **CSP `default-src 'none'`, bez `unsafe-inline`.** Zato nigdje nema `style`
  atributa u markupu ni inline skripti: boje se postavljaju iz JS-a preko
  `element.style`, a podaci za konfigurator idu kroz
  `<script type="application/json">` (podatkovni blok, preglednik ga ne
  izvršava). **Ako se doda analitika, mijenja se ovdje - ne dodavati
  `unsafe-inline`.**
- HSTS 2 godine, `includeSubDomains`, `preload`.
- COOP/COEP/CORP, Permissions-Policy, `X-Frame-Options: DENY`, `nosniff`.
- `/.well-known/security.txt` po RFC 9116, `Expires` se pomiče na svaki build.

**Kontakt forma** ide na **Web3Forms**. To je jedina vanjska domena na
stranici, pa je u CSP-u dopuštena poimence (`form-action` i `connect-src`).
Forma radi i bez JavaScripta: bez njega je običan POST i Web3Forms vrati
vlastitu potvrdu; s njim se šalje u pozadini i javi status, da posjetitelj ne
ispadne iz vodoravne prezentacije. Web3Forms honeypot (`botcheck`) je
uključen.

## Deploy

```bash
_deploy.bat
```

Build ide **prije** pusha; izvor na `main` (bez `dist/`), build na `deploy`
granu fast-forwardom uz nastavak povijesti (Hostinger radi `git pull`, pa bi
force-push razbio auto-deploy). `--allow-empty` commit i kad je build identičan,
inače GitHub ne pošalje webhook.

Hostinger: repo `marinknez/tquilo.com`, grana **`deploy`**, web root = korijen.

## ⚠ Prije lansiranja

- [ ] `LAUNCHED = true` u `src/data/site.ts`.
- [ ] Web3Forms: provjeriti da je `access_key` vezan na pravu primateljsku
      adresu i poslati testni upit.
- [ ] `SITE.securityEmail` - jedino mjesto gdje stranica navodi e-mail
      (RFC 9116 traži kontakt, inače je security.txt nevažeći).
- [ ] **Tuđe oznake s fotografija**: narančasti vanbrodski motor na
      `fjaka-detail-3.jpg` i `partneri.jpg`. Brand pravila to traže.
- [ ] **PDF specifikacije** - nije isporučen; link na ekranu 04 je mrtav.
- [ ] `SITE.social` - `sameAs` se pojavi u JSON-LD-u kad profili postoje.
- [ ] HSTS `preload` - samo ako HTTPS radi na svim subdomenama.
- [ ] Search Console + Bing: prijaviti sitemap.

## Odstupanja od handoffa (i zašto)

1. **RAL 5004** je u handoffu `#1F3A5F`. To nije RAL 5004 („Schwarzblau",
   ≈`#20232C`) nego nešto bliže RAL 5011. Uzete su vrijednosti iz
   konfiguratora proizvođača jer odgovaraju lakiranom proizvodu.
2. **RAL 1013** je u izvornoj tablici bio `#ea9a5` - pet znamenki, nevažeći
   hex, boja je tiho padala na crnu. Ispravljeno na `#E3D9C6`.
3. **3D model je parametarski, ne GLB** - obrazloženo gore.
4. **`mailto:hello@tquilo.com`** s ekrana 08 je izostavljen: adresa ne postoji,
   a uputa je bila da e-mail ne stoji na stranici. Forma je kanal.
5. **`fWho` i `fSub`** postoje u copyju, ali ih finalni dizajn ne renderira -
   nisu implementirani.

**Napomena o `tquilo-quality.png`:** ta je datoteka u isporučenom paketu
bajt-u-bajt identična `tquilo-hero-sea.png`, pa ekran 03 pokazuje isti kadar
kao poster hero videa. Koristi se onako kako je isporučena - ako je to greška
u paketu, zamijeni se izvorna datoteka u `_design/`, ne popis u skripti.

## Licence

Marcellus i Archivo su SIL OFL 1.1; licence putuju uz binarije
(`brand/fonts/*-OFL.txt`, kopirane i u `public/fonts/`).
