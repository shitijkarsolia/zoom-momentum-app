import { useState } from 'react';

interface FeatureInfoProps {
  title: string;
  description: string;
}

export function FeatureInfo({ title, description }: FeatureInfoProps) {
  const [open, setOpen] = useState(false);

  return (
    <span className="feature-info-wrapper">
      <button
        className="feature-info-trigger"
        onClick={() => setOpen(prev => !prev)}
        aria-label={`About ${title}`}
        aria-expanded={open}
      >
        ?
      </button>
      {open && (
        <>
          <div className="feature-info-backdrop" onClick={() => setOpen(false)} />
          <div className="feature-info-popover" role="dialog" aria-label={title}>
            <div className="feature-info-header">
              <span className="feature-info-title">{title}</span>
              <button className="feature-info-close" onClick={() => setOpen(false)} aria-label="Close">
                &times;
              </button>
            </div>
            <p className="feature-info-text">{description}</p>
          </div>
        </>
      )}
    </span>
  );
}
