import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

/** Collage tiles ~15–31vw; 480≈2x phone column, 720≈2x desktop column */
const WIDTHS = [480, 720];
const QUALITY = 55;
const SOURCES = [
  'assets/img/about/about-1.jpg',
  'assets/img/about/about-2.jpg',
  'assets/img/about/about-4.jpg',
  'assets/img/portfolio/project-1/01.jpg',
  'assets/img/portfolio/project-2/01.jpg',
  'assets/img/portfolio/project-6/01.jpg',
];

async function convertOne(rel) {
  const input = path.resolve(rel);
  if (!fs.existsSync(input)) {
    console.warn(`skip missing: ${rel}`);
    return;
  }

  const dir = path.dirname(input);
  const parsed = path.parse(input);
  const image = sharp(input).rotate();
  const meta = await image.metadata();
  const srcW = meta.width || 0;
  const srcH = meta.height || 0;

  console.log(`${rel}: ${srcW}x${srcH} (${(fs.statSync(input).size / 1024).toFixed(0)}KB jpg)`);

  for (const width of WIDTHS) {
    const targetW = Math.min(width, srcW || width);
    const targetH = srcW ? Math.round((srcH * targetW) / srcW) : null;
    const outWebp = path.join(dir, `${parsed.name}-${width}.webp`);
    const outJpg = path.join(dir, `${parsed.name}-${width}.jpg`);

    await image
      .clone()
      .resize({ width: targetW, withoutEnlargement: true })
      .webp({ quality: QUALITY, effort: 6 })
      .toFile(outWebp);

    await image
      .clone()
      .resize({ width: targetW, withoutEnlargement: true })
      .jpeg({ quality: QUALITY, mozjpeg: true, progressive: true })
      .toFile(outJpg);

    const webpKb = (fs.statSync(outWebp).size / 1024).toFixed(1);
    const jpgKb = (fs.statSync(outJpg).size / 1024).toFixed(1);
    console.log(`  ${width}: ${targetW}x${targetH || '?'}  webp ${webpKb}KB | jpg ${jpgKb}KB`);
  }
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
