import { useState } from 'react';
import { PollCard } from '../components/pulse/PollCard';
import { PollResults } from '../components/pulse/PollResults';
import { ArenaStudent } from '../components/arena/ArenaStudent';
import type { Poll } from '../types/messages';
import type { LeaderboardEntry } from '../types/messages';
import type { ArenaStudentPhase } from '../hooks/useArena';

interface StudentViewProps {
  userName: string;
  connected: boolean;
  // Pulse props
  activePoll: Poll | null;
  selectedOption: number | null;
  hasAnswered: boolean;
  pollResults: Poll | null;
  onSelectOption: (index: number) => void;
  onSubmitAnswer: () => void;
  // Arena props
  arenaPhase: ArenaStudentPhase;
  arenaCurrentQuestion: {
    index: number;
    total: number;
    question: string;
    options: string[];
  } | null;
  arenaSelectedOption: number | null;
  arenaCountdown: number;
  arenaLeaderboard: LeaderboardEntry[];
  arenaCorrectIndex: number | null;
  arenaExplanation: string;
  arenaFinalLeaderboard: LeaderboardEntry[];
  onArenaSelectAndSubmit: (optionIndex: number) => void;
}

type StudentTab = 'timeline' | 'glossary';

export function StudentView({
  userName,
  connected,
  activePoll,
  selectedOption,
  hasAnswered,
  pollResults,
  onSelectOption,
  onSubmitAnswer,
  arenaPhase,
  arenaCurrentQuestion,
  arenaSelectedOption,
  arenaCountdown,
  arenaLeaderboard,
  arenaCorrectIndex,
  arenaExplanation,
  arenaFinalLeaderboard,
  onArenaSelectAndSubmit,
}: StudentViewProps) {
  const [activeTab, setActiveTab] = useState<StudentTab>('timeline');

  const showArena = arenaPhase !== 'waiting' || arenaCurrentQuestion !== null;

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

      {pollResults && (
        <div className="card">
          <PollResults poll={pollResults} />
        </div>
      )}

      {activePoll && (
        <PollCard
          poll={activePoll}
          selectedOption={selectedOption}
          hasAnswered={hasAnswered}
          onSelect={onSelectOption}
          onSubmit={onSubmitAnswer}
        />
      )}

      {showArena && (
        <ArenaStudent
          phase={arenaPhase}
          currentQuestion={arenaCurrentQuestion}
          selectedOption={arenaSelectedOption}
          countdown={arenaCountdown}
          leaderboard={arenaLeaderboard}
          correctIndex={arenaCorrectIndex}
          explanation={arenaExplanation}
          finalLeaderboard={arenaFinalLeaderboard}
          onSelectAndSubmit={onArenaSelectAndSubmit}
        />
      )}

      <div style={{ fontSize: 11, color: 'var(--zoom-text-secondary)', textAlign: 'center' }}>
        Joined as {userName}
      </div>
    </div>
  );
}
