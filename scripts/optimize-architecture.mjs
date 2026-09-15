import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const WIDTHS = [480, 720, 960];
const RATIO = 3 / 4;

const JOBS = [
  'assets/img/architecture/still-1.jpg',
  'assets/img/architecture/still-2.jpg',
  'assets/img/architecture/still-3.jpg',
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

  console.log(`${rel}: ${srcW}x${srcH} (${(fs.statSync(input).size / 1024).toFixed(0)}KB)`);

  for (const width of WIDTHS) {
    const height = Math.round(width * RATIO);
    const outWebp = path.join(dir, `${parsed.name}-${width}.webp`);
    const outJpg = path.join(dir, `${parsed.name}-${width}.jpg`);

    await image
      .clone()
      .resize({ width, height, fit: 'cover', position: 'attention', withoutEnlargement: false })
      .webp({ quality: 68, effort: 6 })
      .toFile(outWebp);

    await image
      .clone()
      .resize({ width, height, fit: 'cover', position: 'attention', withoutEnlargement: false })
      .jpeg({ quality: 72, mozjpeg: true, progressive: true })
      .toFile(outJpg);

    console.log(
      `  ${width}x${height}: webp ${(fs.statSync(outWebp).size / 1024).toFixed(1)}KB | jpg ${(fs.statSync(outJpg).size / 1024).toFixed(1)}KB`
    );
  }
}

for (const file of JOBS) {
  await convertOne(file);
}
