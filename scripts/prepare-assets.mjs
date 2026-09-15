/**
 * Brand asset pipeline - brand/ (izvor) → public/ (ono što ide u build).
 *
 * Radi tri stvari:
 *   1. Fontovi: Marcellus + Archivo TTF → subsetirani WOFF2 (latinica + hrvatska
 *      dijakritika + tipografski znakovi koje brand koristi). 1,4 MB → ~30 kB.
 *   2. Logotipi: SVG-ovi iz design systema nose ugrađeni C2PA manifest (base64,
 *      ~8 kB po datoteci) koji browseru ne znači ništa - skida se.
 *   3. Rasterski derivati: favicon PNG-ovi, apple-touch-icon, OG/Twitter slika.
 *
 * Pokreće se ručno (`npm run assets`), ne pri svakom buildu - izlaz je commitan
 * u public/ da deploy ne ovisi o sharp/harfbuzz binarijima.
 */
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import subsetFont from 'subset-font';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = (...p) => path.join(root, 'brand', ...p);
const out = (...p) => path.join(root, 'public', ...p);

/** Znakovi koje subset mora sadržavati.
 *  Namjerno širi od trenutnog copyja - stranica smije dobiti novi tekst bez
 *  ponovnog generiranja fontova, uključujući hrvatsku dijakritiku. */
const CHARSET = [
  'abcdefghijklmnopqrstuvwxyz',
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  '0123456789',
  ' !"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~',
  'čćđšžČĆĐŠŽ', // hrvatska dijakritika
  'áàäâãéèëêíìïîóòöôõúùüûñçÁÀÄÂÃÉÈËÊÍÌÏÎÓÒÖÔÕÚÙÜÛÑÇ', // ostatak latin-1
  // Crtice su namjerno sve tri: brand copy koristi '-', ali en/em dash u
  // subsetu znaci da tekst koji ih ipak dobije ne padne na fallback font.
  '‘’“”–—-… ­×·©®™→€',
].join('');

const brandColors = {
  abyss: '#0B1622',
  deepSea: '#16304A',
  champagne: '#D8C29A',
  salt: '#F6F3EE',
  mist: '#9BA6B2',
  trench: '#24405A',
};

async function ensureDirs() {
  await mkdir(out('fonts'), { recursive: true });
  await mkdir(out('logo'), { recursive: true });
  await mkdir(out('og'), { recursive: true });
}

/* ------------------------------------------------------------------ fontovi */

async function buildFont(file, target, variationAxes) {
  const buf = await readFile(src('fonts', file));
  const subset = await subsetFont(buf, CHARSET, {
    targetFormat: 'woff2',
    noHinting: true,
    ...(variationAxes ? { variationAxes } : {}),
  });
  await writeFile(out('fonts', target), subset);
  const kb = (n) => `${(n / 1024).toFixed(1)} kB`;
  console.log(`  font  ${file} → ${target}  ${kb(buf.length)} → ${kb(subset.length)}`);
}

async function buildFonts() {
  console.log('Fontovi (subset → woff2):');
  await buildFont('Marcellus-Regular.ttf', 'marcellus-400.woff2');
  // Brand koristi wght 300–600 @ wdth 100 (readme §3) - ostatak varijacijskog
  // prostora je mrtva težina, pa se wdth pinna, a wght suzi na brand raspon.
  await buildFont('Archivo-Variable.ttf', 'archivo-var.woff2', {
    wght: { min: 300, max: 600 },
    wdth: 100,
  });
  // Licence idu uz binarije - SIL OFL to traži.
  for (const ofl of ['Marcellus-OFL.txt', 'Archivo-OFL.txt']) {
    await writeFile(out('fonts', ofl), await readFile(src('fonts', ofl)));
  }
}

/* ------------------------------------------------------------------ logotipi */

/** Skida <metadata>…</metadata> (C2PA) i XML komentare iz SVG-a. */
function cleanSvg(svg) {
  return svg
    .replace(/<metadata\b[\s\S]*?<\/metadata>/gi, '')
    .replace(/\s+xmlns:c2pa="[^"]*"/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/>\s+</g, '><')
    .trim();
}

const SHIPPED_LOGOS = [
  'tquilo-primary-dark.svg',
  'tquilo-primary-light.svg',
  'tquilo-stacked-dark.svg',
  'tquilo-monogram-ink.svg',
  'kap-champagne.svg',
];

async function buildLogos() {
  console.log('Logotipi (strip C2PA):');
  const all = await readdir(src('logo'));
  for (const file of all.filter((f) => SHIPPED_LOGOS.includes(f))) {
    const raw = await readFile(src('logo', file), 'utf8');
    const clean = cleanSvg(raw);
    await writeFile(out('logo', file), clean);
    console.log(`  logo  ${file}  ${raw.length} → ${clean.length} B`);
  }
  // favicon.svg ide u root - browseri ga traže i tamo
  const favicon = cleanSvg(await readFile(src('logo', 'favicon.svg'), 'utf8'));
  await writeFile(out('favicon.svg'), favicon);
  return favicon;
}

