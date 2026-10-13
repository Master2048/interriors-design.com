import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

/**
 * Project pages (project-N.html) gallery images.
 *
 * From the heavy source NN.jpg builds:
 *   NN.webp       — full / lightbox, fits inside 1600×1600
 *   NN-1024.webp  — desktop 1x / mobile 2–3x
 *   NN-640.webp   — mobile / narrow column
 * then rewrites the gallery <img> with srcset + sizes that follow the
 * real layout (css/style.css .project-gallery*), so phones never pull
 * the full file.
 *
 * Source JPGs that no page references are removed afterwards; the few
 * that are referenced (og / schema / contacts fallback) are re-encoded.
 */
const ROOT = path.resolve('assets/img/portfolio');
const PROJECTS = [1, 2, 3, 4, 5, 6];
const FULL_BOX = 1600;
const VARIANTS = [640, 1024];
const WEBP_Q = 72;
const VARIANT_Q = 70;
const JPEG_Q = 78;
/** JPGs still referenced by markup: name → max width. */
const KEEP_JPG = { '02': 1200, '03': 1200, '04': 1200 };
const KEEP_JPG_EXTRA = { 'project-2/05': 1600 }; // contacts.html hero fallback

const kb = (f) => (fs.statSync(f).size / 1024).toFixed(0);

async function writeWebp(src, out, opts, quality) {
  const tmp = `${out}.tmp`;
  const info = await sharp(src).rotate().resize(opts).webp({ quality, effort: 6 }).toFile(tmp);
  fs.renameSync(tmp, out);
  return info;
}

async function processProject(n) {
  const dir = path.join(ROOT, `project-${n}`);
  const dims = {};
  const names = fs.readdirSync(dir)
    .map((f) => (f.match(/^(\d\d)\.webp$/) || [])[1])
    .filter(Boolean)
    .sort();

  for (const name of names) {
    const jpg = path.join(dir, `${name}.jpg`);
    const full = path.join(dir, `${name}.webp`);

    if (name === '01') {
      // Already a 1200px master shared with hero/cards: only add the small variant.
      const meta = await sharp(full).metadata();
      dims[name] = { w: meta.width, h: meta.height, widths: [640, meta.width] };
      const v640 = path.join(dir, '01-640.webp');
      if (!fs.existsSync(v640)) {
        await writeWebp(fs.existsSync(jpg) ? jpg : full, v640, { width: 640 }, VARIANT_Q);
      }
      continue;
    }

    if (fs.existsSync(jpg)) {
      const src = fs.readFileSync(jpg);
      const info = await writeWebp(src, full, {
        width: FULL_BOX, height: FULL_BOX, fit: 'inside', withoutEnlargement: true,
      }, WEBP_Q);
      for (const w of VARIANTS) {
        if (w < info.width * 0.9) {
          await writeWebp(src, path.join(dir, `${name}-${w}.webp`), { width: w }, VARIANT_Q);
        }
      }

      const keepW = KEEP_JPG_EXTRA[`project-${n}/${name}`] || KEEP_JPG[name];
      if (keepW) {
        const tmp = `${jpg}.tmp`;
        await sharp(src).rotate().resize({ width: keepW, withoutEnlargement: true })
          .jpeg({ quality: JPEG_Q, mozjpeg: true, progressive: true }).toFile(tmp);
        fs.renameSync(tmp, jpg);
      } else {
        fs.unlinkSync(jpg);
      }
    }

    const meta = await sharp(full).metadata();
    const widths = VARIANTS.filter((w) => fs.existsSync(path.join(dir, `${name}-${w}.webp`)));
    dims[name] = { w: meta.width, h: meta.height, widths: [...widths, meta.width] };
  }

  // Unused intermediate cover size.
  for (const ext of ['jpg', 'webp']) {
    const f = path.join(dir, `01-800.${ext}`);
    if (fs.existsSync(f)) fs.unlinkSync(f);
  }

  return dims;
}

/**
 * Rendered CSS width of an image of aspect `a` inside a gallery slot.
 * Desktop row: wide (flex 1.85) is 4:3, narrow (flex 1) stretches to the
 * row height → box aspect 1 / (0.75 · 1.85). Mobile (≤760px): square.
 */
function sizesFor(kind, a) {
  const r = (x) => Math.round(x * 1000) / 1000;
  const mobile = r(Math.max(1, a));
  const share = kind === 'wide' ? 1.85 / 2.85 : 1 / 2.85;
  const cover = kind === 'wide' ? Math.max(1, a / (4 / 3)) : Math.max(1, a * 0.75 * 1.85);
  const desk = r(share * cover);
  // content width: ≤720 100vw-40, ≤1180 100vw-80, ≤1280 100vw-128, then 1152; minus 24px gap
  return [
    `(max-width: 720px) calc((100vw - 40px) * ${mobile})`,
    `(max-width: 760px) calc((100vw - 80px) * ${mobile})`,
    `(max-width: 1180px) calc((100vw - 104px) * ${desk})`,
    `(max-width: 1280px) calc((100vw - 152px) * ${desk})`,
    `${Math.ceil(1128 * desk)}px`,
  ].join(', ');
}

function rewriteHtml(n, dims) {
  const file = path.resolve(`project-${n}.html`);
  let html = fs.readFileSync(file, 'utf8');
  const base = `assets/img/portfolio/project-${n}`;
  let count = 0;

  const re = new RegExp(
    `(<figure class="project-gallery__item project-gallery__item--(wide|narrow)"[^>]*>)<img src="${base}/(\\d\\d)\\.webp"(?: srcset="[^"]*" sizes="[^"]*")? (alt="[^"]*") width="\\d+" height="\\d+"`,
    'g',
  );
  html = html.replace(re, (m, fig, kind, name, alt) => {
    const d = dims[name];
    if (!d) return m;
    count++;
    const srcset = d.widths
      .map((w, i) => `${base}/${name}${i === d.widths.length - 1 ? '' : `-${w}`}.webp ${w}w`)
      .join(', ');
    return `${fig}<img src="${base}/${name}.webp" srcset="${srcset}" sizes="${sizesFor(kind, d.w / d.h)}" ${alt} width="${d.w}" height="${d.h}"`;
  });

  // Preload must match the hero <picture> sources, otherwise phones fetch both.
  html = html.replace(
    /<link rel="preload" as="image" href="assets\/img\/portfolio\/project-\d\/01\.webp" type="image\/webp">/,
    [
      `<link rel="preload" as="image" href="${base}/01-720.webp" type="image/webp" media="(max-width: 720px)">`,
      `<link rel="preload" as="image" href="${base}/01-960.webp" type="image/webp" media="(min-width: 721px) and (max-width: 1200px)">`,
      `<link rel="preload" as="image" href="${base}/01-1200.webp" type="image/webp" media="(min-width: 1201px) and (max-width: 1600px)">`,
      `<link rel="preload" as="image" href="${base}/01.webp" type="image/webp" media="(min-width: 1601px)">`,
    ].join('\n'),
  );

  fs.writeFileSync(file, html);
  console.log(`project-${n}.html: ${count} gallery images updated`);
}

async function main() {
  for (const n of PROJECTS) {
    const dims = await processProject(n);
    const dir = path.join(ROOT, `project-${n}`);
    const total = fs.readdirSync(dir).reduce((s, f) => s + fs.statSync(path.join(dir, f)).size, 0);
    console.log(`project-${n}: ${Object.keys(dims).length} photos, folder ${(total / 1048576).toFixed(1)} MB`);
    rewriteHtml(n, dims);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
