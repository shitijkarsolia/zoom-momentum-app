# Social demo video

A 34.5 second silent cut of the public demo, sized for the LinkedIn and X
feeds. Everything comes from what the project already has: the shoot drives the
interactive demo the way a visitor would, it opens and closes on a screenshot
of the site's own hero, and every caption is wording lifted from the site's
features section. No artwork or copy is invented here.

Output: `build/social-video/dist/zoom-momentum-demo-16x9.mp4` — 1920×1080,
30fps, ~6.5 MB, H.264 High / yuv420p with `+faststart` and a silent AAC track.
Upload it natively to both platforms.

The cut has no voiceover, so each beat is captioned on screen for muted
autoplay. If you record a voice track, drop the captions from `shoot.mjs` and
mux the audio in `post.sh` instead.

## Regenerating

Needs `ffmpeg` (with libx264) and `playwright` available to Node.

```bash
npm run build -w client                            # the demo is a static build
(cd client/dist && python3 -m http.server 8099)    # serve it on :8099

node scripts/social-video/capture-card.mjs         # screenshot the site hero
node scripts/social-video/shoot.mjs                # drive the demo, record
./scripts/social-video/post.sh                     # trim, retime, encode
```

`DEMO_URL` overrides the demo origin, `OUT_DIR` the output directory,
`CARD` the card image, and `CHROME` the browser binary if you are not using
Playwright's bundled Chromium.

## How it fits together

- **`overlay.js`** — injected into the demo page. Draws the captions, the
  synthetic cursor and click ripple, the spotlight ring, the progress bar and
  the full-frame image card, and exposes them as `window.__vid`.
- **`shoot.mjs`** — records the take. Holds the beats on one absolute timeline
  so the length is deterministic no matter how long a click takes to settle.
- **`find-window.mjs`** — locates the content inside the raw capture. The take
  is topped and tailed with a black hold, and this finds it by mean luminance.
- **`capture-card.mjs`** — serves `website/` and screenshots its hero at frame
  size, so the card is the real site rather than anything drawn for the video.
- **`post.sh`** — trims to that window, retimes, and encodes the deliverable.

Three details worth knowing before changing anything:

**The frame is 1920×1080 but the app is composed at 1280×720.** Playwright
captures video at the CSS viewport size — `deviceScaleFactor` does not raise it
— so the viewport has to be 1920×1080 to get a 1080p file. At that width the
Momentum panel is only ~20% of the frame and unreadable on a phone, so the app
subtree is CSS-zoomed 1.5× to give the 1280-wide composition (~30%) at full
resolution. The app's `100vh` containers are pinned to the design height
because `vh` resolves before the zoom is applied and would otherwise overflow.

**Playwright's webm timestamps do not track wall clock**, and the error varies
between takes in both directions, so `post.sh` retimes the trimmed content back
to the scheduled duration. `TARGET` in `post.sh` must stay in step with `TOTAL`
in `shoot.mjs`.

**The card is fitted, not cropped.** `capture-card.mjs` shoots at 1920x1080 so
it fills the frame exactly. A card of another aspect ratio is letterboxed
against a gradient in `overlay.js` sampled from the old og-image's edges —
re-sample it if you point `CARD` at something shaped differently.

## Suggested post copy

Drawn from the site so it matches the video. Trim to taste.

### LinkedIn

> Most Zoom lectures give the professor one signal: a grid of muted tiles.
>
> Zoom Momentum is a Zoom App that runs inside the meeting and works off the
> live lecture transcript:
>
> • Professor's Pulse — one click drafts a poll from the last few minutes of
> lecture, and answers are tallied the instant it closes. Zero grading.
> • Live Anchor — a live topic timeline and glossary, in any of six languages.
> Join late and you can still see the current topic and every term so far.
> • Recovery Agent — students bookmark hard moments privately, and each one
> turns into a recovery pack after class.
>
> No second screen, no separate site, nothing for students to install.
>
> 35 seconds of it below. Interactive demo at zoom-momentum.vercel.app — you
> can play both the professor and the student seat.
>
> Built as my Zoom Fellowship project at ASU Next Lab.

### X

> Zoom lectures give professors one signal: a grid of muted tiles.
>
> Zoom Momentum runs on the live lecture transcript: one-click comprehension
> polls, a topic timeline and glossary that build themselves, and a recovery
> pack for every student after class.
>
> Demo: zoom-momentum.vercel.app
