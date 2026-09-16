import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

/** Trust reuses 01-architecture variants; keep in sync with services (800/1200 @55). */
const ROOT = path.resolve('assets/img/services');
const BASE = '01-architecture';
const WIDTHS = [800, 1200];
const QUALITY = 55;

async function main() {
  const candidates = [
    path.join(ROOT, `${BASE}.jpg`),
    path.join(ROOT, `${BASE}.webp`),
  ];
  const input = candidates.find((p) => fs.existsSync(p));
  if (!input) {
    console.error('missing trust source (01-architecture)');
    process.exit(1);
  }

  const image = sharp(fs.readFileSync(input)).rotate();
  const meta = await image.metadata();
  console.log(`source ${meta.width}x${meta.height} from ${path.basename(input)}`);

  for (const width of WIDTHS) {
    const height = Math.round((width * 3) / 4);
    const outWebp = path.join(ROOT, `${BASE}-${width}.webp`);
    const outJpg = path.join(ROOT, `${BASE}-${width}.jpg`);

    await image
      .clone()
      .resize({ width, height, fit: 'cover', position: 'centre' })
      .webp({ quality: QUALITY, effort: 6 })
      .toFile(outWebp);

    await image
      .clone()
      .resize({ width, height, fit: 'cover', position: 'centre' })
      .jpeg({ quality: QUALITY, mozjpeg: true, progressive: true })
      .toFile(outJpg);

    console.log(
      `${BASE}-${width}: ${width}x${height} webp ${(fs.statSync(outWebp).size / 1024).toFixed(0)}KB | jpg ${(fs.statSync(outJpg).size / 1024).toFixed(0)}KB`
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
