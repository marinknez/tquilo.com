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
- **Adresa nosi ekran.** Svaki ekran ima jezično neutralan ID (`#mir`,
  `#voda`, …, `SCENE_IDS` u `Stage.astro`). Engine ga upisuje u adresu pri
  svakoj promjeni ekrana i **istovremeno u `href` jezičnih linkova**. Bez
  toga prebacivanje jezika (puni odlazak na drugu rutu) uvijek vrati
  posjetitelja na naslovnicu. ID-evi su isti u HR i EN, pa `#partneri`
  vrijedi na obje rute.
- Pri dolasku na `#ekran` engine jednom pozove `tick()` odmah nakon
  `measure()` - inače traka krene s nule i vidljivo otklizi do cilja.
- **Klik u izborniku ne juri kao kotačić.** Obično pomicanje je
  eksponencijalno dotjerivanje (`cur += (target-cur)*0.08`): kreće naglo i
  dugo se smiruje - dobro za kotačić, ružno za skok preko pola stranice.
  Zato `goScene()` koristi vremenski tween s `ease-in-out`, 1,2-2,6 s ovisno
  o udaljenosti. Svaki korisnikov unos (kotačić, dodir, tipke) ga prekida,
  inače bi se borili za istu vrijednost. `prefers-reduced-motion` skače bez
  animacije.

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

## Jezik i rute

**Primarni jezik je EN** i ne ovisi o postavkama preglednika - nigdje se ne
čita `navigator.language`. HR posjetitelj bira sam, prekidačem u zaglavlju.

**Primarni jezik nema prefiks u adresi:**

| | EN | HR |
| --- | --- | --- |
| naslovnica | `/` | `/hr` |
| konfigurator | `/konfigurator` | `/hr/konfigurator` |
| privatnost | `/privacy` | `/hr/privacy` |

Odlučuje **jedno mjesto** - `localePath()` u `src/i18n/index.ts`. Rute,
`hreflang`, canonical, sitemap, prekidač jezika i sve poveznice čitaju odande;
promjena sheme je promjena te funkcije, ne pretraživanje po projektu.

Tehnički: stranice su `src/pages/[...lang]/*.astro`, a `getStaticPaths` za EN
vraća `lang: undefined` - rest parametar tada gradi datoteku na korijenu.

⚠ **Stare `/en/...` adrese 301-aju** na nove (`.htaccess`). Ne brisati: to je
ono što tražilica već zna i što je možda negdje podijeljeno.

### Trailing slash

Astro je `trailingSlash: 'never'`, pa canonical glasi `/konfigurator`. Ali
build pravi `konfigurator/index.html`, dakle **direktorij** - a Apache uz
zadani `DirectorySlash` na `/konfigurator` odgovara 301-om na
`/konfigurator/`. Posljedica je bila da svaka stranica osim korijena živi na
adresi koja se ne poklapa s vlastitim canonicalom.

Zato je u `.htaccess` **`DirectorySlash Off`**, a mapiranje na `index.html`
radi `RewriteRule` - na `mod_dir` se ne oslanjamo. Provjereno na produkciji:
`/hr/` → 301 → `/hr` → 200, bez petlje.

## Pristanak, kolačići i analitika

Uz pristanak stranica radi dvije stvari: **Google Analytics 4**
(`G-ST8X7GLQSB`, kolačići `_ga` i `_ga_<ID>`) i pamćenje pozicije u
vodoravnoj prezentaciji (`tquilo.D2.x`). Bez pristanka - ni jedno ni drugo.

`„Samo nužno"` nije ukrasni gumb: GA se **ne učita**, engine **prestaje
pamtiti poziciju** i briše već spremljenu. Traka bez stvarne posljedice ne bi
bila pristanak nego kulisa.

- `src/scripts/analytics.ts` - GA se ne učitava dok pristanka nema. Službeni
  gtag isječak ovdje ne ide doslovno: CSP je `script-src 'self'` bez
  `unsafe-inline`, pa je bootstrap (`dataLayer`, `gtag()`) u paketu, a
  vanjska skripta se ubacuje preko `createElement`.
