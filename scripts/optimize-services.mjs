import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve('assets/img/services');
const WIDTHS = [800, 1200, 1600];
const SOURCES = [
  '01-architecture.jpg',
  '02-interior-design.jpg',
  '03-construction.jpg',
  '04-finishing.jpg',
  '05-landscape-design.jpg',
  '06-landscape-build.jpg',
];

async function convertOne(file) {
  const base = file.replace(/\.jpg$/i, '');
  const input = path.join(ROOT, file);
  const image = sharp(input).rotate();

  for (const width of WIDTHS) {
    const outWebp = path.join(ROOT, `${base}-${width}.webp`);
    const outJpg = path.join(ROOT, `${base}-${width}.jpg`);

    await image
      .clone()
      .resize({ width, height: Math.round((width * 3) / 4), fit: 'cover', position: 'centre' })
      .webp({ quality: 78, effort: 5 })
      .toFile(outWebp);

    await image
      .clone()
      .resize({ width, height: Math.round((width * 3) / 4), fit: 'cover', position: 'centre' })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(outJpg);

    const webpStat = fs.statSync(outWebp);
    const jpgStat = fs.statSync(outJpg);
    console.log(
      `${base}-${width}: webp ${(webpStat.size / 1024).toFixed(0)}KB | jpg ${(jpgStat.size / 1024).toFixed(0)}KB`
    );
  }
}

async function main() {
  for (const file of SOURCES) {
    const full = path.join(ROOT, file);
    if (!fs.existsSync(full)) {
      console.warn(`skip missing: ${file}`);
      continue;
    }
    await convertOne(file);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
