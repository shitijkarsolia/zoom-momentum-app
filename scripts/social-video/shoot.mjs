// Records the Zoom Momentum social demo cut.
//
// Drives the public demo (client build served statically) through a scripted
// run, with captions and a synthetic cursor drawn in-page by overlay.js. The
// piece opens and closes on a screenshot of the project's own website (see
// capture-card.mjs) rather than any artwork invented here, and every caption is
// the site's own wording. Produces a raw .webm; post.sh encodes the MP4.
//
//   node scripts/social-video/shoot.mjs
//
// Env:
//   DEMO_URL   demo origin              (default http://127.0.0.1:8099/)
//   OUT_DIR    raw capture destination  (default build/social-video)
//   CARD       card image               (default build/social-video/card.png)
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
// CSS viewport size — deviceScaleFactor does not raise it — so resolution has
// to come from the viewport itself. It is 2560x1440 rather than the 1920x1080
// delivery size so that the push-ins still have a full 1080p of real pixels
// behind them; post.sh downscales. The app subtree is CSS-zoomed by
// FRAME/DESIGN, giving the 1280-wide composition across the whole frame.
const DESIGN = { width: 1280, height: 720 };
const FRAME = { width: 2560, height: 1440 };
const ZOOM = FRAME.width / DESIGN.width;

const OVERLAY = readFileSync(path.join(HERE, 'overlay.js'), 'utf8');

