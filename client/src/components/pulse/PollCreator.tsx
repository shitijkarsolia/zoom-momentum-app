import { useState } from 'react';
import type { PollDraft, PulsePhase } from '../../hooks/usePulse';
import type { Poll } from '../../types/messages';

interface PollCreatorProps {
  phase: PulsePhase;
  draft: PollDraft | null;
  responseCount: number;
  error: string | null;
  activePoll: Poll | null;
  responses: Map<string, number>;
  onGenerate: (context?: string) => void;
  onUpdateDraft: (updates: Partial<PollDraft>) => void;
  onLaunch: () => void;
  onEndPoll: () => void;
  onReset: () => void;
}

export function PollCreator({
  phase,
  draft,
  responseCount,
  error,
  activePoll,
  responses,
  onGenerate,
  onUpdateDraft,
  onLaunch,
  onEndPoll,
  onReset,
}: PollCreatorProps) {
  const [context, setContext] = useState('');

  if (phase === 'idle' || phase === 'generating') {
    return (
      <div className="poll-creator">
        <h2 className="card-title">Professor's Pulse</h2>
        <p className="poll-description">
          Generate an AI-powered check-in poll to gauge student understanding.
        </p>

        <div className="poll-context-input">
          <label htmlFor="poll-context">Context (recommended)</label>
          <input
            id="poll-context"
            type="text"
            placeholder="e.g., 'Did everyone understand the concept of arrays?'"
            value={context}
            onChange={e => setContext(e.target.value)}
            disabled={phase === 'generating'}
          />
        </div>

        {error && <p className="poll-error">{error}</p>}

        <button
          className="btn btn-primary poll-generate-btn"
          onClick={() => onGenerate(context || undefined)}
          disabled={phase === 'generating'}
        >
          {phase === 'generating' ? (
            <>
              <span className="spinner" /> Generating…
            </>
          ) : (
            'Generate Check-In'
          )}
        </button>
      </div>
    );
  }

  if (phase === 'preview' && draft) {
    return (
      <div className="poll-creator">
        <h2 className="card-title">Preview Poll</h2>
        {draft.isFallback && (
          <p className="poll-fallback-notice">
            Using a built-in poll (AI unavailable). You can edit it below.
          </p>
        )}

        <div className="poll-preview">
          <div className="poll-edit-field">
            <label htmlFor="poll-question">Question</label>
            <textarea
              id="poll-question"
              value={draft.question}
              onChange={e => onUpdateDraft({ question: e.target.value })}
            />
          </div>

          <div className="poll-options-edit">
            <label>Options</label>
            {draft.options.map((option, i) => (
              <input
                key={i}
                type="text"
                value={option}
                placeholder={`Option ${i + 1}`}
                onChange={e => {
                  const newOptions = [...draft.options];
                  newOptions[i] = e.target.value;
                  onUpdateDraft({ options: newOptions });
                }}
              />
            ))}
          </div>
        </div>

        <div className="poll-preview-actions">
          <button className="btn btn-secondary" onClick={onReset}>
            ← Back
          </button>
          <button
            className="btn btn-primary"
            onClick={onLaunch}
            disabled={!draft.question.trim() || draft.options.some(o => !o.trim())}
          >
            Launch Poll
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'live' && activePoll) {
    const liveResults: Record<number, number> = {};
    for (const optionIndex of responses.values()) {
      liveResults[optionIndex] = (liveResults[optionIndex] ?? 0) + 1;
    }
    const total = responses.size;
    const maxCount = Math.max(...Object.values(liveResults), 1);

    return (
      <div className="poll-creator">
        <h2 className="card-title">Poll Active</h2>
        <p className="poll-results-question">{activePoll.question}</p>
        <div className="poll-live-status">
          <div className="poll-live-indicator">
            <span className="pulse-dot" />
            <span>Live</span>
          </div>
          <span className="poll-response-count">{responseCount} {responseCount === 1 ? 'response' : 'responses'}</span>
        </div>

        <div className="poll-results-bars">
          {activePoll.options.map((option, i) => {
            const count = liveResults[i] ?? 0;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            const barWidth = total > 0 ? (count / maxCount) * 100 : 0;

            return (
              <div key={i} className="poll-result-row">
                <div className="poll-result-label">
                  <span className="poll-option-letter">{String.fromCharCode(65 + i)}</span>
                  <span className="poll-result-text">{option}</span>
                  <span className="poll-result-pct">{pct}%</span>
                </div>
                <div className="poll-result-bar-bg">
                  <div
                    className="poll-result-bar-fill"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                <span className="poll-result-count">{count}</span>
              </div>
            );
          })}
        </div>

        <button className="btn btn-primary" onClick={onEndPoll}>
          End Poll & Show Results
        </button>
      </div>
    );
  }

  return null;
}
