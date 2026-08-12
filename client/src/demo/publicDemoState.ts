import type { LeaderboardEntry, Poll, Question, Topic, GlossaryEntry } from '../types/messages';
import type { AnchorBookmark } from '../hooks/useLiveAnchor';
import type { DemoScenario, DemoTranscriptBeat, DemoRecoveryItem } from './demoScenario';

export interface DemoTranscriptSegment {
  speaker: string;
  text: string;
  timestamp: number;
}

export type DemoPulsePhase = 'idle' | 'generating' | 'preview' | 'live' | 'results';
export type DemoArenaHostPhase = 'idle' | 'loading' | 'ready' | 'question' | 'leaderboard' | 'finished';
export type DemoArenaStudentPhase = 'waiting' | 'question' | 'answered' | 'leaderboard' | 'finished';

interface DemoPollDraft {
  question: string;
  options: string[];
  isFallback: boolean;
}

interface DemoPulseState {
  phase: DemoPulsePhase;
  draft: DemoPollDraft | null;
  activePoll: Poll | null;
  responses: Map<string, number>;
  selectedOption: number | null;
  hasAnswered: boolean;
  studentResults: Poll | null;
}

interface DemoArenaState {
  phase: DemoArenaHostPhase;
  studentPhase: DemoArenaStudentPhase;
  questions: Question[];
  currentIndex: number;
  responses: Map<string, { optionIndex: number; timeMs: number; name: string }>;
  scores: Map<string, { name: string; score: number }>;
  leaderboard: LeaderboardEntry[];
  questionAccuracy: { correct: number; total: number }[];
  selectedOption: number | null;
  correctIndex: number | null;
  explanation: string;
  finalLeaderboard: LeaderboardEntry[];
  countdown: number;
}

export interface PublicDemoState {
  scenario: DemoScenario;
  startedAt: number;
  elapsedMs: number;
  anchorLive: boolean;
  topics: Topic[];
  currentTopicId: string;
  glossary: GlossaryEntry[];
  bookmarks: AnchorBookmark[];
  recoveryItems: DemoRecoveryItem[];
  meetingEnded: boolean;
  activeSpeaker: string | null;
  pulse: DemoPulseState;
  arena: DemoArenaState;
}

export type PublicDemoEvent =
  | { type: 'ADVANCE_TIME'; elapsedMs: number }
  | { type: 'START_ANCHOR' }
  | { type: 'STOP_ANCHOR' }
  | { type: 'GENERATE_POLL' }
  | { type: 'UPDATE_POLL_DRAFT'; updates: Partial<DemoPollDraft> }
  | { type: 'LAUNCH_POLL' }
  | { type: 'ADD_POLL_RESPONSES'; count?: number }
  | { type: 'SELECT_POLL_OPTION'; optionIndex: number }
  | { type: 'SUBMIT_POLL_ANSWER' }
  | { type: 'END_POLL' }
  | { type: 'RESET_POLL' }
  | { type: 'GENERATE_ARENA' }
  | { type: 'APPEND_ARENA_QUESTIONS' }
  | { type: 'UPDATE_ARENA_QUESTION'; index: number; updates: Partial<Question> }
  | { type: 'START_ARENA' }
  | { type: 'TICK_ARENA' }
  | { type: 'ADD_ARENA_ANSWERS' }
  | { type: 'SELECT_ARENA_OPTION'; optionIndex: number }
  | { type: 'SHOW_ARENA_LEADERBOARD' }
  | { type: 'NEXT_ARENA_QUESTION' }
  | { type: 'END_ARENA' }
  | { type: 'RESET_ARENA' }
  | { type: 'BOOKMARK_CURRENT_TOPIC'; topicOverride?: string }
  | { type: 'AUTO_BOOKMARK_CUE' }
  | { type: 'REMOVE_BOOKMARK'; index: number }
  | { type: 'END_CLASS' }
  | { type: 'RESET_DEMO' };

const DEMO_STUDENT_ID = 'demo-student';
const DEMO_STUDENT_NAME = 'Advikaa Kapil';
const QUESTION_TIME_SEC = 15;

export function createPublicDemoState(scenario: DemoScenario): PublicDemoState {
  return {
    scenario,
    startedAt: Date.now(),
    elapsedMs: -1,
    anchorLive: false,
    topics: [],
    currentTopicId: '',
    glossary: [],
    bookmarks: [],
    recoveryItems: [],
    meetingEnded: false,
    activeSpeaker: null,
    pulse: {
      phase: 'idle',
      draft: null,
      activePoll: null,
      responses: new Map(),
      selectedOption: null,
      hasAnswered: false,
      studentResults: null,
    },
    arena: {
      phase: 'idle',
      studentPhase: 'waiting',
      questions: [],
      currentIndex: 0,
      responses: new Map(),
      scores: new Map(),
      leaderboard: [],
      questionAccuracy: [],
      selectedOption: null,
      correctIndex: null,
      explanation: '',
      finalLeaderboard: [],
      countdown: 0,
    },
  };
}

