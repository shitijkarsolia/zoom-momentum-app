import { useState, useEffect, useRef } from 'react';
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
}

export function TranscriptTab({ meetingId, glossary, topics, currentTopicId }: TranscriptTabProps) {
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [segments]);

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

  // Group consecutive segments by speaker
  const grouped: { speaker: string; lines: string[]; timestamp: number }[] = [];
  for (const seg of segments) {
    const last = grouped[grouped.length - 1];
    if (last && last.speaker === seg.speaker) {
      last.lines.push(seg.text);
    } else {
      grouped.push({ speaker: seg.speaker, lines: [seg.text], timestamp: seg.timestamp });
    }
  }

  return (
    <div>
      {currentTopic && (
        <div style={{
          padding: '8px 12px',
          marginBottom: 10,
          borderRadius: 6,
          background: 'var(--zoom-brand-light, #e8f0fe)',
          borderLeft: '3px solid var(--zoom-brand, #0E71EB)',
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--zoom-brand, #0E71EB)' }}>
            Current Topic
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{currentTopic.title}</div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: 'var(--zoom-text-secondary)' }}>
          {segments.length} segments — live
        </span>
        {glossaryTerms.length > 0 && (
          <span style={{ fontSize: 10, color: 'var(--zoom-text-secondary)' }}>
            Key terms highlighted
          </span>
        )}
      </div>

      <div
        ref={scrollRef}
        style={{
          maxHeight: 400,
          overflowY: 'auto',
          fontSize: 13,
          lineHeight: 1.7,
          color: 'var(--zoom-text)',
          padding: '8px 0',
        }}
      >
        {grouped.map((group, i) => {
          const time = new Date(group.timestamp);
          const timeStr = `${time.getHours()}:${String(time.getMinutes()).padStart(2, '0')}`;
          const text = group.lines.join(' ');

          return (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 2 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--zoom-brand, #0E71EB)' }}>
                  {group.speaker}
                </span>
                <span style={{ fontSize: 10, color: 'var(--zoom-text-secondary)' }}>
                  {timeStr}
                </span>
              </div>
              <div
                style={{ paddingLeft: 2 }}
                dangerouslySetInnerHTML={{ __html: highlightTerms(text, glossaryTerms) }}
              />
            </div>
          );
        })}
      </div>
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
