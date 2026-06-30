// One-off asset pipeline: pull the raw photos/logos off the Desktop, resize and
// compress them to web-ready WebP, and drop them into src/assets. Run: npm run optimize
import sharp from 'sharp';
import { mkdirSync, existsSync, copyFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DESKTOP = 'C:/Users/umbra/Desktop';
const IMG = resolve(__dirname, '../src/assets/img');
const BRAND = resolve(__dirname, '../src/assets/brand');
mkdirSync(IMG, { recursive: true });
mkdirSync(BRAND, { recursive: true });

// Large background/feature textures -> wide WebP, quality 80, capped width.
const textures = [
  { in: 'icecream.jpg', out: 'gelato.webp', w: 1600 },     // white Italian gelato
  { in: 'frozenyogurt.jpg', out: 'froyo.webp', w: 1600 },  // frozen yogurt
  { in: 'yogurt.jpg', out: 'yogurt.webp', w: 1400 },       // yogurt + toppings
  { in: 'waffle.jpg', out: 'waffle.webp', w: 1600 },
  { in: 'crepe.jpg', out: 'crepe.webp', w: 1400 },
  { in: 'prishake.jpg', out: 'shake.webp', w: 1400 },
  { in: 'cones.jpg', out: 'cones.webp', w: 1400 },
  { in: 'pistachioice.jpg', out: 'pistachio.webp', w: 1200 },  // pistachio gelato (signature)
  { in: 'ALL.png', out: 'all.webp', w: 1500 },                 // full spread of cups
];

// Brand marks keep transparency -> PNG (trimmed + sized), plus a hi-dpi text logo.
const brand = [
  { in: 'phistucLogo.png', out: 'mark.png', w: 640, png: true, trim: true },
  { in: 'phistucTextLogo.png', out: 'wordmark.png', w: 1100, png: true, trim: true },
];

const run = async () => {
  for (const t of textures) {
    const src = resolve(DESKTOP, t.in);
    if (!existsSync(src)) { console.warn('skip (missing):', t.in); continue; }
    await sharp(src)
      .resize({ width: t.w, withoutEnlargement: true })
      .webp({ quality: 80, effort: 6 })
      .toFile(resolve(IMG, t.out));
    console.log('texture ->', t.out);
  }
  for (const b of brand) {
    const src = resolve(DESKTOP, b.in);
    if (!existsSync(src)) { console.warn('skip (missing):', b.in); continue; }
    let img = sharp(src);
    if (b.trim) img = img.trim({ threshold: 10 });
    await img
      .resize({ width: b.w, withoutEnlargement: true })
      .png({ compressionLevel: 9, quality: 90 })
      .toFile(resolve(BRAND, b.out));
    console.log('brand ->', b.out);
  }
  // Keep an untrimmed full-color lockup around for social/preview if needed.
  const lockup = resolve(DESKTOP, 'Gemini_Generated_Image_fve8n2fve8n2fve8.png');
  if (existsSync(lockup)) {
    await sharp(lockup).resize({ width: 1200 }).png({ compressionLevel: 9 })
      .toFile(resolve(BRAND, 'lockup.png'));
    console.log('brand -> lockup.png');
  }
  console.log('done.');
};
run().catch((e) => { console.error(e); process.exit(1); });