export function getCurrentTranscriptSegments(state: PublicDemoState): DemoTranscriptSegment[] {
  return state.scenario.transcriptBeats
    .filter(beat => beat.atMs <= state.elapsedMs)
    .map(beat => transcriptBeatToSegment(state.startedAt, beat));
}

export function applyPublicDemoEvent(state: PublicDemoState, event: PublicDemoEvent): PublicDemoState {
  if (event.type === 'RESET_DEMO') {
    return createPublicDemoState(state.scenario);
  }

  switch (event.type) {
    case 'ADVANCE_TIME':
      return syncLectureProgress({ ...state, elapsedMs: Math.max(state.elapsedMs, event.elapsedMs) });
    case 'START_ANCHOR':
      return syncLectureProgress({ ...state, anchorLive: true, activeSpeaker: state.scenario.hostName });
    case 'STOP_ANCHOR':
      return { ...state, anchorLive: false, activeSpeaker: null };
    case 'GENERATE_POLL':
      return {
        ...state,
        pulse: {
          ...state.pulse,
          phase: 'preview',
          draft: {
            question: state.scenario.poll.question,
            options: [...state.scenario.poll.options],
            isFallback: false,
          },
          studentResults: null,
        },
      };
    case 'UPDATE_POLL_DRAFT':
      return {
        ...state,
        pulse: state.pulse.draft
          ? { ...state.pulse, draft: { ...state.pulse.draft, ...event.updates } }
          : state.pulse,
      };
    case 'LAUNCH_POLL':
      return launchPoll(state);
    case 'ADD_POLL_RESPONSES':
      return addPollResponses(state, event.count ?? state.scenario.students.length);
    case 'SELECT_POLL_OPTION':
      return {
        ...state,
        pulse: state.pulse.hasAnswered ? state.pulse : { ...state.pulse, selectedOption: event.optionIndex },
      };
    case 'SUBMIT_POLL_ANSWER':
      return submitPollAnswer(state);
    case 'END_POLL':
      return endPoll(state);
    case 'RESET_POLL':
      return {
        ...state,
        pulse: {
          phase: 'idle',
          draft: null,
          activePoll: null,
          responses: new Map(),
          selectedOption: null,
          hasAnswered: false,
          studentResults: null,
        },
      };
    case 'GENERATE_ARENA':
      return {
        ...state,
        arena: {
          ...createPublicDemoState(state.scenario).arena,
          phase: 'ready',
          questions: [...state.scenario.questions],
        },
      };
    case 'APPEND_ARENA_QUESTIONS':
      return {
        ...state,
        arena: {
          ...state.arena,
          questions: [...state.arena.questions, ...state.scenario.questions],
        },
      };
    case 'UPDATE_ARENA_QUESTION':
      return updateArenaQuestion(state, event.index, event.updates);
    case 'START_ARENA':
      return startArena(state);
    case 'TICK_ARENA':
      return {
        ...state,
        arena: {
          ...state.arena,
          countdown: Math.max(0, state.arena.countdown - 1),
        },
      };
    case 'ADD_ARENA_ANSWERS':
      return addArenaAnswers(state);
    case 'SELECT_ARENA_OPTION':
      return selectArenaOption(state, event.optionIndex);
    case 'SHOW_ARENA_LEADERBOARD':
      return showArenaLeaderboard(state);
    case 'NEXT_ARENA_QUESTION':
      return nextArenaQuestion(state);
    case 'END_ARENA':
      return endArena(state);
    case 'RESET_ARENA':
      return { ...state, arena: createPublicDemoState(state.scenario).arena };
    case 'BOOKMARK_CURRENT_TOPIC':
      return addBookmark(state, event.topicOverride);
    case 'AUTO_BOOKMARK_CUE':
      return addBookmark(state, state.scenario.autoBookmarkCue.topic, true, state.scenario.autoBookmarkCue.transcriptSnippet);
    case 'REMOVE_BOOKMARK':
      return {
        ...state,
        bookmarks: state.bookmarks.filter((_, index) => index !== event.index),
      };
    case 'END_CLASS':
      return {
        ...state,
        anchorLive: false,
        meetingEnded: true,
        activeSpeaker: null,
        recoveryItems: state.scenario.recoveryItems,
      };
    default:
      return state;
  }
}

