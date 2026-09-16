import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

/**
 * Homepage / portfolio-index card covers.
 * Card CSS is 16 / 10. Mobile ~350 CSS px (2x ≈ 700), desktop half-column ~560–640 (2x ≈ 1200).
 */
const ROOT = path.resolve('assets/img/portfolio');
const PROJECTS = [1, 2, 3, 4, 5, 6];
const SIZES = [
  { width: 720, height: 450, label: '720' },   // mobile
  { width: 1200, height: 750, label: '1200' }, // desktop
];
const QUALITY = 60;

async function convertProject(n) {
  const dir = path.join(ROOT, `project-${n}`);
  const inputJpg = path.join(dir, '01.jpg');
  const inputWebp = path.join(dir, '01.webp');
  const input = fs.existsSync(inputJpg) ? inputJpg : inputWebp;
  if (!fs.existsSync(input)) {
    console.warn(`skip missing project-${n}`);
    return;
  }

  const image = sharp(input).rotate();
  const meta = await image.metadata();
  console.log(`project-${n} source ${meta.width}x${meta.height}`);

  for (const size of SIZES) {
    const outWebp = path.join(dir, `01-${size.label}.webp`);
    const outJpg = path.join(dir, `01-${size.label}.jpg`);

    await image
      .clone()
      .resize({
        width: size.width,
        height: size.height,
        fit: 'cover',
        position: 'centre',
      })
      .webp({ quality: QUALITY, effort: 6 })
      .toFile(outWebp);

    await image
      .clone()
      .resize({
        width: size.width,
        height: size.height,
        fit: 'cover',
        position: 'centre',
      })
      .jpeg({ quality: QUALITY, mozjpeg: true, progressive: true })
      .toFile(outJpg);

    const webpKb = (fs.statSync(outWebp).size / 1024).toFixed(0);
    const jpgKb = (fs.statSync(outJpg).size / 1024).toFixed(0);
    console.log(`  01-${size.label}: webp ${webpKb}KB | jpg ${jpgKb}KB`);
  }
}

async function main() {
  for (const n of PROJECTS) {
    await convertProject(n);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
