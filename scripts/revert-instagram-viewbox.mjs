import fs from 'fs';

const original = '<symbol id="icon-instagram" viewBox="-5 -10 110 135">';
const variants = [
  '<symbol id="icon-instagram" viewBox="17 3 66 66">',
  '<symbol id="icon-instagram" viewBox="10 0 80 80">',
];

for (const file of fs.readdirSync('.').filter((name) => name.endsWith('.html'))) {
  let html = fs.readFileSync(file, 'utf8');
  let changed = false;

  for (const variant of variants) {
    if (html.includes(variant)) {
      html = html.replaceAll(variant, original);
      changed = true;
    }
  }

  const instagramFooter = 'class="social" target="_blank" rel="noopener noreferrer" aria-label="Instagram"';
  const instagramFooterMod = 'class="social social--instagram" target="_blank" rel="noopener noreferrer" aria-label="Instagram"';
  if (html.includes(instagramFooter)) {
    html = html.replaceAll(instagramFooter, instagramFooterMod);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, html, 'utf8');
    console.log('updated', file);
  }
}
