// Renders the 1080x1080 card that the 16:9 cut is placed into for the
// LinkedIn feed. Drawn in Chromium rather than with drawtext so it uses the
// same typeface and palette as the rest of the piece.
//
//   node scripts/social-video/make-square-frame.mjs
//
// Writes square-frame.png plus square-frame.json giving the position and size
// of the reserved video window, which post.sh reads so the two cannot drift.

import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT_DIR = process.env.OUT_DIR || path.join(ROOT, 'build/social-video');
const CHROME = process.env.CHROME || undefined;

const HTML = `<!doctype html><html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; }
  body {
    width: 1080px; height: 1080px; overflow: hidden;
    font-family: 'Space Grotesk', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    background:
      radial-gradient(820px 520px at 50% 8%, rgba(11,92,255,.22), transparent 70%),
      radial-gradient(620px 460px at 82% 96%, rgba(92,155,255,.12), transparent 72%),
      #060911;
    display: flex; flex-direction: column; justify-content: space-between;
    padding: 46px 40px 40px;
  }
  .top { text-align: center; }
  .kicker {
    font-size: 15px; font-weight: 700; letter-spacing: .24em;
    text-transform: uppercase; color: #5c9bff; margin-bottom: 14px;
  }
  .title { font-size: 46px; font-weight: 700; letter-spacing: -.025em; color: #fff; line-height: 1.05; }
  .title em { font-style: normal;
    background: linear-gradient(92deg, #5c9bff, #9ec2ff);
    -webkit-background-clip: text; background-clip: text; color: transparent; }

  /* Reserved hole for the video: 1000x563 at (40, 259). */
  .window {
    width: 1000px; height: 563px; margin: 0 auto;
    border-radius: 14px; background: #000;
    box-shadow: 0 26px 70px rgba(0,0,0,.6), 0 0 0 1px rgba(120,165,255,.22);
  }

  .bottom { text-align: center; }
  .line { font-size: 25px; font-weight: 500; color: rgba(236,241,250,.9); line-height: 1.36; }
  .url {
    display: inline-block; margin-top: 20px; font-size: 21px; font-weight: 700; color: #fff;
    padding: 12px 26px; border: 1.5px solid rgba(120,165,255,.42);
    border-radius: 999px; background: rgba(11,92,255,.14);
  }
  .foot { margin-top: 16px; font-size: 14px; color: rgba(206,218,238,.6); }
</style></head><body>
  <div class="top">
    <div class="kicker">A Zoom App for live lectures</div>
    <div class="title">Zoom <em>Momentum</em></div>
  </div>
  <div class="window"></div>
  <div class="bottom">
    <div class="line">AI-generated polls, a live topic timeline,<br/>and a recovery pack for every student.</div>
    <div class="url">zoom-momentum.vercel.app</div>
    <div class="foot">Zoom Fellowship project · built by Shitij Mathur</div>
  </div>
</body></html>`;

mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage({ viewport: { width: 1080, height: 1080 }, deviceScaleFactor: 1 });
await page.setContent(HTML, { waitUntil: 'load' });
await page.waitForFunction(() => document.fonts && document.fonts.status === 'loaded', null, { timeout: 15000 })
  .catch(() => console.warn('! fonts not confirmed loaded, continuing'));
await page.waitForTimeout(400);

// Publish the hole's geometry so post.sh overlays exactly into it. Rounded to
// even numbers because the H.264 encoder wants even dimensions.
const box = await page.locator('.window').boundingBox();
const even = (n) => Math.round(n / 2) * 2;
const window_ = {
  x: even(box.x), y: even(box.y), width: even(box.width), height: even(box.height),
};

const out = path.join(OUT_DIR, 'square-frame.png');
await page.screenshot({ path: out });
writeFileSync(path.join(OUT_DIR, 'square-frame.json'), JSON.stringify(window_, null, 2));
await browser.close();
console.log(`video window: ${JSON.stringify(window_)}`);
console.log(`wrote ${out}`);
