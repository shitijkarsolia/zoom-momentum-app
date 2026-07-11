import { useState, useEffect, useRef } from 'react';
import type { GlossaryEntry } from '../../types/messages';

interface GlossaryTabProps {
  glossary: GlossaryEntry[];
  lang?: string;
  meetingId?: string;
  onAddToNotes?: (entry: GlossaryEntry) => void;
  disableRemoteTranslations?: boolean;
}

export function GlossaryTab({ glossary, lang = 'en', meetingId, onAddToNotes, disableRemoteTranslations }: GlossaryTabProps) {
  const [filter, setFilter] = useState('');
  const [translatedTerms, setTranslatedTerms] = useState<Array<{ term: string; definition: string }> | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const prevLangRef = useRef(lang);
  const prevCountRef = useRef(glossary.length);

  useEffect(() => {
    if (disableRemoteTranslations || lang === 'en' || !meetingId || glossary.length === 0) {
      setTranslatedTerms(null);
      setIsTranslating(false);
      return;
    }

    const langChanged = prevLangRef.current !== lang;
    const countChanged = prevCountRef.current !== glossary.length;
    prevLangRef.current = lang;
    prevCountRef.current = glossary.length;

    if (!langChanged && !countChanged && translatedTerms) return;

    if (langChanged) setIsTranslating(true);

    const controller = new AbortController();
    fetch('/api/transcript/translate-glossary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        meetingId,
        lang,
        terms: glossary.map(g => ({ term: g.term, definition: g.definition })),
      }),
      signal: controller.signal,
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data.terms)) setTranslatedTerms(data.terms);
        setIsTranslating(false);
      })
      .catch(() => {
        setTranslatedTerms(null);
        setIsTranslating(false);
      });

    return () => controller.abort();
  }, [disableRemoteTranslations, lang, meetingId, glossary.length]);

  const displayGlossary = translatedTerms
    ? glossary.map((g, i) => ({
        ...g,
        term: translatedTerms[i]?.term ?? g.term,
        definition: translatedTerms[i]?.definition ?? g.definition,
      }))
    : glossary;

  const filtered = filter.trim()
    ? displayGlossary.filter(g =>
        g.term.toLowerCase().includes(filter.toLowerCase()) ||
        g.definition.toLowerCase().includes(filter.toLowerCase())
      )
    : displayGlossary;

  // Show newest first
  const sorted = [...filtered].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div>
      <h2 className="card-title">Glossary &amp; Formulas ({glossary.length})</h2>
      <input
        type="text"
        className="glossary-search"
        placeholder="Search terms…"
        value={filter}
        onChange={e => setFilter(e.target.value)}
        style={{
          width: '100%',
          padding: '8px 12px',
          borderRadius: 8,
          border: '1px solid var(--zoom-border)',
          background: 'var(--zoom-bg)',
          color: 'var(--zoom-text)',
          fontSize: 13,
          marginBottom: 12,
          boxSizing: 'border-box',
        }}
      />
      {sorted.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">&#128218;</div>
          <p className="empty-state-text">
            {glossary.length === 0
              ? 'Key terms and formulas will accumulate here during the lecture.'
              : 'No matching terms found.'}
          </p>
        </div>
      ) : (
        <div className="glossary-list" dir={lang === 'ar' ? 'rtl' : undefined} style={{ opacity: isTranslating ? 0.4 : 1, transition: 'opacity 0.3s ease-in' }}>
          {sorted.map((entry, i) => (
            <div key={`${entry.term}-${i}`} className="glossary-entry">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{entry.term}</div>
                  <div style={{ fontSize: 12, color: 'var(--zoom-text-secondary)', marginTop: 2 }}>
                    {entry.definition}
                  </div>
                </div>
                {onAddToNotes && (
                  <button
                    className="btn btn-secondary"
                    style={{ fontSize: 10, padding: '2px 8px', flexShrink: 0 }}
                    onClick={() => onAddToNotes(entry)}
                    aria-label={`Add term ${entry.term} to your notes`}
                  >
                    + Note
                  </button>
                )}
              </div>
              {entry.formula && (
                <code style={{
                  display: 'block',
                  marginTop: 4,
                  fontSize: 12,
                  padding: '4px 8px',
                  background: 'var(--zoom-surface)',
                  borderRadius: 4,
                  fontFamily: 'monospace',
                }}>
                  {entry.formula}
                </code>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
