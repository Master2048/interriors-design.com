import fs from 'fs';

const version = '20260918-29';

for (const file of fs.readdirSync('.').filter((name) => name.endsWith('.html'))) {
  const source = fs.readFileSync(file, 'utf8');
  const next = source
    .replace(/style\.min\.css\?v=[^"']+/g, `style.min.css?v=${version}`)
    .replace(/script\.min\.js\?v=[^"']+/g, `script.min.js?v=${version}`);

  if (next !== source) {
    fs.writeFileSync(file, next, 'utf8');
    console.log('updated', file);
  }
}
