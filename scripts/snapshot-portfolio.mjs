import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('.');
const snap = path.join(root, '_snapshots/portfolio-pre-projects5');
fs.mkdirSync(snap, { recursive: true });

const css = fs.readFileSync(path.join(root, 'css/style.css'), 'utf8');
const cssStart = css.indexOf('/* =========================================================\n   Portfolio');
const cssEnd = css.indexOf('/* =========================================================\n   Viz');
if (cssStart < 0) throw new Error('CSS portfolio start not found');
// Find next section after portfolio - might be Viz or FAQ
let end = cssEnd;
if (end < 0) {
  const alt = css.indexOf('/* =========================================================\n   FAQ');
  end = alt;
}
if (end < 0) throw new Error('CSS portfolio end not found');
fs.writeFileSync(path.join(snap, 'style.portfolio.css'), css.slice(cssStart, end), 'utf8');

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const htmlStart = html.indexOf('  <!-- ============ PORTFOLIO');
const htmlEnd = html.indexOf('  <!-- ============ VIZ') >= 0
  ? html.indexOf('  <!-- ============ VIZ')
  : html.indexOf('  <!-- ============ FAQ');
// Try cinematic / viz section
let hEnd = html.indexOf('  <!-- ============');
// find PORTFOLIO then next section comment
const afterPort = html.indexOf('  <!-- ============', htmlStart + 10);
if (htmlStart < 0 || afterPort < 0) throw new Error('HTML portfolio markers not found');
fs.writeFileSync(path.join(snap, 'index.portfolio.html'), html.slice(htmlStart, afterPort), 'utf8');

const js = fs.readFileSync(path.join(root, 'js/script.js'), 'utf8');
const tiltStart = js.indexOf('  /* ---------------------------------------------------------\n     Mouse-tilt effect for portfolio cards');
const lightStart = js.indexOf('  /* ---------------------------------------------------------\n     Portfolio lightbox');
const afterLightbox = js.indexOf('  /* ---------------------------------------------------------\n', lightStart + 20);
if (tiltStart >= 0 && afterLightbox > lightStart) {
  fs.writeFileSync(path.join(snap, 'script.portfolio.js'), js.slice(tiltStart, afterLightbox), 'utf8');
}

const restore = `# Restore portfolio (pre projects5)

1. Replace Portfolio CSS block in \`css/style.css\` with \`style.portfolio.css\`.
2. Replace Portfolio HTML section in \`index.html\` with \`index.portfolio.html\`.
3. If needed, restore tilt/lightbox helpers from \`script.portfolio.js\`.
4. Restore responsive \`--portfolio-cols\` overrides in media queries if changed.
`;
fs.writeFileSync(path.join(snap, 'RESTORE.md'), restore, 'utf8');
console.log('ok', fs.readdirSync(snap));
