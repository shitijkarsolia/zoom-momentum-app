// Finds the content window inside a raw Playwright capture.
//
// The capture has an unavoidable pre-roll (page load, tour dismissal) and a
// tail, and Playwright's webm timestamps do not track wall clock, so the cut
// points cannot be assumed from the shoot script's own schedule. The take is
// topped and tailed with a full-frame black hold, so this locates those holds
// by mean luminance and prints the window between them.
//
//   node scripts/social-video/find-window.mjs <capture.webm>
//
// Prints shell-eval-able START/END/DURATION (seconds, video timebase).

import { spawn } from 'child_process';

const file = process.argv[2];
if (!file) { console.error('usage: find-window.mjs <capture.webm>'); process.exit(1); }

const W = 32, H = 18, FPS = 25;
const FRAME = W * H;

const ff = spawn('ffmpeg', [
  '-v', 'error', '-i', file,
  '-vf', `fps=${FPS},scale=${W}:${H},format=gray`,
  '-f', 'rawvideo', '-',
]);

const chunks = [];
ff.stdout.on('data', (d) => chunks.push(d));
ff.stderr.on('data', (d) => process.stderr.write(d));

ff.on('close', () => {
  const buf = Buffer.concat(chunks);
  const n = Math.floor(buf.length / FRAME);
  const mean = [];
  for (let i = 0; i < n; i++) {
    let s = 0;
    for (let p = 0; p < FRAME; p++) s += buf[i * FRAME + p];
    mean.push(s / FRAME);
  }

  const BLACK = 8;      // mean luma below this is a black hold
  const CONTENT = 14;   // mean luma above this is real content

  // First content frame after the leading black hold.
  let lastLeadingBlack = -1;
  for (let i = 0; i < n; i++) {
    if (mean[i] <= BLACK) lastLeadingBlack = i;
    else if (lastLeadingBlack >= 0 && mean[i] > CONTENT) break;
  }
  let start = lastLeadingBlack + 1;

  // First frame of the trailing black hold.
  let end = n - 1;
  for (let i = n - 1; i > start; i--) {
    if (mean[i] > CONTENT) { end = i; break; }
  }

  if (lastLeadingBlack < 0) {
    console.error('! no leading black hold found — is this a shoot.mjs capture?');
    process.exit(2);
  }

  const startS = start / FPS;
  const endS = (end + 1) / FPS;
  console.error(`frames=${n} leadingBlackEnds=${lastLeadingBlack} contentStart=${start} contentEnd=${end}`);
  console.log(`START=${startS.toFixed(3)}`);
  console.log(`END=${endS.toFixed(3)}`);
  console.log(`DURATION=${(endS - startS).toFixed(3)}`);
});
