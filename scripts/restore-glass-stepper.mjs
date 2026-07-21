import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('.');
const snap = path.join(root, '_snapshots/glass-stepper-pre-magic-bento');

const cssPath = path.join(root, 'css/style.css');
const jsPath = path.join(root, 'js/script.js');
const htmlPath = path.join(root, 'index.html');

const cssSnap = fs.readFileSync(path.join(snap, 'style.glass-stepper.css'), 'utf8');
const jsSnap = fs.readFileSync(path.join(snap, 'script.border-glow.js'), 'utf8');
const htmlSnap = fs.readFileSync(path.join(snap, 'index.glass-stepper.html'), 'utf8');

let css = fs.readFileSync(cssPath, 'utf8');
const cssStart = css.indexOf('/* =========================================================\n   Roadmap — glass stepper');
const cssEnd = css.indexOf('/* =========================================================\n   Portfolio — tilt glass cards');
if (cssStart < 0 || cssEnd < 0) throw new Error('CSS markers not found');
css = css.slice(0, cssStart) + cssSnap + css.slice(cssEnd);

// Restore reduced-motion edge-light rules if Magic Bento version replaced them
css = css.replace(
  `.glass-stepper__spotlight{ display: none !important; }
  .glass-stepper__item.border-glow-card::before,
  .glass-stepper__item.border-glow-card::after{ display: none; }`,
  `.glass-stepper__item.border-glow-card::before,
  .glass-stepper__item.border-glow-card::after,
  .glass-stepper__item.border-glow-card > .edge-light{ display: none; }`
);

fs.writeFileSync(cssPath, css, 'utf8');

let js = fs.readFileSync(jsPath, 'utf8');
const jsStart = js.indexOf('  /* ---------------------------------------------------------\n     Magic Bento glow on roadmap cards');
const jsStartAlt = js.indexOf('  /* ---------------------------------------------------------\n     Border glow on roadmap cards');
const jsEnd = js.indexOf('  /* ---------------------------------------------------------\n     Smooth anchor scrolling');
const start = jsStart >= 0 ? jsStart : jsStartAlt;
if (start < 0 || jsEnd < 0) throw new Error('JS markers not found');
js = js.slice(0, start) + jsSnap + js.slice(jsEnd);
fs.writeFileSync(jsPath, js, 'utf8');

let html = fs.readFileSync(htmlPath, 'utf8');
const htmlStart = html.indexOf('<div class="glass-stepper" id="glass-stepper">');
const htmlEnd = html.indexOf('<!-- ============ PORTFOLIO');
if (htmlStart < 0 || htmlEnd < 0) throw new Error('HTML markers not found');
html = html.slice(0, htmlStart) + htmlSnap + html.slice(htmlEnd);
fs.writeFileSync(htmlPath, html, 'utf8');

console.log('Restored glass-stepper from snapshot');
