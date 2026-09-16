import fs from 'fs';

const pattern = /(<div class="footer__col footer__col--about">\s*)(<a href="[^"]*" class="logo logo--light">[\s\S]*?<\/a>\s*<div class="footer__social">[\s\S]*?<\/div>)(\s*<\/div>)/;

for (const file of fs.readdirSync('.').filter((name) => name.endsWith('.html'))) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes('footer__social') || source.includes('footer__brand')) continue;

  const next = source.replace(pattern, '$1<div class="footer__brand">$2</div>$3');
  if (next === source) {
    console.warn('skip', file);
    continue;
  }

  fs.writeFileSync(file, next, 'utf8');
  console.log('updated', file);
}
