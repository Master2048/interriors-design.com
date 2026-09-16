import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const DIR = path.resolve('assets/img/hero');
const QUALITY = 60;
const WIDTHS = [720, 1120];

async function main() {
  const candidates = [
    path.join(DIR, 'roadmap-bg-1120.jpg'),
    path.join(DIR, 'roadmap-bg.jpg'),
    path.join(DIR, 'roadmap-bg.webp'),
  ];
  const input = candidates.find((p) => fs.existsSync(p));
  if (!input) {
    console.error('missing roadmap source');
    process.exit(1);
  }

  const buffer = fs.readFileSync(input);
  const image = sharp(buffer).rotate();
  const meta = await image.metadata();
  console.log(`source ${meta.width}x${meta.height} from ${path.basename(input)}`);

  for (const width of WIDTHS) {
    const outWebp = path.join(DIR, `roadmap-bg-${width}.webp`);
    const outJpg = path.join(DIR, `roadmap-bg-${width}.jpg`);

    await image
      .clone()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: QUALITY, effort: 6 })
      .toFile(outWebp);

    await image
      .clone()
      .resize({ width, withoutEnlargement: true })
      .jpeg({ quality: QUALITY, mozjpeg: true, progressive: true })
      .toFile(outJpg);

    const m = await sharp(outWebp).metadata();
    console.log(
      `roadmap-bg-${width}: ${m.width}x${m.height} webp ${(fs.statSync(outWebp).size / 1024).toFixed(0)}KB | jpg ${(fs.statSync(outJpg).size / 1024).toFixed(0)}KB`
    );
  }

  // Canonical names for CSS fallback / old references
  fs.writeFileSync(path.join(DIR, 'roadmap-bg.webp'), fs.readFileSync(path.join(DIR, 'roadmap-bg-1120.webp')));
  fs.writeFileSync(path.join(DIR, 'roadmap-bg.jpg'), fs.readFileSync(path.join(DIR, 'roadmap-bg-1120.jpg')));
  console.log('updated roadmap-bg.webp / roadmap-bg.jpg as 1120 master');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
