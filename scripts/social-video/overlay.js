// Browser-side overlay toolkit for the social demo cut.
//
// Injected into the public demo page before recording. Everything the finished
// video shows on top of the app — captions, the synthetic cursor, the title and
// end cards, the progress bar — is drawn here as DOM, so it composites at the
// page's own device-pixel resolution instead of being burned in later by a
// filter chain. Exposed to the capture script as `window.__vid`.

const installOverlay = () => {
  const BLUE = '#0b5cff';
  const BLUE_LIGHT = '#5c9bff';
  // Inter rather than the demo chrome's Space Grotesk: the captions should read
  // as plain subtitles next to the app's own system-UI type, not as display
  // text competing with it.
  const FONT = "'Inter', 'Liberation Sans', system-ui, sans-serif";

  if (!document.getElementById('vid-font')) {
    const link = document.createElement('link');
    link.id = 'vid-font';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap';
    document.head.appendChild(link);
  }

  const style = document.createElement('style');
  style.textContent = `
    #vid-layer, #vid-layer * { box-sizing: border-box; }
    /* Authored in the app's layout space (the "design" size) and scaled up to
       the recorded frame, so every coordinate below matches what the app's own
       CSS sees. configure() sets the three variables. */
    #vid-layer {
      position: fixed; top: 0; left: 0; z-index: 2147483000;
      width: var(--vid-w, 1280px); height: var(--vid-h, 720px);
      transform: scale(var(--vid-s, 1)); transform-origin: top left;
      pointer-events: none; font-family: ${FONT};
      -webkit-font-smoothing: antialiased;
    }

    /* Demo-harness chrome we don't want in the cut. The brand + "simulated
       Zoom meeting" note in the bar stays visible on purpose. */
    .demo-bar-actions { visibility: hidden !important; }

    /* ---- caption ---- */
    #vid-cap {
      position: absolute; z-index: 3; left: 44px; bottom: 88px; max-width: 620px;
      background: rgba(13, 15, 20, 0.88);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      padding: 16px 22px 18px;
      box-shadow: 0 14px 34px rgba(0, 0, 0, 0.4);
      opacity: 0; transform: translateY(10px);
      transition: opacity .32s ease, transform .4s cubic-bezier(.16,1,.3,1);
    }
    #vid-cap.on { opacity: 1; transform: translateY(0); }
    /* Card variant: wider, centred, sitting over the screenshot. */
    /* Card variant sits in the band below the hero's own copy, not over it. */
    #vid-cap.card {
      left: 50%; right: auto; bottom: 26px; max-width: 880px;
      width: 880px; margin-left: -440px; text-align: center;
      padding: 16px 32px 18px;
    }
    #vid-cap.card .line { font-size: 24px; }
    #vid-cap.card .sub { font-size: 15px; margin-top: 8px; }
    #vid-cap .eyebrow {
      display: block; font-size: 11.5px; font-weight: 600;
      letter-spacing: .1em; text-transform: uppercase;
      color: rgba(216, 222, 233, 0.5); margin-bottom: 7px;
    }
    #vid-cap .line {
      display: block; font-size: 24px; line-height: 1.3; font-weight: 600;
      color: #f4f6fa;
    }
    #vid-cap .sub {
      display: block; margin-top: 7px; font-size: 15px; line-height: 1.5;
      font-weight: 400; color: rgba(226, 232, 242, 0.66);
    }

    /* ---- synthetic cursor ---- */
    #vid-cursor {
      position: absolute; top: 0; left: 0; width: 26px; height: 26px;
      margin: -13px 0 0 -13px; opacity: 0;
      transition: transform .52s cubic-bezier(.33,1,.4,1), opacity .25s ease;
      will-change: transform;
    }
    #vid-cursor.on { opacity: 1; }
    #vid-cursor .dot {
      position: absolute; inset: 0; border-radius: 50%;
      background: rgba(255,255,255,.96);
      border: 2px solid rgba(11,92,255,.9);
      box-shadow: 0 3px 14px rgba(0,0,0,.5);
    }
    #vid-cursor .ring {
      position: absolute; inset: 0; border-radius: 50%;
      border: 2.5px solid ${BLUE}; opacity: 0; transform: scale(.4);
    }
    #vid-cursor.click .ring { animation: vid-ripple .5s ease-out; }
    #vid-cursor.click .dot { animation: vid-press .22s ease-out; }
    @keyframes vid-ripple {
      0%   { opacity: .9; transform: scale(.5); }
      100% { opacity: 0;  transform: scale(2.6); }
    }
    @keyframes vid-press {
      0%, 100% { transform: scale(1); }
      45%      { transform: scale(.72); }
    }

    /* ---- full-bleed card: the project's own og-image ---- */
    #vid-card {
      position: absolute; inset: 0; z-index: 2;
      /* Sampled from the image's own top and bottom edges, so the letterbox
         either side of its 1.905:1 crop blends into it. */
      background: linear-gradient(180deg, #0a45be 0%, #0b3083 100%);
      opacity: 0; transition: opacity .45s ease;
    }
    #vid-card.on { opacity: 1; }
    #vid-card img {
      position: absolute; inset: 0;
      width: 100%; height: 100%; object-fit: contain;
    }

    /* ---- progress bar ---- */
    #vid-prog {
      position: absolute; top: 0; left: 0; height: 2px; width: 0%;
      background: rgba(255, 255, 255, 0.5);
    }

    /* ---- spotlight ring on the element being used ---- */
    #vid-spot {
      position: absolute; border: 2.5px solid ${BLUE}; border-radius: 12px;
      box-shadow: 0 0 0 3px rgba(11,92,255,.12);
      opacity: 0; transition: opacity .3s ease, top .4s ease, left .4s ease,
        width .4s ease, height .4s ease;
    }
    #vid-spot.on { opacity: 1; }

    /* ---- black hold used at the head and tail of the take ---- */
    #vid-black {
      position: absolute; inset: 0; z-index: 4; background: #000;
      opacity: 1; transition: opacity .5s ease;
    }
    #vid-black.off { opacity: 0; }
  `;
  document.head.appendChild(style);

  const layer = document.createElement('div');
  layer.id = 'vid-layer';
  layer.innerHTML = `
    <div id="vid-prog"></div>
    <div id="vid-cap"><span class="eyebrow"></span><span class="line"></span><span class="sub"></span></div>
    <div id="vid-spot"></div>
    <div id="vid-cursor"><span class="ring"></span><span class="dot"></span></div>
    <div id="vid-card"></div>
    <div id="vid-black"></div>
  `;
  // Outside <body> on purpose: the app subtree is CSS-zoomed to fill the frame,
  // and the overlay does its own scaling instead of inheriting that.
  document.documentElement.appendChild(layer);

  const $ = (id) => document.getElementById(id);
  const cap = $('vid-cap');
  const cursor = $('vid-cursor');
  const card = $('vid-card');
  const spot = $('vid-spot');
  const prog = $('vid-prog');
  const black = $('vid-black');

  // Ratio between recorded-frame pixels and the layout space above. Incoming
  // element rects are measured in frame pixels, so they divide by this.
  let scale = 1;

  window.__vid = {
    /** designW/designH: the app's layout space. scaleFactor: frame / layout. */
    configure(designW, designH, scaleFactor) {
      scale = scaleFactor;
      layer.style.setProperty('--vid-w', `${designW}px`);
      layer.style.setProperty('--vid-h', `${designH}px`);
      layer.style.setProperty('--vid-s', String(scaleFactor));
    },

    // --- caption ---
    caption(eyebrow, line, sub, onCard) {
      cap.classList.toggle('card', !!onCard);
      const eb = cap.querySelector('.eyebrow');
      eb.textContent = eyebrow || '';
      eb.style.display = eyebrow ? 'block' : 'none';
      cap.querySelector('.line').textContent = line || '';
      const s = cap.querySelector('.sub');
      s.textContent = sub || '';
      s.style.display = sub ? 'block' : 'none';
      cap.classList.add('on');
    },
    hideCaption() { cap.classList.remove('on'); },

    // --- cursor ---
    cursorTo(x, y) {
      cursor.classList.add('on');
      cursor.style.transform = `translate(${x / scale}px, ${y / scale}px)`;
    },
    cursorClick() {
      cursor.classList.remove('click');
      void cursor.offsetWidth;
      cursor.classList.add('click');
    },
    hideCursor() { cursor.classList.remove('on', 'click'); },

    // --- spotlight ---
    spotlight(r) {
      if (!r) { spot.classList.remove('on'); return; }
      Object.assign(spot.style, {
        top: `${r.y / scale - 6}px`, left: `${r.x / scale - 6}px`,
        width: `${r.width / scale + 12}px`, height: `${r.height / scale + 12}px`,
      });
      spot.classList.add('on');
    },

    // --- camera ---
    /**
     * Pushes the app subtree in or out. k is the magnification, ox/oy the fixed
     * point in the app's own layout coordinates. Captions and cursor live
     * outside <body>, so they stay put while the shot moves.
     */
    camera(k, ox, oy) {
      // Applied to the app root, not <body>: body carries the CSS zoom that
      // scales the composition to the frame, and combining zoom with a
      // transform there puts the origin in an unpredictable coordinate space.
      // .demo-root is a plain unzoomed box of the design size.
      const root = document.querySelector('.demo-root');
      if (!root) return;
      root.style.transformOrigin = `${ox}px ${oy}px`;
      root.style.transform = `scale(${k})`;
    },

    // --- full-bleed card ---
    /** Shows a full-frame image card. src is a data: URI. */
    imageCard(src) {
      card.innerHTML = `<img alt="">`;
      card.querySelector('img').src = src;
      card.classList.add('on');
    },
    hideCard() { card.classList.remove('on'); },

    // --- progress bar: one linear sweep across the whole piece ---
    startProgress(totalMs) {
      prog.style.transition = `width ${totalMs}ms linear`;
      requestAnimationFrame(() => { prog.style.width = '100%'; });
    },

    // --- head/tail black ---
    fadeFromBlack() { black.classList.add('off'); },
    fadeToBlack() { black.classList.remove('off'); },
  };
};

// Injected at document-start, so wait for a body to attach to. Everything
// before the capture script's first cue is trimmed off the raw take anyway.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', installOverlay, { once: true });
} else {
  installOverlay();
}
