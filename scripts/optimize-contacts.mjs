import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

/** Contacts bg is blurred + darkened; 640/960/1440 is enough (no 1600). */
const src = path.resolve('assets/img/services/02-interior-design.jpg');
const outDir = path.resolve('assets/img/contacts');
const widths = [640, 960, 1440];
const WEBP_Q = 52;
const JPEG_Q = 56;

fs.mkdirSync(outDir, { recursive: true });

const image = sharp(src).rotate();

for (const width of widths) {
  const height = Math.round((width * 3) / 4);
  const webp = path.join(outDir, `contacts-bg-${width}.webp`);
  const jpg = path.join(outDir, `contacts-bg-${width}.jpg`);

  await image
    .clone()
    .resize({ width, height, fit: 'cover', position: 'centre' })
    .webp({ quality: WEBP_Q, effort: 6 })
    .toFile(webp);

  await image
    .clone()
    .resize({ width, height, fit: 'cover', position: 'centre' })
    .jpeg({ quality: JPEG_Q, mozjpeg: true, progressive: true })
    .toFile(jpg);

  const webpKb = (fs.statSync(webp).size / 1024).toFixed(1);
  const jpgKb = (fs.statSync(jpg).size / 1024).toFixed(1);
  console.log(`${width}: webp ${webpKb}KB | jpg ${jpgKb}KB`);
}

for (const width of [1600]) {
  for (const ext of ['webp', 'jpg']) {
    const dead = path.join(outDir, `contacts-bg-${width}.${ext}`);
    if (fs.existsSync(dead)) {
      fs.unlinkSync(dead);
      console.log(`removed ${path.basename(dead)}`);
    }
  }
}
