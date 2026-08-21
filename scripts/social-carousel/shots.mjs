// Captures the screenshots the carousel is built from, straight out of the
// public demo. Panels are shot as elements at 2x so they stay crisp when a
// slide blows them up; the room shots are full-frame.
//
//   node scripts/social-carousel/shots.mjs
//
// Env: DEMO_URL, OUT_DIR, CHROME

import { chromium } from 'playwright';
import { mkdirSync, rmSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const DEMO_URL = process.env.DEMO_URL || 'http://127.0.0.1:8099/';
const OUT_DIR = process.env.OUT_DIR || path.join(ROOT, 'build/social-carousel');
const SHOTS = path.join(OUT_DIR, 'shots');
const CHROME = process.env.CHROME || undefined;

// Taller than the video's frame: the side panel is the subject here, and this
// is closer to its real proportions in Zoom.
const VIEW = { width: 1280, height: 1000 };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch({
  executablePath: CHROME,
  args: ['--force-color-profile=srgb', '--font-render-hinting=none', '--hide-scrollbars'],
});
const page = await browser.newPage({ viewport: VIEW, deviceScaleFactor: 2 });

// Hide the demo harness controls; the brand and "simulated Zoom meeting" note stay.
await page.addInitScript(() => {
  const apply = () => {
    const s = document.createElement('style');
    s.textContent = '.demo-bar-actions{visibility:hidden !important}';
    document.head.appendChild(s);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply, { once: true });
  else apply();
});

await page.goto(DEMO_URL, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => document.fonts && document.fonts.status === 'loaded', null, { timeout: 15000 })
  .catch(() => console.warn('! fonts not confirmed loaded'));
await page.waitForSelector('.tour-skip', { timeout: 15000 });
await page.locator('.tour-skip').first().click();
await page.waitForSelector('.zmw-panel', { timeout: 10000 });
await sleep(1200);

rmSync(SHOTS, { recursive: true, force: true });
mkdirSync(SHOTS, { recursive: true });

const panel = page.locator('.zmw-panel');
const panelBtn = (re) => page.locator('.zmw-panel button').filter({ hasText: re }).first();
const panelTab = (name) => page.locator('.zmw-panel button.tab', { hasText: name }).first();

// Overlays (the Arena student card, for one) sit over panel controls, so
// clicks fall back to dispatching straight on the element.
const click = async (locator) => {
  try {
    await locator.click({ timeout: 3000 });
  } catch {
    await locator.evaluate((el) => el.click());
  }
};

const shotPanel = async (name) => {
  await panel.screenshot({ path: path.join(SHOTS, `${name}.png`) });
  console.log(`panel  ${name}`);
};
const shotRoom = async (name) => {
  await page.screenshot({ path: path.join(SHOTS, `${name}.png`) });
  console.log(`room   ${name}`);
};

// --- the room, with Anchor already building -------------------------------
await sleep(9000);
await shotRoom('room');
await shotPanel('anchor');

// --- Pulse: draft, student poll, results ----------------------------------
await click(panelTab('Pulse'));
await sleep(500);
await click(panelBtn(/^Generate Check-In$/));
await sleep(1800);
await shotPanel('pulse-draft');

await click(panelBtn(/^Launch Poll$/));
await sleep(1500);
await click(panelBtn(/^Switch to student$/));
await sleep(1200);
await shotPanel('pulse-student');

await click(page.locator('.zmw-panel button').filter({ hasText: /What the loss function measures/ }).first());
await sleep(400);
await click(panelBtn(/^Submit Answer$/));
await sleep(1200);
await click(panelBtn(/^Switch to professor$/));
await sleep(800);
await click(panelBtn(/End Poll & Show Results/));
await sleep(1500);
await shotPanel('pulse-results');
await shotRoom('room-results');

// --- Student side: timeline and glossary, before Arena puts an overlay up --
await click(panelBtn(/^Switch to student$/));
await sleep(1200);
await click(panelTab('Timeline')).catch(() => {});
await sleep(900);
await shotPanel('student-timeline');
await click(panelTab('Glossary'));
await sleep(1000);
await shotPanel('student-glossary');

// --- Arena: needs a topic, since the static demo has no transcript API -----
await click(panelBtn(/^Switch to professor$/));
await sleep(800);
await click(panelTab('Arena'));
await sleep(600);
await page.locator('.zmw-panel input').first().fill('The training loop');
await sleep(300);
await click(panelBtn(/^Generate Quiz$/));
await sleep(2200);
await click(panelBtn(/Start Game|^Start/));
await sleep(2500);
await shotPanel('arena-question');
await click(panelBtn(/Skip to Results/)).catch(() => {});
await sleep(2000);
await shotPanel('arena-leaderboard');

// --- End of class: the recap ----------------------------------------------
await click(panelBtn(/^End Class$/));
await sleep(1800);
await click(panelBtn(/^Switch to student$/));
await sleep(2000);
await shotPanel('recap');
await shotRoom('room-ended');

await browser.close();
console.log(`\nshots in ${SHOTS}`);
