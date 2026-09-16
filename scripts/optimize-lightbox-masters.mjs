import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

/** Lightbox / data-full masters: max edge 1200, quality ~70. */
const SOURCES = [
  'assets/img/about/about-1.jpg',
  'assets/img/about/about-2.jpg',
  'assets/img/about/about-4.jpg',
  'assets/img/portfolio/project-1/01.jpg',
  'assets/img/portfolio/project-2/01.jpg',
  'assets/img/portfolio/project-3/01.jpg',
  'assets/img/portfolio/project-4/01.jpg',
  'assets/img/portfolio/project-5/01.jpg',
  'assets/img/portfolio/project-6/01.jpg',
];
const MAX_W = 1200;
const WEBP_Q = 70;
const JPEG_Q = 72;

async function convertOne(rel) {
  const input = path.resolve(rel);
  if (!fs.existsSync(input)) {
    console.warn(`skip missing: ${rel}`);
    return;
  }

  const dir = path.dirname(input);
  const name = path.parse(input).name;
  const buffer = fs.readFileSync(input);
  const image = sharp(buffer).rotate();
  const meta = await image.metadata();
  const targetW = Math.min(MAX_W, meta.width || MAX_W);

  const outWebp = path.join(dir, `${name}.webp`);
  const outJpg = path.join(dir, `${name}.jpg`);

  await image
    .clone()
    .resize({ width: targetW, withoutEnlargement: true })
    .webp({ quality: WEBP_Q, effort: 6 })
    .toFile(outWebp);

  await image
    .clone()
    .resize({ width: targetW, withoutEnlargement: true })
    .jpeg({ quality: JPEG_Q, mozjpeg: true, progressive: true })
    .toFile(outJpg);

  const webpKb = (fs.statSync(outWebp).size / 1024).toFixed(1);
  const jpgKb = (fs.statSync(outJpg).size / 1024).toFixed(1);
  console.log(`${rel}: ${meta.width}x${meta.height} → ${targetW}  webp ${webpKb}KB | jpg ${jpgKb}KB`);
}

async function main() {
  for (const file of SOURCES) {
    await convertOne(file);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
