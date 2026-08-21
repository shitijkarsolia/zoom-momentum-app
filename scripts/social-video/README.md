# Social demo video

A 41 second silent cut of the public demo, sized for the LinkedIn and X feeds.
Everything comes from what the project already has: the shoot drives the
interactive demo the way a visitor would, it opens and closes on a screenshot
of the site's own hero, and the captions are the site's own wording. No artwork
is invented here.

The piece opens by saying what Momentum is, then goes through the flow in
order: Anchor builds the outline, Pulse drafts a check-in, the class answers,
the results come back, and each student gets a recap. The camera pushes into
the Momentum panel for the detail beats and pulls back out for the room, so the
panel is readable at feed size without losing the context that it runs inside a
Zoom meeting.

Captions are deliberately plain — they describe what is on screen and nothing
more. They are set in Inter rather than the demo chrome's Space Grotesk, on a
neutral dark plate, so they read as subtitles next to the app's own system-UI
type instead of as display text competing with it.

Output: `build/social-video/dist/zoom-momentum-demo-16x9.mp4` — 1920×1080,
30fps, ~8 MB, H.264 High / yuv420p with `+faststart` and a silent AAC track.
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

**Three sizes are in play.** The app is composed at 1280×720, where the
Momentum panel takes ~30% of the frame rather than ~20%. Capture is 2560×1440,
and delivery is 1920×1080 — the extra headroom means a 1.6× push-in still has a
full 1080p of real pixels behind it. Playwright captures video at the CSS
viewport size and ignores `deviceScaleFactor`, so that resolution has to come
from the viewport itself, with the app subtree CSS-zoomed 2× to fill it. The
app's `100vh` containers are pinned to the design height because `vh` resolves
before the zoom is applied and would otherwise overflow.

**The camera is a transform on `.demo-root`, not on `<body>`.** Body carries
the CSS zoom, and combining zoom with a transform on the same element puts
`transform-origin` in an unpredictable coordinate space. `.demo-root` is a
plain unzoomed box of the design size, so origins are in design pixels. Do not
add `will-change: transform` to it: promoting it to its own composited layer
under the parent zoom renders it mis-positioned in the screencast, though
`page.screenshot` still looks correct — which makes the bug easy to miss.

**Configure the overlay at install, not later.** Until `configure()` runs, the
overlay defaults to the design size and its black hold covers only the
top-left quarter of the frame, leaking the app during setup and breaking the
content-window detection that depends on that hold.

**Playwright's webm timestamps do not track wall clock**, and the error varies
between takes in both directions, so `post.sh` retimes the trimmed content back
to the scheduled duration. `TARGET` in `post.sh` must stay in step with `TOTAL`
in `shoot.mjs`.

**The card is fitted, not cropped.** `capture-card.mjs` shoots at 1920x1080 so
it fills the frame exactly. A card of another aspect ratio is letterboxed
against a gradient in `overlay.js` sampled from the old og-image's edges —
re-sample it if you point `CARD` at something shaped differently.

## Suggested post copy

Plain descriptions, matching the video. Trim to taste.

### LinkedIn

> Zoom Momentum is a Zoom App for live college lectures. It runs in the meeting
> side panel and works off the live transcript.
>
> While the lecture is running, it builds a topic timeline with key points and
> a glossary. The professor can generate a check-in poll from the last few
> minutes of lecture, edit it, and launch it to the class; answers are tallied
> as soon as the poll closes. Students can bookmark anything they did not
> follow, and at the end of class each one gets a recap of the topics covered,
> the terms defined, and the moments they marked.
>
> Nothing to install, and students stay in the meeting.
>
> A 40 second walkthrough is below. There is an interactive demo at
> zoom-momentum.vercel.app with both the professor and student views.
>
> Built as my Zoom Fellowship project at ASU Next Lab.

### X

> Zoom Momentum is a Zoom App for live college lectures. It reads the live
> transcript and uses it to generate check-in polls, a topic timeline, a
> glossary, and a recap for each student after class.
>
> Interactive demo: zoom-momentum.vercel.app
