import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const PHOTO_WEBP = 68;
const PHOTO_JPEG = 72;
const BG_WEBP = 62;
const BG_JPEG = 68;
const WEBP_EFFORT = 6;

const kb = (file) => (fs.statSync(file).size / 1024).toFixed(1);

async function writePair(pipeline, destBase, { webpQ, jpegQ, writeJpeg = true, writeWebp = true }) {
  const out = {};
  if (writeWebp) {
    out.webp = `${destBase}.webp`;
    await pipeline.clone().webp({ quality: webpQ, effort: WEBP_EFFORT }).toFile(out.webp);
  }
  if (writeJpeg) {
    out.jpg = `${destBase}.jpg`;
    await pipeline
      .clone()
      .jpeg({ quality: jpegQ, mozjpeg: true, progressive: true })
      .toFile(out.jpg);
  }
  return out;
}

function logPair(label, out) {
  const parts = [];
  if (out.webp) parts.push(`webp ${kb(out.webp)}KB`);
  if (out.jpg) parts.push(`jpg ${kb(out.jpg)}KB`);
  console.log(`  ${label}: ${parts.join(' | ')}`);
}

async function variantsFromMaster(masterRel, widths, { fit, ratio, position = 'centre', webpQ, jpegQ, writeJpeg = true }) {
  const input = path.resolve(masterRel);
  if (!fs.existsSync(input)) {
    console.warn(`skip missing: ${masterRel}`);
    return;
  }

  const dir = path.dirname(input);
  const base = path.parse(input).name;
  const image = sharp(input).rotate();
  const meta = await image.metadata();
  console.log(`${masterRel}: ${meta.width}x${meta.height} (${kb(input)}KB)`);

  for (const width of widths) {
    const height = ratio ? Math.round(width * ratio) : undefined;
    const pipeline = image.clone().resize({
      width,
      height,
      fit,
      position,
      withoutEnlargement: true,
    });
    const dest = path.join(dir, height ? `${base}-${width}` : `${base}-${width}`);
    const out = await writePair(pipeline, dest, { webpQ, jpegQ, writeJpeg });
    logPair(`${width}${height ? `x${height}` : ''}`, out);
  }
}

async function compressDisplayWebp(masterRel, destRel, { maxWidth, webpQ }) {
  const input = path.resolve(masterRel);
  const dest = path.resolve(destRel);
  if (!fs.existsSync(input)) {
    console.warn(`skip missing: ${masterRel}`);
    return;
  }
  const image = sharp(input).rotate();
  const pipeline = image.resize({ width: maxWidth, withoutEnlargement: true });
  await pipeline.webp({ quality: webpQ, effort: WEBP_EFFORT }).toFile(dest);
  console.log(`  display ${path.relative('.', dest)}: webp ${kb(dest)}KB`);
}

async function optimizeServices() {
  console.log('\n== services ==');
  const files = [
    '01-architecture.jpg',
    '02-interior-design.jpg',
    '03-construction.jpg',
    '04-finishing.jpg',
    '05-landscape-design.jpg',
    '06-landscape-build.jpg',
  ];
  for (const file of files) {
    const master = `assets/img/services/${file}`;
    await variantsFromMaster(master, [800, 1200, 1600], {
      fit: 'cover',
      ratio: 3 / 4,
      webpQ: PHOTO_WEBP,
      jpegQ: PHOTO_JPEG,
    });
    const base = file.replace(/\.jpg$/i, '');
    const webp1600 = path.resolve(`assets/img/services/${base}-1600.webp`);
    const webpPlain = path.resolve(`assets/img/services/${base}.webp`);
    if (fs.existsSync(webp1600)) {
      fs.copyFileSync(webp1600, webpPlain);
      console.log(`  copied ${base}.webp (${kb(webpPlain)}KB)`);
    }
  }
}

async function optimizeContacts() {
  console.log('\n== contacts bg ==');
  const input = path.resolve('assets/img/services/02-interior-design.jpg');
  if (!fs.existsSync(input)) {
    console.warn('skip missing contacts source');
    return;
  }
  const image = sharp(input).rotate();
  const destDir = path.resolve('assets/img/contacts');
  fs.mkdirSync(destDir, { recursive: true });
  console.log(`assets/img/services/02-interior-design.jpg (${kb(input)}KB)`);
  for (const width of [640, 960, 1440, 1600]) {
    const height = Math.round((width * 3) / 4);
    const pipeline = image.clone().resize({
      width,
      height,
      fit: 'cover',
      position: 'centre',
      withoutEnlargement: true,
    });
    const dest = path.join(destDir, `contacts-bg-${width}`);
    const out = await writePair(pipeline, dest, { webpQ: BG_WEBP, jpegQ: BG_JPEG });
    logPair(`${width}x${height}`, out);
  }
}

