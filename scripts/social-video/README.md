# Social demo video

A ~43 second silent cut of the public demo, sized for the LinkedIn and X feeds.
Everything is generated from the real app — the shoot drives the interactive
demo the same way a visitor would, and the captions, cursor and title cards are
drawn into the page so they render at full resolution rather than being burned
in afterwards.

Output (in `build/social-video/dist/`, not committed):

| File | Size | Use |
| --- | --- | --- |
| `zoom-momentum-demo-16x9.mp4` | 1920×1080, 30fps, ~5.5 MB | X/Twitter, LinkedIn desktop, YouTube |
| `zoom-momentum-demo-1x1.mp4` | 1080×1080, 30fps, ~2.2 MB | LinkedIn mobile feed |

Both are H.264 High / yuv420p with `+faststart` and a silent AAC track, which
is what both platforms want. The cut has no voiceover, so every beat is
captioned on screen for muted autoplay.

## Regenerating

Needs `ffmpeg` (with libx264) and `playwright` available to Node.

```bash
npm run build -w client                       # the demo is a static build
(cd client/dist && python3 -m http.server 8099)   # serve it on :8099

node scripts/social-video/make-square-frame.mjs   # 1:1 card artwork
node scripts/social-video/shoot.mjs               # drive the demo, record
./scripts/social-video/post.sh                    # trim, retime, encode
```

`DEMO_URL` overrides the demo origin, `OUT_DIR` the output directory, and
`CHROME` the browser binary if you are not using Playwright's bundled Chromium.

## How it fits together

- **`overlay.js`** — injected into the demo page. Draws the captions, the
  synthetic cursor and click ripple, the spotlight ring, the progress bar and
  the title/end cards, and exposes them as `window.__vid`.
- **`shoot.mjs`** — records the take. Holds the beats on one absolute timeline
  so the length is deterministic no matter how long a click takes to settle.
- **`find-window.mjs`** — locates the content inside the raw capture. The take
  is topped and tailed with a black hold, and this finds it by mean luminance.
- **`post.sh`** — trims to that window, retimes, and encodes both deliverables.
- **`make-square-frame.mjs`** — renders the 1:1 card and publishes the video
  window's geometry so `post.sh` composites into exactly the right hole.

Two details worth knowing before changing anything:

**The frame is 1920×1080 but the app is composed at 1280×720.** Playwright
captures video at the CSS viewport size — `deviceScaleFactor` does not raise it
— so the viewport has to be 1920×1080 to get a 1080p file. At that width the
Momentum panel is only ~20% of the frame and unreadable on a phone, so the app
subtree is CSS-zoomed 1.5× to give the 1280-wide composition (~30%) at full
resolution. The app's `100vh` containers are pinned to the design height
because `vh` resolves before the zoom is applied and would otherwise overflow.

**Playwright's webm timestamps run long.** A 42.7s take lands as ~47s of video,
drifting further the longer it runs, so `post.sh` retimes the trimmed content
back to the scheduled duration. `TARGET` in `post.sh` must stay in step with
`TOTAL` in `shoot.mjs`.

## Suggested post copy

### LinkedIn

> Most Zoom lectures give the professor one signal: a grid of muted tiles.
>
> Zoom Momentum is a Zoom App that runs inside the meeting, reads the live
> transcript, and turns it into things both sides of the class can use:
>
> • A comprehension check drafted from the last few minutes of lecture, launched
> to every student in one click
> • Results tallied the moment the poll closes, so you find out who is lost
> while there is still time to fix it
> • A topic timeline and glossary that build themselves as you teach
> • A recovery pack for every student when class ends
>
> No second screen, no separate site, nothing for students to install.
>
> 40 seconds of it below. There is a live interactive demo at
> zoom-momentum.vercel.app where you can play both the professor and the
> student seat.
>
> Built as my Zoom Fellowship project.

### X

> Zoom lectures give professors one signal: a grid of muted tiles.
>
> Zoom Momentum reads the live lecture transcript and turns it into one-click
> comprehension checks, a topic timeline that builds itself, and a recovery pack
> for every student.
>
> Live demo: zoom-momentum.vercel.app

Upload the video natively rather than linking it — both platforms throttle
posts that send people off-site, and the cut is built to autoplay muted.
