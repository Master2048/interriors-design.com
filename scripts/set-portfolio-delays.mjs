import fs from 'node:fs';
import path from 'node:path';

const htmlPath = path.resolve('index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

const start = html.indexOf('<div class="portfolio__grid">');
const end = html.indexOf('</div>\n    </div>\n  </section>', start);
if (start < 0 || end < 0) throw new Error('portfolio grid not found');

let chunk = html.slice(start, end);
const delays = [null, '1', '2', '3', '4', '5'];
let i = 0;
chunk = chunk.replace(
  /<article class="project-card tilt-card" data-reveal(?: data-reveal-delay="\d+")? data-tilt/g,
  function () {
    const d = delays[i++];
    const delayAttr = d ? ' data-reveal-delay="' + d + '"' : '';
    return '<article class="project-card tilt-card" data-reveal' + delayAttr + ' data-tilt';
  }
);

if (i !== 6) throw new Error('expected 6 cards, got ' + i);
html = html.slice(0, start) + chunk + html.slice(end);
fs.writeFileSync(htmlPath, html, 'utf8');
console.log('delays set for', i, 'cards');
