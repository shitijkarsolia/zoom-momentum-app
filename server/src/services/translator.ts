import { prisma } from '../db.js';
import { callAI } from '../ai-client.js';

const LANG_NAMES: Record<string, string> = {
  es: 'Spanish',
  zh: 'Simplified Chinese',
  hi: 'Hindi',
  ar: 'Arabic',
  fr: 'French',
};

export const SUPPORTED_LANGS = new Set(['en', 'es', 'zh', 'hi', 'ar', 'fr']);

const activeLocks = new Map<string, Promise<void>>();

function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const prev = activeLocks.get(key) ?? Promise.resolve();
  const next = prev.then(fn, fn);
  activeLocks.set(key, next.then(() => {}, () => {}));
  return next;
}

interface SourceSegment {
  seqNo: number;
  speaker: string;
  text: string;
  timestamp: bigint;
}

const BATCH_SIZE = 10;

export async function getTranslatedSegments(
  meetingId: string,
  lang: string,
  sourceSegments: SourceSegment[],
): Promise<Array<{ speaker: string; text: string; timestamp: number }>> {
  if (!LANG_NAMES[lang]) return sourceSegments.map(s => ({ speaker: s.speaker, text: s.text, timestamp: Number(s.timestamp) }));
  if (sourceSegments.length === 0) return [];

  return withLock(`seg:${meetingId}:${lang}`, async () => {
    const cached = await prisma.translatedSegment.findMany({
      where: { meetingId, lang },
      select: { seqNo: true, speaker: true, text: true, timestamp: true },
    });
    const cachedMap = new Map(cached.map(c => [c.seqNo, c]));

    const uncached = sourceSegments.filter(s => !cachedMap.has(Number(s.seqNo)));

    for (let i = 0; i < uncached.length; i += BATCH_SIZE) {
      const batch = uncached.slice(i, i + BATCH_SIZE);
      try {
        const input = batch.map(s => ({ seqNo: Number(s.seqNo), speaker: s.speaker, text: s.text }));
        const prompt = `Translate the following lecture transcript segments to ${LANG_NAMES[lang]}.
Return ONLY a valid JSON array of objects with "seqNo", "speaker", "text" fields.
Keep speaker names unchanged. Translate only the "text" field.
Preserve technical terms (code keywords, formulas, proper nouns) in English on first use.
Natural conversational tone, not literal.

Input:
${JSON.stringify(input)}`;

        const raw = await callAI(prompt, { temperature: 0.2, maxTokens: 2000, timeout: 25000 });
        const parsed = JSON.parse(extractJson(raw)) as Array<{ seqNo: number; speaker: string; text: string }>;

        for (const item of parsed) {
          const src = batch.find(s => Number(s.seqNo) === item.seqNo);
          if (!src) continue;
          await prisma.translatedSegment.upsert({
            where: { meetingId_seqNo_lang: { meetingId, seqNo: item.seqNo, lang } },
            update: { text: item.text, speaker: item.speaker, timestamp: src.timestamp },
            create: { meetingId, seqNo: item.seqNo, lang, text: item.text, speaker: item.speaker, timestamp: src.timestamp },
          });
          cachedMap.set(item.seqNo, { seqNo: item.seqNo, speaker: item.speaker, text: item.text, timestamp: src.timestamp });
        }
      } catch (err) {
        console.warn(`[translator] segment batch failed for ${lang}:`, (err as Error).message);
        for (const s of batch) {
          cachedMap.set(Number(s.seqNo), { seqNo: Number(s.seqNo), speaker: s.speaker, text: s.text, timestamp: s.timestamp });
        }
      }
    }

    return sourceSegments.map(s => {
      const t = cachedMap.get(Number(s.seqNo));
      return t
        ? { speaker: t.speaker, text: t.text, timestamp: Number(t.timestamp) }
        : { speaker: s.speaker, text: s.text, timestamp: Number(s.timestamp) };
    });
  });
}

interface SourceTerm {
  term: string;
  definition: string;
}

export async function getTranslatedGlossary(
  meetingId: string,
  lang: string,
  sourceTerms: SourceTerm[],
): Promise<Array<{ term: string; definition: string }>> {
  if (!LANG_NAMES[lang]) return sourceTerms;
  if (sourceTerms.length === 0) return [];

  return withLock(`glos:${meetingId}:${lang}`, async () => {
    const cached = await prisma.translatedGlossary.findMany({
      where: { meetingId, lang },
      select: { termKey: true, term: true, definition: true },
    });
    const cachedMap = new Map(cached.map(c => [c.termKey, c]));

    const uncached = sourceTerms.filter(t => !cachedMap.has(t.term.toLowerCase()));

    if (uncached.length > 0) {
      try {
        const input = uncached.map(t => ({ termKey: t.term.toLowerCase(), term: t.term, definition: t.definition }));
        const prompt = `Translate these academic glossary terms to ${LANG_NAMES[lang]}.
Return ONLY a valid JSON array of objects with "termKey", "term", "definition" fields.
"termKey" must be the original English term (unchanged, lowercase).
"term" is the translated term name. "definition" is the translated definition.

Input:
${JSON.stringify(input)}`;

        const raw = await callAI(prompt, { temperature: 0.2, maxTokens: 2000, timeout: 25000 });
        const parsed = JSON.parse(extractJson(raw)) as Array<{ termKey: string; term: string; definition: string }>;

        for (const item of parsed) {
          await prisma.translatedGlossary.upsert({
            where: { meetingId_termKey_lang: { meetingId, termKey: item.termKey, lang } },
            update: { term: item.term, definition: item.definition },
            create: { meetingId, termKey: item.termKey, lang, term: item.term, definition: item.definition },
          });
          cachedMap.set(item.termKey, item);
        }
      } catch (err) {
        console.warn(`[translator] glossary failed for ${lang}:`, (err as Error).message);
      }
    }

    return sourceTerms.map(t => {
      const c = cachedMap.get(t.term.toLowerCase());
      return c ? { term: c.term, definition: c.definition } : t;
    });
  });
}

function extractJson(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) raw = fenced[1]!;

  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) return raw;

  try {
    JSON.parse(match[0]);
    return match[0];
  } catch {
    const cleaned = match[0]
      .replace(/,\s*([}\]])/g, '$1')
      .replace(/[\x00-\x1f]/g, ' ');
    return cleaned;
  }
}