// The website screenshot used as the opening and closing frame. Inlined as a
// data URI so the demo can stay a plain static build with nothing added to it.
const CARD_PATH = process.env.CARD || path.join(OUT_DIR, 'card.png');
const CARD = `data:image/png;base64,${readFileSync(CARD_PATH).toString('base64')}`;

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
        // No will-change here: promoting the app root to its own composited
        // layer under the parent CSS zoom makes the screencast (though not
        // page.screenshot) render it mis-positioned.
        `.demo-root{height:${h}px !important;min-height:${h}px !important;` +
        `transition:transform 950ms cubic-bezier(.22,1,.36,1)}`;
      document.head.appendChild(s);
      // Size the overlay to the frame straight away. Until it is configured it
      // defaults to the design size, so its black hold would cover only the
      // top-left quarter and leak the app during setup.
      if (window.__vid) window.__vid.configure(w, h, z);
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', apply, { once: true });
    } else { apply(); }
  }, { w: DESIGN.width, h: DESIGN.height, z: ZOOM });

  await page.goto(DEMO_URL, { waitUntil: 'domcontentloaded' });

  // Both the demo's own webfont and the overlay's Inter load at runtime.
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
    // A push-in can carry a control off the visible frame; the real click
    // refuses that, so fall back to dispatching one on the element itself.
    try {
      await locator.click({ force: true, timeout: 2500 });
    } catch {
      await locator.evaluate((el) => el.click());
    }
    if (spotlight) {
      await sleep(250);
      await page.evaluate(() => window.__vid.spotlight(null));
    }
    await sleep(settle);
  }

  const caption = (eyebrow, line, sub, onCard) =>
    page.evaluate(([e, l, s, c]) => window.__vid.caption(e, l, s, c), [eyebrow, line, sub, onCard]);
  const hideCaption = () => vid(() => window.__vid.hideCaption());

  // Camera moves, in the app's own layout coordinates. Scaling about a fixed
  // point on the right edge frames the Momentum panel; about the left edge,
  // the meeting gallery. WIDE resets to the whole room.
  const WIDE = [1, 640, 360];
  const PANEL = [1.6, 1280, 360];
  const PANEL_TIGHT = [1.95, 1280, 330];
  const ROOM = [1.35, 120, 380];
  const CAMERA_MS = 950;
  const camera = async ([k, ox, oy], settle = CAMERA_MS) => {
    await vid(([a, b, c]) => window.__vid.camera(a, b, c), [k, ox, oy]);
    if (settle) await sleep(settle);
  };

  const panelBtn = (re) => page.locator('.zmw-panel button').filter({ hasText: re }).first();
  const panelTab = (name) => page.locator('.zmw-panel button.tab', { hasText: name }).first();

  // ---- the cut ------------------------------------------------------------
  // Absolute marks on one timeline so the total length is deterministic
  // regardless of how long any individual click takes to settle.
  const CARD_OUT = 5400;   // opening card + what-it-is explainer
  const B1 = 12000;        // Live Anchor
  const B2 = 19200;        // Pulse: draft + launch
  const B3 = 25800;        // student answers
  const B4 = 31800;        // results
  const B5 = 37200;        // end class -> recovery pack
  const END = 41200;       // closing card out
  const TOTAL = END;

  // Bring the card fully up behind the black hold first — fading both at once
  // lets the app show through the gap between them.
  await vid((src) => window.__vid.imageCard(src), CARD);
  await sleep(800);

  await vid((total) => {
    window.__vid.fadeFromBlack();
    window.__vid.startProgress(total);
  }, TOTAL);

  T0.t = Date.now();

  // --- Opening card: say what this actually is ---
  await sleep(1100);
  await caption(
    '',
    'A Zoom App for live college lectures.',
    'Momentum uses AI to generate live polls, a topic outline, a glossary, and a post-class recap from your lecture.',
    true,
  );
  await until(CARD_OUT - 700);
  await hideCaption();
  await sleep(250);
  await vid(() => window.__vid.hideCard());
  await until(CARD_OUT);

  // --- Beat 1: the room, then push in on the panel ---
  await caption('Inside the meeting', 'Momentum runs in the side panel of a live Zoom lecture.');
  await sleep(1600);
  await camera(PANEL);
  await sleep(1100);
  await caption('Live Anchor', 'A topic timeline built from the live transcript.',
    'Each topic gets key points, and new terms are added to a glossary.');
  await until(B1);

  // --- Beat 2: Pulse drafts a check ---
  await caption('Professor\u2019s Pulse', 'The professor generates a check-in poll from the lecture.',
    'The question and options can be edited before it is launched.');
  await uiClick(panelTab('Pulse'));
  await uiClick(panelBtn(/^Generate Check-In$/), { spotlight: true });
  await sleep(1100);
  await uiClick(panelBtn(/^Launch Poll$/), { spotlight: true });
  await until(B2);

  // --- Beat 3: pull out so the class answering is visible, then back in ---
  await caption('Student view', 'The poll appears in each student\u2019s panel.',
    'Students answer without leaving the meeting.');
  await camera(WIDE);
  await uiClick(panelBtn(/^Switch to student$/));
  await camera(PANEL, 600);
  await uiClick(page.locator('.zmw-panel button').filter({ hasText: /What the loss function measures/ }).first());
  await uiClick(panelBtn(/^Submit Answer$/), { spotlight: true });
  await until(B3);

  // --- Beat 4: the gap, held tight on the results ---
  await camera(WIDE, 700);
  await uiClick(panelBtn(/^Switch to professor$/));
  await uiClick(panelBtn(/End Poll & Show Results/), { spotlight: true });
  await camera(PANEL_TIGHT, 600);
  await caption('Results', 'Answers are tallied when the poll closes.',
    '44% picked the same option, so the professor knows what to go back over.');
  await until(B4);

  // --- Beat 5: pull back out for the end of class ---
  await camera(WIDE, 800);
  await uiClick(panelBtn(/^End Class$/), { spotlight: true });
  await caption('Recovery Agent', 'At the end of class, each student gets a recap.',
    'Topics covered, terms defined, and the moments they bookmarked.');
  await uiClick(panelBtn(/^Switch to student$/));
  await camera(ROOM, 0);
  await until(B5);

  // --- Closing card ---
  await hideCaption();
  await sleep(200);
  await vid((src) => {
    window.__vid.hideCursor();
    window.__vid.imageCard(src);
  }, CARD);
  await sleep(700);
  await caption('Interactive demo', 'zoom-momentum.vercel.app',
    'Runs in the browser, with both the professor and student views.', true);
  await until(END - 400);
  await hideCaption();
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
