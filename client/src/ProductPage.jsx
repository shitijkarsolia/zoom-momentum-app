import React, { useState, useEffect, useRef } from 'react';

/* ─── Zoom Momentum — Product Page (react-app.js theme) ─── */

const customStyles = {
  bgBlue: '#0044CC',
  fontSerifItalic: {
    fontFamily: "'Playfair Display', serif",
    fontStyle: 'italic',
    fontWeight: 400,
  },
};

const GlobalStyles = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,400&family=Space+Mono:wght@400;700&display=swap');

      :root {
        --bg-blue: #0044CC;
        --grid-color: rgba(255, 255, 255, 0.08);
      }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        background-color: var(--bg-blue);
        color: #ffffff;
        font-family: 'Space Mono', monospace;
        overflow-x: hidden;
      }
      html { scroll-behavior: smooth; }
      ::selection { background: #facc15; color: #1e3a5f; }
      .font-serif-italic {
        font-family: 'Playfair Display', serif;
        font-style: italic;
        font-weight: 400;
      }
      .bg-grid {
        background-size: 60px 60px;
        background-image:
          linear-gradient(to right, var(--grid-color) 1px, transparent 1px),
          linear-gradient(to bottom, var(--grid-color) 1px, transparent 1px);
        mask-image: radial-gradient(circle at center, black 60%, transparent 100%);
        -webkit-mask-image: radial-gradient(circle at center, black 60%, transparent 100%);
      }
      @keyframes float-slow {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-20px); }
      }
      @keyframes float-medium {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-15px); }
      }
      @keyframes float-fast {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
      .animate-float-medium { animation: float-medium 5s ease-in-out infinite; }
      .animate-float-fast { animation: float-fast 4s ease-in-out infinite; }
      .delay-100 { animation-delay: 100ms; }
      .delay-200 { animation-delay: 200ms; }
      .delay-300 { animation-delay: 300ms; }
      .delay-500 { animation-delay: 500ms; }
      .delay-700 { animation-delay: 700ms; }
      .delay-1000 { animation-delay: 1000ms; }
      .pixel-art {
        image-rendering: pixelated;
        shape-rendering: crispEdges;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 0.8; transform: translateY(0); }
      }
      .animate-fade-in-delay-1 {
        opacity: 0;
        animation: fadeIn 1s ease-out 1s forwards;
      }
      .animate-fade-in-delay-1-5 {
        opacity: 0;
        animation: fadeIn 1s ease-out 1.5s forwards;
      }
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-6px); }
      }
      .animate-bounce-custom { animation: bounce 1s ease-in-out infinite; }
      .section-reveal {
        opacity: 0;
        transform: translateY(40px);
        transition: opacity 0.8s ease, transform 0.8s ease;
      }
      .section-reveal.visible {
        opacity: 1;
        transform: translateY(0);
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  return null;
};

/* ─── Pixel Flowers (from react-app.js) ─── */
const PixelFlowerRed = () => (
  <svg viewBox="0 0 12 16" style={{ width: '100%', height: '100%', imageRendering: 'pixelated', shapeRendering: 'crispEdges', filter: 'drop-shadow(0 4px 3px rgba(0,0,0,0.3))' }}>
    <rect x="4" y="0" width="4" height="4" fill="#FF3333" />
    <rect x="4" y="8" width="4" height="4" fill="#FF3333" />
    <rect x="0" y="4" width="4" height="4" fill="#FF3333" />
    <rect x="8" y="4" width="4" height="4" fill="#FF3333" />
    <rect x="4" y="4" width="4" height="4" fill="#FFD700" />
    <rect x="4" y="12" width="4" height="4" fill="#228B22" />
  </svg>
);

const PixelFlowerYellow = () => (
  <svg viewBox="0 0 12 16" style={{ width: '100%', height: '100%', imageRendering: 'pixelated', shapeRendering: 'crispEdges', filter: 'drop-shadow(0 4px 3px rgba(0,0,0,0.3))' }}>
    <rect x="4" y="0" width="4" height="4" fill="#FFD700" />
    <rect x="4" y="8" width="4" height="4" fill="#FFD700" />
    <rect x="0" y="4" width="4" height="4" fill="#FFD700" />
    <rect x="8" y="4" width="4" height="4" fill="#FFD700" />
    <rect x="4" y="4" width="4" height="4" fill="#8B4513" />
    <rect x="4" y="12" width="4" height="4" fill="#228B22" />
  </svg>
);

