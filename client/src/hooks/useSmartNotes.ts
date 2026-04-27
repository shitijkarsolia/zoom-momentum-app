import { useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_PREFIX = 'zm-smart-notes:';
const SAVE_DEBOUNCE_MS = 500;

interface PersistedNotes {
  freeform: string;
  lastSaved: number;
}

function storageKey(meetingId: string): string {
  return `${STORAGE_PREFIX}${meetingId || 'unknown'}`;
}

function loadNotes(meetingId: string): PersistedNotes {
  if (typeof window === 'undefined') return { freeform: '', lastSaved: 0 };
  try {
    const raw = window.localStorage.getItem(storageKey(meetingId));
    if (!raw) return { freeform: '', lastSaved: 0 };
    const parsed = JSON.parse(raw) as Partial<PersistedNotes>;
    return {
      freeform: typeof parsed.freeform === 'string' ? parsed.freeform : '',
      lastSaved: typeof parsed.lastSaved === 'number' ? parsed.lastSaved : 0,
    };
  } catch {
    return { freeform: '', lastSaved: 0 };
  }
}

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function useSmartNotes(meetingId: string) {
  const [freeform, setFreeformState] = useState<string>('');
  const [lastSaved, setLastSaved] = useState<number>(0);
  const [saveError, setSaveError] = useState<string | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadedKeyRef = useRef<string>('');
  const persistedValueRef = useRef<string>('');

  // Load when meetingId changes
  useEffect(() => {
    const loaded = loadNotes(meetingId);
    persistedValueRef.current = loaded.freeform;
    setFreeformState(loaded.freeform);
    setLastSaved(loaded.lastSaved);
    loadedKeyRef.current = storageKey(meetingId);
  }, [meetingId]);

  const freeformRef = useRef<string>('');
  freeformRef.current = freeform;

  // Debounced auto-save on user-initiated freeform changes
  useEffect(() => {
    if (!loadedKeyRef.current) return;
    if (freeform === persistedValueRef.current) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const now = Date.now();
      try {
        window.localStorage.setItem(
          loadedKeyRef.current,
          JSON.stringify({ freeform, lastSaved: now } satisfies PersistedNotes),
        );
        persistedValueRef.current = freeform;
        setLastSaved(now);
      } catch (err) {
        console.error('[smart-notes] save failed:', err);
        const isQuota = err instanceof DOMException && (err.name === 'QuotaExceededError' || err.code === 22);
        setSaveError(isQuota ? 'Storage full — notes may not be saved' : 'Save failed');
      }
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [freeform]);

  // Flush unsaved changes on unmount
  useEffect(() => {
    return () => {
      if (!loadedKeyRef.current) return;
      if (freeformRef.current === persistedValueRef.current) return;
      try {
        window.localStorage.setItem(
          loadedKeyRef.current,
          JSON.stringify({ freeform: freeformRef.current, lastSaved: Date.now() } satisfies PersistedNotes),
        );
      } catch { /* best-effort */ }
    };
  }, []);

  const setNotes = useCallback((value: string) => {
    setFreeformState(value);
  }, []);

  const appendToNotes = useCallback((snippet: string) => {
    setFreeformState(prev => {
      const trimmedPrev = prev.replace(/\s+$/, '');
      const separator = trimmedPrev.length === 0 ? '' : '\n\n';
      return `${trimmedPrev}${separator}${snippet}`;
    });
  }, []);

  const clearNotes = useCallback(() => {
    setFreeformState('');
  }, []);

  return {
    notes: freeform,
    setNotes,
    appendToNotes,
    clearNotes,
    lastSaved,
    wordCount: countWords(freeform),
    saveError,
  };
}
