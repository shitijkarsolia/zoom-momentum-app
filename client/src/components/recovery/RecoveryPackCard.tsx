interface RecoveryItem {
  topic: string;
  explanation: string;
  practice: string;
  resource: string;
}

interface RecoveryPackCardProps {
  items: RecoveryItem[];
  meetingTitle?: string;
  onDismiss?: () => void;
}

export function RecoveryPackCard({ items, meetingTitle, onDismiss }: RecoveryPackCardProps) {
  if (items.length === 0) {
    return (
      <div className="recovery-pack">
        <h2 className="recovery-title">Recovery Pack</h2>
        <p className="recovery-empty">
          No bookmarks were created during this session.
        </p>
      </div>
    );
  }

  return (
    <div className="recovery-pack">
      <div className="recovery-header">
        <h2 className="recovery-title">Recovery Pack</h2>
        {meetingTitle && (
          <span className="recovery-meeting">{meetingTitle}</span>
        )}
      </div>
      <p className="recovery-subtitle">
        Based on {items.length} moment{items.length !== 1 ? 's' : ''} you bookmarked
      </p>

      <div className="recovery-items">
        {items.map((item, i) => (
          <div key={i} className="recovery-item">
            <div className="recovery-item-header">
              <span className="recovery-item-number">{i + 1}</span>
              <h3 className="recovery-item-topic">{item.topic}</h3>
            </div>

            <div className="recovery-section">
              <span className="recovery-label">Explanation</span>
              <p className="recovery-text">{item.explanation}</p>
            </div>

            <div className="recovery-section">
              <span className="recovery-label">Practice</span>
              <p className="recovery-text">{item.practice}</p>
            </div>

            <div className="recovery-section">
              <span className="recovery-label">Resource</span>
              <p className="recovery-resource">{item.resource}</p>
            </div>
          </div>
        ))}
      </div>

      {onDismiss && (
        <button className="btn btn-secondary recovery-dismiss" onClick={onDismiss}>
          Done Reviewing
        </button>
      )}
    </div>
  );
}
