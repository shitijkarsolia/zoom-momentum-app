import { useState } from 'react';

interface StudentViewProps {
  userName: string;
  connected: boolean;
}

type StudentTab = 'timeline' | 'glossary';

export function StudentView({ userName, connected }: StudentViewProps) {
  const [activeTab, setActiveTab] = useState<StudentTab>('timeline');

  return (
    <div className="app-container">
      <div className="status-bar">
        <span style={{ fontWeight: 600 }}>⚡ Momentum</span>
        <div className="status-indicator">
          <div className={`status-dot ${connected ? 'connected' : ''}`} />
          <span>{connected ? 'Connected' : 'Connecting…'}</span>
        </div>
      </div>

      <div className="card" style={{ padding: '8px 0 0' }}>
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'timeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('timeline')}
          >
            📌 Timeline
          </button>
          <button
            className={`tab ${activeTab === 'glossary' ? 'active' : ''}`}
            onClick={() => setActiveTab('glossary')}
          >
            📖 Glossary
          </button>
        </div>
      </div>

      <div className="card" style={{ flex: 1 }}>
        {activeTab === 'timeline' && (
          <div>
            <h2 className="card-title">Live Anchor</h2>
            <p style={{ color: 'var(--zoom-text-secondary)' }}>
              Topic summaries will appear here as the lecture progresses.
            </p>
            <button className="btn btn-secondary" style={{ marginTop: 12 }}>
              📌 I'm Confused (Bookmark)
            </button>
          </div>
        )}
        {activeTab === 'glossary' && (
          <div>
            <h2 className="card-title">Glossary & Formulas</h2>
            <p style={{ color: 'var(--zoom-text-secondary)' }}>
              Key terms and formulas will accumulate here during the lecture.
            </p>
          </div>
        )}
      </div>

      <div style={{ fontSize: 11, color: 'var(--zoom-text-secondary)', textAlign: 'center' }}>
        Joined as {userName}
      </div>
    </div>
  );
}
