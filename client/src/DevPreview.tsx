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
import type { Poll, Question, LeaderboardEntry, Topic, GlossaryEntry } from './types/messages';
import type { PollDraft, PulsePhase } from './hooks/usePulse';
import type { ArenaHostPhase, ArenaStudentPhase } from './hooks/useArena';

type PreviewMode = 'host' | 'student';
type FeatureTab = 'pulse' | 'arena' | 'anchor';

const MOCK_TOPICS: Topic[] = [
  {
    id: 'topic-1',
    title: 'Introduction to Derivatives',
    bullets: ['Definition of a derivative as a limit', 'Notation: f\'(x) and dy/dx', 'Geometric interpretation as slope of tangent line'],
    startTime: Date.now() - 600_000,
  },
  {
    id: 'topic-2',
    title: 'Power Rule',
    bullets: ['d/dx(xⁿ) = nxⁿ⁻¹', 'Works for any real exponent', 'Examples with polynomials'],
    startTime: Date.now() - 300_000,
  },
];

const MOCK_GLOSSARY: GlossaryEntry[] = [
  { term: 'Derivative', definition: 'The instantaneous rate of change of a function at a point', timestamp: Date.now() - 600_000 },
  { term: 'Power Rule', definition: 'Differentiation rule: d/dx(xⁿ) = nxⁿ⁻¹', formula: 'd/dx(xⁿ) = nxⁿ⁻¹', timestamp: Date.now() - 300_000 },
  { term: 'Tangent Line', definition: 'A line that touches a curve at exactly one point and has the same slope as the curve at that point', timestamp: Date.now() - 450_000 },
];

const QUESTION_TIME = 15;

