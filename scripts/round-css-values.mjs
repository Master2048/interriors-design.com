import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'css', 'style.css');
let css = fs.readFileSync(filePath, 'utf8');

const placeholders = [];

function protect(regex) {
  css = css.replace(regex, (match) => {
    const key = `__PROT_${placeholders.length}__`;
    placeholders.push(match);
    return key;
  });
}

protect(/rgba?\([^)]*\)/gi);
protect(/hsla?\([^)]*\)/gi);
protect(/cubic-bezier\([^)]*\)/gi);
protect(/letter-spacing:\s*-?\d*\.?\d+em/gi);
protect(/word-spacing:\s*-?\d*\.?\d+em/gi);

function smartRound(n) {
  const abs = Math.abs(n);
  if (abs < 5) return Math.round(n);
  return Math.round(n / 5) * 5;
}

function roundPx(n) {
  return smartRound(n);
}

function roundRem(n) {
  const rawPx = n * 16;
  const px = Math.abs(n) < 1 ? Math.round(rawPx) : smartRound(rawPx);
  if (px !== 0 && px % 16 === 0) {
    return { value: px / 16, unit: 'rem' };
  }
  return { value: px, unit: 'px' };
}

function roundEm(n) {
  if (Math.abs(n) < 1) return { value: n, unit: 'em' };
  return { value: smartRound(n), unit: 'em' };
}

function roundByUnit(n, unit) {
  const u = unit.toLowerCase();
  if (u === 'px') return { value: roundPx(n), unit: 'px' };
  if (u === 'rem') return roundRem(n);
  if (u === 'em') return roundEm(n);
  if (u === 'vw' || u === 'vh' || u === 'svh' || u === 'lvh' || u === 'dvh' || u === '%' || u === 'ch') {
    return { value: Math.round(n), unit: u };
  }
  return { value: n, unit: u };
}

function formatNumber(n) {
  if (Object.is(n, -0)) return '0';
  return String(n);
}

function roundLine(line) {
  return line.replace(/(-?\d+\.\d+)(px|rem|em|vw|vh|svh|lvh|dvh|%|ch)/gi, (match, numStr, unit) => {
    const num = parseFloat(numStr);
    if (Number.isNaN(num)) return match;
    const rounded = roundByUnit(num, unit);
    if (rounded.value === num && rounded.unit === unit.toLowerCase()) return match;
    return formatNumber(rounded.value) + rounded.unit;
  });
}

css = css.split('\n').map(roundLine).join('\n');

placeholders.forEach((value, index) => {
  css = css.replace(`__PROT_${index}__`, value);
});

fs.writeFileSync(filePath, css, 'utf8');

const remaining = (css.match(/-?\d+\.\d+(px|rem|em|vw|vh|svh|lvh|dvh|%|ch)/gi) || []).length;
console.log('Done. Remaining fractional dimensions:', remaining);
