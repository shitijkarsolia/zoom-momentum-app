/**
 * Development-only preview page for testing UI components
 * outside of a Zoom meeting. Not included in production builds.
 */
import { useState, useCallback } from 'react';
import { PollCreator } from './components/pulse/PollCreator';
import { PollCard } from './components/pulse/PollCard';
import { PollResults } from './components/pulse/PollResults';
import type { Poll } from './types/messages';
import type { PollDraft, PulsePhase } from './hooks/usePulse';

type PreviewMode = 'host' | 'student';

export function DevPreview() {
  const [mode, setMode] = useState<PreviewMode>('host');

  // Host state
  const [hostPhase, setHostPhase] = useState<PulsePhase>('idle');
  const [draft, setDraft] = useState<PollDraft | null>(null);
  const [activePoll, setActivePoll] = useState<Poll | null>(null);
  const [responseCount, setResponseCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [resultsPoll, setResultsPoll] = useState<Poll | null>(null);

  // Student state
  const [studentPoll, setStudentPoll] = useState<Poll | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [studentResults, setStudentResults] = useState<Poll | null>(null);

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

  const handleLaunch = useCallback(() => {
    if (!draft) return;
    const poll: Poll = {
      pollId: `poll-${Date.now()}`,
      question: draft.question,
      options: draft.options,
    };
    setActivePoll(poll);
    setHostPhase('live');
    setDraft(null);
    setResponseCount(0);

    // Also show it on student view
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
    // Simulate aggregated results
    const results: Record<number, number> = {};
    activePoll.options.forEach((_, i) => {
      results[i] = Math.floor(Math.random() * 15) + 1;
    });
    if (selectedOption !== null) {
      results[selectedOption] = (results[selectedOption] ?? 0) + 1;
    }
    const total = Object.values(results).reduce((a, b) => a + b, 0);
    const pollWithResults: Poll = { ...activePoll, results, totalResponses: total };
    setResultsPoll(pollWithResults);
    setHostPhase('results');
    setStudentPoll(null);
    setStudentResults(pollWithResults);
  }, [activePoll, selectedOption]);

  const handleReset = useCallback(() => {
    setHostPhase('idle');
    setDraft(null);
    setActivePoll(null);
    setResultsPoll(null);
    setResponseCount(0);
    setStudentPoll(null);
    setStudentResults(null);
    setSelectedOption(null);
    setHasAnswered(false);
  }, []);

  return (
    <div style={{ display: 'flex', gap: 16, padding: 16, minHeight: '100vh', background: 'var(--zoom-bg)' }}>
      {/* Mode selector */}
      <div style={{ position: 'fixed', top: 8, right: 8, zIndex: 200, display: 'flex', gap: 8 }}>
        <button
          className={`btn ${mode === 'host' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMode('host')}
          style={{ fontSize: 12 }}
        >
          Host View
        </button>
        <button
          className={`btn ${mode === 'student' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMode('student')}
          style={{ fontSize: 12 }}
        >
          Student View
        </button>
      </div>

      {/* Main content */}
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
            <div className="card" style={{ flex: 1 }}>
              {hostPhase === 'results' && resultsPoll ? (
                <PollResults poll={resultsPoll} onDismiss={handleReset} />
              ) : (
                <PollCreator
                  phase={hostPhase}
                  draft={draft}
                  responseCount={responseCount}
                  error={error}
                  onGenerate={handleGenerate}
                  onUpdateDraft={(updates) => setDraft(prev => prev ? { ...prev, ...updates } : prev)}
                  onLaunch={handleLaunch}
                  onEndPoll={handleEndPoll}
                  onReset={handleReset}
                />
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
            <div className="card" style={{ flex: 1 }}>
              <h2 className="card-title">Live Anchor</h2>
              <p style={{ color: 'var(--zoom-text-secondary)' }}>
                Topic summaries will appear here as the lecture progresses.
              </p>
            </div>
            {studentResults && (
              <div className="card">
                <PollResults poll={studentResults} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Student poll overlay (shows regardless of mode when a poll is active) */}
      {studentPoll && mode === 'student' && (
        <PollCard
          poll={studentPoll}
          selectedOption={selectedOption}
          hasAnswered={hasAnswered}
          onSelect={setSelectedOption}
          onSubmit={handleStudentSubmit}
        />
      )}
    </div>
  );
}
