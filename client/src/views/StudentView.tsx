import { useState, useCallback, useEffect, useRef } from 'react';
import { PollCard } from '../components/pulse/PollCard';
import { PollResults } from '../components/pulse/PollResults';
import { ArenaStudent } from '../components/arena/ArenaStudent';
import { Timeline } from '../components/anchor/Timeline';
import { GlossaryTab } from '../components/anchor/GlossaryTab';
import { PostClassSummary } from '../components/recovery/PostClassSummary';
import { FeatureInfo } from '../components/shared/FeatureInfo';
import type { Poll, Topic, GlossaryEntry } from '../types/messages';
import { BookmarkList } from '../components/anchor/BookmarkList';
import type { AnchorBookmark } from '../hooks/useLiveAnchor';
import { useSmartNotes } from '../hooks/useSmartNotes';
import { SmartNotesPanel } from '../components/notes/SmartNotesPanel';

import { TranscriptTab } from '../components/anchor/TranscriptTab';

const TAB_INFO = {
  timeline: 'Topics and key takeaways appear here as your professor lectures.',
  glossary: 'Technical terms and definitions extracted from the lecture. Use the search bar to find specific terms.',
  transcript: 'Live transcript of the lecture. Key terms are highlighted.',
  bookmarks: 'Tap "Mark for Review" to bookmark the current moment. Review these after class.',
  notes: 'Type your own notes during class. Tap "+ Note" on any topic, glossary term, or bookmark to capture it. Download the full set as Markdown anytime.',
} as const;
import type { LeaderboardEntry } from '../types/messages';
import type { ArenaStudentPhase } from '../hooks/useArena';

interface StudentViewProps {
  userName: string;
  connected: boolean;
  meetingId: string;
  anchorIsLive?: boolean;
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
  anchorBookmarks: AnchorBookmark[];
  onBookmark: (meetingId?: string, userId?: string, options?: { topicOverride?: string }) => boolean;
  onRemoveBookmark: (index: number) => void;
  // Events props
  meetingEnded?: boolean;
  lateJoinInfo?: { topicCount: number; latestTopic: string } | null;
  onDismissLateJoin?: () => void;
  activeSpeaker?: string | null;
}

const BOOKMARK_SAVED = 'Bookmarked';

type StudentTab = 'timeline' | 'glossary' | 'transcript' | 'bookmarks' | 'notes';

