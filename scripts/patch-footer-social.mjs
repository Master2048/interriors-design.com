import fs from 'fs';
import path from 'path';

const root = process.cwd();
const vkSvg = fs.readFileSync(path.join(root, 'assets', 'svg', 'vk.svg'), 'utf8');
const pathMatch = vkSvg.match(/\sd="([^"]+)"/);

if (!pathMatch) {
  throw new Error('Could not read path from assets/svg/vk.svg');
}

const iconVk = `<symbol id="icon-vk" viewBox="0 0 24 24"><path fill="currentColor" d="${pathMatch[1]}"/></symbol>`;

const socialBlock = `
      <div class="footer__social">
        <a href="https://www.instagram.com/ymg.design/" class="social" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
          <svg class="icon icon--fill" width="18" height="18" aria-hidden="true"><use href="#icon-instagram"/></svg>
        </a>
        <a href="https://vk.com/ymg.design" class="social" target="_blank" rel="noopener noreferrer" aria-label="ВКонтакте">
          <svg class="icon icon--fill" width="18" height="18" aria-hidden="true"><use href="#icon-vk"/></svg>
        </a>
      </div>`;

const aboutColPattern = /(<div class="footer__col footer__col--about">\s*<a href="[^"]*" class="logo logo--light">[\s\S]*?<\/a>)(\s*<\/div>)/;

for (const file of fs.readdirSync(root).filter((name) => name.endsWith('.html'))) {
  let html = fs.readFileSync(path.join(root, file), 'utf8');
  let changed = false;

  if (!html.includes('id="icon-vk"') && html.includes('id="icon-instagram"')) {
    html = html.replace(
      /<symbol id="icon-instagram"[\s\S]*?<\/symbol>/,
      (match) => `${match}\n    ${iconVk}`,
    );
    changed = true;
  }

  if (!html.includes('footer__social') && aboutColPattern.test(html)) {
    html = html.replace(aboutColPattern, `$1${socialBlock}$2`);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(path.join(root, file), html, 'utf8');
    console.log('updated', file);
  }
}