/* -------------------------------------------------------- rasterski derivati */

/**
 * Monogram (Abyss ploča, Salt „T", Champagne kap) kao PNG.
 * `padRatio` > 0 uvlači znak unutar ploče - treba samo za Androidov maskable
 * safe zone; sve ostalo je full-bleed, kako je monogram i nacrtan.
 */
async function iconPng(size, padRatio = 0) {
  const mono = await readFile(out('logo', 'tquilo-monogram-ink.svg'));
  if (padRatio === 0) {
    return sharp(mono, { density: 600 }).resize(size, size).png({ compressionLevel: 9 }).toBuffer();
  }
  const inner = Math.round(size * (1 - padRatio * 2));
  const glyph = await sharp(mono, { density: 600 }).resize(inner, inner).png().toBuffer();
  return sharp({
    create: { width: size, height: size, channels: 4, background: brandColors.abyss },
  })
    .composite([{ input: glyph, gravity: 'centre' }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

async function buildIcons() {
  console.log('Ikone:');
  const icons = [
    ['icon-32.png', 32, 0],
    ['apple-touch-icon.png', 180, 0],
    ['icon-192.png', 192, 0],
    ['icon-512.png', 512, 0],
    // Android maskable: znak mora stati u središnjih 80 % - inače ga launcher odreže.
    ['icon-512-maskable.png', 512, 0.14],
  ];
  for (const [name, size, pad] of icons) {
    await writeFile(out(name), await iconPng(size, pad));
    console.log(`  icon  ${name} (${size}×${size}${pad ? ', maskable' : ''})`);
  }
  // /favicon.ico se traži i bez <link> deklaracije (stari klijenti, feed čitači).
  await writeFile(out('favicon.ico'), await iconPng(32, 0));
  console.log('  icon  favicon.ico (32×32)');
}

/* ------------------------------------------------------------------ OG slika */

/**
 * 1200 × 630 social card. Sastavljena iz istih tokena kao stranica: Abyss
 * podloga, 2 px Champagne linija gore, wordmark, Marcellus naslov.
 * Tekst je renderiran kroz sharp/pango iz self-hostanog Marcellusa - nema
 * ovisnosti o fontovima na stroju koji radi build.
 */
async function buildOgImage() {
  console.log('OG slika:');
  const W = 1200;
  const H = 630;
  const marcellus = (await readFile(out('fonts', 'marcellus-400.woff2'))).toString('base64');
  const archivo = (await readFile(out('fonts', 'archivo-var.woff2'))).toString('base64');
  const wordmark = (await readFile(out('logo', 'tquilo-primary-dark.svg'), 'utf8'))
    .replace(/^<\?xml[^>]*\?>/, '');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <style>
      @font-face{font-family:"Marcellus";src:url(data:font/woff2;base64,${marcellus}) format("woff2");font-weight:400}
      @font-face{font-family:"Archivo";src:url(data:font/woff2;base64,${archivo}) format("woff2");font-weight:300 600}
      .display{font-family:"Marcellus",Georgia,serif;font-size:76px;letter-spacing:0.01em}
      .lede{font-family:"Archivo",Arial,sans-serif;font-size:26px;font-weight:400}
      .label{font-family:"Archivo",Arial,sans-serif;font-size:18px;font-weight:500;letter-spacing:3.4px;text-transform:uppercase}
    </style>
  </defs>
  <rect width="${W}" height="${H}" fill="${brandColors.abyss}"/>
  <rect width="${W}" height="4" fill="${brandColors.champagne}"/>
  <rect x="80" y="150" width="2" height="330" fill="${brandColors.trench}"/>
  <g transform="translate(80,66) scale(0.34)">${wordmark.replace(/^<svg[^>]*>/, '<g>').replace(/<\/svg>$/, '</g>')}</g>
  <text class="label" x="124" y="196" fill="${brandColors.champagne}">Something new is taking shape. Launching October 2026</text>
  <text class="display" x="124" y="300" fill="${brandColors.champagne}">Coming soon.</text>
  <text class="display" x="124" y="386" fill="${brandColors.salt}">Your tranquilo place</text>
  <text class="display" x="124" y="462" fill="${brandColors.salt}">on water.</text>
  <text class="lede" x="124" y="540" fill="${brandColors.mist}">A floating sunbed for two. No crew, no schedule.</text>
  <rect x="0" y="${H - 4}" width="${W}" height="4" fill="${brandColors.deepSea}"/>
</svg>`;

  const png = await sharp(Buffer.from(svg), { density: 96 }).png({ compressionLevel: 9 }).toBuffer();
  await writeFile(out('og', 'tquilo-og.png'), png);
  console.log(`  og    og/tquilo-og.png (${W}×${H}, ${(png.length / 1024).toFixed(1)} kB)`);
}

/* ------------------------------------------------------------------------- */

await ensureDirs();
await buildFonts();
await buildLogos();
await buildIcons();
await buildOgImage();
console.log('\nGotovo - public/ je osvježen.');
