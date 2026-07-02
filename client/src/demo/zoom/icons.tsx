interface IconProps {
  size?: number;
}

function base(size: number) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
}

export function MicIcon({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)}>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <line x1="12" y1="18" x2="12" y2="21" />
    </svg>
  );
}

export function MicOffIcon({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)}>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <line x1="12" y1="18" x2="12" y2="21" />
      <line x1="4" y1="4" x2="20" y2="20" stroke="#e8283f" strokeWidth="2" />
    </svg>
  );
}

export function VideoIcon({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)}>
      <rect x="3" y="6.5" width="12.5" height="11" rx="2.5" />
      <path d="M15.5 10.5 21 7.5v9l-5.5-3" />
    </svg>
  );
}

export function ShieldIcon({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M12 3 5 5.8v5.4c0 4.4 3 8 7 9.8 4-1.8 7-5.4 7-9.8V5.8L12 3Z" />
      <path d="m9.2 11.8 2 2 3.6-4" />
    </svg>
  );
}

export function PeopleIcon({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)}>
      <circle cx="9" cy="8.5" r="3.2" />
      <path d="M3.5 19.5c.6-3.2 2.9-5 5.5-5s4.9 1.8 5.5 5" />
      <path d="M15.5 6a3 3 0 0 1 0 5.4M17.5 14.8c1.7.7 2.7 2.3 3 4.7" />
    </svg>
  );
}

export function ChatIcon({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 3.5V17H6.5A2.5 2.5 0 0 1 4 14.5v-8Z" />
    </svg>
  );
}

export function ShareIcon({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)}>
      <rect x="3.5" y="5" width="17" height="12" rx="2" />
      <path d="M12 13.5V8.2m0 0-2.4 2.3M12 8.2l2.4 2.3" />
      <line x1="8.5" y1="20" x2="15.5" y2="20" />
    </svg>
  );
}

export function RecordIcon({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function SmileIcon({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8.8 14.2a4.2 4.2 0 0 0 6.4 0" />
      <circle cx="9.2" cy="10" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="14.8" cy="10" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function AppsIcon({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)}>
      <rect x="4" y="4" width="7" height="7" rx="1.6" />
      <rect x="13" y="4" width="7" height="7" rx="1.6" />
      <rect x="4" y="13" width="7" height="7" rx="1.6" />
      <rect x="13" y="13" width="7" height="7" rx="1.6" />
    </svg>
  );
}

export function CaptionsIcon({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="M10.5 10.6a2.1 2.1 0 1 0 0 2.8M16.5 10.6a2.1 2.1 0 1 0 0 2.8" />
    </svg>
  );
}

export function ChevronDownIcon({ size = 14 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function CloseIcon({ size = 16 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M6 6 18 18M18 6 6 18" />
    </svg>
  );
}

export function BoltIcon({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M13.4 2 5 13.4h5.2L9.4 22l8.6-11.8h-5.3L13.4 2Z" />
    </svg>
  );
}

/** The Zoom app icon: blue rounded square with the white camera glyph. */
export function ZoomLogoIcon({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect width="48" height="48" rx="10.8" fill="#0B5CFF" />
      <path
        d="M9 18.2C9 16.43 10.43 15 12.2 15h13.3c3.59 0 6.5 2.91 6.5 6.5v8.3c0 1.77-1.43 3.2-3.2 3.2H15.5A6.5 6.5 0 0 1 9 26.5v-8.3Z"
        fill="#fff"
      />
      <path
        d="m34.2 21.6 4.1-3.07c1.05-.79 2.55-.04 2.55 1.28v8.38c0 1.32-1.5 2.07-2.55 1.28l-4.1-3.07v-4.8Z"
        fill="#fff"
      />
    </svg>
  );
}
