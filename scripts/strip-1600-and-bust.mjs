import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CACHE = '20260916-41';
const SKIP = new Set(['backups', 'node_modules', '.git', '_snapshots']);

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (e.name.endsWith('.html')) acc.push(p);
  }
  return acc;
}

function strip1600(html) {
  return html
    .replace(/,?\s*assets\/img\/services\/[A-Za-z0-9_-]+-1600\.webp\s+1600w/g, '')
    .replace(/,?\s*assets\/img\/services\/[A-Za-z0-9_-]+-1600\.jpg\s+1600w/g, '')
    .replace(/,?\s*assets\/img\/contacts\/contacts-bg-1600\.webp\s+1600w/g, '')
    .replace(/,?\s*assets\/img\/contacts\/contacts-bg-1600\.jpg\s+1600w/g, '')
    .replace(/,\s*(["'])/g, '$1');
}

function bumpCache(html) {
  return html
    .replace(/style\.min\.css\?v=[^"']+/g, `style.min.css?v=${CACHE}`)
    .replace(/script\.min\.js\?v=[^"']+/g, `script.min.js?v=${CACHE}`)
    .replace(/hero-poster\.webp\?v=[^"']+/g, `hero-poster.webp?v=${CACHE}`)
    .replace(/viz-poster\.webp\?v=[^"']+/g, `viz-poster.webp?v=${CACHE}`);
}

const files = walk(ROOT);
let changed = 0;
for (const file of files) {
  const before = fs.readFileSync(file, 'utf8');
  let html = strip1600(before);
  html = bumpCache(html);
  if (html !== before) {
    fs.writeFileSync(file, html, 'utf8');
    changed += 1;
    console.log('updated', path.relative(ROOT, file));
  }
}

const cssPath = path.join(ROOT, 'css', 'style.css');
let css = fs.readFileSync(cssPath, 'utf8');
const cssBefore = css;
css = css
  .replace(/hero-poster\.webp\?v=[^')]+/g, `hero-poster.webp?v=${CACHE}`)
  .replace(/viz-bg\.webp\?v=[^')]+/g, `viz-bg.webp?v=${CACHE}`)
  .replace(/hero-bg\.webp\?v=[^')]+/g, `hero-bg.webp?v=${CACHE}`);
if (css !== cssBefore) {
  fs.writeFileSync(cssPath, css, 'utf8');
  console.log('updated css/style.css cache tokens');
}

const idx = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
console.log('files changed', changed);
console.log('cyrillic ok', /Дома|контакты|услуги/i.test(idx));
console.log('1600 refs in index', (idx.match(/1600\.(webp|jpg)/g) || []).length);
