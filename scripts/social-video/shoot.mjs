// Records the Zoom Momentum social demo cut.
//
// Drives the public demo (client build served statically) through a scripted
// run, with captions, a synthetic cursor and title cards drawn in-page by
// overlay.js. Produces a raw .webm; post.sh turns that into the delivered MP4s.
//
//   node scripts/social-video/shoot.mjs
//
// Env:
//   DEMO_URL   demo origin              (default http://127.0.0.1:8099/)
//   OUT_DIR    raw capture destination  (default build/social-video)
//   CHROME     browser executable       (default Playwright's bundled Chromium)

import { chromium } from 'playwright';
import { readFileSync, mkdirSync, rmSync, readdirSync, renameSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');

const DEMO_URL = process.env.DEMO_URL || 'http://127.0.0.1:8099/';
const OUT_DIR = process.env.OUT_DIR || path.join(ROOT, 'build/social-video');
const CHROME = process.env.CHROME || undefined;

// Two sizes matter here.
//
// DESIGN is the layout the app is composed at. At 1280 wide the Momentum panel
// takes ~30% of the frame instead of ~20%, which is the difference between
// readable and not on a phone-sized feed.
//
// FRAME is what actually gets recorded. Playwright's video is captured at the
// CSS viewport size — deviceScaleFactor does not raise it — so the frame has to
// be 1920x1080 natively to deliver 1080p. The app subtree is CSS-zoomed by
// FRAME/DESIGN to fill it, giving the 1280-wide composition at true 1080p.
const DESIGN = { width: 1280, height: 720 };
const FRAME = { width: 1920, height: 1080 };
const ZOOM = FRAME.width / DESIGN.width;

const OVERLAY = readFileSync(path.join(HERE, 'overlay.js'), 'utf8');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  rmSync(path.join(OUT_DIR, 'raw'), { recursive: true, force: true });
  mkdirSync(path.join(OUT_DIR, 'raw'), { recursive: true });

  const browser = await chromium.launch({
    executablePath: CHROME,
    args: ['--force-color-profile=srgb', '--font-render-hinting=none', '--hide-scrollbars'],
  });
  const ctx = await browser.newContext({
    viewport: FRAME,
    deviceScaleFactor: 1,
    recordVideo: { dir: path.join(OUT_DIR, 'raw'), size: FRAME },
  });
  const page = await ctx.newPage();

  // Overlay goes in before any app script runs, so the black hold is already
  // covering the frame on the very first painted video frame.
  await page.addInitScript(OVERLAY);

  // Scale the app subtree up to the recorded frame. The app's full-height
  // containers use 100vh, which resolves against the unzoomed viewport and is
  // then scaled again, so they get pinned to the design height explicitly.
  await page.addInitScript(({ w, h, z }) => {
    const apply = () => {
      document.body.style.zoom = String(z);
      const s = document.createElement('style');
      s.textContent =
        `html{overflow:hidden}` +
        `body{width:${w}px;height:${h}px;overflow:hidden;margin:0}` +
        `.demo-root{height:${h}px !important;min-height:${h}px !important}`;
      document.head.appendChild(s);
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', apply, { once: true });
    } else { apply(); }
  }, { w: DESIGN.width, h: DESIGN.height, z: ZOOM });

  await page.goto(DEMO_URL, { waitUntil: 'domcontentloaded' });

  // The demo injects Space Grotesk at runtime; the overlay uses the same face.
  await page.waitForFunction(() => document.fonts && document.fonts.status === 'loaded', null, { timeout: 15000 })
    .catch(() => console.warn('! fonts not confirmed loaded, continuing'));
  await page.waitForSelector('.tour-skip', { timeout: 15000 });
  await page.locator('.tour-skip').first().click();
  await page.waitForSelector('.zmw-panel', { timeout: 10000 });
  await page.evaluate(({ w, h, z }) => window.__vid.configure(w, h, z),
    { w: DESIGN.width, h: DESIGN.height, z: ZOOM });
  await sleep(900);

  // ---- helpers ------------------------------------------------------------

  const T0 = { t: 0 };
  const until = async (ms) => {
    const wait = T0.t + ms - Date.now();
    if (wait > 0) await sleep(wait);
  };
  const vid = (fn, ...args) => page.evaluate(fn, ...args);

  /** Move the synthetic cursor onto a locator, ripple, then really click it. */
  async function uiClick(locator, { spotlight = false, settle = 260 } = {}) {
    const center = async () => {
      const b = await locator.boundingBox();
      if (!b) throw new Error('uiClick: target not visible');
      return b;
    };

    // The panel re-lays out while content streams in, so the rect is measured
    // twice: once to start the cursor moving, and again on arrival so the
    // spotlight lands on where the control actually ended up.
    let box = await center();
    await page.evaluate(([px, py]) => window.__vid.cursorTo(px, py),
      [box.x + box.width / 2, box.y + box.height / 2]);
    await sleep(600);

    box = await center();
    await page.evaluate(([px, py]) => window.__vid.cursorTo(px, py),
      [box.x + box.width / 2, box.y + box.height / 2]);
    if (spotlight) await page.evaluate((r) => window.__vid.spotlight(r), box);
    await sleep(220);
    await page.evaluate(() => window.__vid.cursorClick());
    await sleep(150);
    await locator.click({ force: true });
    if (spotlight) {
      await sleep(250);
      await page.evaluate(() => window.__vid.spotlight(null));
    }
    await sleep(settle);
  }

  const caption = (eyebrow, line, sub) =>
    page.evaluate(([e, l, s]) => window.__vid.caption(e, l, s), [eyebrow, line, sub]);
  const hideCaption = () => vid(() => window.__vid.hideCaption());

  const panelBtn = (re) => page.locator('.zmw-panel button').filter({ hasText: re }).first();
  const panelTab = (name) => page.locator('.zmw-panel button.tab', { hasText: name }).first();

  // ---- the cut ------------------------------------------------------------
  // Absolute marks on one timeline so the total length is deterministic
  // regardless of how long any individual click takes to settle.
  const TITLE_OUT = 3200;
  const B1 = 9200;    // Live Anchor
  const B2 = 17200;   // Pulse: draft + launch
  const B3 = 24200;   // Student seat: answer
  const B4 = 30700;   // Results
  const B5 = 38200;   // End class -> recovery pack
  const END = 42700;  // End card out
  const TOTAL = END;

  // Bring the title card fully up behind the black hold first — fading both at
  // once lets the app show through the gap between them.
  await vid(() => window.__vid.titleCard(
    'A Zoom App for live lectures',
    'Zoom <em>Momentum</em>',
    'Your students are on the call.<br/>Are they actually following?',
  ));
  await sleep(800);

  await vid((total) => {
    window.__vid.fadeFromBlack();
    window.__vid.startProgress(total);
  }, TOTAL);

  T0.t = Date.now();

  // --- Title card ---
  await until(TITLE_OUT - 500);
  await vid(() => window.__vid.hideCard());
  await until(TITLE_OUT);

  // --- Beat 1: Live Anchor ---
  await caption(
    'Live Anchor',
    'It listens to the lecture and builds the outline as you teach.',
    "Topics, key points and a glossary — from Zoom's real-time transcript.",
  );
  await until(B1);

  // --- Beat 2: Pulse ---
  await caption('Pulse', 'One click drafts a comprehension check.', 'Written from the last few minutes of the lecture.');
  await uiClick(panelTab('Pulse'));
  await sleep(300);
  await uiClick(panelBtn(/^Generate Check-In$/), { spotlight: true });
  await sleep(1500);
  await uiClick(panelBtn(/^Launch Poll$/), { spotlight: true });
  await until(B2);

  // --- Beat 3: the student's seat ---
  await caption('The student’s seat', 'It lands in every student’s panel.', 'Same meeting, no new app, nothing to install.');
  await uiClick(panelBtn(/^Switch to student$/));
  await sleep(700);
  await uiClick(page.locator('.zmw-panel button').filter({ hasText: /What the loss function measures/ }).first());
  await sleep(250);
  await uiClick(panelBtn(/^Submit Answer$/), { spotlight: true });
  await until(B3);

  // --- Beat 4: the professor sees the gap ---
  await uiClick(panelBtn(/^Switch to professor$/));
  await sleep(500);
  await caption('Instant signal', 'The whole class, tallied the moment it closes.', 'No grading, no guessing who is lost.');
  await uiClick(panelBtn(/End Poll & Show Results/), { spotlight: true });
  await until(B4);

  // --- Beat 5: after class ---
  await uiClick(panelBtn(/^End Class$/), { spotlight: true });
  await caption('After class', 'Everyone leaves with a recap of what they missed.');
  await sleep(1200);
  await uiClick(panelBtn(/^Switch to student$/));
  await until(B5);

  // --- End card ---
  await hideCaption();
  await vid(() => {
    window.__vid.hideCursor();
    window.__vid.endCard(
      'Zoom <em>Momentum</em>',
      'AI-generated polls, a live topic timeline,<br/>and a recovery pack for every student.',
      'zoom-momentum.vercel.app',
      'Zoom Fellowship project · built by Shitij Mathur',
    );
  });
  await until(END - 400);
  await vid(() => window.__vid.fadeToBlack());
  await until(END + 600);

  const realTotal = Date.now() - T0.t;
  console.log(`content window: 0 -> ${realTotal}ms`);

  await ctx.close();
  await browser.close();

  // Playwright names videos by an internal hash; give it a stable filename.
  const raws = readdirSync(path.join(OUT_DIR, 'raw')).filter((f) => f.endsWith('.webm'));
  if (raws.length !== 1) throw new Error(`expected 1 raw capture, found ${raws.length}`);
  const stable = path.join(OUT_DIR, 'raw', 'capture.webm');
  renameSync(path.join(OUT_DIR, 'raw', raws[0]), stable);
  console.log(`raw capture: ${stable}`);
  console.log(`TOTAL_MS=${TOTAL}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
