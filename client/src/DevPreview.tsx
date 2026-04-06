/**
 * Development-only preview page for testing UI components
 * outside of a Zoom meeting. Not included in production builds.
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { PollCreator } from './components/pulse/PollCreator';
import { PollCard } from './components/pulse/PollCard';
import { PollResults } from './components/pulse/PollResults';
import { ArenaHost } from './components/arena/ArenaHost';
import { ArenaStudent } from './components/arena/ArenaStudent';
import { Timeline } from './components/anchor/Timeline';
import { GlossaryTab } from './components/anchor/GlossaryTab';
import { PostClassSummary } from './components/recovery/PostClassSummary';
import { FeatureInfo } from './components/shared/FeatureInfo';
import { WelcomeView } from './views/WelcomeView';
import type { Poll, Question, LeaderboardEntry, Topic, GlossaryEntry } from './types/messages';
import type { PollDraft, PulsePhase } from './hooks/usePulse';

const HOST_TAB_INFO: Record<string, string> = {
  pulse: 'Generate AI check-in polls to gauge student understanding. You can edit the question before launching it to everyone.',
  arena: 'Run a timed trivia quiz. AI generates questions from your topic, and students compete on a live leaderboard with scoring.',
  anchor: 'AI analyzes your lecture transcript in real time, building a topic timeline and glossary visible to all students.',
};
const STUDENT_TAB_INFO: Record<string, string> = {
  timeline: 'Topics and key takeaways appear here as your professor lectures. Tap "Mark for Review" to bookmark moments for review after class.',
  glossary: 'Technical terms and definitions extracted from the lecture. Use the search bar to find specific terms.',
  transcript: 'Live transcript of the lecture, updated every 10 seconds. Key terms are highlighted.',
};
import { BookmarkList } from './components/anchor/BookmarkList';
import { TranscriptTab } from './components/anchor/TranscriptTab';
import type { ArenaHostPhase, ArenaStudentPhase } from './hooks/useArena';

interface RecoveryItem {
  topic: string;
  explanation: string;
  practice: string;
  resource: string;
}

type PreviewMode = 'host' | 'student';
type FeatureTab = 'pulse' | 'arena' | 'anchor';

const QUESTION_TIME = 15;

export function DevPreview() {
  const [mode, setMode] = useState<PreviewMode>('host');
  const [activeFeature, setActiveFeature] = useState<FeatureTab>('pulse');
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);

  // --- Pulse State ---
  const [hostPhase, setHostPhase] = useState<PulsePhase>('idle');
  const [draft, setDraft] = useState<PollDraft | null>(null);
  const [activePoll, setActivePoll] = useState<Poll | null>(null);
  const [responseCount, setResponseCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [resultsPoll, setResultsPoll] = useState<Poll | null>(null);
  const [studentPoll, setStudentPoll] = useState<Poll | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [studentResults, setStudentResults] = useState<Poll | null>(null);

  // --- Arena Host State ---
  const [arenaHostPhase, setArenaHostPhase] = useState<ArenaHostPhase>('idle');
  const [arenaQuestions, setArenaQuestions] = useState<Question[]>([]);
  const [arenaCurrentIndex, setArenaCurrentIndex] = useState(0);
  const [arenaHostCountdown, setArenaHostCountdown] = useState(0);
  const [arenaHostResponses, setArenaHostResponses] = useState(0);
  const [arenaLeaderboard, setArenaLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [arenaError, setArenaError] = useState<string | null>(null);

  // --- Arena Student State ---
  const [arenaStudentPhase, setArenaStudentPhase] = useState<ArenaStudentPhase>('waiting');
  const [arenaStudentQ, setArenaStudentQ] = useState<{
    index: number; total: number; question: string; options: string[];
  } | null>(null);
  const [arenaStudentSelected, setArenaStudentSelected] = useState<number | null>(null);
  const [arenaStudentCountdown, setArenaStudentCountdown] = useState(0);
  const [arenaStudentLeaderboard, setArenaStudentLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [arenaCorrectIndex, setArenaCorrectIndex] = useState<number | null>(null);
  const [arenaExplanation, setArenaExplanation] = useState('');
  const [arenaFinalLeaderboard, setArenaFinalLeaderboard] = useState<LeaderboardEntry[]>([]);

  // --- Anchor State ---
  const [anchorTopics, setAnchorTopics] = useState<Topic[]>([]);
  const [anchorCurrentTopicId, setAnchorCurrentTopicId] = useState('');
  const [anchorGlossary, setAnchorGlossary] = useState<GlossaryEntry[]>([]);
  const [anchorIsPolling, setAnchorIsPolling] = useState(false);
  const [anchorStudentTab, setAnchorStudentTab] = useState<'timeline' | 'glossary' | 'transcript'>('timeline');
  const [bookmarkToast, setBookmarkToast] = useState(false);

  // --- Recovery State ---
  const [showPostClass, setShowPostClass] = useState(false);
  const [recoveryItems, setRecoveryItems] = useState<RecoveryItem[]>([]);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [studentBookmarks, setStudentBookmarks] = useState<{ topic: string; timestamp: number }[]>([]);

  // --- Events Simulation State ---
  const [simLateJoinInfo, setSimLateJoinInfo] = useState<{ topicCount: number; latestTopic: string } | null>(null);
  const [simMeetingEnded, setSimMeetingEnded] = useState(false);
  const [simAutoBookmarkToast, setSimAutoBookmarkToast] = useState(false);
  const [simActiveSpeaker, setSimActiveSpeaker] = useState<string | null>(null);

  const hostTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const studentTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const anchorTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = useCallback(() => {
    if (hostTimerRef.current) { clearInterval(hostTimerRef.current); hostTimerRef.current = null; }
    if (studentTimerRef.current) { clearInterval(studentTimerRef.current); studentTimerRef.current = null; }
    if (anchorTimerRef.current) { clearInterval(anchorTimerRef.current); anchorTimerRef.current = null; }
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  // --- Anchor Handlers ---
  const handleAnchorStartPolling = useCallback(() => {
    setAnchorIsPolling(true);

    const pollTranscript = async () => {
      try {
        const bufRes = await fetch('/api/transcript/buffer?meetingId=mock-meeting-001');
        if (!bufRes.ok) return;
        const { buffer } = await bufRes.json();
        if (!buffer || buffer.trim().length < 20) return;

        const previousTopic = anchorCurrentTopicId
          ? anchorTopics.find(t => t.id === anchorCurrentTopicId)?.title ?? ''
          : '';

        const segRes = await fetch('/api/ai/topic-segment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcript: buffer, previousTopic }),
        });
        if (!segRes.ok) return;
        const result = await segRes.json();

        if (result.topic?.title) {
          const now = Date.now();
          const topicId = result.topicChanged ? `topic-${now}` : (anchorCurrentTopicId || `topic-${now}`);
          const newTopic: Topic = {
            id: topicId,
            title: result.topic.title,
            bullets: result.topic.bullets ?? [],
            startTime: now,
          };
          setAnchorTopics(prev => {
            const existing = prev.findIndex(t => t.id === topicId);
            const updated = [...prev];
            if (existing >= 0) updated[existing] = newTopic;
            else updated.push(newTopic);
            return updated;
          });
          setAnchorCurrentTopicId(topicId);
        }

        if (Array.isArray(result.glossaryTerms) && result.glossaryTerms.length > 0) {
          const newTerms: GlossaryEntry[] = result.glossaryTerms.map((t: { term: string; definition: string; formula?: string }) => ({
            term: t.term,
            definition: t.definition,
            formula: t.formula || undefined,
            timestamp: Date.now(),
          }));
          setAnchorGlossary(prev => {
            const existing = new Set(prev.map(g => g.term.toLowerCase()));
            const unique = newTerms.filter(t => !existing.has(t.term.toLowerCase()));
            return unique.length > 0 ? [...prev, ...unique] : prev;
          });
        }
      } catch (err) {
        console.error('[DevPreview] anchor poll error:', err);
      }
    };

    pollTranscript();
    anchorTimerRef.current = setInterval(pollTranscript, 15000);
  }, [anchorCurrentTopicId, anchorTopics]);

  const handleAnchorStopPolling = useCallback(() => {
    setAnchorIsPolling(false);
    if (anchorTimerRef.current) { clearInterval(anchorTimerRef.current); anchorTimerRef.current = null; }
  }, []);

  const handleAnchorReset = useCallback(() => {
    handleAnchorStopPolling();
    setAnchorTopics([]); setAnchorCurrentTopicId(''); setAnchorGlossary([]);
  }, [handleAnchorStopPolling]);

  const handleBookmark = useCallback(() => {
    const currentTopic = anchorTopics.find(t => t.id === anchorCurrentTopicId);
    setStudentBookmarks(prev => [...prev, {
      topic: currentTopic?.title ?? 'Current topic',
      timestamp: Date.now(),
    }]);
    setBookmarkToast(true);
    setTimeout(() => setBookmarkToast(false), 2200);
  }, [anchorTopics, anchorCurrentTopicId]);

  const handleEndClass = useCallback(async () => {
    setRecoveryLoading(true);
    setShowPostClass(true);

    const bookmarksForAI = studentBookmarks.length > 0
      ? studentBookmarks
      : anchorTopics.slice(0, 2).map(t => ({ topic: t.title, timestamp: t.startTime }));

    try {
      const res = await fetch('/api/ai/recovery-pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookmarks: bookmarksForAI,
          topics: anchorTopics.map(t => ({ title: t.title, bullets: t.bullets })),
        }),
      });
      const data = await res.json();
      setRecoveryItems(data.items ?? []);
    } catch {
      setRecoveryItems([]);
    } finally {
      setRecoveryLoading(false);
    }
  }, [studentBookmarks, anchorTopics]);

  // --- Pulse Handlers ---
  const handleGenerate = useCallback(async (context?: string) => {
    setHostPhase('generating');
    setError(null);
    try {
      const res = await fetch('/api/ai/poll-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context }),
      });
      const data = await res.json();
      setDraft({ question: data.question, options: data.options, isFallback: !!data.fallback });
      setHostPhase('preview');
    } catch {
      setError('Failed to generate poll');
      setHostPhase('idle');
    }
  }, []);

  const handleLaunchPoll = useCallback(() => {
    if (!draft) return;
    const poll: Poll = { pollId: `poll-${Date.now()}`, question: draft.question, options: draft.options };
    setActivePoll(poll);
    setHostPhase('live');
    setDraft(null);
    setResponseCount(0);
    setStudentPoll(poll);
    setSelectedOption(null);
    setHasAnswered(false);
    setStudentResults(null);
  }, [draft]);

  const handleStudentSubmit = useCallback(() => {
    if (selectedOption === null) return;
    setHasAnswered(true);
    setResponseCount(prev => prev + 1);
  }, [selectedOption]);

  const handleEndPoll = useCallback(() => {
    if (!activePoll) return;
    const results: Record<number, number> = {};
    activePoll.options.forEach((_, i) => { results[i] = Math.floor(Math.random() * 15) + 1; });
    if (selectedOption !== null) results[selectedOption] = (results[selectedOption] ?? 0) + 1;
    const total = Object.values(results).reduce((a, b) => a + b, 0);
    const pollWithResults: Poll = { ...activePoll, results, totalResponses: total };
    setResultsPoll(pollWithResults);
    setHostPhase('results');
    setStudentPoll(null);
    setStudentResults(pollWithResults);
  }, [activePoll, selectedOption]);

  const handlePulseReset = useCallback(() => {
    setHostPhase('idle'); setDraft(null); setActivePoll(null); setResultsPoll(null);
    setResponseCount(0); setStudentPoll(null); setStudentResults(null);
    setSelectedOption(null); setHasAnswered(false);
  }, []);

  // --- Arena Handlers ---
  const handleFetchQuestions = useCallback(async (topic?: string, transcript?: string) => {
    setArenaHostPhase('loading');
    setArenaError(null);
    try {
      // If no transcript provided, fetch from mock meeting
      let transcriptText = transcript;
      if (!transcriptText) {
        try {
          const bufRes = await fetch('/api/transcript/buffer?meetingId=mock-meeting-001');
          if (bufRes.ok) {
            const bufData = await bufRes.json();
            transcriptText = bufData.buffer || '';
          }
        } catch { /* silent */ }
      }
      const res = await fetch('/api/ai/quiz-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, transcript: transcriptText, questionCount: 5 }),
      });
      const data = await res.json();
      setArenaQuestions(data.questions);
      setArenaHostPhase('ready');
    } catch {
      setArenaError('Failed to load quiz');
      setArenaHostPhase('idle');
    }
  }, []);

  const startCountdowns = useCallback((seconds: number) => {
    clearTimers();
    setArenaHostCountdown(seconds);
    setArenaStudentCountdown(seconds);
    hostTimerRef.current = setInterval(() => {
      setArenaHostCountdown(prev => {
        if (prev <= 1) { if (hostTimerRef.current) clearInterval(hostTimerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
    studentTimerRef.current = setInterval(() => {
      setArenaStudentCountdown(prev => {
        if (prev <= 1) { if (studentTimerRef.current) clearInterval(studentTimerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  }, [clearTimers]);

  const handleStartGame = useCallback(() => {
    setArenaStudentPhase('waiting');
    setArenaCurrentIndex(0);
    setArenaHostResponses(0);
    setArenaLeaderboard([]);
    setArenaFinalLeaderboard([]);

    setTimeout(() => {
      const q = arenaQuestions[0];
      if (!q) return;
      setArenaHostPhase('question');
      setArenaStudentPhase('question');
      setArenaStudentQ({ index: 0, total: arenaQuestions.length, question: q.question, options: q.options });
      setArenaStudentSelected(null);
      setArenaCorrectIndex(null);
      setArenaExplanation('');
      startCountdowns(QUESTION_TIME);
    }, 300);
  }, [arenaQuestions, startCountdowns]);

  const handleArenaStudentAnswer = useCallback((optionIndex: number) => {
    setArenaStudentSelected(optionIndex);
    setArenaStudentPhase('answered');
    setArenaHostResponses(prev => prev + 1);
  }, []);

  const handleShowLeaderboard = useCallback(() => {
    clearTimers();
    const q = arenaQuestions[arenaCurrentIndex];
    const fakeEntries: LeaderboardEntry[] = [
      { participantId: 'student-1', name: 'Alice', score: 2400, rank: 1 },
      { participantId: 'student-2', name: 'Bob', score: 1800, rank: 2 },
      { participantId: 'dev-user', name: 'You', score: arenaStudentSelected === q?.correctIndex ? 1500 : 600, rank: 3 },
      { participantId: 'student-3', name: 'Charlie', score: 900, rank: 4 },
      { participantId: 'student-4', name: 'Dana', score: 500, rank: 5 },
    ].sort((a, b) => b.score - a.score).map((e, i) => ({ ...e, rank: i + 1 }));

    setArenaLeaderboard(fakeEntries);
    setArenaHostPhase('leaderboard');
    setArenaStudentPhase('leaderboard');
    setArenaStudentLeaderboard(fakeEntries);
    setArenaCorrectIndex(q?.correctIndex ?? 0);
    setArenaExplanation(q?.explanation ?? '');
  }, [arenaQuestions, arenaCurrentIndex, arenaStudentSelected, clearTimers]);

  const handleNextQuestion = useCallback(() => {
    const nextIdx = arenaCurrentIndex + 1;
    if (nextIdx >= arenaQuestions.length) {
      setArenaHostPhase('finished');
      setArenaStudentPhase('finished');
      setArenaFinalLeaderboard(arenaLeaderboard);
      return;
    }
    setArenaCurrentIndex(nextIdx);
    setArenaHostResponses(0);
    const q = arenaQuestions[nextIdx];
    if (!q) return;
    setArenaHostPhase('question');
    setArenaStudentPhase('question');
    setArenaStudentQ({ index: nextIdx, total: arenaQuestions.length, question: q.question, options: q.options });
    setArenaStudentSelected(null);
    setArenaCorrectIndex(null);
    setArenaExplanation('');
    startCountdowns(QUESTION_TIME);
  }, [arenaCurrentIndex, arenaQuestions, arenaLeaderboard, startCountdowns]);

  const handleArenaReset = useCallback(() => {
    clearTimers();
    setArenaHostPhase('idle'); setArenaQuestions([]); setArenaCurrentIndex(0);
    setArenaHostCountdown(0); setArenaHostResponses(0); setArenaLeaderboard([]);
    setArenaStudentPhase('waiting'); setArenaStudentQ(null); setArenaStudentSelected(null);
    setArenaStudentCountdown(0); setArenaStudentLeaderboard([]); setArenaCorrectIndex(null);
    setArenaExplanation(''); setArenaFinalLeaderboard([]);
  }, [clearTimers]);

  const showStudentArena = arenaStudentPhase !== 'waiting' || arenaStudentQ !== null;

  if (!hasSeenWelcome) {
    return (
      <WelcomeView
        userName="Dev User"
        isHost={mode === 'host'}
        onContinue={() => setHasSeenWelcome(true)}
      />
    );
  }

  return (
    <div style={{ display: 'flex', gap: 16, padding: 16, minHeight: '100vh', background: 'var(--zoom-bg)' }}>
      <div style={{ position: 'fixed', top: 8, right: 8, zIndex: 200, display: 'flex', gap: 8, flexWrap: 'wrap', maxWidth: 600, justifyContent: 'flex-end' }}>
        <button className={`btn ${mode === 'host' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMode('host')} style={{ fontSize: 12 }}>Host View</button>
        <button className={`btn ${mode === 'student' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMode('student')} style={{ fontSize: 12 }}>Student View</button>
        <span style={{ fontSize: 10, color: 'var(--zoom-text-secondary)', alignSelf: 'center', maxWidth: 140 }}>
          Toggle views here. In Zoom, host and students run on separate devices.
        </span>
        {!showPostClass && !simMeetingEnded && (
          <button className="btn btn-secondary" onClick={handleEndClass}
            style={{ fontSize: 12, background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5' }}>
            End Class
          </button>
        )}
        {!showPostClass && !simMeetingEnded && (
          <>
            <button className="btn btn-secondary" onClick={() => {
              setSimLateJoinInfo({ topicCount: 3, latestTopic: 'Advanced Applications' });
            }} style={{ fontSize: 11, background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d' }}>
              Sim Late Join
            </button>
            <button className="btn btn-secondary" onClick={async () => {
              setSimMeetingEnded(true);
              setRecoveryLoading(true);
              const bookmarksForAI = studentBookmarks.length > 0
                ? studentBookmarks
                : anchorTopics.slice(0, 2).map(t => ({ topic: t.title, timestamp: t.startTime }));
              try {
                const res = await fetch('/api/ai/recovery-pack', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    bookmarks: bookmarksForAI,
                    topics: anchorTopics.map(t => ({ title: t.title, bullets: t.bullets })),
                  }),
                });
                const data = await res.json();
                setRecoveryItems(data.items ?? []);
              } catch { setRecoveryItems([]); }
              finally { setRecoveryLoading(false); }
            }} style={{ fontSize: 11, background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5' }}>
              Sim Meeting End
            </button>
            <button className="btn btn-secondary" onClick={() => {
              setSimAutoBookmarkToast(true);
              setTimeout(() => setSimAutoBookmarkToast(false), 3000);
            }} style={{ fontSize: 11, background: '#dbeafe', color: '#1d4ed8', border: '1px solid #93c5fd' }}>
              Sim Auto-Bookmark
            </button>
            <button className="btn btn-secondary" onClick={() => {
              setSimActiveSpeaker(simActiveSpeaker ? null : 'Prof. Smith');
            }} style={{ fontSize: 11, background: '#e0e7ff', color: '#3730a3', border: '1px solid #a5b4fc' }}>
              {simActiveSpeaker ? 'Clear Speaker' : 'Sim Speaker'}
            </button>
          </>
        )}
        {(simMeetingEnded || showPostClass) && (
          <button className="btn btn-secondary" onClick={() => {
            setSimMeetingEnded(false);
            setShowPostClass(false);
            setRecoveryItems([]);
          }} style={{ fontSize: 12, background: '#d1fae5', color: '#065f46', border: '1px solid #6ee7b7' }}>
            Reset to Live
          </button>
        )}
      </div>

      <div style={{ flex: 1, maxWidth: 420, margin: '0 auto' }}>
        {showPostClass ? (
          <div className="app-container" style={{ minHeight: 'auto' }}>
            <div className="card" style={{ flex: 1 }}>
              <PostClassSummary
                meetingTitle="Lecture Session"
                topics={anchorTopics}
                glossary={anchorGlossary}
                recoveryItems={recoveryItems}
                isLoading={recoveryLoading}
                onDismiss={() => { setShowPostClass(false); setRecoveryItems([]); }}
              />
            </div>
          </div>
        ) : simMeetingEnded && mode === 'student' ? (
          <div className="app-container" style={{ minHeight: 'auto' }}>
            <div className="card" style={{ flex: 1 }}>
              <PostClassSummary
                meetingTitle="Lecture Session"
                topics={anchorTopics}
                glossary={anchorGlossary}
                recoveryItems={recoveryItems}
                isLoading={recoveryLoading}
                onDismiss={() => { setSimMeetingEnded(false); setRecoveryItems([]); }}
              />
            </div>
          </div>
        ) : mode === 'host' ? (
          <div className="app-container" style={{ minHeight: 'auto' }}>
            <div className="status-bar">
              <span style={{ fontWeight: 600 }}>Momentum — Host</span>
              <div className="status-indicator">
                <div className="status-dot connected" />
                <span>Dev Preview</span>
              </div>
            </div>
            <div className="card" style={{ padding: '8px 0 0' }}>
              <div className="tabs">
                <button className={`tab ${activeFeature === 'pulse' ? 'active' : ''}`}
                  onClick={() => setActiveFeature('pulse')}>Pulse</button>
                <button className={`tab ${activeFeature === 'arena' ? 'active' : ''}`}
                  onClick={() => setActiveFeature('arena')}>Arena</button>
                <button className={`tab ${activeFeature === 'anchor' ? 'active' : ''}`}
                  onClick={() => setActiveFeature('anchor')}>Anchor</button>
              </div>
            </div>
            <div className="card" style={{ flex: 1 }}>
              <div className="tab-info-bar">
                <FeatureInfo title={activeFeature.charAt(0).toUpperCase() + activeFeature.slice(1)} description={HOST_TAB_INFO[activeFeature] ?? ''} />
              </div>
              {activeFeature === 'pulse' && (
                <>
                  {hostPhase === 'results' && resultsPoll ? (
                    <PollResults poll={resultsPoll} onDismiss={handlePulseReset} />
                  ) : (
                    <PollCreator phase={hostPhase} draft={draft} responseCount={responseCount}
                      error={error} onGenerate={handleGenerate}
                      onUpdateDraft={(updates) => setDraft(prev => prev ? { ...prev, ...updates } : prev)}
                      onLaunch={handleLaunchPoll} onEndPoll={handleEndPoll} onReset={handlePulseReset} />
                  )}
                </>
              )}
              {activeFeature === 'arena' && (
                <ArenaHost
                  phase={arenaHostPhase}
                  currentQuestion={arenaQuestions[arenaCurrentIndex] ?? null}
                  currentIndex={arenaCurrentIndex}
                  totalQuestions={arenaQuestions.length}
                  responseCount={arenaHostResponses}
                  countdown={arenaHostCountdown}
                  leaderboard={arenaLeaderboard}
                  error={arenaError}
                  questions={arenaQuestions}
                  meetingId="mock-meeting-001"
                  onFetchQuestions={handleFetchQuestions}
                  onUpdateQuestion={(index, updates) => {
                    setArenaQuestions(prev => {
                      const next = [...prev];
                      const existing = next[index];
                      if (!existing) return prev;
                      next[index] = {
                        question: updates.question ?? existing.question,
                        options: updates.options ?? existing.options,
                        correctIndex: updates.correctIndex ?? existing.correctIndex,
                        explanation: updates.explanation ?? existing.explanation,
                      };
                      return next;
                    });
                  }}
                  onStartGame={handleStartGame}
                  onShowLeaderboard={handleShowLeaderboard}
                  onNextQuestion={handleNextQuestion}
                  onReset={handleArenaReset}
                />
              )}
              {activeFeature === 'anchor' && (
                <div className="anchor-controls">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 className="card-title" style={{ margin: 0 }}>Live Anchor</h2>
                    <div className="anchor-status">
                      <div className={`status-dot ${anchorIsPolling ? 'active' : ''}`} />
                      <span>{anchorIsPolling ? 'AI Active' : 'Paused'}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {anchorIsPolling ? (
                      <button className="btn btn-secondary" onClick={handleAnchorStopPolling}>Pause AI</button>
                    ) : (
                      <button className="btn btn-primary" onClick={handleAnchorStartPolling}>Start AI</button>
                    )}
                    <button className="btn btn-secondary" onClick={handleAnchorReset}>Reset</button>
                  </div>
                  <Timeline topics={anchorTopics} currentTopicId={anchorCurrentTopicId} />
                  {anchorGlossary.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <GlossaryTab glossary={anchorGlossary} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="app-container" style={{ minHeight: 'auto' }}>
            <div className="status-bar">
              <span style={{ fontWeight: 600 }}>Momentum</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {simActiveSpeaker && (
                  <span style={{ fontSize: 11, color: 'var(--zoom-brand)', fontWeight: 500 }}>
                    Speaking: {simActiveSpeaker}
                  </span>
                )}
                <div className="status-indicator">
                  <div className="status-dot connected" />
                  <span>Dev Preview</span>
                </div>
              </div>
            </div>
            {simLateJoinInfo && (
              <div className="card" style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#e8f0fe', borderLeft: '3px solid #0E71EB' }}>
                <div style={{ fontSize: 13 }}>
                  <strong>You joined late.</strong> {simLateJoinInfo.topicCount} topics covered so far. Latest: <em>{simLateJoinInfo.latestTopic}</em>
                </div>
                <button className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: 11, marginLeft: 8, flexShrink: 0 }} onClick={() => setSimLateJoinInfo(null)}>
                  Dismiss
                </button>
              </div>
            )}
            <div className="card" style={{ padding: '8px 0 0' }}>
              <div className="tabs">
                <button className={`tab ${anchorStudentTab === 'timeline' ? 'active' : ''}`}
                  onClick={() => setAnchorStudentTab('timeline')}>Timeline</button>
                <button className={`tab ${anchorStudentTab === 'glossary' ? 'active' : ''}`}
                  onClick={() => setAnchorStudentTab('glossary')}>Glossary</button>
                <button className={`tab ${anchorStudentTab === 'transcript' ? 'active' : ''}`}
                  onClick={() => setAnchorStudentTab('transcript')}>Transcript</button>
              </div>
            </div>
            <div className="card" style={{ flex: 1 }}>
              <div className="tab-info-bar">
                <FeatureInfo title={anchorStudentTab === 'timeline' ? 'Timeline' : anchorStudentTab === 'glossary' ? 'Glossary' : 'Transcript'} description={STUDENT_TAB_INFO[anchorStudentTab] ?? ''} />
              </div>
              {anchorStudentTab === 'timeline' ? (
                <div>
                  <Timeline
                    topics={anchorTopics}
                    currentTopicId={anchorCurrentTopicId}
                    onBookmark={() => handleBookmark()}
                  />
                  <button
                    className="btn btn-secondary"
                    style={{ marginTop: 12, width: '100%' }}
                    onClick={handleBookmark}
                  >
                    Mark for Review
                  </button>
                  <BookmarkList bookmarks={studentBookmarks.map(b => ({ ...b, isAuto: false }))} />
                </div>
              ) : anchorStudentTab === 'glossary' ? (
                <GlossaryTab glossary={anchorGlossary} />
              ) : (
                <TranscriptTab meetingId="mock-meeting-001" glossary={anchorGlossary} topics={anchorTopics} currentTopicId={anchorCurrentTopicId} />
              )}
            </div>
            {studentResults && (
              <div className="card"><PollResults poll={studentResults} /></div>
            )}
            {bookmarkToast && (
              <div className="bookmark-toast">Bookmarked</div>
            )}
            {simAutoBookmarkToast && (
              <div className="bookmark-toast" style={{ background: '#1d4ed8' }}>Auto-bookmarked: instructor cue detected</div>
            )}
          </div>
        )}
      </div>

      {studentPoll && mode === 'student' && (
        <PollCard poll={studentPoll} selectedOption={selectedOption} hasAnswered={hasAnswered}
          onSelect={setSelectedOption} onSubmit={handleStudentSubmit} />
      )}

      {showStudentArena && mode === 'student' && (
        <ArenaStudent
          phase={arenaStudentPhase}
          currentQuestion={arenaStudentQ}
          selectedOption={arenaStudentSelected}
          countdown={arenaStudentCountdown}
          leaderboard={arenaStudentLeaderboard}
          correctIndex={arenaCorrectIndex}
          explanation={arenaExplanation}
          finalLeaderboard={arenaFinalLeaderboard}
          onSelectAndSubmit={handleArenaStudentAnswer}
        />
      )}
    </div>
  );
}
