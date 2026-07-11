import { useId } from 'react';
import { ZOOM_WORDMARK_PATH } from './zoomWordmark';

interface ZoomMomentumLogoProps {
  /** Rendered height of the wordmark in px. */
  height?: number;
  /** Color of the "Momentum" word (the zoom wordmark stays brand blue). */
  wordColor?: string;
  /** Set false to render just the zoom wordmark with the momentum "o". */
  showMomentum?: boolean;
}

const ZOOM_BLUE = '#0B5CFF';

/**
 * The Zoom Momentum lockup: the official zoom wordmark with a "momentum"
 * motif on the second o (a ball with speed lines, cut through the ring via
 * a mask so it works on any background), followed by the product name.
 */
export function ZoomMomentumLogo({
  height = 22,
  wordColor = '#10203F',
  showMomentum = true,
}: ZoomMomentumLogoProps) {
  const maskId = useId();

  return (
    <span className="zml" style={{ gap: Math.round(height * 0.42) }} aria-label="Zoom Momentum">
      <svg viewBox="0 0 1000 225" style={{ height, width: 'auto' }} aria-hidden>
        <mask id={maskId}>
          <rect x="0" y="0" width="1000" height="225" fill="#fff" />
          {/* breathing room around the speed line where it crosses the ring */}
          <rect x="366" y="92" width="150" height="41" rx="20.5" fill="#000" />
        </mask>
        <path d={ZOOM_WORDMARK_PATH} fill={ZOOM_BLUE} fillRule="evenodd" mask={`url(#${maskId})`} />
        {/* momentum motif: speed lines + ball inside the second o */}
        <g fill={ZOOM_BLUE}>
          <rect x="374" y="101.5" width="126" height="22" rx="11" />
          <rect x="514" y="101.5" width="14" height="22" rx="7" />
          <circle cx="566" cy="112.5" r="27" />
        </g>
      </svg>
      {showMomentum && (
        <span className="zml-word" style={{ color: wordColor, fontSize: Math.round(height * 1.32) }}>
          Momentum
        </span>
      )}
    </span>
  );
}
