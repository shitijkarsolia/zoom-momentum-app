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
  const FONT = "'Space Grotesk', 'Liberation Sans', system-ui, sans-serif";

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
      position: absolute; left: 44px; bottom: 92px; max-width: 640px;
      background: rgba(7, 11, 20, 0.93);
      backdrop-filter: blur(6px);
      border-left: 3px solid ${BLUE};
      border-radius: 4px 16px 16px 4px;
      padding: 18px 26px 20px;
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55);
      opacity: 0; transform: translateY(16px);
      transition: opacity .34s ease, transform .44s cubic-bezier(.16,1,.3,1);
    }
    #vid-cap.on { opacity: 1; transform: translateY(0); }
    #vid-cap .eyebrow {
      display: block; font-size: 12.5px; font-weight: 700;
      letter-spacing: .16em; text-transform: uppercase;
      color: ${BLUE_LIGHT}; margin-bottom: 9px;
    }
    #vid-cap .line {
      display: block; font-size: 29px; line-height: 1.2; font-weight: 700;
      color: #fff; letter-spacing: -0.01em;
    }
    #vid-cap .sub {
      display: block; margin-top: 8px; font-size: 16px; line-height: 1.4;
      font-weight: 400; color: rgba(233, 238, 248, 0.74);
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

    /* ---- full-bleed cards ---- */
    #vid-card {
      position: absolute; inset: 0; display: flex; flex-direction: column;
      align-items: center; justify-content: center; text-align: center;
      background:
        radial-gradient(1100px 620px at 50% 42%, rgba(11,92,255,.20), transparent 68%),
        radial-gradient(700px 420px at 78% 88%, rgba(92,155,255,.10), transparent 70%),
        #060911;
      opacity: 0; transition: opacity .5s ease;
    }
    #vid-card.on { opacity: 1; }
    #vid-card .wordmark {
      font-size: 62px; font-weight: 700; letter-spacing: -.028em; color: #fff;
      line-height: 1;
    }
    #vid-card .wordmark em {
      font-style: normal;
      background: linear-gradient(92deg, ${BLUE_LIGHT}, #9ec2ff);
      -webkit-background-clip: text; background-clip: text; color: transparent;
    }
    #vid-card .kicker {
      font-size: 13px; font-weight: 700; letter-spacing: .22em;
      text-transform: uppercase; color: ${BLUE_LIGHT}; margin-bottom: 22px;
    }
    #vid-card .tagline {
      margin-top: 22px; font-size: 27px; line-height: 1.34; font-weight: 500;
      color: rgba(236,241,250,.92); max-width: 760px;
    }
    #vid-card .url {
      margin-top: 34px; font-size: 21px; font-weight: 700; color: #fff;
      padding: 12px 26px; border: 1.5px solid rgba(120,165,255,.42);
      border-radius: 999px; background: rgba(11,92,255,.13);
    }
    #vid-card .foot {
      margin-top: 26px; font-size: 14.5px; color: rgba(206,218,238,.62);
      letter-spacing: .01em;
    }
    #vid-card .rise { opacity: 0; transform: translateY(18px); }
    #vid-card.on .rise {
      animation: vid-rise .68s cubic-bezier(.16,1,.3,1) forwards;
    }
    #vid-card.on .d1 { animation-delay: .10s; }
    #vid-card.on .d2 { animation-delay: .24s; }
    #vid-card.on .d3 { animation-delay: .38s; }
    #vid-card.on .d4 { animation-delay: .52s; }
    @keyframes vid-rise { to { opacity: 1; transform: translateY(0); } }

    /* ---- progress bar ---- */
    #vid-prog {
      position: absolute; top: 0; left: 0; height: 3px; width: 0%;
      background: linear-gradient(90deg, ${BLUE}, ${BLUE_LIGHT});
      box-shadow: 0 0 12px rgba(11,92,255,.7);
    }

    /* ---- spotlight ring on the element being used ---- */
    #vid-spot {
      position: absolute; border: 2.5px solid ${BLUE}; border-radius: 12px;
      box-shadow: 0 0 0 4px rgba(11,92,255,.18), 0 0 26px rgba(11,92,255,.4);
      opacity: 0; transition: opacity .3s ease, top .4s ease, left .4s ease,
        width .4s ease, height .4s ease;
    }
    #vid-spot.on { opacity: 1; }

    /* ---- black hold used at the head and tail of the take ---- */
    #vid-black {
      position: absolute; inset: 0; background: #000;
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
    caption(eyebrow, line, sub) {
      cap.querySelector('.eyebrow').textContent = eyebrow || '';
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

    // --- full-bleed cards ---
    titleCard(kicker, wordHtml, tagline) {
      card.innerHTML = `
        <div class="kicker rise d1">${kicker}</div>
        <div class="wordmark rise d2">${wordHtml}</div>
        <div class="tagline rise d3">${tagline}</div>`;
      card.classList.add('on');
    },
    endCard(wordHtml, tagline, url, foot) {
      card.innerHTML = `
        <div class="wordmark rise d1">${wordHtml}</div>
        <div class="tagline rise d2">${tagline}</div>
        <div class="url rise d3">${url}</div>
        <div class="foot rise d4">${foot}</div>`;
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
