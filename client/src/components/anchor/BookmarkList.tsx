import { useState } from 'react';
import type { AnchorBookmark } from '../../hooks/useLiveAnchor';

interface BookmarkListProps {
  bookmarks: AnchorBookmark[];
  onRemove?: (index: number) => void;
  onAddToNotes?: (bookmark: AnchorBookmark) => void;
}

export function BookmarkList({ bookmarks, onRemove, onAddToNotes }: BookmarkListProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (bookmarks.length === 0) return null;

  return (
    <div className="bookmark-list">
      <h4 style={{ fontSize: 12, color: 'var(--zoom-text-secondary)', margin: '12px 0 6px', fontWeight: 600 }}>
        Bookmarks ({bookmarks.length})
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {bookmarks.map((b, i) => {
          const ago = Math.round((Date.now() - b.timestamp) / 60000);
          const timeLabel = ago < 1 ? 'just now' : `${ago}m ago`;
          const isExpanded = expandedIndex === i;
          const time = new Date(b.timestamp);
          const timeStr = `${time.getHours()}:${String(time.getMinutes()).padStart(2, '0')}:${String(time.getSeconds()).padStart(2, '0')}`;

          return (
            <div
              key={i}
              role="button"
              tabIndex={0}
              aria-expanded={isExpanded}
              style={{
                padding: '8px 10px',
                borderRadius: 6,
                background: 'var(--zoom-bg)',
                fontSize: 12,
                cursor: 'pointer',
                border: isExpanded ? '1px solid var(--zoom-brand, #0E71EB)' : '1px solid transparent',
                transition: 'border-color 0.2s',
              }}
              onClick={() => setExpandedIndex(isExpanded ? null : i)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpandedIndex(isExpanded ? null : i); } }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14 }}>{'\uD83D\uDD16'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {b.topic}
                  </div>
                </div>
                <span style={{ fontSize: 10, color: 'var(--zoom-text-secondary)', flexShrink: 0 }}>{timeLabel}</span>
              </div>

              {isExpanded && (
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--zoom-border, #e0e0e0)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11 }}>
                    <div>
                      <span style={{ color: 'var(--zoom-text-secondary)' }}>Time: </span>
                      <span>{timeStr}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--zoom-text-secondary)' }}>Topic: </span>
                      <span style={{ fontWeight: 500 }}>{b.topic}</span>
                    </div>
                    {b.transcriptSnippet && (
                      <div>
                        <span style={{ color: 'var(--zoom-text-secondary)' }}>Context: </span>
                        <span style={{ fontStyle: 'italic' }}>{b.transcriptSnippet}</span>
                      </div>
                    )}
                  </div>
                  <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                    {onAddToNotes && (
                      <button
                        className="btn btn-secondary"
                        style={{ fontSize: 11, padding: '3px 10px', flex: 1 }}
                        onClick={(e) => { e.stopPropagation(); onAddToNotes(b); }}
                        title="Add this bookmark to your notes"
                      >
                        + Note
                      </button>
                    )}
                    {onRemove && (
                      <button
                        className="btn btn-secondary"
                        style={{ fontSize: 11, padding: '3px 10px', flex: 1 }}
                        onClick={(e) => { e.stopPropagation(); onRemove(i); setExpandedIndex(null); }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
