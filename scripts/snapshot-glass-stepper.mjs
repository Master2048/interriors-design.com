import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('.');
const snap = path.join(root, '_snapshots/glass-stepper-pre-magic-bento');
fs.mkdirSync(snap, { recursive: true });

const css = fs.readFileSync(path.join(root, 'css/style.css'), 'utf8');
const cssStart = css.indexOf('/* =========================================================\n   Roadmap — glass stepper');
const cssEnd = css.indexOf('/* =========================================================\n   Portfolio — tilt glass cards');
if (cssStart < 0 || cssEnd < 0) throw new Error('CSS markers not found');
fs.writeFileSync(path.join(snap, 'style.glass-stepper.css'), css.slice(cssStart, cssEnd), 'utf8');

const js = fs.readFileSync(path.join(root, 'js/script.js'), 'utf8');
const jsStart = js.indexOf('  /* ---------------------------------------------------------\n     Border glow on roadmap cards');
const jsEnd = js.indexOf('  /* ---------------------------------------------------------\n     Smooth anchor scrolling');
if (jsStart < 0 || jsEnd < 0) throw new Error('JS markers not found');
fs.writeFileSync(path.join(snap, 'script.border-glow.js'), js.slice(jsStart, jsEnd), 'utf8');

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const htmlStart = html.indexOf('<div class="glass-stepper" id="glass-stepper">');
const htmlEnd = html.indexOf('<!-- ============ PORTFOLIO');
if (htmlStart < 0 || htmlEnd < 0) throw new Error('HTML markers not found');
fs.writeFileSync(path.join(snap, 'index.glass-stepper.html'), html.slice(htmlStart, htmlEnd), 'utf8');

const restore = `# Restore glass-stepper (pre Magic Bento)

1. Replace the Roadmap / glass-stepper / border-glow CSS block in \`css/style.css\`
   (from \`Roadmap — glass stepper\` through just before \`Portfolio — tilt glass cards\`)
   with the contents of \`style.glass-stepper.css\`.
2. Replace \`initBorderGlowCards\` / \`initMagicBentoStepper\` in \`js/script.js\`
   with \`script.border-glow.js\`.
3. Replace the \`#glass-stepper\` markup in \`index.html\` with \`index.glass-stepper.html\`.
4. If you reintroduce \`.edge-light\`, keep the reduced-motion hide rules for it.
`;
fs.writeFileSync(path.join(snap, 'RESTORE.md'), restore, 'utf8');

console.log('snapshot ok:', fs.readdirSync(snap).join(', '));
