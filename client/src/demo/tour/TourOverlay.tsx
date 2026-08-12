import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ZoomMomentumLogo } from '../zoom/ZoomMomentumLogo';
import type { TourStep } from './tourSteps';

interface TourOverlayProps {
  step: TourStep;
  stepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

interface SpotRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const GAP = 14;
const MARGIN = 12;
const SPOT_PADDING = 8;

function rectsDiffer(a: SpotRect | null, b: SpotRect | null): boolean {
  if (!a || !b) return a !== b;
  return (
    Math.abs(a.top - b.top) > 1 ||
    Math.abs(a.left - b.left) > 1 ||
    Math.abs(a.width - b.width) > 1 ||
    Math.abs(a.height - b.height) > 1
  );
}

export function TourOverlay({ step, stepIndex, totalSteps, onNext, onBack, onSkip }: TourOverlayProps) {
  const [spot, setSpot] = useState<SpotRect | null>(null);
  const [cardPos, setCardPos] = useState<{ top: number; left: number } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const centered = !step.target || step.placement === 'center';

  // Track the highlighted element. Content streams into the panel while a step
  // is open, so poll the rect instead of measuring once.
  useEffect(() => {
    if (centered) {
      setSpot(null);
      return;
    }
    let current: SpotRect | null = null;
    const measure = () => {
      const el = document.querySelector(step.target!);
      if (!el) {
        if (current !== null) {
          current = null;
          setSpot(null);
        }
        return;
      }
      const rect = el.getBoundingClientRect();
      const next: SpotRect = {
        top: rect.top - SPOT_PADDING,
        left: rect.left - SPOT_PADDING,
        width: rect.width + SPOT_PADDING * 2,
        height: rect.height + SPOT_PADDING * 2,
      };
      if (rectsDiffer(current, next)) {
        current = next;
        setSpot(next);
      }
    };
    measure();
    const interval = setInterval(measure, 200);
    window.addEventListener('resize', measure);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', measure);
    };
  }, [step.id, step.target, centered]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (event.key === 'ArrowRight') onNext();
      if (event.key === 'ArrowLeft') onBack();
      if (event.key === 'Escape') onSkip();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onNext, onBack, onSkip]);

  // Position the card once its real size is known, clamped fully on-screen.
  // When the preferred side has no room (e.g. the target fills the viewport),
  // the card floats over the target's near edge instead of escaping the view.
  useLayoutEffect(() => {
    if (centered || !spot) {
      setCardPos(null);
      return;
    }
    const card = cardRef.current;
    if (!card) return;
    const cw = card.offsetWidth;
    const ch = card.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const placement = step.placement ?? 'bottom';
    let top: number;
    let left: number;
    if (placement === 'left') {
      left = spot.left - cw - GAP;
      top = spot.top + spot.height / 2 - ch / 2;
    } else if (placement === 'right') {
      left = spot.left + spot.width + GAP;
      top = spot.top + spot.height / 2 - ch / 2;
    } else if (placement === 'top') {
      left = spot.left + spot.width / 2 - cw / 2;
      top = spot.top - ch - GAP;
    } else {
      left = spot.left + spot.width / 2 - cw / 2;
      top = spot.top + spot.height + GAP;
    }
    left = Math.max(MARGIN, Math.min(left, vw - cw - MARGIN));
    top = Math.max(MARGIN, Math.min(top, vh - ch - MARGIN));
    setCardPos(current =>
      current && Math.abs(current.top - top) <= 1 && Math.abs(current.left - left) <= 1
        ? current
        : { top, left },
    );
  }, [centered, spot, step.id, step.placement]);

  const cardStyle: React.CSSProperties = centered
    ? {}
    : cardPos
      ? { top: cardPos.top, left: cardPos.left }
      : { top: -9999, left: -9999, visibility: 'hidden' };

  const isLast = stepIndex === totalSteps - 1;

  return (
    <div className={`tour-layer ${centered ? 'tour-layer--centered' : ''}`}>
      {!centered && spot && (
        <div
          className="tour-spot"
          style={{ top: spot.top, left: spot.left, width: spot.width, height: spot.height }}
        />
      )}
      <div
        key={step.id}
        ref={cardRef}
        className={`tour-card ${centered ? 'tour-card--centered' : ''}`}
        style={centered ? undefined : cardStyle}
        role="dialog"
        aria-label={step.title}
      >
        {centered && (
          <span className="tour-logo">
            <ZoomMomentumLogo height={26} wordColor="#10203F" />
          </span>
        )}
        {step.chip && <span className={`tour-chip tour-chip--${step.pov}`}>{step.chip}</span>}
        <h3 className="tour-title">{step.title}</h3>
        {step.body.split('\n\n').map((para, i) => (
          <p className="tour-body" key={i}>
            {para}
          </p>
        ))}
        {step.interactive && <span className="tour-try">✦ Try it — the panel is live</span>}
        <div className="tour-footer">
          <div className="tour-progress">
            <span className="tour-count">
              {stepIndex + 1} / {totalSteps}
            </span>
            <span className="tour-dots" aria-hidden>
              {Array.from({ length: totalSteps }, (_, i) => (
                <i key={i} className={i === stepIndex ? 'active' : i < stepIndex ? 'past' : ''} />
              ))}
            </span>
          </div>
          <div className="tour-actions">
            {stepIndex > 0 && (
              <button type="button" className="tour-btn tour-btn--ghost" onClick={onBack}>
                Back
              </button>
            )}
            <button type="button" className="tour-btn tour-btn--primary" onClick={onNext}>
              {step.nextLabel ?? (isLast ? 'Finish' : 'Next')}
            </button>
          </div>
        </div>
        {!isLast && (
          <button type="button" className="tour-skip" onClick={onSkip}>
            {stepIndex === 0 ? 'Skip — let me explore on my own' : 'Skip tour'}
          </button>
        )}
      </div>
    </div>
  );
}
