import type { Topic } from '../../types/messages';

interface TopicCardProps {
  topic: Topic;
  isCurrent: boolean;
  isBookmarked?: boolean;
  onBookmark?: () => void;
  onAddToNotes?: () => void;
}

export function TopicCard({ topic, isCurrent, isBookmarked, onBookmark, onAddToNotes }: TopicCardProps) {
  const elapsed = Math.round((Date.now() - topic.startTime) / 60_000);
  const timeLabel = elapsed < 1 ? 'Just now' : `${elapsed}m ago`;

  return (
    <div
      className={`topic-card ${isCurrent ? 'topic-card-current' : ''}`}
      style={isCurrent ? { borderLeft: '3px solid var(--zoom-blue)' } : undefined}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
          {isCurrent && <span className="current-indicator" />}
          {topic.title}
        </h3>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {topic.bullets.length > 0 && (
            <span style={{
              fontSize: 10,
              color: 'var(--zoom-text-secondary)',
              background: 'var(--zoom-bg)',
              padding: '1px 6px',
              borderRadius: 8,
              fontWeight: 500,
            }}>
              {topic.bullets.length} key point{topic.bullets.length !== 1 ? 's' : ''}
            </span>
          )}
          <span style={{ fontSize: 11, color: 'var(--zoom-text-secondary)' }}>
            {timeLabel}
          </span>
        </span>
      </div>
      {topic.bullets.length > 0 && (
        <ul style={{ margin: '6px 0 0', paddingLeft: 18, fontSize: 13, lineHeight: 1.5 }}>
          {topic.bullets.map((bullet, i) => (
            <li key={i} style={{ color: 'var(--zoom-text-secondary)' }}>{bullet}</li>
          ))}
        </ul>
      )}
      {(onBookmark || onAddToNotes) && (
        <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {onBookmark && (
            <button
              className={`btn ${isBookmarked ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: 11, padding: '3px 10px' }}
              onClick={onBookmark}
              disabled={isBookmarked}
            >
              {isBookmarked ? 'Bookmarked' : 'Bookmark'}
            </button>
          )}
          {onAddToNotes && (
            <button
              className="btn btn-secondary"
              style={{ fontSize: 11, padding: '3px 10px' }}
              onClick={onAddToNotes}
              title="Add this topic to your notes"
            >
              + Note
            </button>
          )}
        </div>
      )}
    </div>
  );
}
