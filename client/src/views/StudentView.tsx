import { useState, useCallback } from 'react';
import { PollCard } from '../components/pulse/PollCard';
import { PollResults } from '../components/pulse/PollResults';
import { ArenaStudent } from '../components/arena/ArenaStudent';
import { Timeline } from '../components/anchor/Timeline';
import { GlossaryTab } from '../components/anchor/GlossaryTab';
import { FeatureInfo } from '../components/shared/FeatureInfo';
import type { Poll, Topic, GlossaryEntry } from '../types/messages';

const TAB_INFO = {
  timeline: 'Topics and key takeaways appear here as your professor lectures. Tap "I\'m Confused" to bookmark moments for review after class.',
  glossary: 'Technical terms and definitions extracted from the lecture. Use the search bar to find specific terms.',
} as const;
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
  // Anchor props
  anchorTopics: Topic[];
  anchorCurrentTopicId: string;
  anchorGlossary: GlossaryEntry[];
  onBookmark: (meetingId: string, userId: string) => Promise<boolean>;
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
  anchorTopics,
  anchorCurrentTopicId,
  anchorGlossary,
  onBookmark,
}: StudentViewProps) {
  const [activeTab, setActiveTab] = useState<StudentTab>('timeline');
  const [bookmarkToast, setBookmarkToast] = useState(false);

  const showArena = arenaPhase !== 'waiting' || arenaCurrentQuestion !== null;

  const handleBookmark = useCallback(async () => {
    const ok = await onBookmark('current-meeting', userName);
    if (ok) {
      setBookmarkToast(true);
      setTimeout(() => setBookmarkToast(false), 2200);
    }
  }, [onBookmark, userName]);

  return (
    <div className="app-container">
      <div className="status-bar">
        <span style={{ fontWeight: 600 }}>Momentum</span>
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
            Timeline
          </button>
          <button
            className={`tab ${activeTab === 'glossary' ? 'active' : ''}`}
            onClick={() => setActiveTab('glossary')}
          >
            Glossary
          </button>
        </div>
      </div>

      <div className="card" style={{ flex: 1 }}>
        <div className="tab-info-bar">
          <FeatureInfo title={activeTab === 'timeline' ? 'Timeline' : 'Glossary'} description={TAB_INFO[activeTab]} />
        </div>
        {activeTab === 'timeline' && (
          <div>
            <Timeline
              topics={anchorTopics}
              currentTopicId={anchorCurrentTopicId}
              onBookmark={handleBookmark ? () => handleBookmark() : undefined}
            />
            <button
              className="btn btn-secondary"
              style={{ marginTop: 12, width: '100%' }}
              onClick={handleBookmark}
            >
              I'm Confused
            </button>
          </div>
        )}
        {activeTab === 'glossary' && (
          <GlossaryTab glossary={anchorGlossary} />
        )}
      </div>

      {bookmarkToast && (
        <div className="bookmark-toast">Bookmarked</div>
      )}

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