- `stopAnalytics()` koristi `ga-disable-G-ST8X7GLQSB` - službeni GA prekidač -
  i **briše `_ga` kolačiće**. Bez toga bi „Samo nužno" nakon „Prihvaćam" bio
  prazan gumb: skripta je tada već u stranici i ne može se odučitati.
- `src/scripts/consent.ts` - `canStore()` je jedino mjesto koje ostatak koda
  pita smije li spremati. Nova domena uvijek ide i u CSP - ne obrnuto.
- Odluka je u `localStorage` pod `tquilo.consent` (`all` | `essential`).
- Traka se ne renderira dok skripta ne provjeri postoji li već odluka, pa ne
  bljesne posjetitelju koji se vraća.
- Pozicija: dolje desno (kao DS `Toast`), iznad fiksne donje trake. Na
  mobitelu se razvlači preko obje margine jer bi inače bila pretijesna.
- **× skuplja traku u kap** (brandov znak, 44 × 44). To **nije** pristanak:
  do izbora se ponaša kao „samo nužno". Stanje trake je u `tquilo.consent.ui`.
- **Kap ostaje i nakon izbora.** Dok nije bilo analitike to je bilo svejedno;
  s njom nije - povlačenje pristanka mora biti jednako dostupno kao davanje.
  Otvorena traka ispisuje trenutno stanje (`[data-consent-state]`).
- Blokirana pohrana (privatni prozor) tretira se kao „samo nužno".

### Politika privatnosti

`src/pages/[lang]/privacy.astro` -> `/hr/privacy` i `/en/privacy`. Namjerno
kratka: svaka stavka odgovara nečemu što u kodu postoji. **Ako se doda nova
vanjska usluga, dodaje se i odlomak ondje.**

**Jedina poveznica na nju je u traci za pristanak** - ne u navigaciji ni u
podnožju, po izričitoj uputi.

⚠ Stranica nema e-mail adresu (ranija uputa), pa se prava ostvaruju preko
kontakt forme. Ako se jednom uvede adresa za privatnost, dodaje se u `SITE`
i referencira iz `privacy.astro`.

⚠ **Provjeriti postavke GA property-ja:** rok čuvanja podataka (zadano 14
mjeseci), isključiti Google signals ako se ne koristi (inače CSP treba i
`stats.g.doubleclick.net`), te potpisati Google ugovor o obradi podataka.

## Konfigurator

- **„Resetiraj prikaz" vraća i kut kamere I boje** na polaznu liniju
  (Midnight), briše polja za prilagođeni RAL/HEX i miče oznaku „po narudžbi".
  Gumb koji vraća samo kameru ostavlja korisnika s pola vraćenog stanja.
- **PDF** nastaje iz `window.print()` nad skrivenim blokom `[data-print]`;
  stilovi su u `@media print` u `global.css`.
  - `print-color-adjust: exact` - bez toga preglednik izbacuje pozadine, pa
    mrlje boja i tamna podloga renderа nestanu.
  - **Snimka se renderira u fiksnom omjeru 1760 x 1068** (= okvir 178 x 108 mm),
    neovisno o veličini prikaza. Prije je u PDF išlo platno kakvo je zateklo -
    na uskom prozoru doslovno pruga 125 x 320.
  - **Kadar je fiksiran**: kut gledanja ostaje korisnikov, udaljenost se
    postavlja na 7 m od (0, 1.1, 0). Inače PDF nosi i korisnikov zum.
  - ⚠ `img.decode()` na slici u `display: none` zna u Chromiumu ostati vječno
    neriješen - zato utrka s rokom od 600 ms. Bez toga se `print()` nikad ne
    pozove i gumb izgleda kao da ne radi.
  - Ako slika u PDF-u ispadne siva: to je postavka **u dijalogu za ispis**
    („Boja" / „Crno-bijelo"), ne stranica.

## Sigurnost

Sve je u `public/.htaccess`:

