import { useState } from 'react';

interface HostDashboardProps {
  userName: string;
  connected: boolean;
}

type HostTab = 'pulse' | 'arena' | 'anchor';

export function HostDashboard({ userName, connected }: HostDashboardProps) {
  const [activeTab, setActiveTab] = useState<HostTab>('pulse');

  return (
    <div className="app-container">
      <div className="status-bar">
        <span style={{ fontWeight: 600 }}>⚡ Momentum — Host</span>
        <div className="status-indicator">
          <div className={`status-dot ${connected ? 'connected' : ''}`} />
          <span>{connected ? 'Connected' : 'Connecting…'}</span>
        </div>
      </div>

      <div className="card" style={{ padding: '8px 0 0' }}>
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'pulse' ? 'active' : ''}`}
            onClick={() => setActiveTab('pulse')}
          >
            📊 Pulse
          </button>
          <button
            className={`tab ${activeTab === 'arena' ? 'active' : ''}`}
            onClick={() => setActiveTab('arena')}
          >
            🎮 Arena
          </button>
          <button
            className={`tab ${activeTab === 'anchor' ? 'active' : ''}`}
            onClick={() => setActiveTab('anchor')}
          >
            📌 Anchor
          </button>
        </div>
      </div>

      <div className="card" style={{ flex: 1 }}>
        {activeTab === 'pulse' && (
          <div>
            <h2 className="card-title">Professor's Pulse</h2>
            <p style={{ color: 'var(--zoom-text-secondary)' }}>
              Generate AI-powered check-in polls to gauge student understanding.
            </p>
            <button className="btn btn-primary" style={{ marginTop: 12 }} disabled>
              Generate Poll (coming soon)
            </button>
          </div>
        )}
        {activeTab === 'arena' && (
          <div>
            <h2 className="card-title">Warm-Up Arena</h2>
            <p style={{ color: 'var(--zoom-text-secondary)' }}>
              Launch a trivia game to review last lecture's material.
            </p>
            <button className="btn btn-primary" style={{ marginTop: 12 }} disabled>
              Start Trivia (coming soon)
            </button>
          </div>
        )}
        {activeTab === 'anchor' && (
          <div>
            <h2 className="card-title">Live Anchor</h2>
            <p style={{ color: 'var(--zoom-text-secondary)' }}>
              Real-time topic timeline powered by live transcript analysis.
            </p>
          </div>
        )}
      </div>

      <div style={{ fontSize: 11, color: 'var(--zoom-text-secondary)', textAlign: 'center' }}>
        Hosting as {userName}
      </div>
    </div>
  );
}
