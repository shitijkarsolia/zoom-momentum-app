// Captures the opening/closing card for the social cut straight from the
// project's own website, so the video uses nothing that wasn't already
// designed for the site.
//
//   node scripts/social-video/capture-card.mjs
//
// Serves website/ on a scratch port and screenshots the hero at the capture
// frame size (2560x1440, matching shoot.mjs), writing build/social-video/card.png.
//
// The page is CSS-zoomed the same way shoot.mjs zooms the app: the site is
// composed at 1920x1080, where the hero fills the frame, and that composition
// is scaled up to the capture size. Shooting 2560x1440 directly would show the
// hero plus most of the next section.

import { chromium } from 'playwright';
import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SITE = process.env.SITE_DIR || path.join(ROOT, 'website');
const OUT_DIR = process.env.OUT_DIR || path.join(ROOT, 'build/social-video');
const CHROME = process.env.CHROME || undefined;
const PORT = Number(process.env.CARD_PORT || 8123);

const TYPES = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json',
};

const server = createServer(async (req, res) => {
  try {
    let rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (rel.endsWith('/')) rel += 'index.html';
    const file = path.join(SITE, path.normalize(rel).replace(/^(\.\.[/\\])+/, ''));
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404).end('not found');
  }
});
await new Promise((r) => server.listen(PORT, '127.0.0.1', r));

mkdirSync(OUT_DIR, { recursive: true });
const browser = await chromium.launch({ executablePath: CHROME });
const FRAME = { width: 2560, height: 1440 };
const DESIGN = { width: 1920, height: 1080 };
const Z = FRAME.width / DESIGN.width;

const page = await browser.newPage({ viewport: FRAME, deviceScaleFactor: 1 });
await page.addInitScript(({ w, h, z }) => {
  const apply = () => {
    document.body.style.zoom = String(z);
    const s = document.createElement('style');
    // Isolate the hero: everything below it is a different section of the
    // page and just clutters a title frame.
    s.textContent =
      `html{overflow:hidden}body{width:${w}px;height:${h}px;overflow:hidden;margin:0}` +
      `main#top > section:not(.hero){display:none !important}` +
      `section.hero{min-height:${h}px !important;display:flex !important;` +
      `flex-direction:column;justify-content:center}`;
    document.head.appendChild(s);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply, { once: true });
  else apply();
}, { w: DESIGN.width, h: DESIGN.height, z: Z });

await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'networkidle' });
// Let the hero's reveal animations finish before capturing.
await page.waitForTimeout(2500);

const out = path.join(OUT_DIR, 'card.png');
await page.screenshot({ path: out });
await browser.close();
server.close();
console.log(`wrote ${out}`);
