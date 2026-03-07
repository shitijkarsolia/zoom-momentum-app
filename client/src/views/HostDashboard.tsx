import { useState } from 'react';
import { PollCreator } from '../components/pulse/PollCreator';
import { PollResults } from '../components/pulse/PollResults';
import { ArenaHost } from '../components/arena/ArenaHost';
import type { PollDraft, PulsePhase } from '../hooks/usePulse';
import type { ArenaHostPhase } from '../hooks/useArena';
import type { Poll, Question, LeaderboardEntry } from '../types/messages';

interface HostDashboardProps {
  userName: string;
  connected: boolean;
  // Pulse props
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
  // Arena props
  arenaPhase: ArenaHostPhase;
  arenaCurrentQuestion: Question | null;
  arenaCurrentIndex: number;
  arenaTotalQuestions: number;
  arenaResponseCount: number;
  arenaCountdown: number;
  arenaLeaderboard: LeaderboardEntry[];
  arenaError: string | null;
  onArenaFetchQuestions: (topic?: string) => void;
  onArenaStartGame: () => void;
  onArenaShowLeaderboard: () => void;
  onArenaNextQuestion: () => void;
  onArenaReset: () => void;
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
  arenaPhase,
  arenaCurrentQuestion,
  arenaCurrentIndex,
  arenaTotalQuestions,
  arenaResponseCount,
  arenaCountdown,
  arenaLeaderboard,
  arenaError,
  onArenaFetchQuestions,
  onArenaStartGame,
  onArenaShowLeaderboard,
  onArenaNextQuestion,
  onArenaReset,
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
          <ArenaHost
            phase={arenaPhase}
            currentQuestion={arenaCurrentQuestion}
            currentIndex={arenaCurrentIndex}
            totalQuestions={arenaTotalQuestions}
            responseCount={arenaResponseCount}
            countdown={arenaCountdown}
            leaderboard={arenaLeaderboard}
            error={arenaError}
            onFetchQuestions={onArenaFetchQuestions}
            onStartGame={onArenaStartGame}
            onShowLeaderboard={onArenaShowLeaderboard}
            onNextQuestion={onArenaNextQuestion}
            onReset={onArenaReset}
          />
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
