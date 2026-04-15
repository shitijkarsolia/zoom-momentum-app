import type { Topic } from '../../types/messages';
import { TopicCard } from './TopicCard';

interface TimelineProps {
  topics: Topic[];
  currentTopicId: string;
}

export function Timeline({ topics, currentTopicId }: TimelineProps) {
  // Show newest first
  const sorted = [...topics].sort((a, b) => b.startTime - a.startTime);

  if (sorted.length === 0) {
    return (
      <div>
        <div className="empty-state">
          <div className="empty-state-icon">&#9776;</div>
          <p className="empty-state-text">
            Topic summaries will appear here as the lecture progresses.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="timeline-list">
        {sorted.map(topic => (
          <TopicCard
            key={topic.id}
            topic={topic}
            isCurrent={topic.id === currentTopicId}
          />
        ))}
      </div>
    </div>
  );
}
