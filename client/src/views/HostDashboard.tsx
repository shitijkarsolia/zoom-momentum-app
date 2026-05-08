import { useState, useRef } from 'react';
import { PollCreator } from '../components/pulse/PollCreator';
import { PollResults } from '../components/pulse/PollResults';
import { ArenaHost } from '../components/arena/ArenaHost';
import { Timeline } from '../components/anchor/Timeline';
import { TranscriptTab } from '../components/anchor/TranscriptTab';
import { FeatureInfo } from '../components/shared/FeatureInfo';
import type { PollDraft, PulsePhase } from '../hooks/usePulse';
import type { ArenaHostPhase } from '../hooks/useArena';
import type { Poll, Question, LeaderboardEntry, Topic, GlossaryEntry } from '../types/messages';

const TAB_INFO = {
  pulse: 'Generate AI check-in polls to gauge student understanding. You can edit the question before launching it to everyone.',
  arena: 'Run a timed trivia quiz. AI generates questions from your topic, and students compete on a live leaderboard with scoring.',
  anchor: 'AI analyzes your lecture transcript in real time, building a topic timeline visible to all students.',
  transcript: 'Live transcript of the lecture with speaker attribution and timestamps.',
} as const;

interface HostDashboardProps {
  userName: string;
  connected: boolean;
  participantCount: number;
  // Pulse props
  pulsePhase: PulsePhase;
  pulseDraft: PollDraft | null;
  pulseResponseCount: number;
  pulseActivePoll: Poll | null;
  pulseResponses: Map<string, number>;
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
  arenaQuestionAccuracy: { correct: number; total: number }[];
  arenaError: string | null;
  arenaQuestions: Question[];
  arenaMeetingId?: string;
  onArenaFetchQuestions: (topic?: string, transcript?: string) => void;
  onArenaAppendQuestions: (topic?: string, transcript?: string) => void;
  onArenaUpdateQuestion: (index: number, updates: Partial<Question>) => void;
  onArenaStartGame: () => void;
  onArenaShowLeaderboard: () => void;
  onArenaNextQuestion: () => void;
  onArenaEndGame: () => void;
  onArenaReset: () => void;
  // Anchor props
  anchorTopics: Topic[];
  anchorCurrentTopicId: string;
  anchorGlossary: GlossaryEntry[];
  anchorIsPolling: boolean;
  anchorError: string | null;
  meetingId: string;
  isInZoom: boolean;
  useMockTranscript: boolean;
  onToggleTranscriptSource: () => void;
  onAnchorStartPolling: () => void;
  onAnchorStopPolling: () => void;
  onEndClass?: () => void;
  onResetMeeting?: () => void;
}

type HostTab = 'pulse' | 'arena' | 'anchor' | 'transcript';