const PixelFlowerTall = ({ withLeaf = false }) => (
  <svg viewBox="0 0 12 20" style={{ width: '100%', height: '100%', imageRendering: 'pixelated', shapeRendering: 'crispEdges', filter: 'drop-shadow(0 4px 3px rgba(0,0,0,0.3))' }}>
    <rect x="4" y="0" width="4" height="4" fill="#FF3333" />
    <rect x="4" y="8" width="4" height="4" fill="#FF3333" />
    <rect x="0" y="4" width="4" height="4" fill="#FF3333" />
    <rect x="8" y="4" width="4" height="4" fill="#FF3333" />
    <rect x="4" y="4" width="4" height="4" fill="#FFD700" />
    <rect x="4" y="12" width="4" height="8" fill="#228B22" />
    {withLeaf && <rect x="8" y="14" width="2" height="2" fill="#228B22" />}
  </svg>
);

const CenterFlower = () => (
  <svg viewBox="0 0 24 60" style={{ width: '100%', height: '100%', imageRendering: 'pixelated', shapeRendering: 'crispEdges', overflow: 'visible' }} preserveAspectRatio="xMidYMax">
    <rect x="10" y="24" width="4" height="36" fill="#008000" />
    <rect x="6" y="44" width="4" height="4" fill="#006400" />
    <rect x="2" y="40" width="4" height="4" fill="#006400" />
    <rect x="14" y="36" width="4" height="4" fill="#006400" />
    <rect x="18" y="32" width="4" height="4" fill="#006400" />
    <rect x="8" y="8" width="8" height="8" fill="#5C3317" />
    <rect x="8" y="0" width="8" height="8" fill="#FFD700" />
    <rect x="8" y="16" width="8" height="8" fill="#FFD700" />
    <rect x="0" y="8" width="8" height="8" fill="#FFD700" />
    <rect x="16" y="8" width="8" height="8" fill="#FFD700" />
    <rect x="4" y="4" width="4" height="4" fill="#FFD700" opacity="0.8" />
    <rect x="16" y="4" width="4" height="4" fill="#FFD700" opacity="0.8" />
    <rect x="4" y="16" width="4" height="4" fill="#FFD700" opacity="0.8" />
    <rect x="16" y="16" width="4" height="4" fill="#FFD700" opacity="0.8" />
  </svg>
);

/* ─── Floating Flowers ─── */
const FloatingFlowers = () => {
  const flowersRef = useRef([]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (window.innerWidth / 2 - e.pageX) / 50;
      const y = (window.innerHeight / 2 - e.pageY) / 50;
      flowersRef.current.forEach((el, index) => {
        if (el) {
          const speed = (index + 1) * 0.5;
          el.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
        }
      });
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const setRef = (index) => (el) => {
    flowersRef.current[index] = el;
  };

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <div ref={setRef(0)} className="animate-float-medium delay-100" style={{ position: 'absolute', top: '15%', left: '10%', width: '2rem', height: '2rem', opacity: 0.9 }}>
        <PixelFlowerRed />
      </div>
      <div ref={setRef(1)} className="animate-float-slow delay-500" style={{ position: 'absolute', top: '8%', left: '25%', width: '1.5rem', height: '1.5rem', opacity: 0.8 }}>
        <PixelFlowerYellow />
      </div>
      <div ref={setRef(2)} className="animate-float-fast delay-300" style={{ position: 'absolute', top: '20%', right: '15%', width: '2.5rem', height: '2.5rem', opacity: 0.85 }}>
        <PixelFlowerTall />
      </div>
      <div ref={setRef(3)} className="animate-float-slow delay-700" style={{ position: 'absolute', bottom: '20%', left: '8%', width: '1.75rem', height: '1.75rem', opacity: 0.8 }}>
        <PixelFlowerYellow />
      </div>
      <div ref={setRef(4)} className="animate-float-medium delay-1000" style={{ position: 'absolute', bottom: '25%', right: '20%', width: '2.25rem', height: '2.25rem', opacity: 0.9 }}>
        <PixelFlowerTall withLeaf={true} />
      </div>
      <div ref={setRef(5)} className="animate-float-slow" style={{ position: 'absolute', top: '40%', left: '10%', width: '1rem', height: '1rem', opacity: 0.6 }}>
        <PixelFlowerYellow />
      </div>
      <div ref={setRef(6)} className="animate-float-slow delay-200" style={{ position: 'absolute', top: '60%', right: '8%', width: '1.25rem', height: '1.25rem', opacity: 0.7 }}>
        <PixelFlowerRed />
      </div>
    </div>
  );
};

