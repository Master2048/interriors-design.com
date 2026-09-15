import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const src = path.resolve('assets/img/services/02-interior-design.jpg');
const outDir = path.resolve('assets/img/contacts');
const widths = [640, 960, 1440, 1600];

fs.mkdirSync(outDir, { recursive: true });

const image = sharp(src).rotate();

for (const width of widths) {
  const height = Math.round((width * 3) / 4);
  const webp = path.join(outDir, `contacts-bg-${width}.webp`);
  const jpg = path.join(outDir, `contacts-bg-${width}.jpg`);

  await image
    .clone()
    .resize({ width, height, fit: 'cover', position: 'centre' })
    .webp({ quality: 62, effort: 6 })
    .toFile(webp);

  await image
    .clone()
    .resize({ width, height, fit: 'cover', position: 'centre' })
    .jpeg({ quality: 68, mozjpeg: true, progressive: true })
    .toFile(jpg);

  const webpKb = (fs.statSync(webp).size / 1024).toFixed(1);
  const jpgKb = (fs.statSync(jpg).size / 1024).toFixed(1);
  console.log(`${width}: webp ${webpKb}KB | jpg ${jpgKb}KB`);
}