export function HostDashboard({
  userName,
  connected,
  participantCount,
  pulsePhase,
  pulseDraft,
  pulseResponseCount,
  pulseActivePoll,
  pulseResponses,
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
  arenaQuestionAccuracy,
  arenaError,
  arenaQuestions,
  arenaMeetingId,
  onArenaFetchQuestions,
  onArenaAppendQuestions,
  onArenaUpdateQuestion,
  onArenaStartGame,
  onArenaShowLeaderboard,
  onArenaNextQuestion,
  onArenaEndGame,
  onArenaReset,
  anchorTopics,
  anchorCurrentTopicId,
  anchorGlossary,
  anchorIsPolling,
  anchorError,
  meetingId,
  isInZoom,
  useMockTranscript,
  onToggleTranscriptSource,
  onAnchorStartPolling,
  onAnchorStopPolling,
  onEndClass,
  onResetMeeting,
}: HostDashboardProps) {
  const [activeTab, setActiveTab] = useState<HostTab>('pulse');
  const [showSettings, setShowSettings] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [hostToast, setHostToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setHostToast(msg);
    toastTimerRef.current = setTimeout(() => setHostToast(null), 2500);
  };

  return (
    <div className="app-container">
      <div className="status-bar">
        <span style={{ fontWeight: 600 }}>Momentum — Host</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {anchorIsPolling && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#16a34a', fontWeight: 500 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
              Live
            </span>
          )}
          <span style={{ fontSize: 11, color: 'var(--zoom-text-secondary)' }}>Students: {participantCount || '--'}</span>
          <div className="status-indicator">
            <div className={`status-dot ${connected ? 'connected' : ''}`} />
            <span>{connected ? 'Connected' : 'Connecting…'}</span>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '8px 0 0' }}>
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'pulse' ? 'active' : ''}`}
            onClick={() => setActiveTab('pulse')}
          >
            Pulse
            {pulsePhase === 'live' && (
              <span style={{
                display: 'inline-block',
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: 'var(--zoom-error, #e53935)',
                marginLeft: 6,
                verticalAlign: 'middle',
              }} />
            )}
          </button>
          <button
            className={`tab ${activeTab === 'arena' ? 'active' : ''}`}
            onClick={() => setActiveTab('arena')}
          >
            Arena
            {(arenaPhase === 'question' || arenaPhase === 'leaderboard') && (
              <span style={{
                display: 'inline-block',
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: 'var(--zoom-error, #e53935)',
                marginLeft: 6,
                verticalAlign: 'middle',
              }} />
            )}
          </button>
          <button
            className={`tab ${activeTab === 'anchor' ? 'active' : ''}`}
            onClick={() => setActiveTab('anchor')}
          >
            Anchor
            {anchorIsPolling && (
              <span style={{
                display: 'inline-block',
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: 'var(--zoom-success, #43a047)',
                marginLeft: 6,
                verticalAlign: 'middle',
              }} />
            )}
          </button>
          <button
            className={`tab ${activeTab === 'transcript' ? 'active' : ''}`}
            onClick={() => setActiveTab('transcript')}
          >
            Transcript
          </button>
        </div>
      </div>

      <div className="card" style={{ flex: 1 }}>
        <div className="tab-info-bar">
          <FeatureInfo title={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} description={TAB_INFO[activeTab]} />
        </div>
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
                activePoll={pulseActivePoll}
                responses={pulseResponses}
                onGenerate={onPulseGenerate}
                onUpdateDraft={onPulseUpdateDraft}
                onLaunch={() => { onPulseLaunch(); showToast('Poll sent to students'); }}
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
            questionAccuracy={arenaQuestionAccuracy}
            error={arenaError}
            questions={arenaQuestions}
            meetingId={arenaMeetingId}
            onFetchQuestions={onArenaFetchQuestions}
            onAppendQuestions={onArenaAppendQuestions}
            onUpdateQuestion={onArenaUpdateQuestion}
            onStartGame={() => { onArenaStartGame(); showToast('Quiz started'); }}
            onShowLeaderboard={onArenaShowLeaderboard}
            onNextQuestion={onArenaNextQuestion}
            onEndGame={onArenaEndGame}
            onReset={onArenaReset}
          />
        )}
        {activeTab === 'anchor' && (
          <div className="anchor-controls">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="card-title" style={{ margin: 0 }}>Live Anchor</h2>
              <div className="anchor-status">
                <div className={`status-dot ${anchorIsPolling ? 'active' : ''}`} />
                <span>{anchorIsPolling ? 'AI Active' : 'Paused'}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {anchorIsPolling ? (
                <button className="btn btn-secondary" onClick={onAnchorStopPolling}>Pause AI</button>
              ) : (
                <button className="btn btn-primary" onClick={onAnchorStartPolling}>Start AI</button>
              )}
              {!isInZoom && (
                <button
                  className={`btn btn-secondary`}
                  onClick={onToggleTranscriptSource}
                  disabled={anchorIsPolling}
                  style={{ fontSize: 11, padding: '4px 10px' }}
                >
                  {useMockTranscript ? 'Mock' : 'Live'}
                </button>
              )}
            </div>
            {anchorError && (
              <p style={{ color: 'var(--zoom-error)', fontSize: 12 }}>{anchorError}</p>
            )}
            <Timeline topics={anchorTopics} currentTopicId={anchorCurrentTopicId} />
          </div>
        )}
        {activeTab === 'transcript' && meetingId && (
          <TranscriptTab
            meetingId={meetingId}
            glossary={anchorGlossary}
            topics={anchorTopics}
            currentTopicId={anchorCurrentTopicId}
          />
        )}
      </div>

      {onEndClass && (
        <button
          className="btn btn-secondary"
          style={{ margin: '8px 12px', width: 'calc(100% - 24px)', fontSize: 12 }}
          onClick={onEndClass}
        >
          End Class
        </button>
      )}

      <div style={{ fontSize: 11, color: 'var(--zoom-text-secondary)', textAlign: 'center', position: 'relative' }}>
        Hosting as {userName}
        {onResetMeeting && (
          <button
            onClick={() => setShowSettings(prev => !prev)}
            style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 16,
              color: 'var(--zoom-text-secondary)',
              padding: 4,
              lineHeight: 1,
            }}
            title="Settings"
          >
            &#9881;
          </button>
        )}
        {showSettings && onResetMeeting && (
          <div style={{
            position: 'absolute',
            right: 12,
            bottom: '100%',
            marginBottom: 4,
            background: 'var(--zoom-surface, #fff)',
            border: '1px solid var(--zoom-border)',
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            padding: 4,
            zIndex: 10,
          }}>
            <button
              onClick={() => { setShowSettings(false); setShowResetConfirm(true); }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 12,
                color: 'var(--zoom-error, #e53935)',
                padding: '6px 12px',
                whiteSpace: 'nowrap',
              }}
            >
              Reset Meeting
            </button>
          </div>
        )}
      </div>

      {showResetConfirm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
        }}>
          <div style={{
            background: 'var(--zoom-surface, #fff)',
            borderRadius: 12,
            padding: 20,
            maxWidth: 280,
            textAlign: 'center',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          }}>
            <p style={{ fontSize: 14, fontWeight: 600, margin: '0 0 8px' }}>Reset Meeting?</p>
            <p style={{ fontSize: 12, color: 'var(--zoom-text-secondary)', margin: '0 0 16px' }}>
              This will clear all transcript data, topics, glossary, and bookmarks for everyone. This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button
                className="btn btn-secondary"
                style={{ fontSize: 12, padding: '6px 16px' }}
                onClick={() => setShowResetConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                style={{ fontSize: 12, padding: '6px 16px', background: 'var(--zoom-error, #e53935)' }}
                onClick={() => { setShowResetConfirm(false); onResetMeeting?.(); }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
      {hostToast && (
        <div className="bookmark-toast">{hostToast}</div>
      )}
    </div>
  );
}
