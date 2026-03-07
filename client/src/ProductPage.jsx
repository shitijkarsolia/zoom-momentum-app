import React, { useState, useEffect, useRef } from 'react';

/* ─── Zoom Momentum — Single-Page Product Page ─── */

const GlobalStyles = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@1,400;1,700&display=swap');

      :root {
        --zoom-blue: #0b5cff;
        --zoom-blue-dark: #0948cc;
        --zoom-blue-deeper: #0635a1;
        --zoom-bg: #f7f8fa;
        --zoom-card: #ffffff;
        --zoom-text: #232333;
        --zoom-text-secondary: #6e7191;
        --zoom-border: #e4e4e7;
        --zoom-success: #2ea44f;
        --zoom-warning: #d29922;
        --zoom-error: #cf222e;
        --zoom-radius: 12px;
        --grid-color: rgba(255, 255, 255, 0.06);
      }

      * { box-sizing: border-box; margin: 0; padding: 0; }

      html {
        scroll-behavior: smooth;
      }

      body {
        background-color: #0a0f1a;
        color: #ffffff;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        overflow-x: hidden;
      }

      ::selection { background: var(--zoom-blue); color: #ffffff; }

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
        mask-image: radial-gradient(circle at center, black 40%, transparent 80%);
        -webkit-mask-image: radial-gradient(circle at center, black 40%, transparent 80%);
      }

      @keyframes float-slow {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-20px); }
      }
      @keyframes float-medium {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-14px); }
      }
      @keyframes float-fast {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-8px); }
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

      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideInLeft {
        from { opacity: 0; transform: translateX(-40px); }
        to { opacity: 1; transform: translateX(0); }
      }
      @keyframes slideInRight {
        from { opacity: 0; transform: translateX(40px); }
        to { opacity: 1; transform: translateX(0); }
      }
      @keyframes pulse-ring {
        0% { transform: scale(1); opacity: 1; }
        100% { transform: scale(1.8); opacity: 0; }
      }
      @keyframes gradient-shift {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-6px); }
      }
      .animate-bounce-custom { animation: bounce 1.5s ease-in-out infinite; }

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

