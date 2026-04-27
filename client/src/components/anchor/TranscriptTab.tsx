import { useState, useEffect, useRef, useCallback } from 'react';
import type { Topic, GlossaryEntry } from '../../types/messages';

interface TranscriptSegment {
  speaker: string;
  text: string;
  timestamp: number;
}

interface TranscriptTabProps {
  meetingId: string;
  glossary: GlossaryEntry[];
  topics: Topic[];
  currentTopicId: string;
  showTitle?: boolean;
}

export function TranscriptTab({ meetingId, glossary, topics, currentTopicId, showTitle }: TranscriptTabProps) {
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const wasAtBottomRef = useRef(true);

  useEffect(() => {
    if (!meetingId) return;

    const fetchSegments = async () => {
      try {
        const res = await fetch(`/api/transcript/segments?meetingId=${encodeURIComponent(meetingId)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data.segments)) {
          setSegments(data.segments);
        }
      } catch {
        // silent
      }
    };

    fetchSegments();
    const interval = setInterval(fetchSegments, 5_000);
    return () => clearInterval(interval);
  }, [meetingId]);

  // Auto-scroll only if user was already at the bottom
  useEffect(() => {
    if (scrollRef.current && wasAtBottomRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [segments]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const atBottom = scrollHeight - scrollTop - clientHeight < 40;
    wasAtBottomRef.current = atBottom;
    setIsAtBottom(atBottom);
  }, []);

  const jumpToLatest = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      wasAtBottomRef.current = true;
      setIsAtBottom(true);
    }
  }, []);

  if (!meetingId) {
    return (
      <div style={{ padding: 16, textAlign: 'center', color: 'var(--zoom-text-secondary)', fontSize: 13 }}>
        Live transcript will appear here during a meeting.
      </div>
    );
  }

  if (segments.length === 0) {
    return (
      <div style={{ padding: 16, textAlign: 'center', color: 'var(--zoom-text-secondary)', fontSize: 13 }}>
        Waiting for transcript data…
      </div>
    );
  }

  const glossaryTerms = glossary.map(g => g.term).filter(t => t.length > 2);
  const currentTopic = topics.find(t => t.id === currentTopicId);

  return (
    <div>
      {showTitle && (
        <h2 className="card-title" style={{ margin: '0 0 8px' }}>Transcript</h2>
      )}

      {currentTopic && (
        <div style={{
          padding: '6px 10px',
          marginBottom: 8,
          borderRadius: 6,
          background: 'var(--zoom-brand-light, #e8f0fe)',
          borderLeft: '3px solid var(--zoom-brand, #0E71EB)',
          fontSize: 12,
        }}>
          <span style={{ fontWeight: 600, color: 'var(--zoom-brand, #0E71EB)' }}>Topic: </span>
          <span style={{ fontWeight: 600 }}>{currentTopic.title}</span>
        </div>
      )}

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{
          maxHeight: 400,
          overflowY: 'auto',
          fontSize: 13,
          color: 'var(--zoom-text)',
          padding: '4px 0',
        }}
      >
        {segments.map((seg, i) => {
          const rawTs = seg.timestamp;
          const ms = rawTs > 1e15 ? Math.floor(rawTs / 1000) : rawTs > 1e12 ? rawTs : rawTs * 1000;
          const time = new Date(ms);
          const timeStr = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}:${String(time.getSeconds()).padStart(2, '0')}`;
          const prevSpeaker = i > 0 ? segments[i - 1]!.speaker : null;
          const isNewSpeaker = seg.speaker !== prevSpeaker;

          return (
            <div key={i} style={{
              padding: '4px 8px',
              marginTop: isNewSpeaker ? 10 : 1,
              borderRadius: 4,
              background: i % 2 === 0 ? 'transparent' : 'var(--zoom-bg, #f8f8fa)',
            }}>
              {isNewSpeaker && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--zoom-brand, #0E71EB)' }}>
                    {seg.speaker}
                  </span>
                </div>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ fontSize: 10, color: 'var(--zoom-text-secondary)', flexShrink: 0, paddingTop: 2, minWidth: 52 }}>
                  {timeStr}
                </span>
                <span
                  style={{ lineHeight: 1.5 }}
                  dangerouslySetInnerHTML={{ __html: highlightTerms(seg.text, glossaryTerms) }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {!isAtBottom && segments.length > 0 && (
        <button
          onClick={jumpToLatest}
          style={{
            position: 'sticky',
            bottom: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'block',
            margin: '0 auto',
            background: 'var(--zoom-brand, #0E71EB)',
            color: '#fff',
            border: 'none',
            borderRadius: 16,
            padding: '4px 14px',
            fontSize: 11,
            fontWeight: 500,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            zIndex: 5,
          }}
        >
          ↓ Latest
        </button>
      )}
    </div>
  );
}

function highlightTerms(text: string, terms: string[]): string {
  if (terms.length === 0) return escapeHtml(text);

  const escaped = terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return escapeHtml(text).replace(
    new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi'),
    '<strong style="color: var(--zoom-brand, #0E71EB)">$1</strong>',
  );
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
