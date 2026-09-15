const fs = require('fs');

let updated = 0;
for (const file of fs.readdirSync('.').filter((name) => name.endsWith('.html'))) {
  const html = fs.readFileSync(file, 'utf8');
  const next = html.replaceAll('20260916-13', '20260916-14');
  if (next !== html) {
    fs.writeFileSync(file, next, 'utf8');
    updated += 1;
  }
}

const index = fs.readFileSync('index.html', 'utf8');
console.log(JSON.stringify({
  updated,
  version: (index.match(/style\.min\.css\?v=([^"]+)/) || [])[1],
  replacementCharacters: (index.match(/\uFFFD/g) || []).length,
}));
