import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const src = path.resolve('assets/img/page-hero/brand-lockup.png');
const outDir = path.resolve('assets/img/page-hero');
const desktopWidths = [960, 1440, 1920];

fs.mkdirSync(outDir, { recursive: true });

const image = sharp(src).rotate();
const meta = await image.metadata();
console.log(`source: ${meta.width}x${meta.height}`);

for (const width of desktopWidths) {
  const height = Math.round((width * 9) / 16);
  const webp = path.join(outDir, `brand-${width}.webp`);
  const jpg = path.join(outDir, `brand-${width}.jpg`);

  await image
    .clone()
    .resize({ width, height, fit: 'cover', position: 'centre' })
    .webp({ quality: 74, effort: 6 })
    .toFile(webp);

  await image
    .clone()
    .resize({ width, height, fit: 'cover', position: 'centre' })
    .jpeg({ quality: 80, mozjpeg: true, progressive: true })
    .toFile(jpg);

  const webpKb = (fs.statSync(webp).size / 1024).toFixed(1);
  const jpgKb = (fs.statSync(jpg).size / 1024).toFixed(1);
  console.log(`desktop ${width}x${height}: webp ${webpKb}KB | jpg ${jpgKb}KB`);
}

const mobileW = 960;
const mobileH = 1280;
const fitted = await image
  .clone()
  .resize({ width: mobileW, height: Math.round((mobileW * 9) / 16), fit: 'cover', position: 'centre' })
  .toBuffer();

const mobileBase = sharp({
  create: {
    width: mobileW,
    height: mobileH,
    channels: 3,
    background: { r: 8, g: 9, b: 12 },
  },
}).composite([{ input: fitted, top: 120, left: 0 }]);

const mobileWebp = path.join(outDir, 'brand-mobile-960.webp');
const mobileJpg = path.join(outDir, 'brand-mobile-960.jpg');

await mobileBase.clone().webp({ quality: 74, effort: 6 }).toFile(mobileWebp);
await mobileBase.clone().jpeg({ quality: 80, mozjpeg: true, progressive: true }).toFile(mobileJpg);

console.log(
  `mobile ${mobileW}x${mobileH}: webp ${(fs.statSync(mobileWebp).size / 1024).toFixed(1)}KB | jpg ${(fs.statSync(mobileJpg).size / 1024).toFixed(1)}KB`
);
