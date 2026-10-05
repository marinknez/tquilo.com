/**
 * Web asset pipeline - _design/web2 (izvor) -> src/assets + public (build).
 *
 * Izvorni paket nosi ~60 MB fotografija i 16 MB videa. Ništa od toga ne ide
 * u repozitorij u originalnom obliku: ovdje se svede na commitane izvore koje
 * Astro dalje optimizira (AVIF/WebP, responsive širine).
 *
 * Pokreće se ručno (`npm run assets:web`), ne pri buildu - ffmpeg i sharp ne
 * smiju biti uvjet za deploy.
 */
import { readFile, writeFile, mkdir, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const run = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = (...p) => path.join(root, '_design/web2/design_handoff_tquilo_web', ...p);
const photos = (...p) => path.join(root, 'images', ...p);
const outAsset = (...p) => path.join(root, 'src/assets', ...p);
const outPublic = (...p) => path.join(root, 'public', ...p);

const kb = (n) => `${(n / 1024).toFixed(0)} kB`;
const mb = (n) => `${(n / 1048576).toFixed(2)} MB`;

/* ---------------------------------------------------------------- fotografije */

/**
 * Izvorne fotografije -> commitani JPEG izvori, max 2560 px.
 *
 * Astro `<Image>` iz ovih generira AVIF/WebP u više širina, pa je ovdje
 * jedini cilj skinuti 18 MB PNG-ove na nešto što smije živjeti u gitu.
 * Kvaliteta 84 + mozjpeg: razlika se ne vidi, a datoteka je 10-20x manja.
 *
 * NAPOMENA: `tquilo-quality.png` je u isporučenom paketu bajt-u-bajt
 * identičan `tquilo-hero-sea.png`. Koristi se onako kako je isporučen -
 * ako je to greška u paketu, zamijeni se izvorna datoteka, ne ovaj popis.
 */
const PHOTOS = [
  { from: src('design/assets/photography/tquilo-hero-sea.png'), to: 'hero-sea.jpg', w: 2560 },
  { from: src('design/assets/photography/tquilo-voda-aerial.png'), to: 'voda-aerial.jpg', w: 2560 },
  { from: src('design/assets/photography/tquilo-quality.png'), to: 'kvaliteta.jpg', w: 2560 },
  { from: src('design/assets/photography/tquilo-partneri.jpg'), to: 'partneri.jpg', w: 2560 },
  { from: src('design/assets/photography/tquilo-fjaka.png'), to: 'fjaka.jpg', w: 2560 },
  { from: src('design/assets/photography/fjaka-detail-1.jpg'), to: 'fjaka-detail-1.jpg', w: 900 },
  { from: src('design/assets/photography/fjaka-detail-2.jpg'), to: 'fjaka-detail-2.jpg', w: 900 },
  { from: src('design/assets/photography/fjaka-detail-3.jpg'), to: 'fjaka-detail-3.jpg', w: 900 },
  { from: photos('tquilo-privatnost.webp'), to: 'privatnost.jpg', w: 2560 },
  // Referenca za konfigurator i OG varijante
  { from: photos('DJI_0996.JPG'), to: 'platforma-more.jpg', w: 2560 },
];

async function buildPhotos() {
  console.log('Fotografije (-> src/assets/photo, max 2560 px, mozjpeg q84):');
  await mkdir(outAsset('photo'), { recursive: true });
  for (const p of PHOTOS) {
    if (!existsSync(p.from)) {
      console.log(`  PRESKOČENO (nema izvora): ${p.to}`);
      continue;
    }
    const before = (await stat(p.from)).size;
    const buf = await sharp(p.from)
      .rotate()
      .resize({ width: p.w, withoutEnlargement: true })
      .jpeg({ quality: 84, mozjpeg: true, chromaSubsampling: '4:4:4' })
      .toBuffer();
    await writeFile(outAsset('photo', p.to), buf);
    console.log(`  ${p.to.padEnd(24)} ${mb(before)} -> ${mb(buf.length)}`);
  }
}

/* ---------------------------------------------------------------------- video */

/**
 * Hero video: 1280x720, 15 s, izvorno 8,5 Mbit/s = 16 MB za loop koji stoji
 * iza teksta. Na toj rezoluciji je to 4-5x više nego što oko vidi.
 *
 * Izlaz: H.264 (~1,6 Mbit/s, faststart) + VP9 WebM. WebM ide prvi u <video>,
 * MP4 je fallback za Safari. Poster je prvi frame.
 */
async function buildVideo() {
  const input = src('design/assets/video/hero-2.mp4');
  if (!existsSync(input)) {
    console.log('Video: PRESKOČENO (nema izvora)');
    return;
  }
  console.log('Video (ffmpeg):');
  await mkdir(outPublic('video'), { recursive: true });
  const before = (await stat(input)).size;

  const mp4 = outPublic('video', 'hero.mp4');
  await run('ffmpeg', [
    '-y', '-i', input,
    '-an', // zvuk se nikad ne pušta - nema ga smisla nositi
    '-c:v', 'libx264', '-profile:v', 'high', '-level', '4.0',
    '-crf', '26', '-maxrate', '2M', '-bufsize', '4M',
    '-pix_fmt', 'yuv420p', '-preset', 'slow',
    '-movflags', '+faststart',
    mp4,
  ]);

  const webm = outPublic('video', 'hero.webm');
  await run('ffmpeg', [
    '-y', '-i', input,
    '-an',
    '-c:v', 'libvpx-vp9', '-crf', '34', '-b:v', '0',
    '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2',
    webm,
  ]);

  // Poster: NE prvi frame - video se otvara fade-om iz crnog, pa je frame 0
  // potpuno crn. Uzima se 2. sekunda, kad je kadar već pun.
  const posterRaw = path.join(root, '.astro', 'hero-poster-raw.png');
  await mkdir(path.dirname(posterRaw), { recursive: true });
  await run('ffmpeg', ['-y', '-ss', '2', '-i', input, '-frames:v', '1', posterRaw]);
  await writeFile(
    outAsset('photo', 'hero-poster.jpg'),
    await sharp(posterRaw).jpeg({ quality: 82, mozjpeg: true }).toBuffer(),
  );

  console.log(`  hero.mp4   ${mb(before)} -> ${mb((await stat(mp4)).size)}`);
  console.log(`  hero.webm  ${mb(before)} -> ${mb((await stat(webm)).size)}`);
  console.log(`  hero-poster.jpg`);
}

/* ---------------------------------------------------------------------- ikone */

/**
 * 13 brand ikona. Svaka izvorna datoteka ima 8 kB C2PA manifesta na ~400 B
 * stvarnog crteža. Ovdje se skida manifest i izvuče samo unutrašnjost SVG-a,
 * koja se inlinea u `Icon.astro` - bez 13 HTTP zahtjeva i sa `currentColor`.
 */
function innerSvg(svg) {
  return svg
    .replace(/<metadata\b[\s\S]*?<\/metadata>/gi, '')
    .replace(/<title\b[\s\S]*?<\/title>/gi, '')
    .replace(/<desc\b[\s\S]*?<\/desc>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/^[\s\S]*?<svg[^>]*>/i, '')
    .replace(/<\/svg>\s*$/i, '')
    .replace(/>\s+</g, '><')
    .trim();
}

async function buildIcons() {
  console.log('Ikone (strip C2PA -> inline TS modul):');
  const dir = src('icons');
  const files = (await readdir(dir)).filter((f) => f.endsWith('.svg')).sort();
  const entries = [];
  let before = 0;
  let after = 0;
  for (const f of files) {
    const raw = await readFile(path.join(dir, f), 'utf8');
    const body = innerSvg(raw);
    before += raw.length;
    after += body.length;
    entries.push(`  '${f.replace(/\.svg$/, '')}': \`${body}\`,`);
  }
  const ts = `// GENERIRANO - scripts/prepare-web-assets.mjs. Ne uređivati ručno.
//
// Brand ikone (${files.length}), outline, 24 px grid, stroke \`currentColor\`.
// Inlineane jer su sitne: ${kb(after)} ukupno protiv ${files.length} HTTP zahtjeva.
export const ICONS = {
${entries.join('\n')}
} as const;

export type IconName = keyof typeof ICONS;
`;
  await mkdir(outAsset('..', 'icons'), { recursive: true });
  await writeFile(path.join(root, 'src/icons/icons.ts'), ts);
  console.log(`  ${files.length} ikona  ${kb(before)} -> ${kb(after)}`);
}

/* --------------------------------------------------------------------- logo */

async function buildLogos() {
  console.log('Logotipi:');
  const wanted = ['tquilo-primary-mono.svg', 'tquilo-stacked-mono.svg', 'kap.svg'];
  const dir = src('design/assets/logo');
  for (const f of wanted) {
    const p = path.join(dir, f);
    if (!existsSync(p)) continue;
    const raw = await readFile(p, 'utf8');
    const clean = raw
      .replace(/<metadata\b[\s\S]*?<\/metadata>/gi, '')
      .replace(/\s+xmlns:c2pa="[^"]*"/gi, '')
      .replace(/>\s+</g, '><')
      .trim();
    await writeFile(outPublic('logo', f), clean);
    console.log(`  ${f.padEnd(28)} ${kb(raw.length)} -> ${kb(clean.length)}`);
  }
}

/* ------------------------------------------------------------------------- */

const only = process.argv[2];
await mkdir(outAsset('photo'), { recursive: true });
if (!only || only === 'photos') await buildPhotos();
if (!only || only === 'icons') await buildIcons();
if (!only || only === 'logos') await buildLogos();
if (!only || only === 'video') await buildVideo();
console.log('\nGotovo.');
