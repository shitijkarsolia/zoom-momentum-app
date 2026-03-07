import type { Topic } from '../../types/messages';

interface TopicCardProps {
  topic: Topic;
  isCurrent: boolean;
  onBookmark?: () => void;
}

export function TopicCard({ topic, isCurrent, onBookmark }: TopicCardProps) {
  const elapsed = Math.round((Date.now() - topic.startTime) / 60_000);
  const timeLabel = elapsed < 1 ? 'Just now' : `${elapsed}m ago`;

  return (
    <div className={`topic-card ${isCurrent ? 'topic-card-current' : ''}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
          {isCurrent && <span style={{ marginRight: 4 }}>🔴</span>}
          {topic.title}
        </h3>
        <span style={{ fontSize: 11, color: 'var(--zoom-text-secondary)', flexShrink: 0 }}>
          {timeLabel}
        </span>
      </div>
      {topic.bullets.length > 0 && (
        <ul style={{ margin: '6px 0 0', paddingLeft: 18, fontSize: 13, lineHeight: 1.5 }}>
          {topic.bullets.map((bullet, i) => (
            <li key={i} style={{ color: 'var(--zoom-text-secondary)' }}>{bullet}</li>
          ))}
        </ul>
      )}
      {onBookmark && (
        <button
          className="btn btn-secondary"
          style={{ marginTop: 8, fontSize: 12, padding: '4px 10px' }}
          onClick={onBookmark}
        >
          📌 Bookmark
        </button>
      )}
    </div>
  );
}