function transcriptBeatToSegment(baseTimestamp: number, beat: DemoTranscriptBeat): DemoTranscriptSegment {
  return {
    speaker: beat.speaker,
    text: beat.text,
    timestamp: baseTimestamp + beat.atMs,
  };
}

function syncLectureProgress(state: PublicDemoState): PublicDemoState {
  const topics = state.scenario.topics
    .filter(topic => topic.revealAtMs <= state.elapsedMs)
    .map(({ revealAtMs, ...topic }) => ({
      ...topic,
      startTime: state.startedAt + revealAtMs,
    }));
  const glossary = state.scenario.glossary
    .filter(entry => entry.revealAtMs <= state.elapsedMs)
    .map(({ revealAtMs, ...entry }) => ({
      ...entry,
      timestamp: state.startedAt + revealAtMs,
    }));
  const currentTopicId = topics[topics.length - 1]?.id ?? '';

  return {
    ...state,
    topics,
    glossary,
    currentTopicId,
  };
}

function launchPoll(state: PublicDemoState): PublicDemoState {
  if (!state.pulse.draft) return state;
  const poll: Poll = {
    pollId: 'demo-poll-1',
    question: state.pulse.draft.question,
    options: [...state.pulse.draft.options],
  };

  return {
    ...state,
    pulse: {
      ...state.pulse,
      phase: 'live',
      draft: null,
      activePoll: poll,
      responses: new Map(),
      selectedOption: null,
      hasAnswered: false,
      studentResults: null,
    },
  };
}

function addPollResponses(state: PublicDemoState, count: number): PublicDemoState {
  if (state.pulse.phase !== 'live' || !state.pulse.activePoll) return state;
  const responses = new Map(state.pulse.responses);
  for (const student of state.scenario.students.slice(0, count)) {
    responses.set(student.participantId, student.pollAnswerIndex);
  }
  return { ...state, pulse: { ...state.pulse, responses } };
}

function submitPollAnswer(state: PublicDemoState): PublicDemoState {
  if (!state.pulse.activePoll || state.pulse.selectedOption === null || state.pulse.hasAnswered) return state;
  const responses = new Map(state.pulse.responses);
  responses.set(DEMO_STUDENT_ID, state.pulse.selectedOption);
  return {
    ...state,
    pulse: {
      ...state.pulse,
      responses,
      hasAnswered: true,
    },
  };
}

function endPoll(state: PublicDemoState): PublicDemoState {
  if (!state.pulse.activePoll) return state;
  const results: Record<number, number> = {};
  for (const optionIndex of state.pulse.responses.values()) {
    results[optionIndex] = (results[optionIndex] ?? 0) + 1;
  }
  const activePoll: Poll = {
    ...state.pulse.activePoll,
    results,
    totalResponses: state.pulse.responses.size,
  };
  return {
    ...state,
    pulse: {
      ...state.pulse,
      phase: 'results',
      activePoll,
      studentResults: activePoll,
    },
  };
}

function updateArenaQuestion(state: PublicDemoState, index: number, updates: Partial<Question>): PublicDemoState {
  const existing = state.arena.questions[index];
  if (!existing) return state;
  const questions = [...state.arena.questions];
  questions[index] = {
    question: updates.question ?? existing.question,
    options: updates.options ?? existing.options,
    correctIndex: updates.correctIndex ?? existing.correctIndex,
    explanation: updates.explanation ?? existing.explanation,
  };
  return { ...state, arena: { ...state.arena, questions } };
}

function startArena(state: PublicDemoState): PublicDemoState {
  const questions = state.arena.questions.length > 0 ? state.arena.questions : state.scenario.questions;
  if (questions.length === 0) return state;
  return {
    ...state,
    arena: {
      ...state.arena,
      phase: 'question',
      studentPhase: 'question',
      questions,
      currentIndex: 0,
      responses: new Map(),
      selectedOption: null,
      correctIndex: null,
      explanation: '',
      finalLeaderboard: [],
      countdown: QUESTION_TIME_SEC,
    },
  };
}

function addArenaAnswers(state: PublicDemoState): PublicDemoState {
  if (state.arena.phase !== 'question') return state;
  const responses = new Map(state.arena.responses);
  const scores = new Map(state.arena.scores);
  const question = state.arena.questions[state.arena.currentIndex];
  if (!question) return state;

  for (const student of state.scenario.students) {
    const optionIndex = student.arenaAnswers[state.arena.currentIndex] ?? 0;
    const timeMs = student.arenaAnswerMs[state.arena.currentIndex] ?? 2_500;
    if (responses.has(student.participantId)) continue;
    responses.set(student.participantId, { optionIndex, timeMs, name: student.name });
    addArenaScore(scores, student.participantId, student.name, optionIndex, timeMs, question.correctIndex);
  }

  return { ...state, arena: { ...state.arena, responses, scores } };
}

