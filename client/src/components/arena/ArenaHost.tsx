import { useState } from 'react';
import { Leaderboard } from './Leaderboard';
import type { ArenaHostPhase } from '../../hooks/useArena';
import type { Question, LeaderboardEntry } from '../../types/messages';

interface ArenaHostProps {
  phase: ArenaHostPhase;
  currentQuestion: Question | null;
  currentIndex: number;
  totalQuestions: number;
  responseCount: number;
  countdown: number;
  leaderboard: LeaderboardEntry[];
  error: string | null;
  questions: Question[];
  meetingId?: string;
  onFetchQuestions: (topic?: string, transcript?: string) => void;
  onAppendQuestions: (topic?: string, transcript?: string) => void;
  onUpdateQuestion: (index: number, updates: Partial<Question>) => void;
  onStartGame: () => void;
  onShowLeaderboard: () => void;
  onNextQuestion: () => void;
  onEndGame: () => void;
  onReset: () => void;
}

export function ArenaHost({
  phase,
  currentQuestion,
  currentIndex,
  totalQuestions,
  responseCount,
  countdown,
  leaderboard,
  error,
  questions,
  meetingId,
  onFetchQuestions,
  onAppendQuestions,
  onUpdateQuestion,
  onStartGame,
  onShowLeaderboard,
  onNextQuestion,
  onEndGame,
  onReset,
}: ArenaHostProps) {
  const [topic, setTopic] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tailorInput, setTailorInput] = useState('');
  const [fetchingTranscript, setFetchingTranscript] = useState(false);
  const [showNoContextAlert, setShowNoContextAlert] = useState(false);

  const handleGenerate = async () => {
    let transcript = '';
    if (meetingId) {
      setFetchingTranscript(true);
      try {
        const res = await fetch(`/api/transcript/buffer?meetingId=${encodeURIComponent(meetingId)}`);
        if (res.ok) {
          const data = await res.json();
          transcript = data.buffer || '';
        }
      } catch { /* silent */ }
      setFetchingTranscript(false);
    }
    if (!topic && !transcript) {
      setShowNoContextAlert(true);
      return;
    }
    onFetchQuestions(topic || undefined, transcript || undefined);
  };

  const handleTailorAppend = async () => {
    let transcript = '';
    if (meetingId) {
      try {
        const res = await fetch(`/api/transcript/buffer?meetingId=${encodeURIComponent(meetingId)}`);
        if (res.ok) {
          const data = await res.json();
          transcript = data.buffer || '';
        }
      } catch { /* silent */ }
    }
    onAppendQuestions(tailorInput || undefined, transcript || undefined);
    setTailorInput('');
  };

  if (phase === 'idle' || phase === 'loading') {
    return (
      <div className="arena-host">
        <h2 className="card-title">Arena</h2>
        <p className="arena-description">
          Generate a timed quiz for your students. AI creates questions from any topic — review material, test comprehension, or just have fun.
        </p>

        <div className="arena-topic-input">
          <label htmlFor="arena-topic">Topic (recommended)</label>
          <input
            id="arena-topic"
            type="text"
            placeholder="e.g., 'Binary and ASCII encoding' or 'Chapter 3 review'"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            disabled={phase === 'loading'}
          />
          <p style={{ fontSize: 11, color: 'var(--zoom-text-secondary)', marginTop: 4 }}>
            {meetingId ? 'Questions will be based on the lecture transcript + topic.' : 'Start the transcript or enter a topic for relevant questions.'}
          </p>
        </div>

        {error && <p className="poll-error">{error}</p>}

        {showNoContextAlert && (
          <div style={{
            background: 'var(--zoom-bg)',
            border: '1px solid var(--zoom-border)',
            borderRadius: 8,
            padding: '12px 14px',
            marginBottom: 12,
          }}>
            <p style={{ fontSize: 13, fontWeight: 500, margin: '0 0 4px' }}>No context available</p>
            <p style={{ fontSize: 12, color: 'var(--zoom-text-secondary)', margin: 0 }}>
              Enter a topic above or start the live transcript (Anchor tab) so the AI can generate relevant questions.
            </p>
          </div>
        )}

        <button
          className="btn btn-primary"
          onClick={handleGenerate}
          disabled={phase === 'loading' || fetchingTranscript}
        >
          {phase === 'loading' || fetchingTranscript ? (
            <>
              <span className="spinner" /> {fetchingTranscript ? 'Fetching transcript…' : 'Generating Questions…'}
            </>
          ) : (
            'Generate Quiz'
          )}
        </button>
      </div>
    );
  }

  if (phase === 'ready') {
    return (
      <div className="arena-host">
        <h2 className="card-title">Review Questions</h2>
        <p className="arena-description" style={{ marginBottom: 12 }}>
          {questions.length} questions ready. Review and edit before starting. Students get 15 seconds per question.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {questions.map((q, qi) => (
            <div key={qi} style={{ border: '1px solid var(--zoom-border)', borderRadius: 8, padding: 12 }}>
              {editingIndex === qi ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input
                    type="text"
                    value={q.question}
                    onChange={e => onUpdateQuestion(qi, { question: e.target.value })}
                    style={{ fontSize: 13, padding: '6px 8px', borderRadius: 4, border: '1px solid var(--zoom-border)' }}
                  />
                  {q.options.map((opt, oi) => (
                    <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span
                        style={{
                          fontSize: 11, fontWeight: 600, width: 20, textAlign: 'center',
                          color: oi === q.correctIndex ? 'var(--zoom-success, #43a047)' : 'var(--zoom-text-secondary)',
                        }}
                      >
                        {String.fromCharCode(65 + oi)}
                      </span>
                      <input
                        type="text"
                        value={opt}
                        onChange={e => {
                          const newOptions = [...q.options];
                          newOptions[oi] = e.target.value;
                          onUpdateQuestion(qi, { options: newOptions });
                        }}
                        style={{ flex: 1, fontSize: 12, padding: '4px 6px', borderRadius: 4, border: '1px solid var(--zoom-border)' }}
                      />
                      <button
                        type="button"
                        style={{
                          fontSize: 10, padding: '2px 6px', borderRadius: 4, cursor: 'pointer',
                          background: oi === q.correctIndex ? 'var(--zoom-success, #43a047)' : 'var(--zoom-bg)',
                          color: oi === q.correctIndex ? '#fff' : 'var(--zoom-text-secondary)',
                          border: '1px solid var(--zoom-border)',
                        }}
                        onClick={() => onUpdateQuestion(qi, { correctIndex: oi })}
                      >
                        {oi === q.correctIndex ? 'Correct' : 'Set correct'}
                      </button>
                    </div>
                  ))}
                  <button className="btn btn-secondary" style={{ fontSize: 11, padding: '4px 8px', alignSelf: 'flex-end' }} onClick={() => setEditingIndex(null)}>
                    Done
                  </button>
                </div>
              ) : (
                <div style={{ cursor: 'pointer' }} onClick={() => setEditingIndex(qi)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <p style={{ fontSize: 13, fontWeight: 500, margin: 0 }}>
                      <span style={{ color: 'var(--zoom-text-secondary)', marginRight: 6 }}>Q{qi + 1}.</span>
                      {q.question}
                    </p>
                    <span style={{ fontSize: 10, color: 'var(--zoom-brand)', flexShrink: 0, marginLeft: 8 }}>Edit</span>
                  </div>
                  <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {q.options.map((opt, oi) => (
                      <span
                        key={oi}
                        style={{
                          fontSize: 11, padding: '2px 8px', borderRadius: 4,
                          background: oi === q.correctIndex ? 'var(--zoom-success, #43a047)' : 'var(--zoom-bg)',
                          color: oi === q.correctIndex ? '#fff' : 'var(--zoom-text)',
                        }}
                      >
                        {String.fromCharCode(65 + oi)}) {opt}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 11, color: 'var(--zoom-text-secondary)', display: 'block', marginBottom: 4 }}>
            Add more questions on a specific topic
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              placeholder="e.g., 'Focus more on binary math' or 'Make them harder'"
              value={tailorInput}
              onChange={e => setTailorInput(e.target.value)}
              style={{ flex: 1, fontSize: 12, padding: '6px 8px', borderRadius: 4, border: '1px solid var(--zoom-border)' }}
            />
            <button
              className="btn btn-secondary"
              style={{ fontSize: 11, padding: '4px 10px', flexShrink: 0 }}
              onClick={handleTailorAppend}
              disabled={!tailorInput.trim()}
            >
              Add More
            </button>
          </div>
        </div>

        <div className="arena-ready-actions">
          <button className="btn btn-secondary" onClick={onReset}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={onStartGame}>
            Start Game
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'question' && currentQuestion) {
    return (
      <div className="arena-host">
        <div className="arena-question-header">
          <span className="arena-q-number">Q{currentIndex + 1}/{totalQuestions}</span>
          <span className={`arena-countdown ${countdown <= 3 ? 'urgent' : ''}`}>
            {countdown}s
          </span>
        </div>

        <h3 className="arena-host-question">{currentQuestion.question}</h3>

        <div className="arena-host-options">
          {currentQuestion.options.map((opt, i) => (
            <div key={i} className={`arena-host-option ${i === currentQuestion.correctIndex ? 'correct' : ''}`}>
              <span className="poll-option-letter">{String.fromCharCode(65 + i)}</span>
              <span>{opt}</span>
            </div>
          ))}
        </div>

        <div className="arena-live-stats">
          <span>{responseCount} {responseCount === 1 ? 'answer' : 'answers'} received</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-secondary" onClick={onEndGame} style={{ fontSize: 11, padding: '4px 8px', color: 'var(--zoom-error, #e53935)' }}>
              End Quiz
            </button>
            <button className="btn btn-secondary" onClick={onShowLeaderboard} style={{ fontSize: 12 }}>
              Skip to Results
            </button>
          </div>
        </div>
        <p style={{ fontSize: 10, color: 'var(--zoom-text-secondary)', textAlign: 'center', marginTop: 4 }}>
          Auto-advances when timer ends
        </p>
      </div>
    );
  }

  if (phase === 'leaderboard') {
    const isLast = currentIndex >= totalQuestions - 1;
    return (
      <div className="arena-host">
        <Leaderboard
          entries={leaderboard}
          title={`After Q${currentIndex + 1}`}
        />
        <button className="btn btn-primary arena-next-btn" onClick={onNextQuestion}>
          {isLast ? 'Final Results' : `Next Question (Q${currentIndex + 2})`}
        </button>
        <button className="btn btn-secondary" onClick={onEndGame} style={{ width: '100%', marginTop: 6, fontSize: 11, color: 'var(--zoom-error, #e53935)' }}>
          End Quiz
        </button>
        <p style={{ fontSize: 10, color: 'var(--zoom-text-secondary)', textAlign: 'center', marginTop: 4 }}>
          {countdown > 0 ? `Auto-advances in ${countdown}s` : 'Advancing…'}
        </p>
      </div>
    );
  }

  if (phase === 'finished') {
    return (
      <div className="arena-host">
        <div className="arena-finished">
          <h2 className="card-title">Game Over</h2>
        </div>
        <Leaderboard entries={leaderboard} title="Final Standings" />
        <button className="btn btn-secondary arena-next-btn" onClick={onReset}>
          New Game
        </button>
      </div>
    );
  }

  return null;
}