async function optimizeArchitectureStills() {
  console.log('\n== architecture stills ==');
  for (const file of ['still-1.jpg', 'still-2.jpg', 'still-3.jpg']) {
    await variantsFromMaster(`assets/img/architecture/${file}`, [480, 720, 960], {
      fit: 'cover',
      ratio: 3 / 4,
      position: 'attention',
      webpQ: PHOTO_WEBP,
      jpegQ: PHOTO_JPEG,
    });
  }
}

async function optimizeInteriorStills() {
  console.log('\n== interior stills (4:3) ==');
  for (const file of [
    'assets/img/portfolio/project-1/01.jpg',
    'assets/img/portfolio/project-2/01.jpg',
    'assets/img/portfolio/project-6/01.jpg',
  ]) {
    await variantsFromMaster(file, [480, 720, 960], {
      fit: 'cover',
      ratio: 3 / 4,
      position: 'attention',
      webpQ: PHOTO_WEBP,
      jpegQ: PHOTO_JPEG,
    });
  }
}

async function optimizeCollageAbout() {
  console.log('\n== collage about ==');
  for (const file of ['about-1.jpg', 'about-2.jpg', 'about-4.jpg']) {
    const master = `assets/img/about/${file}`;
    await variantsFromMaster(master, [480, 720], {
      fit: 'inside',
      webpQ: PHOTO_WEBP,
      jpegQ: PHOTO_JPEG,
    });
    await compressDisplayWebp(master, `assets/img/about/${file.replace('.jpg', '.webp')}`, {
      maxWidth: 1400,
      webpQ: PHOTO_WEBP,
    });
  }
}

async function optimizePortfolioCovers() {
  console.log('\n== portfolio covers ==');
  for (let n = 1; n <= 6; n += 1) {
    const master = `assets/img/portfolio/project-${n}/01.jpg`;
    const input = path.resolve(master);
    if (!fs.existsSync(input)) continue;
    const image = sharp(input).rotate();
    const meta = await image.metadata();
    console.log(`${master}: ${meta.width}x${meta.height} (${kb(input)}KB)`);

    for (const width of [800, 1200]) {
      const pipeline = image.clone().resize({ width, withoutEnlargement: true });
      const dest = path.resolve(`assets/img/portfolio/project-${n}/01-${width}`);
      const out = await writePair(pipeline, dest, { webpQ: PHOTO_WEBP, jpegQ: PHOTO_JPEG });
      const info = await sharp(out.jpg).metadata();
      logPair(`${width} (${info.width}x${info.height})`, out);
    }

    await compressDisplayWebp(master, `assets/img/portfolio/project-${n}/01.webp`, {
      maxWidth: 1600,
      webpQ: PHOTO_WEBP,
    });
  }
}

async function optimizePortfolioGallery() {
  console.log('\n== portfolio lightbox webp ==');
  for (let n = 1; n <= 6; n += 1) {
    const dir = path.resolve(`assets/img/portfolio/project-${n}`);
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter((name) => /^\d{2}\.jpg$/i.test(name) && name !== '01.jpg');
    for (const file of files) {
      const master = path.join(dir, file);
      const dest = path.join(dir, file.replace(/\.jpg$/i, '.webp'));
      const before = fs.existsSync(dest) ? kb(dest) : '0';
      await compressDisplayWebp(master, dest, { maxWidth: 1600, webpQ: PHOTO_WEBP });
      console.log(`    was ${before}KB`);
    }
  }
}

async function optimizeHero() {
  console.log('\n== hero ==');
  const jobs = [
    ['assets/img/hero/roadmap-bg.jpg', 'assets/img/hero/roadmap-bg.webp', 1400, BG_WEBP],
    ['assets/img/hero/viz-bg.jpg', 'assets/img/hero/viz-bg.webp', 1600, BG_WEBP],
    ['assets/img/hero/hero-bg.jpg', 'assets/img/hero/hero-bg.webp', 1600, PHOTO_WEBP],
  ];
  for (const [src, dest, maxWidth, webpQ] of jobs) {
    await compressDisplayWebp(src, dest, { maxWidth, webpQ });
  }

}

async function main() {
  console.log(`quality: photo webp ${PHOTO_WEBP} / jpeg ${PHOTO_JPEG}; bg webp ${BG_WEBP} / jpeg ${BG_JPEG}`);
  await optimizeServices();
  await optimizeContacts();
  await optimizeArchitectureStills();
  await optimizeInteriorStills();
  await optimizeCollageAbout();
  await optimizePortfolioCovers();
  await optimizePortfolioGallery();
  await optimizeHero();
  console.log('\ndone');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