function selectArenaOption(state: PublicDemoState, optionIndex: number): PublicDemoState {
  if (state.arena.phase !== 'question' || state.arena.selectedOption !== null) return state;
  const question = state.arena.questions[state.arena.currentIndex];
  if (!question) return state;
  const responses = new Map(state.arena.responses);
  const scores = new Map(state.arena.scores);
  const timeMs = Math.max(900, (QUESTION_TIME_SEC - state.arena.countdown + 1) * 1000);
  responses.set(DEMO_STUDENT_ID, { optionIndex, timeMs, name: DEMO_STUDENT_NAME });
  addArenaScore(scores, DEMO_STUDENT_ID, DEMO_STUDENT_NAME, optionIndex, timeMs, question.correctIndex);
  return {
    ...state,
    arena: {
      ...state.arena,
      responses,
      scores,
      selectedOption: optionIndex,
      studentPhase: 'answered',
    },
  };
}

function showArenaLeaderboard(state: PublicDemoState): PublicDemoState {
  if (state.arena.phase !== 'question') return state;
  const question = state.arena.questions[state.arena.currentIndex];
  if (!question) return state;
  const leaderboard = buildLeaderboard(state.arena.scores);
  let correct = 0;
  for (const response of state.arena.responses.values()) {
    if (response.optionIndex === question.correctIndex) correct += 1;
  }
  const questionAccuracy = [...state.arena.questionAccuracy];
  questionAccuracy[state.arena.currentIndex] = { correct, total: state.arena.responses.size };

  return {
    ...state,
    arena: {
      ...state.arena,
      phase: 'leaderboard',
      studentPhase: 'leaderboard',
      leaderboard,
      questionAccuracy,
      correctIndex: question.correctIndex,
      explanation: question.explanation,
      countdown: 0,
    },
  };
}

function nextArenaQuestion(state: PublicDemoState): PublicDemoState {
  const nextIndex = state.arena.currentIndex + 1;
  if (nextIndex >= state.arena.questions.length) {
    return endArena(state);
  }
  return {
    ...state,
    arena: {
      ...state.arena,
      phase: 'question',
      studentPhase: 'question',
      currentIndex: nextIndex,
      responses: new Map(),
      selectedOption: null,
      correctIndex: null,
      explanation: '',
      countdown: QUESTION_TIME_SEC,
    },
  };
}

function endArena(state: PublicDemoState): PublicDemoState {
  const leaderboard = state.arena.leaderboard.length > 0
    ? state.arena.leaderboard
    : buildLeaderboard(state.arena.scores);
  return {
    ...state,
    arena: {
      ...state.arena,
      phase: 'finished',
      studentPhase: 'finished',
      leaderboard,
      finalLeaderboard: leaderboard,
      countdown: 0,
    },
  };
}

function addArenaScore(
  scores: Map<string, { name: string; score: number }>,
  participantId: string,
  name: string,
  optionIndex: number,
  timeMs: number,
  correctIndex: number,
) {
  const current = scores.get(participantId) ?? { name, score: 0 };
  if (optionIndex === correctIndex) {
    const speedBonus = Math.max(0, Math.floor((1 - timeMs / (QUESTION_TIME_SEC * 1000)) * 500));
    current.score += 1000 + speedBonus;
  }
  scores.set(participantId, current);
}

function buildLeaderboard(scores: Map<string, { name: string; score: number }>): LeaderboardEntry[] {
  const sorted = Array.from(scores.entries())
    .map(([participantId, { name, score }]) => ({ participantId, name, score, rank: 0 }))
    .sort((a, b) => b.score - a.score);
  const ranked: LeaderboardEntry[] = [];
  for (const [index, entry] of sorted.entries()) {
    const prev = ranked[index - 1];
    ranked.push({ ...entry, rank: prev && prev.score === entry.score ? prev.rank : index + 1 });
  }
  return ranked;
}

function addBookmark(
  state: PublicDemoState,
  topicOverride?: string,
  isAuto = false,
  transcriptSnippet?: string,
): PublicDemoState {
  const currentTopic = state.topics.find(topic => topic.id === state.currentTopicId);
  const topic = topicOverride ?? currentTopic?.title ?? 'Marked for Review';
  if (state.bookmarks.some(bookmark => bookmark.topic === topic && bookmark.isAuto === isAuto)) {
    return state;
  }
  return {
    ...state,
    bookmarks: [
      ...state.bookmarks,
      {
        topic,
        isAuto,
        transcriptSnippet,
        timestamp: state.startedAt + Math.max(0, state.elapsedMs),
      },
    ],
  };
}
