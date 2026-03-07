import { useState } from 'react';
import { PollCreator } from '../components/pulse/PollCreator';
import { PollResults } from '../components/pulse/PollResults';
import type { PollDraft } from '../hooks/usePulse';
import type { Poll } from '../types/messages';
import type { PulsePhase } from '../hooks/usePulse';

interface HostDashboardProps {
  userName: string;
  connected: boolean;
  pulsePhase: PulsePhase;
  pulseDraft: PollDraft | null;
  pulseResponseCount: number;
  pulseActivePoll: Poll | null;
  pulseError: string | null;
  onPulseGenerate: (context?: string) => void;
  onPulseUpdateDraft: (updates: Partial<PollDraft>) => void;
  onPulseLaunch: () => void;
  onPulseEndPoll: () => void;
  onPulseReset: () => void;
}

type HostTab = 'pulse' | 'arena' | 'anchor';

export function HostDashboard({
  userName,
  connected,
  pulsePhase,
  pulseDraft,
  pulseResponseCount,
  pulseActivePoll,
  pulseError,
  onPulseGenerate,
  onPulseUpdateDraft,
  onPulseLaunch,
  onPulseEndPoll,
  onPulseReset,
}: HostDashboardProps) {
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
          <>
            {pulsePhase === 'results' && pulseActivePoll ? (
              <PollResults
                poll={pulseActivePoll}
                onDismiss={onPulseReset}
              />
            ) : (
              <PollCreator
                phase={pulsePhase}
                draft={pulseDraft}
                responseCount={pulseResponseCount}
                error={pulseError}
                onGenerate={onPulseGenerate}
                onUpdateDraft={onPulseUpdateDraft}
                onLaunch={onPulseLaunch}
                onEndPoll={onPulseEndPoll}
                onReset={onPulseReset}
              />
            )}
          </>
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
