import type { Topic } from '../../types/messages';
import { TopicCard } from './TopicCard';

interface TimelineProps {
  topics: Topic[];
  currentTopicId: string;
  bookmarkedTopics?: Set<string>;
  onBookmark?: (topicTitle: string) => void;
  onAddToNotes?: (topic: Topic) => void;
}

export function Timeline({ topics, currentTopicId, bookmarkedTopics, onBookmark, onAddToNotes }: TimelineProps) {
  // Show newest first
  const sorted = [...topics].sort((a, b) => b.startTime - a.startTime);

  if (sorted.length === 0) {
    return (
      <div>
        <div className="empty-state">
          <div className="empty-state-icon" style={{ fontSize: 28, opacity: 0.5 }}>&#128203;</div>
          <p className="empty-state-text">No topics yet</p>
          <p style={{ fontSize: 11, color: 'var(--zoom-text-secondary)', margin: '4px 0 0' }}>
            Topics will appear as your professor lectures.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="timeline-list timeline-connector">
        {sorted.map(topic => (
          <div key={topic.id} className="timeline-item">
            <div className={`timeline-dot ${topic.id === currentTopicId ? 'timeline-dot-current' : ''}`} />
            <TopicCard
            key={topic.id}
            topic={topic}
            isCurrent={topic.id === currentTopicId}
            isBookmarked={bookmarkedTopics?.has(topic.title)}
            onBookmark={onBookmark ? () => onBookmark(topic.title) : undefined}
            onAddToNotes={onAddToNotes ? () => onAddToNotes(topic) : undefined}
          />
          </div>
        ))}
      </div>
    </div>
  );
}