/* ─── Scroll reveal hook ─── */
const useScrollReveal = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll('.section-reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
};

/* ─── Nav ─── */
const NavLink = ({ children, href = '#' }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      style={{
        position: 'relative',
        padding: '4px 0',
        color: hovered ? '#fde047' : 'white',
        textDecoration: 'none',
        fontWeight: 700,
        fontSize: '0.875rem',
        letterSpacing: '0.05em',
        fontFamily: "'Space Mono', monospace",
        transition: 'color 0.3s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
      <span
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: 2,
          width: hovered ? '100%' : '0%',
          background: '#fde047',
          transition: 'width 0.3s',
        }}
      />
    </a>
  );
};

const SocialLink = ({ children }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href="#"
      style={{
        color: hovered ? '#fde047' : 'white',
        textDecoration: 'none',
        transition: 'color 0.2s',
        fontFamily: "'Space Mono', monospace",
        fontWeight: 700,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </a>
  );
};

/* ─── Hero (same layout as react-app.js HomePage) ─── */
const Hero = () => (
  <section
    style={{
      position: 'relative',
      height: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#0044CC',
      color: '#ffffff',
      fontFamily: "'Space Mono', monospace",
      overflow: 'hidden',
    }}
  >
    {/* Grid background */}
    <div className="bg-grid" style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }} />

    {/* Floating flowers */}
    <FloatingFlowers />

    {/* Nav */}
    <nav style={{
      position: 'relative', zIndex: 50, width: '100%',
      padding: '2rem 3rem',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}>
      <div>
        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.7, letterSpacing: '0.2em' }}>
          Zoom Momentum 2025
        </span>
      </div>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'clamp(1.5rem, 4vw, 3rem)' }}>
        <NavLink href="#features">FEATURES</NavLink>
        <NavLink href="#how-it-works">HOW IT WORKS</NavLink>
        <NavLink href="#for-who">FOR WHO</NavLink>
        <NavLink href="#cta">GET STARTED</NavLink>
      </div>

      <div style={{ display: 'flex', gap: '1rem', opacity: 0.7 }}>
        <SocialLink>GH</SocialLink>
        <SocialLink>ZM</SocialLink>
      </div>
    </nav>

    {/* Main content */}
    <main style={{
      flexGrow: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      position: 'relative', zIndex: 20, paddingBottom: '5rem',
    }}>
      <div style={{ position: 'relative', cursor: 'default' }}>
        <h1
          className="font-serif-italic"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: '16vw',
            lineHeight: 1,
            letterSpacing: '-0.03em',
            color: 'white',
            display: 'flex',
            alignItems: 'flex-end',
            userSelect: 'none',
            filter: 'drop-shadow(0 25px 25px rgba(0,0,0,0.15))',
          }}
        >
          <span>Zoom</span>

          {/* Center flower */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              alignItems: 'center',
              marginLeft: '0.5vw',
              marginRight: '0.5vw',
              width: '4vw',
              height: '15vw',
            }}
          >
            <CenterFlower />
          </div>

          <span>M</span>
        </h1>

        {/* Labels */}
        <div
          className="animate-fade-in-delay-1"
          style={{
            position: 'absolute', top: '-2rem', left: '1rem',
            fontSize: 'clamp(0.65rem, 1vw, 0.875rem)', fontWeight: 700,
            letterSpacing: '0.1em',
          }}
        >
          IN-MEETING ENGAGEMENT
        </div>
        <div
          className="animate-fade-in-delay-1-5"
          style={{
            position: 'absolute', bottom: '-1rem', right: '1rem',
            fontSize: 'clamp(0.65rem, 1vw, 0.875rem)', fontWeight: 700,
            letterSpacing: '0.1em',
          }}
        >
          ZOOM APPS SDK
        </div>
      </div>
    </main>

    {/* Footer */}
    <footer style={{
      position: 'absolute', bottom: 0, left: 0, width: '100%',
      padding: '1.5rem', display: 'flex', justifyContent: 'space-between',
      alignItems: 'flex-end', zIndex: 30,
      fontSize: '0.75rem', fontWeight: 700, opacity: 0.6, letterSpacing: '0.1em',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <span>TRANSFORM VIRTUAL CLASSROOMS</span>
        <span>2025</span>
      </div>
      <div className="animate-bounce-custom" style={{ marginBottom: '0.5rem' }}>&#8595; SCROLL</div>
      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <span>&copy; 2025 ZOOM MOMENTUM</span>
        <span>ALL RIGHTS RESERVED</span>
      </div>
    </footer>
  </section>
);

/* ─── Feature Card ─── */
const FeatureCard = ({ icon, title, description, color, tags }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="section-reveal"
      style={{
        background: hovered ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
        border: `1px solid ${hovered ? 'rgba(253,224,71,0.4)' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: 4,
        padding: 'clamp(1.5rem, 3vw, 2.5rem)',
        transition: 'all 0.3s ease',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        cursor: 'default',
        fontFamily: "'Space Mono', monospace",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 4,
        background: 'rgba(253,224,71,0.15)',
        border: '1px solid rgba(253,224,71,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.4rem',
        marginBottom: 20,
        transition: 'transform 0.3s',
        transform: hovered ? 'scale(1.08)' : 'scale(1)',
      }}>
        {icon}
      </div>

      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 12, color: '#fde047' }}>{title}</h3>
      <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 20 }}>
        {description}
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {tags.map((tag) => (
          <span
            key={tag}
            style={{
              padding: '4px 10px',
              borderRadius: 2,
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              background: 'rgba(253,224,71,0.1)',
              color: '#fde047',
              border: '1px solid rgba(253,224,71,0.2)',
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

/* ─── Features Section ─── */
const Features = () => (
  <section id="features" style={{
    position: 'relative',
    padding: 'clamp(4rem, 10vw, 8rem) clamp(1.5rem, 5vw, 4rem)',
    maxWidth: 1200,
    margin: '0 auto',
    fontFamily: "'Space Mono', monospace",
  }}>
    <div className="section-reveal" style={{ textAlign: 'center', marginBottom: 64 }}>
      <span style={{
        display: 'inline-block', padding: '6px 16px', borderRadius: 2,
        fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em',
        color: '#fde047', background: 'rgba(253,224,71,0.1)',
        border: '1px solid rgba(253,224,71,0.2)', marginBottom: 20,
      }}>
        CORE FEATURES
      </span>
      <h2 className="font-serif-italic" style={{
        fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 400,
        fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.02em', marginBottom: 16,
      }}>
        Four Engines of Engagement
      </h2>
      <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
        Every feature designed to keep students focused, professors informed, and lectures alive.
      </p>
    </div>

    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: 24,
    }}>
      <FeatureCard
        icon={<span role="img" aria-label="arena">&#9889;</span>}
        title="Warm-Up Arena"
        description="AI-generated trivia from past lectures launches before class. A synchronized multiplayer game with a live leaderboard that primes students for what's ahead."
        color="#d29922"
        tags={['PRE-LECTURE', 'AI TRIVIA', 'LEADERBOARD']}
      />
      <FeatureCard
        icon={<span role="img" aria-label="anchor">&#9875;</span>}
        title="Live Anchor"
        description="A shared, auto-updating timeline of topics and takeaways generated from live transcription. Students always know what's being discussed and can bookmark key moments."
        color="#2ea44f"
        tags={['REAL-TIME', 'RTMS', 'BOOKMARKS']}
      />
      <FeatureCard
        icon={<span role="img" aria-label="pulse">&#128313;</span>}
        title="Professor's Pulse"
        description="One-tap AI-generated check-in polls that gauge comprehension in real time. Professors see results instantly and can adjust their teaching on the fly."
        color="#0b5cff"
        tags={['POLLS', 'AI-GENERATED', 'INSTANT RESULTS']}
      />
      <FeatureCard
        icon={<span role="img" aria-label="recovery">&#128218;</span>}
        title="Recovery Agent"
        description="Students tap a bookmark button when lost. After class, AI builds a personalized remediation pack with explanations and practice problems — fully private."
        color="#cf222e"
        tags={['POST-CLASS', 'PERSONALIZED', 'PRIVACY-FIRST']}
      />
    </div>
  </section>
);

/* ─── How It Works ─── */
const HowItWorks = () => {
  const steps = [
    { num: '01', title: 'Install the Zoom App', desc: 'Add Zoom Momentum from the Zoom Marketplace. It loads as an in-meeting side panel — zero setup for students.' },
    { num: '02', title: 'Start Your Lecture', desc: 'The Warm-Up Arena auto-launches trivia. Live Anchor begins building a shared timeline from the transcript stream.' },
    { num: '03', title: 'Engage in Real Time', desc: 'Professors trigger Pulse check-ins at any moment. Students bookmark confusion points. Everything syncs live.' },
    { num: '04', title: 'Learn After Class', desc: 'Recovery Agent generates personalized study packs from bookmarks. Students get targeted explanations and practice.' },
  ];

  return (
    <section id="how-it-works" style={{
      position: 'relative',
      padding: 'clamp(4rem, 10vw, 8rem) clamp(1.5rem, 5vw, 4rem)',
      background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.1) 50%, transparent 100%)',
      fontFamily: "'Space Mono', monospace",
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="section-reveal" style={{ textAlign: 'center', marginBottom: 64 }}>
          <span style={{
            display: 'inline-block', padding: '6px 16px', borderRadius: 2,
            fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em',
            color: '#fde047', background: 'rgba(253,224,71,0.1)',
            border: '1px solid rgba(253,224,71,0.2)', marginBottom: 20,
          }}>
            HOW IT WORKS
          </span>
          <h2 className="font-serif-italic" style={{
            fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 400,
            fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.02em', marginBottom: 16,
          }}>
            From Install to Impact in Minutes
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
            No complex configuration. No learning curve. Just open Zoom and teach.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 32,
          position: 'relative',
        }}>
          {steps.map((step) => (
            <div key={step.num} className="section-reveal" style={{
              position: 'relative',
              padding: '32px 28px',
              borderRadius: 4,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <span style={{
                display: 'block',
                fontSize: '3rem', fontWeight: 700,
                color: '#fde047',
                marginBottom: 16,
                lineHeight: 1,
                fontFamily: "'Space Mono', monospace",
              }}>
                {step.num}
              </span>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 10 }}>{step.title}</h3>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─── Audience Section ─── */
const ForWho = () => {
  const audiences = [
    {
      emoji: <span role="img" aria-label="professor" style={{ fontSize: '2.5rem' }}>&#128105;&#8205;&#127979;</span>,
      title: 'Professors',
      points: [
        'One-tap AI polls to check comprehension',
        'See engagement signals in real time',
        'No extra prep work — AI handles content',
        'Works in any subject or class size',
      ],
    },
    {
      emoji: <span role="img" aria-label="student" style={{ fontSize: '2.5rem' }}>&#127891;</span>,
      title: 'Students',
      points: [
        'Stay engaged with pre-lecture trivia',
        'Follow along with live topic timeline',
        'Bookmark moments of confusion privately',
        'Get AI study packs tailored to your gaps',
      ],
    },
    {
      emoji: <span role="img" aria-label="admin" style={{ fontSize: '2.5rem' }}>&#127963;</span>,
      title: 'Institutions',
      points: [
        'Runs inside Zoom — nothing else to license',
        'Privacy-first: no individual student tracking',
        'Works across departments and disciplines',
        'Measurable improvement in engagement',
      ],
    },
  ];

  return (
    <section id="for-who" style={{
      position: 'relative',
      padding: 'clamp(4rem, 10vw, 8rem) clamp(1.5rem, 5vw, 4rem)',
      maxWidth: 1200,
      margin: '0 auto',
      fontFamily: "'Space Mono', monospace",
    }}>
      <div className="section-reveal" style={{ textAlign: 'center', marginBottom: 64 }}>
        <span style={{
          display: 'inline-block', padding: '6px 16px', borderRadius: 2,
          fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em',
          color: '#fde047', background: 'rgba(253,224,71,0.1)',
          border: '1px solid rgba(253,224,71,0.2)', marginBottom: 20,
        }}>
          BUILT FOR EDUCATION
        </span>
        <h2 className="font-serif-italic" style={{
          fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 400,
          fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.02em', marginBottom: 16,
        }}>
          Everyone Benefits
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
          Designed for the realities of virtual learning — not just another tool.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 24,
      }}>
        {audiences.map((a) => (
          <div key={a.title} className="section-reveal" style={{
            padding: 'clamp(1.5rem, 3vw, 2.5rem)',
            borderRadius: 4,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <div style={{ marginBottom: 16 }}>{a.emoji}</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 20, color: '#fde047' }}>{a.title}</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {a.points.map((p) => (
                <li key={p} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)',
                  marginBottom: 14, lineHeight: 1.6,
                }}>
                  <span style={{ color: '#fde047', fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.6, flexShrink: 0 }}>&#10003;</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};

/* ─── Tech Stack Banner ─── */
const TechStack = () => {
  const techs = [
    'React 18', 'TypeScript', 'Zoom Apps SDK', 'Vite', 'Express', 'Prisma', 'OpenAI', 'RTMS',
  ];
  return (
    <section style={{
      padding: '48px clamp(1.5rem, 5vw, 4rem)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      fontFamily: "'Space Mono', monospace",
    }}>
      <div className="section-reveal" style={{
        maxWidth: 1200, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexWrap: 'wrap', gap: 'clamp(16px, 3vw, 32px)',
      }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', marginRight: 8 }}>
          BUILT WITH
        </span>
        {techs.map((t) => (
          <span key={t} style={{
            padding: '8px 18px',
            borderRadius: 2,
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'rgba(255,255,255,0.5)',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            {t}
          </span>
        ))}
      </div>
    </section>
  );
};

/* ─── CTA Section ─── */
const CTA = () => (
  <section id="cta" style={{
    position: 'relative',
    padding: 'clamp(4rem, 10vw, 8rem) clamp(1.5rem, 5vw, 4rem)',
    textAlign: 'center',
    overflow: 'hidden',
    fontFamily: "'Space Mono', monospace",
  }}>
    <div className="section-reveal" style={{ position: 'relative', zIndex: 10 }}>
      <h2 className="font-serif-italic" style={{
        fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 400,
        fontSize: 'clamp(2rem, 5vw, 3.5rem)',
        letterSpacing: '-0.02em',
        marginBottom: 20,
        lineHeight: 1.1,
      }}>
        Ready to Transform<br />Your Virtual Classroom?
      </h2>
      <p style={{
        fontSize: '0.9rem',
        color: 'rgba(255,255,255,0.5)',
        maxWidth: 480,
        margin: '0 auto 40px',
        lineHeight: 1.7,
      }}>
        Zoom Momentum is built for Zoom — install it once and every lecture
        becomes more engaging, more interactive, and more effective.
      </p>
      <a
        href="#"
        style={{
          display: 'inline-block',
          padding: '16px 40px',
          borderRadius: 2,
          background: '#fde047',
          color: '#1e3a5f',
          fontWeight: 700,
          fontSize: '0.9rem',
          textDecoration: 'none',
          letterSpacing: '0.05em',
          fontFamily: "'Space Mono', monospace",
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(253,224,71,0.3)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
      >
        GET STARTED WITH ZOOM MOMENTUM
      </a>
    </div>
  </section>
);

/* ─── Footer ─── */
const Footer = () => (
  <footer style={{
    padding: '40px clamp(1.5rem, 5vw, 4rem)',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    maxWidth: 1200,
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
    fontFamily: "'Space Mono', monospace",
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '0.1em',
    opacity: 0.5,
  }}>
    <span>ZOOM MOMENTUM</span>
    <span>BUILT WITH ZOOM APPS SDK &middot; POWERED BY AI</span>
    <span>&copy; 2025 ZOOM MOMENTUM</span>
  </footer>
);

/* ─── App ─── */
const App = () => {
  useScrollReveal();
  return (
    <>
      <GlobalStyles />
      <div style={{ minHeight: '100vh', position: 'relative', backgroundColor: '#0044CC' }}>
        <Hero />
        <Features />
        <HowItWorks />
        <ForWho />
        <TechStack />
        <CTA />
        <Footer />
      </div>
    </>
  );
};

export default App;