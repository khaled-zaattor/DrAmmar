/**
 * One-off image optimisation. Run with `npm run images`.
 *
 * The generated files are committed, so a production build needs no image
 * tooling — sharp and png-to-ico are devDependencies only.
 *
 * Re-run this after replacing any source photo, then re-check the sizes it
 * prints. It never deletes the originals; removal is a deliberate manual step.
 */
import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import { writeFile, stat, mkdir, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = path.join(root, 'public');
const assets = path.join(root, 'src', 'assets');

const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
const results = [];

async function report(label, srcPath, outPath) {
  const before = existsSync(srcPath) ? (await stat(srcPath)).size : 0;
  const after = (await stat(outPath)).size;
  results.push({ label, before, after });
  console.log(
    `  ${label.padEnd(34)} ${kb(before).padStart(10)} -> ${kb(after).padStart(10)}` +
      (before ? `  (${Math.round((1 - after / before) * 100)}% smaller)` : '')
  );
}

// --- Hero: the LCP image. Multiple widths so phones stop downloading a 1920px
// --- file, plus a JPEG fallback at the largest width for old browsers.
async function hero() {
  console.log('\nHero (LCP image)');
  // Source lives in src/assets, not public/: everything in public/ is copied
  // verbatim into the build, so keeping the 146 KB original there would ship it
  // alongside the optimised versions. Files in src/assets that nothing imports
  // are never bundled, so the original is free to keep there for re-runs.
  const src = path.join(assets, 'hero-barber.jpg');
  const meta = await sharp(src).metadata();
  console.log(`  source: ${meta.width}x${meta.height}`);

  for (const w of [640, 960, 1280, 1920]) {
    const out = path.join(pub, `hero-barber-${w}.webp`);
    await sharp(src).resize({ width: w }).webp({ quality: 72, effort: 6 }).toFile(out);
    await report(`hero-barber-${w}.webp`, w === 1920 ? src : '', out);
  }

  // No JPEG fallback: the hero is a plain <img srcset> rather than a <picture>,
  // because that is the pairing a <link rel=preload imagesrcset> reliably
  // matches. WebP is supported by every browser released since 2020, so a
  // fallback source would only ever ship unused bytes.
}

// --- Icons: the existing favicon.ico is 169 KB, larger than the hero image.
async function icons() {
  console.log('\nIcons');
  const logo = path.join(pub, 'logo.png');

  const png32 = path.join(pub, 'favicon-32.png');
  await sharp(logo).resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 }).toFile(png32);
  await report('favicon-32.png', '', png32);

  // Multi-resolution .ico so a bare /favicon.ico request still resolves.
  const sizes = [16, 32];
  const buffers = await Promise.all(
    sizes.map((s) =>
      sharp(logo)
        .resize(s, s, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png({ compressionLevel: 9 })
        .toBuffer()
    )
  );
  const ico = path.join(pub, 'favicon.ico');
  const before = (await stat(ico)).size;
  await writeFile(ico, await pngToIco(buffers));
  const after = (await stat(ico)).size;
  results.push({ label: 'favicon.ico', before, after });
  console.log(
    `  ${'favicon.ico'.padEnd(34)} ${kb(before).padStart(10)} -> ${kb(after).padStart(10)}` +
      `  (${Math.round((1 - after / before) * 100)}% smaller)`
  );

  const touch = path.join(pub, 'apple-touch-icon.png');
  await sharp(logo).resize(180, 180, { fit: 'contain', background: { r: 26, g: 26, b: 26 } })
    .png({ compressionLevel: 9 }).toFile(touch);
  await report('apple-touch-icon.png', logo, touch);
}

// --- Logos: both were shipping full-resolution PNGs for tiny rendered sizes.
async function logos() {
  console.log('\nLogos');
  // Rendered at 40x40 (h-10 w-10) -> 2x for retina.
  const nav = path.join(assets, 'nav-logo.webp');
  await sharp(path.join(assets, 'nav-logo.png')).resize({ width: 80 })
    .webp({ quality: 85, effort: 6 }).toFile(nav);
  await report('nav-logo.webp', path.join(assets, 'nav-logo.png'), nav);

  // Rendered at 128x128 (h-32 w-32) -> 2x for retina.
  const foot = path.join(assets, 'footer-logo.webp');
  await sharp(path.join(assets, 'footer-logo.png')).resize({ width: 256 })
    .webp({ quality: 85, effort: 6 }).toFile(foot);
  await report('footer-logo.webp', path.join(assets, 'footer-logo.png'), foot);
}

// --- Gallery: 8 JPEGs shown in a square grid, below the fold.
// withoutEnlargement matters: two of these sources are already small, and
// upscaling them to 800px made the "optimised" file 3x larger than the original.
// Quality is stepped down until the WebP actually beats the JPEG.
async function gallery() {
  console.log('\nGallery');
  for (let i = 1; i <= 8; i++) {
    const src = path.join(assets, `gallery-${i}.jpg`);
    const out = path.join(assets, `gallery-${i}.webp`);
    const original = (await stat(src)).size;

    let win = false;
    for (const quality of [74, 66, 58, 50]) {
      await sharp(src)
        .resize({ width: 800, withoutEnlargement: true })
        .webp({ quality, effort: 6 })
        .toFile(out);
      if ((await stat(out)).size < original) {
        win = true;
        break;
      }
    }

    if (win) {
      await report(`gallery-${i}.webp`, src, out);
    } else {
      // Already-small, low-resolution source that WebP cannot beat. Drop the
      // generated file so the component keeps importing the original JPEG.
      await unlink(out);
      console.log(`  ${`gallery-${i}`.padEnd(34)} ${kb(original).padStart(10)}  -> kept original JPEG`);
    }
  }
}

// --- Social card: 1200×630 JPEG (Facebook/LinkedIn) plus a WebP sibling.
// Cropped from the hero so the card matches the site, with exact dimensions
// the crawlers expect. JPEG is the primary og:image — WebP cards fail in
// iMessage, some Slack clients, and older Facebook scrapers.
async function og() {
  console.log('\nSocial card');
  const src = path.join(assets, 'hero-barber.jpg');
  const jpg = path.join(pub, 'og-image.jpg');
  const webp = path.join(pub, 'og-image.webp');

  await sharp(src)
    .resize(1200, 630, { fit: 'cover', position: 'left bottom' })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(jpg);
  await report('og-image.jpg', src, jpg);

  await sharp(src)
    .resize(1200, 630, { fit: 'cover', position: 'left bottom' })
    .webp({ quality: 78, effort: 6 })
    .toFile(webp);
  await report('og-image.webp', src, webp);
}

if (!existsSync(pub)) await mkdir(pub, { recursive: true });

await hero();
await icons();
await logos();
await gallery();
await og();

const before = results.reduce((s, r) => s + r.before, 0);
const after = results.reduce((s, r) => s + r.after, 0);
console.log(`\nTotal (compared files): ${kb(before)} -> ${kb(after)}`);
console.log('Generated files are committed; originals are left in place for manual removal.\n');
