import type { HostTab } from '../../views/HostDashboard';
import type { StudentTab } from '../../views/StudentView';
import type { PublicDemoEvent } from '../publicDemoState';

export type TourPov = 'host' | 'student';
export type TourLayout = 'meeting' | 'split';
export type TourPlacement = 'left' | 'right' | 'top' | 'bottom' | 'center';

export interface TourStep {
  id: string;
  /** Short chip shown above the title, e.g. which seat you're in. */
  chip?: string;
  title: string;
  body: string;
  pov: TourPov;
  layout?: TourLayout;
  panelOpen?: boolean;
  hostTab?: HostTab;
  studentTab?: StudentTab;
  /** CSS selector to spotlight; omit for a centered card. */
  target?: string;
  placement?: TourPlacement;
  /** Demo events dispatched when the step is entered (and replayed on back-navigation). */
  effects?: PublicDemoEvent[];
  /** Shows a "try it yourself" hint on the card. */
  interactive?: boolean;
  nextLabel?: string;
}

export const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to the Zoom Momentum demo',
    body:
      'You are looking at a simulated Zoom meeting — a college lecture already in progress. ' +
      'Momentum is a Zoom App that runs inside the meeting itself, so this walkthrough recreates ' +
      'the real thing: the same app, docked exactly where it runs in Zoom, everything live and ' +
      'clickable. The tour takes about two minutes.',
    pov: 'host',
    panelOpen: false,
    placement: 'center',
    effects: [
      { type: 'START_ANCHOR' },
      { type: 'ADVANCE_TIME', elapsedMs: 0 },
    ],
    nextLabel: 'Start the tour',
  },
  {
    id: 'classroom',
    title: 'A live lecture on Zoom',
    body:
      'Professor Rivera is teaching Intro to AI Systems to nine students. The green ring means ' +
      'she is speaking, and Zoom is transcribing her in real time. Everything you will see next ' +
      'happens without anyone leaving this meeting.',
    pov: 'host',
    panelOpen: false,
    target: '[data-tour="stage"]',
    placement: 'bottom',
    effects: [
      { type: 'START_ANCHOR' },
      { type: 'ADVANCE_TIME', elapsedMs: 8_000 },
    ],
  },
  {
    id: 'apps-button',
    title: 'Momentum lives in the Apps panel',
    body:
      'In a real meeting, professors and students open Momentum from Zoom’s Apps button — ' +
      'no second screen, no separate website, no install for students. Hit Next to open it.',
    pov: 'host',
    panelOpen: false,
    target: '[data-tour="apps-btn"]',
    placement: 'top',
    nextLabel: 'Open Momentum',
  },
  {
    id: 'host-anchor',
    chip: 'Professor seat',
    title: 'You’re the professor now',
    body:
      'This is the host view, docked where Zoom Apps actually live. Live Anchor listens to the ' +
      'lecture through Zoom’s real-time transcript and builds a topic timeline as Professor ' +
      'Rivera speaks — watch new topics appear on their own.',
    pov: 'host',
    hostTab: 'anchor',
    target: '[data-tour="panel"]',
    placement: 'left',
    effects: [{ type: 'ADVANCE_TIME', elapsedMs: 16_000 }],
  },
  {
    id: 'host-transcript',
    chip: 'Professor seat',
    title: 'The raw feed: a live transcript',
    body:
      'Every AI feature is built on this stream. Speaker-attributed captions arrive as the ' +
      'professor talks; topics, glossary terms, polls, and quiz questions are all generated from it.',
    pov: 'host',
    hostTab: 'transcript',
    target: '[data-tour="panel"]',
    placement: 'left',
    effects: [{ type: 'ADVANCE_TIME', elapsedMs: 26_000 }],
  },
  {
    id: 'pulse-generate',
    chip: 'Professor seat',
    title: 'Pulse: read the room in one click',
    body:
      'Momentum just drafted a comprehension check from the last few minutes of lecture. ' +
      'The professor can edit the question or any option before it goes out — try it. ' +
      'When it looks right, Next launches it to every student.',
    pov: 'host',
    hostTab: 'pulse',
    target: '[data-tour="panel"]',
    placement: 'left',
    effects: [{ type: 'GENERATE_POLL' }],
    interactive: true,
    nextLabel: 'Launch the poll',
  },
  {
    id: 'student-poll',
    chip: 'Student seat',
    title: 'Now you’re a student',
    body:
      'You switched seats — you are Shitij Mathur now, and the poll just landed on every student’s ' +
      'panel. Pick an answer and submit it. Your classmates are answering too: watch the ' +
      'checkmarks pop in the gallery.',
    pov: 'student',
    target: '[data-tour="panel"]',
    placement: 'left',
    effects: [{ type: 'LAUNCH_POLL' }],
    interactive: true,
  },
  {
    id: 'pulse-results',
    chip: 'Professor seat',
    title: 'Instant signal, zero grading',
    body:
      'Back in the professor’s seat: the whole class’s answers, tallied the moment the poll ' +
      'closes. One glance shows whether to move on or re-explain — while there is still time to fix it.',
    pov: 'host',
    hostTab: 'pulse',
    target: '[data-tour="panel"]',
    placement: 'left',
    effects: [{ type: 'ADD_POLL_RESPONSES' }, { type: 'END_POLL' }],
  },
  {
    id: 'arena-launch',
    chip: 'Professor seat',
    title: 'Arena: a one-minute game show',
    body:
      'For energy rather than grades, Arena turns the lecture into timed trivia. The questions ' +
      'are AI-written from the transcript and editable before launch. Hit Next to start the game.',
    pov: 'host',
    hostTab: 'arena',
    target: '[data-tour="panel"]',
    placement: 'left',
    effects: [{ type: 'RESET_POLL' }, { type: 'GENERATE_ARENA' }],
    nextLabel: 'Start the game',
  },
  {
    id: 'arena-answer',
    chip: 'Student seat',
    title: 'Race the class',
    body:
      'You’re Shitij again. Answer before the countdown hits zero — faster correct answers score ' +
      'more points, and your classmates are already tapping.',
    pov: 'student',
    target: '[data-tour="panel"]',
    placement: 'left',
    effects: [{ type: 'START_ARENA' }],
    interactive: true,
  },
  {
    id: 'arena-leaderboard',
    chip: 'Professor seat',
    title: 'A live leaderboard',
    body:
      'Scores and per-question accuracy update in real time. The professor sees exactly which ' +
      'concepts landed; students get a very good reason to stay off their phones.',
    pov: 'host',
    hostTab: 'arena',
    target: '[data-tour="panel"]',
    placement: 'left',
    effects: [{ type: 'ADD_ARENA_ANSWERS' }, { type: 'SHOW_ARENA_LEADERBOARD' }],
  },
  {
    id: 'timeline-bookmarks',
    chip: 'Student seat',
    title: 'Never lose the thread',
    body:
      'Students can bookmark any topic with one tap — try it on a topic card. Momentum also ' +
      'listens for cues: when Professor Rivera said “this will be important for the exam,” it ' +
      'auto-bookmarked that moment. Check the Bookmarks tab.',
    pov: 'student',
    studentTab: 'timeline',
    target: '[data-tour="panel"]',
    placement: 'left',
    effects: [
      { type: 'RESET_ARENA' },
      { type: 'ADVANCE_TIME', elapsedMs: 50_000 },
      { type: 'AUTO_BOOKMARK_CUE' },
    ],
    interactive: true,
  },
  {
    id: 'glossary',
    chip: 'Student seat',
    title: 'A glossary that writes itself',
    body:
      'Every technical term from the lecture, defined in real time and searchable. The language ' +
      'dropdown in the header translates the transcript and glossary into six languages — ' +
      'and late joiners can catch up on everything they missed in seconds.',
    pov: 'student',
    studentTab: 'glossary',
    target: '[data-tour="panel"]',
    placement: 'left',
    effects: [{ type: 'ADVANCE_TIME', elapsedMs: 64_000 }],
  },
  {
    id: 'recovery',
    chip: 'Student seat',
    title: 'Class ends. Momentum doesn’t.',
    body:
      'The professor just ended class, and every student instantly received a recovery pack: ' +
      'their bookmarks matched with plain-language explanations, practice prompts, and notes ' +
      'they can download as Markdown.',
    pov: 'student',
    target: '[data-tour="panel"]',
    placement: 'left',
    effects: [{ type: 'END_CLASS' }],
  },
  {
    id: 'finale',
    title: 'The whole loop, side by side',
    body:
      'Professor on the left, the class in the middle, a student on the right — Momentum keeping ' +
      'a lecture honest in both directions. It’s all yours now: reset the class, run polls, ' +
      'start games, and click anything. Everything is live.',
    pov: 'student',
    layout: 'split',
    placement: 'center',
    nextLabel: 'Explore freely',
  },
];