export function StudentView({
  userName,
  connected,
  meetingId,
  anchorIsLive = false,
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
  anchorBookmarks,
  onBookmark,
  onRemoveBookmark,
  meetingEnded = false,
  lateJoinInfo,
  onDismissLateJoin,
  activeSpeaker,
}: StudentViewProps) {
  const [activeTab, setActiveTab] = useState<StudentTab>('timeline');
  const [bookmarkToast, setBookmarkToast] = useState<string | null>(null);
  const [pollResultsDismissed, setPollResultsDismissed] = useState(false);

  const smartNotes = useSmartNotes(meetingId);

  const handleAddTopicToNotes = useCallback((topic: Topic) => {
    const lines = [`### ${topic.title}`];
    if (topic.bullets.length > 0) {
      topic.bullets.forEach(b => lines.push(`- ${b}`));
    }
    smartNotes.appendToNotes(lines.join('\n'));
    setBookmarkToast('Added to notes');
    setTimeout(() => setBookmarkToast(null), 1800);
  }, [smartNotes]);

  const handleAddGlossaryToNotes = useCallback((entry: GlossaryEntry) => {
    const lines = [`**${entry.term}** — ${entry.definition}`];
    if (entry.formula) {
      lines.push('```');
      lines.push(entry.formula);
      lines.push('```');
    }
    smartNotes.appendToNotes(lines.join('\n'));
    setBookmarkToast('Added to notes');
    setTimeout(() => setBookmarkToast(null), 1800);
  }, [smartNotes]);

  const handleAddBookmarkToNotes = useCallback((bookmark: AnchorBookmark) => {
    const time = new Date(bookmark.timestamp);
    const timeStr = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}:${String(time.getSeconds()).padStart(2, '0')}`;
    const tag = bookmark.isAuto ? '⭐ ' : '';
    const snippet = bookmark.transcriptSnippet ? ` — _"${bookmark.transcriptSnippet}"_` : '';
    smartNotes.appendToNotes(`- **${timeStr}** ${tag}${bookmark.topic}${snippet}`);
    setBookmarkToast('Added to notes');
    setTimeout(() => setBookmarkToast(null), 1800);
  }, [smartNotes]);

  // Auto-dismiss poll results after 8s
  const pollResultsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (pollResults) {
      setPollResultsDismissed(false);
      pollResultsTimerRef.current = setTimeout(() => setPollResultsDismissed(true), 8000);
      return () => { if (pollResultsTimerRef.current) clearTimeout(pollResultsTimerRef.current); };
    }
  }, [pollResults]);

  // --- Recovery state for meeting end ---
  const [recoveryItems, setRecoveryItems] = useState<{ topic: string; explanation: string; practice: string; resource: string }[]>([]);
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  useEffect(() => {
    if (!meetingEnded || !meetingId) return;
    let cancelled = false;
    setRecoveryLoading(true);
    const bookmarks = anchorBookmarks.map((bookmark) => ({
      topic: bookmark.topic,
      timestamp: bookmark.timestamp,
      transcriptSnippet: bookmark.transcriptSnippet,
      isAuto: bookmark.isAuto,
    }));

    if (bookmarks.length === 0) {
      setRecoveryItems([]);
      setRecoveryLoading(false);
      return;
    }

    fetch('/api/ai/recovery-pack', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookmarks,
        topics: anchorTopics.map(t => ({ title: t.title, bullets: t.bullets })),
      }),
    })
      .then(res => res.json())
      .then(data => { if (!cancelled) setRecoveryItems(data.items ?? []); })
      .catch(() => { if (!cancelled) setRecoveryItems([]); })
      .finally(() => { if (!cancelled) setRecoveryLoading(false); });
    return () => { cancelled = true; };
  }, [meetingEnded, meetingId, anchorBookmarks, anchorTopics]);

  const showArena = arenaPhase === 'question' || arenaPhase === 'answered' || arenaPhase === 'leaderboard' || arenaPhase === 'finished';

  const bookmarkedTopics = new Set(anchorBookmarks.map(b => b.topic));

  const handleBookmark = useCallback((topicTitle?: string) => {
    if (topicTitle && bookmarkedTopics.has(topicTitle)) return;
    onBookmark(undefined, undefined, topicTitle ? { topicOverride: topicTitle } : undefined);
    setBookmarkToast(BOOKMARK_SAVED);
    setTimeout(() => setBookmarkToast(null), 2200);
  }, [onBookmark, bookmarkedTopics]);

  // Show PostClassSummary when meeting has ended
  if (meetingEnded) {
    return (
      <div className="app-container">
        <div className="card" style={{ flex: 1 }}>
          <PostClassSummary
            meetingTitle="Lecture Session"
            topics={anchorTopics}
            glossary={anchorGlossary}
            recoveryItems={recoveryItems}
            isLoading={recoveryLoading}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="status-bar">
        <span style={{ fontWeight: 600 }}>Momentum</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {anchorIsLive && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#16a34a', fontWeight: 500 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
              Live
            </span>
          )}
          {activeSpeaker && (
            <span style={{ fontSize: 11, color: 'var(--zoom-brand)', fontWeight: 500 }}>
              Speaking: {activeSpeaker}
            </span>
          )}
          <div className="status-indicator">
            <div className={`status-dot ${connected ? 'connected' : ''}`} />
            <span>{connected ? 'Connected' : 'Connecting…'}</span>
          </div>
        </div>
      </div>

      {lateJoinInfo && (
        <div className="card" style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--zoom-brand-light, #e8f0fe)', borderLeft: '3px solid var(--zoom-brand, #0E71EB)' }}>
          <div style={{ fontSize: 13 }}>
            <strong>You joined late.</strong> {lateJoinInfo.topicCount} topic{lateJoinInfo.topicCount !== 1 ? 's' : ''} covered so far. Latest: <em>{lateJoinInfo.latestTopic}</em>
          </div>
          {onDismissLateJoin && (
            <button
              className="btn btn-secondary"
              style={{ padding: '2px 8px', fontSize: 11, marginLeft: 8, flexShrink: 0 }}
              onClick={onDismissLateJoin}
            >
              Dismiss
            </button>
          )}
        </div>
      )}

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
          <button
            className={`tab ${activeTab === 'transcript' ? 'active' : ''}`}
            onClick={() => setActiveTab('transcript')}
          >
            Transcript
          </button>
          <button
            className={`tab ${activeTab === 'bookmarks' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookmarks')}
          >
            Bookmarks{anchorBookmarks.length > 0 ? ` (${anchorBookmarks.length})` : ''}
          </button>
          <button
            className={`tab ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={() => setActiveTab('notes')}
          >
            Notes{smartNotes.wordCount > 0 ? ` (${smartNotes.wordCount}w)` : ''}
          </button>
        </div>
      </div>

      <div className="card" style={{ flex: 1 }}>
        <div className="tab-info-bar">
          <FeatureInfo
            title={activeTab === 'timeline' ? 'Timeline' : activeTab === 'glossary' ? 'Glossary' : activeTab === 'transcript' ? 'Transcript' : activeTab === 'bookmarks' ? 'Bookmarks' : 'Notes'}
            description={TAB_INFO[activeTab]}
          />
        </div>
        {activeTab === 'timeline' && (
          <>
            {!anchorIsLive && anchorTopics.length > 0 && (
              <div style={{ padding: '8px 14px', textAlign: 'center', color: 'var(--zoom-text-secondary)', fontSize: 11, background: 'var(--zoom-bg)', borderRadius: 8, margin: '0 0 8px' }}>
                AI paused by professor
              </div>
            )}
            <Timeline
              topics={anchorTopics}
              currentTopicId={anchorCurrentTopicId}
              bookmarkedTopics={bookmarkedTopics}
              onBookmark={handleBookmark}
              onAddToNotes={handleAddTopicToNotes}
            />
          </>
        )}
        {activeTab === 'glossary' && (
          <GlossaryTab glossary={anchorGlossary} onAddToNotes={handleAddGlossaryToNotes} />
        )}
        {activeTab === 'transcript' && (
          <TranscriptTab meetingId={meetingId} glossary={anchorGlossary} topics={anchorTopics} currentTopicId={anchorCurrentTopicId} />
        )}
        {activeTab === 'bookmarks' && (
          <div>
            <BookmarkList bookmarks={anchorBookmarks} onRemove={onRemoveBookmark} onAddToNotes={handleAddBookmarkToNotes} />
            {anchorBookmarks.length === 0 && (
              <div style={{ padding: 16, textAlign: 'center', color: 'var(--zoom-text-secondary)', fontSize: 13 }}>
                No bookmarks yet. Tap "Bookmark" on a topic to save it for review.
              </div>
            )}
          </div>
        )}
        {activeTab === 'notes' && (
          <SmartNotesPanel
            meetingId={meetingId}
            userName={userName}
            notes={smartNotes.notes}
            setNotes={smartNotes.setNotes}
            clearNotes={smartNotes.clearNotes}
            lastSaved={smartNotes.lastSaved}
            wordCount={smartNotes.wordCount}
            topics={anchorTopics}
            glossary={anchorGlossary}
            bookmarks={anchorBookmarks}
          />
        )}
      </div>

      {bookmarkToast && (
        <div className="bookmark-toast">{bookmarkToast}</div>
      )}

      {pollResults && !pollResultsDismissed && (
        <div className="card poll-results-fade">
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