- **CSP `default-src 'none'`, bez `unsafe-inline`.** Zato nigdje nema `style`
  atributa u markupu ni inline skripti: boje se postavljaju iz JS-a preko
  `element.style`, a podaci za konfigurator idu kroz
  `<script type="application/json">` (podatkovni blok, preglednik ga ne
  izvršava). **Nikad ne dodavati `unsafe-inline`** - ni gtag ga ne treba.
- **HSTS** 2 godine, `includeSubDomains`, `preload` token.

  Hostingerov „force HTTPS" je 301 s `http://` na `https://` - **prvi zahtjev
  ipak ode u čisto**. Na tuđoj mreži se taj jedan hop presretne i odgovor
  nikad ne stigne do redirecta (sslstrip); posjetitelj vidi stranicu na
  `http` i ništa ne primijeti. HSTS zato nije isto što i redirect: preglednik
  nakon prvog uspješnog posjeta sam pretvara `http` u `https` prije slanja,
  pa čistog hopa više nema.

  ⚠ `includeSubDomains` **već** veže sve buduće poddomene: posjetitelj koji je
  bio na glavnoj stranici dvije godine neće moći otvoriti poddomenu bez
  valjanog HTTPS-a, i to bez mogućnosti da klikne „svejedno nastavi".

  `preload` token je **deklaracija namjere i sam po sebi ne radi ništa** -
  domena se mora prijaviti na hstspreload.org. Time se zatvara i rupa prvog
  posjeta, ali je **praktički nepovratno**: skidanje s liste traje mjesecima,
  a stari preglednici nose staru listu. Za marketinški site to je više rizika
  nego koristi; zaglavlje radi posao, prijava je opcija koja ostaje otvorena.
- COOP/COEP/CORP, Permissions-Policy, `X-Frame-Options: DENY`, `nosniff`.
- `/.well-known/security.txt` po RFC 9116, `Expires` se pomiče na svaki build.

**Vanjske domene su dvije** i obje su u CSP-u poimence:

| Domena | Čemu služi | Kada se učita |
| --- | --- | --- |
| `api.web3forms.com` | primatelj kontakt forme | na slanje |
| `www.googletagmanager.com` | gtag.js (GA4) | tek na pristanak |

GA4 mjerenja idu na `google-analytics.com`, a regionalni endpoint je poddomena
(`region1...`) - odatle zvjezdica u `connect-src`. Bez tog unosa GA tiho ne
šalje ništa i pogreška se vidi samo u konzoli.

`frame-src 'none'`: stranica nema nijedan iframe i ne smije ga dobiti.

## Kontakt forma

Forma ide na **Web3Forms**. Radi i bez JS-a (obični POST); sa skriptom se
šalje u pozadini da posjetitelj ne ispadne iz vodoravne prezentacije.

**Nema captche.** hCaptcha je bila ugrađena pa uklonjena: Web3Forms na
besplatnom planu odbija zahtjev s
`"You are trying to use a Pro feature, Please Upgrade to use reCaptcha"` -
prekidač za captchu u njihovoj nadzornoj ploči je Pro značajka, bez obzira
što je sama hCaptcha u njihovoj dokumentaciji opisana kao besplatna. Protiv
robota ostaje honeypot (`botcheck`), koji Web3Forms provjerava na svom kraju.

⚠ Ako se captcha jednom vrati, vraća se i `frame-src`, `style-src` i
`script-src` za tog pružatelja - i tek nakon što se u nadzornoj ploči potvrdi
da prekidač uopće radi na trenutnom planu.

**E-mail** `aboard@tquilo.com` (`SITE.email`) stoji ispod naslova na ekranu
Kontakt i u politici privatnosti. U structured data i `llms.txt` namjerno NE
ide - ondje ga ubiru skupljači adresa.

**Provjera e-maila:** `type=email` propušta `ime@domena` bez vršne domene -
formalno valjano, u praksi uvijek tipfeler. Zato i `pattern` atribut (radi i
prije nego se skripta učita) i isti izraz u `contact.ts`, koji postavlja
poruku na jeziku stranice. To hvata tipfelere **u obliku**; da je adresa
stvarno dostavljiva dokazuje jedino potvrdni e-mail, a autoresponder je
Web3Forms Pro.

