// Builds the screenshot carousel from the shots captured by shots.mjs.
//
//   node scripts/social-carousel/carousel.mjs
//
// Produces:
//   dist/zoom-momentum-carousel.pdf   10 pages at 1080x1350 — LinkedIn document post
//   dist/slides/slide-01.png ...      the same slides as images — X, or a fallback
//
// Slides are laid out in the browser and printed from it, so the type and the
// screenshots render exactly as they do in the app. Copy is the site's own
// wording, kept plain.

import { chromium } from 'playwright';
import { readFileSync, mkdirSync, rmSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const OUT_DIR = process.env.OUT_DIR || path.join(ROOT, 'build/social-carousel');
const SHOTS = path.join(OUT_DIR, 'shots');
const DIST = path.join(OUT_DIR, 'dist');
const CHROME = process.env.CHROME || undefined;

// 4:5. LinkedIn renders document posts at the PDF's own aspect, and portrait
// takes the most room in a phone feed.
const W = 1080;
const H = 1350;

const img = (name) =>
  `data:image/png;base64,${readFileSync(path.join(SHOTS, `${name}.png`)).toString('base64')}`;

/** kind: 'cover' | 'room' | 'panel' | 'end' */
const slides = [
  {
    kind: 'cover',
    eyebrow: 'A Zoom App for live college lectures',
    title: 'Zoom Momentum',
    body: 'Momentum uses AI to generate live polls, a topic outline, a glossary, and a post-class recap from your lecture.',
    shot: 'room',
  },
  {
    kind: 'room',
    eyebrow: 'Where it runs',
    title: 'Momentum runs in the side panel of a live Zoom lecture.',
    body: 'Nothing to install, and students never leave the meeting.',
    shot: 'room',
  },
  {
    kind: 'panel',
    eyebrow: 'Live Anchor',
    title: 'A topic timeline built from the live transcript.',
    body: 'Each topic gets key points, and new terms are added to a glossary as they are said.',
    shot: 'anchor',
  },
  {
    kind: 'panel',
    eyebrow: 'Professor’s Pulse',
    title: 'The professor generates a check-in poll from the lecture.',
    body: 'The question and options can be edited before it is launched.',
    shot: 'pulse-draft',
  },
  {
    kind: 'panel',
    eyebrow: 'Professor’s Pulse',
    title: 'The poll appears in each student’s panel.',
    body: 'Students answer without leaving the meeting.',
    shot: 'pulse-student',
  },
  {
    kind: 'panel',
    eyebrow: 'Professor’s Pulse',
    title: 'Answers are tallied when the poll closes.',
    body: 'The professor can see which idea to go back over, with time left to do it.',
    shot: 'pulse-results',
  },
  {
    kind: 'panel',
    eyebrow: 'Warm-Up Arena',
    title: 'A timed review game built from the lecture.',
    body: 'Students race a countdown, and faster correct answers score higher on a live leaderboard.',
    shot: 'arena-leaderboard',
  },
  {
    kind: 'panel',
    eyebrow: 'Live Anchor',
    title: 'A glossary that fills itself in.',
    body: 'Terms are defined the moment they are said, and can be read in six languages.',
    shot: 'student-glossary',
  },
  {
    kind: 'panel',
    eyebrow: 'Recovery Agent',
    title: 'At the end of class, each student gets a recap.',
    body: 'Topics covered, terms defined, and the moments they bookmarked during the lecture.',
    shot: 'recap',
  },
  {
    kind: 'end',
    eyebrow: 'Interactive demo',
    title: 'zoom-momentum.vercel.app',
    body: 'Runs in the browser, with both the professor and the student views. No install and no sign-in.',
  },
];

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

const slideHtml = (s, i) => {
  const n = String(i + 1).padStart(2, '0');
  const total = slides.length;
  const foot = `
    <div class="foot">
      <span>zoom-momentum.vercel.app</span>
      <span>${i + 1} / ${total}</span>
    </div>`;

  if (s.kind === 'cover') {
    return `<section class="slide cover">
      <div class="cover-top">
        <div class="eyebrow">${esc(s.eyebrow)}</div>
        <h1>${esc(s.title)}</h1>
        <p class="body">${esc(s.body)}</p>
      </div>
      <div class="cover-shot"><img src="${img(s.shot)}" alt=""></div>
      ${foot}
    </section>`;
  }

  if (s.kind === 'end') {
    return `<section class="slide end">
      <div class="end-inner">
        <div class="eyebrow">${esc(s.eyebrow)}</div>
        <h2 class="url">${esc(s.title)}</h2>
        <p class="body">${esc(s.body)}</p>
        <p class="credit">Zoom Fellowship project at ASU Next Lab · built by Shitij Mathur</p>
      </div>
      ${foot}
    </section>`;
  }

  if (s.kind === 'room') {
    return `<section class="slide room">
      <div class="head">
        <div class="eyebrow">${esc(s.eyebrow)}</div>
        <h2>${esc(s.title)}</h2>
        <p class="body">${esc(s.body)}</p>
      </div>
      <div class="room-shot"><img src="${img(s.shot)}" alt=""></div>
      ${foot}
    </section>`;
  }

  return `<section class="slide panel">
    <div class="head">
      <div class="eyebrow">${esc(s.eyebrow)}</div>
      <h2>${esc(s.title)}</h2>
      <p class="body">${esc(s.body)}</p>
    </div>
    <div class="panel-shot"><img src="${img(s.shot)}" alt=""></div>
    ${foot}
  </section>`;
};

const HTML = `<!doctype html><html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  @page { size: ${W}px ${H}px; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }

  .slide {
    position: relative; width: ${W}px; height: ${H}px; overflow: hidden;
    padding: 64px 64px 56px;
    background:
      radial-gradient(780px 520px at 78% 6%, rgba(92,155,255,.16), transparent 70%),
      linear-gradient(168deg, #0d4ec8 0%, #0a3ba0 52%, #082d78 100%);
    color: #fff;
    display: flex; flex-direction: column;
    page-break-after: always; break-after: page;
  }
  .slide:last-child { page-break-after: auto; break-after: auto; }

  .eyebrow {
    font-size: 17px; font-weight: 600; letter-spacing: .1em;
    text-transform: uppercase; color: rgba(197, 217, 255, .78); margin-bottom: 16px;
  }
  h1 { font-size: 76px; font-weight: 600; letter-spacing: -.025em; line-height: 1.02; }
  h2 { font-size: 42px; font-weight: 600; letter-spacing: -.015em; line-height: 1.22; }
  .body {
    margin-top: 16px; font-size: 21px; line-height: 1.5; font-weight: 400;
    color: rgba(228, 238, 255, .8); max-width: 44ch;
  }

  /* Fixed heading block and image box, so the panel is the same size on every
     slide regardless of how long that slide's heading runs. */
  .head { flex: 0 0 auto; height: 250px; }

  .panel-shot {
    flex: 0 0 auto; height: 900px; margin-top: 20px;
    display: flex; align-items: flex-start; justify-content: center;
  }
  .panel-shot img {
    max-height: 100%; max-width: 100%; width: auto; height: auto;
    border-radius: 14px; box-shadow: 0 26px 60px rgba(0, 20, 60, .42);
  }

  /* Contain, not cover: this slide is about seeing the whole meeting, so
     cropping the gallery or the panel defeats it. */
  .room-shot { flex: 1 1 auto; display: flex; align-items: center; justify-content: center; margin-top: 40px; }
  .room-shot img {
    max-width: 100%; max-height: 100%; width: auto; height: auto;
    border-radius: 14px; box-shadow: 0 26px 60px rgba(0, 20, 60, .42);
  }

  .cover { justify-content: space-between; }
  .cover-top { padding-top: 40px; }
  .cover .body { font-size: 23px; margin-top: 22px; max-width: 40ch; }
  .cover-shot { margin: 0 -64px -56px; }
  .cover-shot img {
    width: 100%; height: 470px; object-fit: cover; object-position: center top;
    opacity: .94;
  }

  .end { justify-content: center; }
  .end-inner { padding-bottom: 40px; }
  .url { font-size: 52px; font-weight: 600; letter-spacing: -.02em; }
  .end .body { font-size: 23px; margin-top: 20px; }
  .credit { margin-top: 40px; font-size: 18px; color: rgba(197, 217, 255, .62); }

  .foot {
    position: absolute; left: 64px; right: 64px; bottom: 26px;
    display: flex; justify-content: space-between;
    font-size: 16px; color: rgba(197, 217, 255, .5);
  }
  .cover .foot, .room .foot { color: rgba(255, 255, 255, .68); }
</style></head><body>
${slides.map(slideHtml).join('\n')}
</body></html>`;

rmSync(DIST, { recursive: true, force: true });
mkdirSync(path.join(DIST, 'slides'), { recursive: true });

const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
await page.setContent(HTML, { waitUntil: 'load' });
await page.waitForFunction(() => document.fonts && document.fonts.status === 'loaded', null, { timeout: 20000 })
  .catch(() => console.warn('! fonts not confirmed loaded'));
await page.waitForTimeout(500);

const pdfPath = path.join(DIST, 'zoom-momentum-carousel.pdf');
await page.pdf({ path: pdfPath, width: `${W}px`, height: `${H}px`, printBackground: true, pageRanges: `1-${slides.length}` });
console.log(`wrote ${pdfPath}`);

const nodes = page.locator('.slide');
for (let i = 0; i < slides.length; i++) {
  const out = path.join(DIST, 'slides', `slide-${String(i + 1).padStart(2, '0')}.png`);
  await nodes.nth(i).screenshot({ path: out });
  console.log(`wrote ${out}`);
}

await browser.close();
