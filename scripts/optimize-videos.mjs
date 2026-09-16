import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Re-encode muted ambient MP4s for the web.
 * Uses scale + CRF aggressive enough for overlay backgrounds.
 * Replaces source only when the new file is clearly smaller.
 */
const DIR = path.resolve('video');

/** Homepage-critical first; then unused library clips. */
const JOBS = [
  { file: 'Video_5.mp4', scale: 960, crf: 30, fps: 24 }, // hero
  { file: 'Video_4.mp4', scale: 960, crf: 30, fps: 24 }, // viz
  { file: 'Video_1.mp4', scale: 960, crf: 30, fps: 24 },
  { file: 'Video_2.mp4', scale: 960, crf: 30, fps: 24 },
  { file: 'Video_3.mp4', scale: 854, crf: 30, fps: 24 },
];

function kb(n) {
  return (n / 1024).toFixed(0);
}

function replaceFile(tmp, dest) {
  try {
    fs.copyFileSync(tmp, dest);
    fs.unlinkSync(tmp);
  } catch (err) {
    // Windows often locks the live file; leave tmp for manual swap
    console.error(`replace failed for ${path.basename(dest)}: ${err.message}`);
    console.error(`kept temp: ${tmp}`);
  }
}

function encodeOne({ file, scale, crf, fps }) {
  const input = path.join(DIR, file);
  if (!fs.existsSync(input)) {
    console.warn(`skip missing: ${file}`);
    return;
  }

  const tmp = path.join(DIR, `${path.parse(file).name}.opt.tmp.mp4`);
  if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
  const before = fs.statSync(input).size;

  const args = [
    '-y',
    '-i',
    input,
    '-an',
    '-c:v',
    'libx264',
    '-preset',
    'slow',
    '-crf',
    String(crf),
    '-vf',
    `scale='min(${scale},iw)':-2,fps=${fps}`,
    '-pix_fmt',
    'yuv420p',
    '-profile:v',
    'main',
    '-level',
    '4.0',
    '-movflags',
    '+faststart',
    tmp,
  ];

  console.log(`\n→ ${file} (${kb(before)} KB) scale≤${scale} crf=${crf} fps=${fps}`);
  const result = spawnSync('ffmpeg', args, { stdio: 'inherit' });
  if (result.status !== 0 || !fs.existsSync(tmp)) {
    console.error(`ffmpeg failed for ${file}`);
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
    return;
  }

  const after = fs.statSync(tmp).size;
  if (after < before * 0.9) {
    replaceFile(tmp, input);
    if (!fs.existsSync(tmp)) {
      const saved = before - after;
      console.log(
        `✓ ${file}: ${kb(before)} → ${kb(after)} KB (−${kb(saved)} KB, −${((1 - after / before) * 100).toFixed(0)}%)`
      );
    }
  } else {
    fs.unlinkSync(tmp);
    console.log(`· ${file}: kept original (${kb(before)} KB; new ${kb(after)} KB not enough smaller)`);
  }
}

for (const job of JOBS) {
  encodeOne(job);
}