## Deploy

```bash
_deploy.bat
```

Build ide **prije** pusha; izvor na `main` (bez `dist/`), build na `deploy`
granu fast-forwardom uz nastavak povijesti (Hostinger radi `git pull`, pa bi
force-push razbio auto-deploy). `--allow-empty` commit i kad je build identičan,
inače GitHub ne pošalje webhook.

Hostinger: repo `marinknez/tquilo.com`, grana **`deploy`**, web root = korijen.

## Lansiranje

**Site je javan od 1. 10. 2026.** `LAUNCHED = true`, coming soon stranica je
obrisana (`src/pages/index.astro`), korijen je EN verzija.

### Provjereno na produkciji

- Zaglavlja: CSP `default-src 'none'` bez `unsafe-inline`, HSTS 2 g s
  `preload`, COOP/COEP/CORP, `X-Frame-Options: DENY`, `nosniff`,
  Permissions-Policy, Referrer-Policy. Brotli uključen.
- Rute: svih 6 stranica 200 na **točno onoj adresi koju tvrdi canonical**.
  `/en/...` 301, `/hr/` 301, `www` i `http` 301. Nema petlji.
- Keš: hashirani assetovi `immutable, 1 g`; HTML `max-age=0, must-revalidate`.
- GA se ne učitava bez pristanka (0 zahtjeva prema Googleu).
- 404 vraća status 404, nosi `noindex`.
- Naslovnica: 12 zahtjeva, DOMContentLoaded ~0,21 s, load ~0,35 s.

### Još otvoreno

- [ ] Web3Forms: poslati jedan testni upit sa živog sitea.
- [ ] **Tuđe oznake s fotografija**: narančasti vanbrodski motor na
      `fjaka-detail-3.jpg` i `partneri.jpg`. Brand pravila to traže.
- [ ] `SITE.social` - `sameAs` se pojavi u JSON-LD-u kad profili postoje.
- [ ] Search Console + Bing: prijaviti `sitemap-index.xml`.
- [ ] GA property: rok čuvanja podataka (zadano 14 mj.), Google signals,
      ugovor o obradi podataka.
- [ ] Hero video je 0,94 MB (webm) uz `preload="auto"` - najteža stavka na
      naslovnici. Ako se želi lakši prvi dojam, `preload="metadata"`, uz
      rizik od trzaja na početku petlje.

## Odstupanja od handoffa (i zašto)

1. **RAL 5004** je u handoffu `#1F3A5F`. To nije RAL 5004 („Schwarzblau",
   ≈`#20232C`) nego nešto bliže RAL 5011. Uzete su vrijednosti iz
   konfiguratora proizvođača jer odgovaraju lakiranom proizvodu.
2. **RAL 1013** je u izvornoj tablici bio `#ea9a5` - pet znamenki, nevažeći
   hex, boja je tiho padala na crnu. Ispravljeno na `#E3D9C6`.
3. **3D model je parametarski, ne GLB** - obrazloženo gore.
4. **`mailto:hello@tquilo.com`** s ekrana 08 zamijenjen je stvarnom adresom
   `aboard@tquilo.com` (`SITE.email`), koja stoji ispod naslova na ekranu 08
   i u politici privatnosti.
5. **`fWho` i `fSub`** postoje u copyju, ali ih finalni dizajn ne renderira -
   nisu implementirani.

**Napomena o `tquilo-quality.png`:** ta je datoteka u isporučenom paketu
bajt-u-bajt identična `tquilo-hero-sea.png`, pa ekran 03 pokazuje isti kadar
kao poster hero videa. Koristi se onako kako je isporučena - ako je to greška
u paketu, zamijeni se izvorna datoteka u `_design/`, ne popis u skripti.

## Licence

Marcellus i Archivo su SIL OFL 1.1; licence putuju uz binarije
(`brand/fonts/*-OFL.txt`, kopirane i u `public/fonts/`).