/* ─── Floating Orbs (replaces flowers, Zoom-themed) ─── */
const FloatingOrbs = () => {
  const orbsRef = useRef([]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (window.innerWidth / 2 - e.pageX) / 60;
      const y = (window.innerHeight / 2 - e.pageY) / 60;
      orbsRef.current.forEach((el, i) => {
        if (el) {
          const speed = (i + 1) * 0.4;
          el.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
        }
      });
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const setRef = (i) => (el) => { orbsRef.current[i] = el; };

  const orbs = [
    { top: '10%', left: '8%', size: 120, color: 'rgba(11,92,255,0.25)', anim: 'animate-float-medium delay-100' },
    { top: '5%', right: '15%', size: 80, color: 'rgba(11,92,255,0.15)', anim: 'animate-float-slow delay-500' },
    { top: '30%', right: '5%', size: 160, color: 'rgba(46,164,79,0.12)', anim: 'animate-float-fast delay-300' },
    { bottom: '20%', left: '5%', size: 100, color: 'rgba(210,153,34,0.15)', anim: 'animate-float-slow delay-700' },
    { bottom: '10%', right: '10%', size: 140, color: 'rgba(11,92,255,0.2)', anim: 'animate-float-medium delay-1000' },
    { top: '50%', left: '50%', size: 200, color: 'rgba(11,92,255,0.08)', anim: 'animate-float-slow delay-200' },
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {orbs.map((orb, i) => (
        <div
          key={i}
          ref={setRef(i)}
          className={orb.anim}
          style={{
            position: 'absolute',
            top: orb.top,
            left: orb.left,
            right: orb.right,
            bottom: orb.bottom,
            width: orb.size,
            height: orb.size,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${orb.color}, transparent 70%)`,
            filter: 'blur(40px)',
          }}
        />
      ))}
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
        color: hovered ? '#0b5cff' : '#ffffff',
        textDecoration: 'none',
        fontWeight: 600,
        fontSize: '0.875rem',
        letterSpacing: '0.05em',
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
          background: '#0b5cff',
          transition: 'width 0.3s',
        }}
      />
    </a>
  );
};

const Nav = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '0 clamp(1.5rem, 5vw, 4rem)',
        height: 72,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: scrolled ? 'rgba(10,15,26,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
        transition: 'all 0.3s',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: 'linear-gradient(135deg, #0b5cff, #0948cc)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: '1.1rem', color: '#fff',
        }}>
          M
        </div>
        <span style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.01em' }}>
          <span style={{ color: '#0b5cff' }}>Zoom</span> Momentum
        </span>
      </div>

      {/* Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(1rem, 3vw, 2.5rem)' }}>
        <NavLink href="#features">FEATURES</NavLink>
        <NavLink href="#how-it-works">HOW IT WORKS</NavLink>
        <NavLink href="#for-who">FOR WHO</NavLink>
        <a
          href="#cta"
          style={{
            padding: '10px 24px',
            background: '#0b5cff',
            color: '#fff',
            borderRadius: 8,
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: '0.875rem',
            letterSpacing: '0.02em',
            transition: 'background 0.2s, transform 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#0948cc'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#0b5cff'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          GET STARTED
        </a>
      </div>
    </nav>
  );
};

/* ─── Hero ─── */
const Hero = () => (
  <section
    style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '120px clamp(1.5rem, 5vw, 4rem) 80px',
      overflow: 'hidden',
    }}
  >
    <div className="bg-grid" style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }} />
    <FloatingOrbs />

    {/* Badge */}
    <div
      style={{
        position: 'relative', zIndex: 10,
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '8px 20px', borderRadius: 100,
        background: 'rgba(11,92,255,0.12)',
        border: '1px solid rgba(11,92,255,0.25)',
        marginBottom: 32,
        animation: 'fadeInUp 0.8s ease forwards',
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2ea44f', position: 'relative' }}>
        <span style={{
          position: 'absolute', inset: -3,
          borderRadius: '50%',
          border: '2px solid #2ea44f',
          animation: 'pulse-ring 2s ease-out infinite',
        }} />
      </span>
      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#8bb3ff', letterSpacing: '0.06em' }}>
        ZOOM APPS SDK — IN-MEETING SIDE PANEL
      </span>
    </div>

    {/* Title */}
    <h1
      className="font-serif-italic"
      style={{
        position: 'relative', zIndex: 10,
        fontSize: 'clamp(3rem, 8vw, 7rem)',
        fontWeight: 700,
        lineHeight: 1.05,
        letterSpacing: '-0.03em',
        marginBottom: 24,
        animation: 'fadeInUp 0.8s ease 0.2s both',
      }}
    >
      <span style={{ color: '#ffffff' }}>Zoom</span>
      <br />
      <span
        style={{
          background: 'linear-gradient(135deg, #0b5cff 0%, #4d94ff 50%, #0b5cff 100%)',
          backgroundSize: '200% 200%',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: 'gradient-shift 4s ease infinite',
        }}
      >
        Momentum
      </span>
    </h1>

    {/* Subtitle */}
    <p
      style={{
        position: 'relative', zIndex: 10,
        fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
        color: 'rgba(255,255,255,0.65)',
        maxWidth: 640,
        lineHeight: 1.6,
        marginBottom: 48,
        animation: 'fadeInUp 0.8s ease 0.4s both',
      }}
    >
      Transform passive virtual classrooms into active learning environments.
      Real-time trivia, live summaries, instant polls, and personalized study
      guides — all inside Zoom.
    </p>

    {/* CTA Buttons */}
    <div
      style={{
        position: 'relative', zIndex: 10,
        display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center',
        animation: 'fadeInUp 0.8s ease 0.6s both',
      }}
    >
      <a
        href="#features"
        style={{
          padding: '16px 36px', borderRadius: 10,
          background: '#0b5cff', color: '#fff',
          fontWeight: 700, fontSize: '1rem',
          textDecoration: 'none',
          boxShadow: '0 4px 24px rgba(11,92,255,0.35)',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#0948cc'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(11,92,255,0.45)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = '#0b5cff'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(11,92,255,0.35)'; }}
      >
        Explore Features
      </a>
      <a
        href="#how-it-works"
        style={{
          padding: '16px 36px', borderRadius: 10,
          background: 'transparent', color: '#fff',
          fontWeight: 700, fontSize: '1rem',
          textDecoration: 'none',
          border: '2px solid rgba(255,255,255,0.2)',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(11,92,255,0.6)'; e.currentTarget.style.background = 'rgba(11,92,255,0.08)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.background = 'transparent'; }}
      >
        See How It Works
      </a>
    </div>

    {/* Scroll indicator */}
    <div className="animate-bounce-custom" style={{
      position: 'absolute', bottom: 40, zIndex: 10,
      fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em',
      color: 'rgba(255,255,255,0.4)',
    }}>
      SCROLL
    </div>
  </section>
);

/* ─── Feature Card ─── */
const FeatureCard = ({ icon, title, description, color, tags }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="section-reveal"
      style={{
        background: hovered ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${hovered ? color + '40' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: 16,
        padding: 'clamp(1.5rem, 3vw, 2.5rem)',
        transition: 'all 0.3s ease',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        cursor: 'default',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Icon */}
      <div style={{
        width: 56, height: 56, borderRadius: 14,
        background: `${color}18`,
        border: `1px solid ${color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.6rem',
        marginBottom: 20,
        transition: 'transform 0.3s',
        transform: hovered ? 'scale(1.08)' : 'scale(1)',
      }}>
        {icon}
      </div>

      <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 12, color: '#fff' }}>{title}</h3>
      <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, marginBottom: 20 }}>
        {description}
      </p>

      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {tags.map((tag) => (
          <span
            key={tag}
            style={{
              padding: '4px 12px',
              borderRadius: 100,
              fontSize: '0.72rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
              background: `${color}15`,
              color: color,
              border: `1px solid ${color}25`,
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
  }}>
    <div className="section-reveal" style={{ textAlign: 'center', marginBottom: 64 }}>
      <span style={{
        display: 'inline-block', padding: '6px 16px', borderRadius: 100,
        fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em',
        color: '#0b5cff', background: 'rgba(11,92,255,0.1)',
        border: '1px solid rgba(11,92,255,0.2)', marginBottom: 20,
      }}>
        CORE FEATURES
      </span>
      <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 16 }}>
        Four Engines of Engagement
      </h2>
      <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.5)', maxWidth: 560, margin: '0 auto' }}>
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
      background: 'linear-gradient(180deg, transparent 0%, rgba(11,92,255,0.04) 50%, transparent 100%)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="section-reveal" style={{ textAlign: 'center', marginBottom: 64 }}>
          <span style={{
            display: 'inline-block', padding: '6px 16px', borderRadius: 100,
            fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em',
            color: '#2ea44f', background: 'rgba(46,164,79,0.1)',
            border: '1px solid rgba(46,164,79,0.2)', marginBottom: 20,
          }}>
            HOW IT WORKS
          </span>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 16 }}>
            From Install to Impact in Minutes
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.5)', maxWidth: 520, margin: '0 auto' }}>
            No complex configuration. No learning curve. Just open Zoom and teach.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 32,
          position: 'relative',
        }}>
          {steps.map((step, i) => (
            <div key={step.num} className="section-reveal" style={{
              position: 'relative',
              padding: '32px 28px',
              borderRadius: 16,
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <span style={{
                display: 'block',
                fontSize: '3rem', fontWeight: 900,
                background: 'linear-gradient(135deg, #0b5cff, #4d94ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: 16,
                lineHeight: 1,
              }}>
                {step.num}
              </span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 10 }}>{step.title}</h3>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{step.desc}</p>
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
    }}>
      <div className="section-reveal" style={{ textAlign: 'center', marginBottom: 64 }}>
        <span style={{
          display: 'inline-block', padding: '6px 16px', borderRadius: 100,
          fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em',
          color: '#d29922', background: 'rgba(210,153,34,0.1)',
          border: '1px solid rgba(210,153,34,0.2)', marginBottom: 20,
        }}>
          BUILT FOR EDUCATION
        </span>
        <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 16 }}>
          Everyone Benefits
        </h2>
        <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.5)', maxWidth: 520, margin: '0 auto' }}>
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
            borderRadius: 16,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ marginBottom: 16 }}>{a.emoji}</div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 20 }}>{a.title}</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {a.points.map((p) => (
                <li key={p} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)',
                  marginBottom: 14, lineHeight: 1.5,
                }}>
                  <span style={{ color: '#0b5cff', fontWeight: 700, fontSize: '1rem', lineHeight: 1.5, flexShrink: 0 }}>&#10003;</span>
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
      borderTop: '1px solid rgba(255,255,255,0.04)',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
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
            borderRadius: 100,
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.5)',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
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
  }}>
    {/* Glow */}
    <div style={{
      position: 'absolute', top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 600, height: 600,
      background: 'radial-gradient(circle, rgba(11,92,255,0.15), transparent 70%)',
      pointerEvents: 'none',
    }} />

    <div className="section-reveal" style={{ position: 'relative', zIndex: 10 }}>
      <h2 style={{
        fontSize: 'clamp(2rem, 5vw, 3.5rem)',
        fontWeight: 800,
        letterSpacing: '-0.02em',
        marginBottom: 20,
        lineHeight: 1.1,
      }}>
        Ready to Transform<br />Your Virtual Classroom?
      </h2>
      <p style={{
        fontSize: '1.1rem',
        color: 'rgba(255,255,255,0.5)',
        maxWidth: 480,
        margin: '0 auto 40px',
        lineHeight: 1.6,
      }}>
        Zoom Momentum is built for Zoom — install it once and every lecture
        becomes more engaging, more interactive, and more effective.
      </p>
      <a
        href="#"
        style={{
          display: 'inline-block',
          padding: '18px 48px',
          borderRadius: 12,
          background: 'linear-gradient(135deg, #0b5cff, #0948cc)',
          color: '#fff',
          fontWeight: 700,
          fontSize: '1.05rem',
          textDecoration: 'none',
          boxShadow: '0 4px 32px rgba(11,92,255,0.4)',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 40px rgba(11,92,255,0.55)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 32px rgba(11,92,255,0.4)'; }}
      >
        Get Started with Zoom Momentum
      </a>
    </div>
  </section>
);

/* ─── Footer ─── */
const Footer = () => (
  <footer style={{
    padding: '40px clamp(1.5rem, 5vw, 4rem)',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    maxWidth: 1200,
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 28, height: 28, borderRadius: 6,
        background: 'linear-gradient(135deg, #0b5cff, #0948cc)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 800, fontSize: '0.8rem', color: '#fff',
      }}>
        M
      </div>
      <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>
        Zoom Momentum
      </span>
    </div>

    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>
      BUILT WITH ZOOM APPS SDK &middot; POWERED BY AI
    </span>

    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
      &copy; 2025 Zoom Momentum. All rights reserved.
    </span>
  </footer>
);

/* ─── App ─── */
const App = () => {
  useScrollReveal();
  return (
    <>
      <GlobalStyles />
      <div style={{ minHeight: '100vh', position: 'relative' }}>
        <Nav />
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