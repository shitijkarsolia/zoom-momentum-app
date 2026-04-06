import type { AnchorBookmark } from '../../hooks/useLiveAnchor';

interface BookmarkListProps {
  bookmarks: AnchorBookmark[];
}

export function BookmarkList({ bookmarks }: BookmarkListProps) {
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
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 10px',
                borderRadius: 6,
                background: 'var(--zoom-bg)',
                fontSize: 12,
              }}
            >
              <span style={{ fontSize: 14 }}>{b.isAuto ? '\u2728' : '\uD83D\uDD16'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {b.topic}
                </div>
                {b.transcriptSnippet && (
                  <div style={{ fontSize: 11, color: 'var(--zoom-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {b.transcriptSnippet}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                <span style={{ fontSize: 10, color: 'var(--zoom-text-secondary)' }}>{timeLabel}</span>
                <span style={{
                  fontSize: 9,
                  padding: '1px 5px',
                  borderRadius: 3,
                  background: b.isAuto ? 'var(--zoom-brand-light, #e8f0fe)' : 'var(--zoom-bg)',
                  color: b.isAuto ? 'var(--zoom-brand, #0E71EB)' : 'var(--zoom-text-secondary)',
                }}>
                  {b.isAuto ? 'auto' : 'manual'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
