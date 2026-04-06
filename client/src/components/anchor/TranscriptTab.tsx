import { useState, useEffect, useRef } from 'react';
import type { GlossaryEntry } from '../../types/messages';

interface TranscriptTabProps {
  meetingId: string;
  glossary: GlossaryEntry[];
}

export function TranscriptTab({ meetingId, glossary }: TranscriptTabProps) {
  const [transcript, setTranscript] = useState('');
  const [segmentCount, setSegmentCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!meetingId) return;

    const fetchBuffer = async () => {
      try {
        const res = await fetch(`/api/transcript/buffer?meetingId=${encodeURIComponent(meetingId)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.buffer) {
          setTranscript(data.buffer);
          setSegmentCount(data.segmentCount);
        }
      } catch {
        // silent
      }
    };

    fetchBuffer();
    const interval = setInterval(fetchBuffer, 10_000);
    return () => clearInterval(interval);
  }, [meetingId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  if (!meetingId) {
    return (
      <div style={{ padding: 16, textAlign: 'center', color: 'var(--zoom-text-secondary)', fontSize: 13 }}>
        Live transcript will appear here during a meeting.
      </div>
    );
  }

  if (!transcript) {
    return (
      <div style={{ padding: 16, textAlign: 'center', color: 'var(--zoom-text-secondary)', fontSize: 13 }}>
        Waiting for transcript data…
      </div>
    );
  }

  // Bold glossary terms in the transcript
  const glossaryTerms = glossary.map(g => g.term).filter(t => t.length > 2);
  const highlighted = highlightTerms(transcript, glossaryTerms);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: 'var(--zoom-text-secondary)' }}>
          {segmentCount} segments — updates every 10s
        </span>
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
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
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