export function DevPreview() {
  const [mode, setMode] = useState<PreviewMode>('host');
  const [activeFeature, setActiveFeature] = useState<FeatureTab>('pulse');

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
  const [anchorStudentTab, setAnchorStudentTab] = useState<'timeline' | 'glossary'>('timeline');
  const [bookmarkToast, setBookmarkToast] = useState(false);

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
    setAnchorTopics([MOCK_TOPICS[0]!]);
    setAnchorCurrentTopicId(MOCK_TOPICS[0]!.id);
    setAnchorGlossary([MOCK_GLOSSARY[0]!]);

    anchorTimerRef.current = setInterval(() => {
      setAnchorTopics(prev => {
        if (prev.length >= MOCK_TOPICS.length) {
          // Only add the Chain Rule topic once
          const chainRuleId = 'topic-chain-rule';
          if (prev.some(t => t.id === chainRuleId)) {
            return prev;
          }
          const newTopic: Topic = {
            id: chainRuleId,
            title: 'Chain Rule',
            bullets: ['d/dx[f(g(x))] = f\'(g(x))·g\'(x)', 'Used for composite functions', 'Inner and outer function identification'],
            startTime: Date.now(),
          };
          setAnchorCurrentTopicId(newTopic.id);
          setAnchorGlossary(g => {
            if (g.some(entry => entry.term.toLowerCase() === 'chain rule')) return g;
            return [...g, {
              term: 'Chain Rule',
              definition: 'Rule for differentiating composite functions',
              formula: 'd/dx[f(g(x))] = f\'(g(x))·g\'(x)',
              timestamp: Date.now(),
            }];
          });
          return [...prev, newTopic];
        }
        const next = MOCK_TOPICS[prev.length]!;
        setAnchorCurrentTopicId(next.id);
        setAnchorGlossary(g => {
          const newTerms = MOCK_GLOSSARY.slice(prev.length, prev.length + 1);
          const existing = new Set(g.map(e => e.term.toLowerCase()));
          const unique = newTerms.filter(t => !existing.has(t.term.toLowerCase()));
          return unique.length > 0 ? [...g, ...unique] : g;
        });
        return [...prev, next];
      });
    }, 8000);
  }, []);

  const handleAnchorStopPolling = useCallback(() => {
    setAnchorIsPolling(false);
    if (anchorTimerRef.current) { clearInterval(anchorTimerRef.current); anchorTimerRef.current = null; }
  }, []);

  const handleAnchorReset = useCallback(() => {
    handleAnchorStopPolling();
    setAnchorTopics([]); setAnchorCurrentTopicId(''); setAnchorGlossary([]);
  }, [handleAnchorStopPolling]);

  const handleBookmark = useCallback(() => {
    setBookmarkToast(true);
    setTimeout(() => setBookmarkToast(false), 2200);
  }, []);

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
  const handleFetchQuestions = useCallback(async (topic?: string) => {
    setArenaHostPhase('loading');
    setArenaError(null);
    try {
      const res = await fetch('/api/ai/quiz-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, questionCount: 5 }),
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

  return (
    <div style={{ display: 'flex', gap: 16, padding: 16, minHeight: '100vh', background: 'var(--zoom-bg)' }}>
      <div style={{ position: 'fixed', top: 8, right: 8, zIndex: 200, display: 'flex', gap: 8 }}>
        <button className={`btn ${mode === 'host' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMode('host')} style={{ fontSize: 12 }}>Host View</button>
        <button className={`btn ${mode === 'student' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMode('student')} style={{ fontSize: 12 }}>Student View</button>
      </div>

      <div style={{ flex: 1, maxWidth: 420, margin: '0 auto' }}>
        {mode === 'host' ? (
          <div className="app-container" style={{ minHeight: 'auto' }}>
            <div className="status-bar">
              <span style={{ fontWeight: 600 }}>⚡ Momentum — Host</span>
              <div className="status-indicator">
                <div className="status-dot connected" />
                <span>Dev Preview</span>
              </div>
            </div>
            <div className="card" style={{ padding: '8px 0 0' }}>
              <div className="tabs">
                <button className={`tab ${activeFeature === 'pulse' ? 'active' : ''}`}
                  onClick={() => setActiveFeature('pulse')}>📊 Pulse</button>
                <button className={`tab ${activeFeature === 'arena' ? 'active' : ''}`}
                  onClick={() => setActiveFeature('arena')}>🎮 Arena</button>
                <button className={`tab ${activeFeature === 'anchor' ? 'active' : ''}`}
                  onClick={() => setActiveFeature('anchor')}>📌 Anchor</button>
              </div>
            </div>
            <div className="card" style={{ flex: 1 }}>
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
                  onFetchQuestions={handleFetchQuestions}
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
                      <button className="btn btn-secondary" onClick={handleAnchorStopPolling}>⏸ Pause AI</button>
                    ) : (
                      <button className="btn btn-primary" onClick={handleAnchorStartPolling}>▶ Start AI</button>
                    )}
                    <button className="btn btn-secondary" onClick={handleAnchorReset}>🔄 Reset</button>
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
              <span style={{ fontWeight: 600 }}>⚡ Momentum</span>
              <div className="status-indicator">
                <div className="status-dot connected" />
                <span>Dev Preview</span>
              </div>
            </div>
            <div className="card" style={{ padding: '8px 0 0' }}>
              <div className="tabs">
                <button className={`tab ${anchorStudentTab === 'timeline' ? 'active' : ''}`}
                  onClick={() => setAnchorStudentTab('timeline')}>📌 Timeline</button>
                <button className={`tab ${anchorStudentTab === 'glossary' ? 'active' : ''}`}
                  onClick={() => setAnchorStudentTab('glossary')}>📖 Glossary</button>
              </div>
            </div>
            <div className="card" style={{ flex: 1 }}>
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
                    📌 I'm Confused (Bookmark)
                  </button>
                </div>
              ) : (
                <GlossaryTab glossary={anchorGlossary} />
              )}
            </div>
            {studentResults && (
              <div className="card"><PollResults poll={studentResults} /></div>
            )}
            {bookmarkToast && (
              <div className="bookmark-toast">📌 Bookmarked!</div>
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
