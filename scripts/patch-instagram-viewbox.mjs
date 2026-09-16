import fs from 'fs';

const froms = [
  '<symbol id="icon-instagram" viewBox="-5 -10 110 135">',
  '<symbol id="icon-instagram" viewBox="17 3 66 66">',
];
const to = '<symbol id="icon-instagram" viewBox="10 0 80 80">';

for (const file of fs.readdirSync('.').filter((name) => name.endsWith('.html'))) {
  const source = fs.readFileSync(file, 'utf8');
  let next = source;
  for (const from of froms) {
    next = next.replaceAll(from, to);
  }
  if (next === source) continue;
  fs.writeFileSync(file, next, 'utf8');
  console.log('updated', file);
}
