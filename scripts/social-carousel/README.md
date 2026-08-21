# Social screenshot carousel

A ten-slide carousel of the real app, at 1080×1350 (4:5).

| Output | Use |
| --- | --- |
| `build/social-carousel/dist/zoom-momentum-carousel.pdf` | LinkedIn — post it as a **document**, which LinkedIn renders as a swipeable carousel |
| `build/social-carousel/dist/slides/slide-01..10.png` | X (up to 4 images per post, or a thread), or anywhere a PDF won't do |

Every screenshot is captured from the public demo at 2× on the way through a
scripted run, so they are current and free of the compression artefacts in
`website/assets/screenshots/`. The copy is the site's own wording, kept plain.

Slides: cover · where it runs · Live Anchor · Pulse draft · Pulse on the
student's panel · Pulse results · Warm-Up Arena · glossary · Recovery Agent ·
the demo link. All four features get a slide.

## Regenerating

Needs `playwright` available to Node.

```bash
npm run build -w client                            # the demo is a static build
(cd client/dist && python3 -m http.server 8099)    # serve it on :8099

node scripts/social-carousel/shots.mjs             # drive the demo, capture
node scripts/social-carousel/carousel.mjs          # lay out, write PDF + PNGs
```

`DEMO_URL`, `OUT_DIR` and `CHROME` override the demo origin, the output
directory and the browser binary.

To change what a slide says or which screenshot it uses, edit the `slides`
array at the top of `carousel.mjs`. To add a state, capture it in `shots.mjs`
first — the two are joined by the shot's filename.

## Things worth knowing

**Capture order matters.** Arena leaves an overlay on the student panel that
covers the glossary and timeline, so those are shot before Arena runs. Clicks
go through a helper that falls back to dispatching on the element, since that
overlay intercepts pointer events.

**Arena needs a topic typed in.** Its Generate button reads
`/api/transcript/buffer`, which does not exist in the static demo build, so
without a topic it stops at "No context available". `shots.mjs` types one.

**The slide layout is fixed, not fluid.** The heading block and the screenshot
box have set heights so the panel is the same size on every slide; letting them
size to content made a short heading blow the screenshot up past the slide
edge. Panel screenshots are ~768×1784, so they are scaled to fit that box.
