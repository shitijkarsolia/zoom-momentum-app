import { useState, useEffect } from 'react';
import type { Topic, GlossaryEntry } from '../../types/messages';
import type { AnchorBookmark } from '../../hooks/useLiveAnchor';
import { buildMarkdown, buildFilename } from './buildMarkdown';
import { downloadMarkdown, copyToClipboard } from './downloadFile';

interface SmartNotesPanelProps {
  meetingId: string;
  userName?: string;
  notes: string;
  setNotes: (value: string) => void;
  clearNotes: () => void;
  lastSaved: number;
  wordCount: number;
  saveError?: string | null;
  topics: Topic[];
  glossary: GlossaryEntry[];
  bookmarks: AnchorBookmark[];
}

function relativeTime(ms: number): string {
  if (!ms) return 'Not saved yet';
  const diff = Date.now() - ms;
  if (diff < 5_000) return 'Saved just now';
  if (diff < 60_000) return `Saved ${Math.floor(diff / 1000)}s ago`;
  if (diff < 3_600_000) return `Saved ${Math.floor(diff / 60_000)}m ago`;
  return `Saved ${new Date(ms).toLocaleTimeString()}`;
}

export function SmartNotesPanel({
  meetingId,
  userName,
  notes,
  setNotes,
  clearNotes,
  lastSaved,
  wordCount,
  saveError,
  topics,
  glossary,
  bookmarks,
}: SmartNotesPanelProps) {
  const [includesOpen, setIncludesOpen] = useState(false);
  const [actionToast, setActionToast] = useState<string | null>(null);
  const [savedLabel, setSavedLabel] = useState<string>(relativeTime(lastSaved));

  useEffect(() => {
    setSavedLabel(relativeTime(lastSaved));
    const interval = setInterval(() => setSavedLabel(relativeTime(lastSaved)), 5_000);
    return () => clearInterval(interval);
  }, [lastSaved]);

  useEffect(() => {
    if (!actionToast) return;
    const timer = setTimeout(() => setActionToast(null), 2200);
    return () => clearTimeout(timer);
  }, [actionToast]);

  const handleDownload = () => {
    const content = buildMarkdown({
      meetingId,
      userName,
      freeform: notes,
      topics,
      glossary,
      bookmarks,
    });
    const filename = buildFilename(meetingId);
    downloadMarkdown(filename, content);
    setActionToast(`Downloaded ${filename}`);
  };

  const handleCopy = async () => {
    const content = buildMarkdown({
      meetingId,
      userName,
      freeform: notes,
      topics,
      glossary,
      bookmarks,
    });
    const ok = await copyToClipboard(content);
    setActionToast(ok ? 'Copied notes to clipboard' : 'Copy failed -- try Download');
  };

  const handleClear = () => {
    if (notes.trim().length === 0) return;
    if (window.confirm('Clear your typed notes? Topics, glossary, and bookmarks will not be affected.')) {
      clearNotes();
      setActionToast('Notes cleared');
    }
  };

  const includesTotal = topics.length + glossary.length + bookmarks.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: '100%' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>My Notes</div>
          <div style={{ fontSize: 11, color: 'var(--zoom-text-secondary)' }}>
            {wordCount} {wordCount === 1 ? 'word' : 'words'} · {savedLabel}
          </div>
          {saveError && (
            <div style={{ fontSize: 11, color: '#dc2626', fontWeight: 500 }}>{saveError}</div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button
            className="btn btn-secondary"
            style={{ fontSize: 11, padding: '4px 10px' }}
            onClick={handleCopy}
            disabled={wordCount === 0 && includesTotal === 0}
            title="Copy formatted notes to clipboard"
          >
            Copy
          </button>
          <button
            className="btn btn-primary"
            style={{ fontSize: 11, padding: '4px 10px' }}
            onClick={handleDownload}
            disabled={wordCount === 0 && includesTotal === 0}
            title="Download as Markdown file"
          >
            Download .md
          </button>
        </div>
      </div>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder={'Type your notes here...\n\nTip: tap "+ Note" on any topic, glossary term, or bookmark to drop it into your notes.'}
        aria-label="Freeform notes"
        spellCheck
        style={{
          flex: 1,
          minHeight: 220,
          width: '100%',
          padding: 12,
          borderRadius: 8,
          border: '1px solid var(--zoom-border)',
          background: 'var(--zoom-bg)',
          color: 'var(--zoom-text)',
          fontSize: 13,
          lineHeight: 1.55,
          fontFamily: 'inherit',
          resize: 'vertical',
          boxSizing: 'border-box',
          outline: 'none',
        }}
      />

      <div style={{
        border: '1px solid var(--zoom-border)',
        borderRadius: 8,
        background: 'var(--zoom-bg)',
        overflow: 'hidden',
      }}>
        <button
          onClick={() => setIncludesOpen(v => !v)}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            padding: '8px 12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--zoom-text)',
          }}
          aria-expanded={includesOpen}
        >
          <span>What's in your export</span>
          <span style={{ color: 'var(--zoom-text-secondary)' }}>
            {topics.length} topics · {glossary.length} terms · {bookmarks.length} bookmarks {includesOpen ? '▾' : '▸'}
          </span>
        </button>
        {includesOpen && (
          <div style={{ padding: '0 12px 10px', fontSize: 11, color: 'var(--zoom-text-secondary)', lineHeight: 1.6 }}>
            <div>Your downloaded file will include:</div>
            <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
              <li>Your typed notes above</li>
              <li>{topics.length} topic{topics.length === 1 ? '' : 's'} covered (titles + bullets)</li>
              <li>{glossary.length} glossary term{glossary.length === 1 ? '' : 's'} with definitions and formulas</li>
              <li>{bookmarks.length} bookmark{bookmarks.length === 1 ? '' : 's'} with timestamps</li>
            </ul>
          </div>
        )}
      </div>

      {wordCount > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleClear}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              fontSize: 11,
              color: 'var(--zoom-text-secondary)',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
            title="Clear typed notes only"
          >
            Clear my notes
          </button>
        </div>
      )}

      {actionToast && (
        <div className="bookmark-toast" style={{ background: 'var(--zoom-brand, #0E71EB)' }}>
          {actionToast}
        </div>
      )}
    </div>
  );
}
