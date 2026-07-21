import * as esbuild from 'esbuild';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const jsOut = join(root, 'js/vendor/swiper/swiper-custom.min.js');
const cssOut = join(root, 'css/vendor/swiper/swiper-custom.min.css');

mkdirSync(dirname(jsOut), { recursive: true });
mkdirSync(dirname(cssOut), { recursive: true });

await esbuild.build({
  entryPoints: [join(root, 'scripts/swiper-entry.js')],
  bundle: true,
  minify: true,
  format: 'iife',
  outfile: jsOut,
  target: ['es2018'],
});

await esbuild.build({
  entryPoints: [join(root, 'scripts/swiper-entry.css')],
  bundle: true,
  minify: true,
  outfile: cssOut,
  loader: { '.css': 'css' },
});

const { statSync } = await import('node:fs');
const jsKb = (statSync(jsOut).size / 1024).toFixed(1);
const cssKb = (statSync(cssOut).size / 1024).toFixed(1);
console.log(`Built ${jsOut} (${jsKb} KB)`);
console.log(`Built ${cssOut} (${cssKb} KB)`);
