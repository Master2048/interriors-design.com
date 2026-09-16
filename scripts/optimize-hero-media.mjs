import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const DIR = path.resolve('assets/img/hero');

async function writePair(pipeline, baseName, { webpQ, jpegQ, writeJpeg = true }) {
  const webp = path.join(DIR, `${baseName}.webp`);
  await pipeline.clone().webp({ quality: webpQ, effort: 6 }).toFile(webp);
  const webpKb = (fs.statSync(webp).size / 1024).toFixed(1);
  let jpgKb = '-';
  if (writeJpeg) {
    const jpg = path.join(DIR, `${baseName}.jpg`);
    await pipeline
      .clone()
      .jpeg({ quality: jpegQ, mozjpeg: true, progressive: true })
      .toFile(jpg);
    jpgKb = (fs.statSync(jpg).size / 1024).toFixed(1);
  }
  console.log(`${baseName}: webp ${webpKb}KB | jpg ${jpgKb}KB`);
}

async function main() {
  const heroJpg = path.join(DIR, 'hero-bg.jpg');
  const vizJpg = path.join(DIR, 'viz-bg.jpg');
  const vizPoster = path.join(DIR, 'viz-poster.webp');
  const heroPoster = path.join(DIR, 'hero-poster.webp');

  // OG / CSS fallback: keep jpg lighter; webp for CSS bg
  if (fs.existsSync(heroJpg)) {
    const img = sharp(fs.readFileSync(heroJpg)).rotate().resize({
      width: 1600,
      withoutEnlargement: true,
    });
    await writePair(img, 'hero-bg', { webpQ: 62, jpegQ: 68 });
  }

  if (fs.existsSync(vizJpg)) {
    const img = sharp(fs.readFileSync(vizJpg)).rotate().resize({
      width: 1600,
      withoutEnlargement: true,
    });
    await writePair(img, 'viz-bg', { webpQ: 55, jpegQ: 60 });
  }

  // Keep viz-poster composition; only re-encode the existing poster frame
  if (fs.existsSync(vizPoster)) {
    const buf = fs.readFileSync(vizPoster);
    const out = await sharp(buf).webp({ quality: 52, effort: 6 }).toBuffer();
    if (out.length < buf.length) {
      fs.writeFileSync(vizPoster, out);
    }
    console.log(`viz-poster: webp ${(fs.statSync(vizPoster).size / 1024).toFixed(1)}KB`);
  }

  // Keep hero-poster composition; only re-encode the existing poster frame
  if (fs.existsSync(heroPoster)) {
    const buf = fs.readFileSync(heroPoster);
    const out = await sharp(buf).webp({ quality: 55, effort: 6 }).toBuffer();
    if (out.length < buf.length) {
      fs.writeFileSync(heroPoster, out);
    }
    console.log(`hero-poster: webp ${(fs.statSync(heroPoster).size / 1024).toFixed(1)}KB`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
