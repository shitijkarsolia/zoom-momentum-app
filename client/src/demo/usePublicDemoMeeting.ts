import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import type { Question } from '../types/messages';
import { demoScenario } from './demoScenario';
import {
  applyPublicDemoEvent,
  createPublicDemoState,
  getCurrentTranscriptSegments,
  type PublicDemoEvent,
} from './publicDemoState';

const LECTURE_STEP_MS = 8_000;
const LECTURE_TIMER_MS = 3_200;
const AUTO_BOOKMARK_AT_MS = 38_000;

export function usePublicDemoMeeting() {
  const [state, dispatch] = useReducer(
    (current: ReturnType<typeof createPublicDemoState>, event: PublicDemoEvent) =>
      applyPublicDemoEvent(current, event),
    demoScenario,
    createPublicDemoState,
  );
  const stateRef = useRef(state);
  const autoBookmarkSentRef = useRef(false);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch({ type: 'START_ANCHOR' });
      dispatch({ type: 'ADVANCE_TIME', elapsedMs: 0 });
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!state.anchorLive || state.meetingEnded) return;
    const interval = setInterval(() => {
      const current = stateRef.current;
      const nextElapsed = Math.min(
        current.elapsedMs + LECTURE_STEP_MS,
        demoScenario.transcriptBeats[demoScenario.transcriptBeats.length - 1]?.atMs ?? current.elapsedMs,
      );
      dispatch({ type: 'ADVANCE_TIME', elapsedMs: nextElapsed });
    }, LECTURE_TIMER_MS);
    return () => clearInterval(interval);
  }, [state.anchorLive, state.meetingEnded]);

  useEffect(() => {
    if (state.elapsedMs < AUTO_BOOKMARK_AT_MS || autoBookmarkSentRef.current) return;
    autoBookmarkSentRef.current = true;
    dispatch({ type: 'AUTO_BOOKMARK_CUE' });
  }, [state.elapsedMs]);

  useEffect(() => {
    if (state.pulse.phase !== 'live') return;
    const timers = [
      setTimeout(() => dispatch({ type: 'ADD_POLL_RESPONSES', count: 2 }), 900),
      setTimeout(() => dispatch({ type: 'ADD_POLL_RESPONSES', count: 5 }), 1_900),
      setTimeout(() => dispatch({ type: 'ADD_POLL_RESPONSES', count: 8 }), 3_100),
    ];
    return () => timers.forEach(clearTimeout);
  }, [state.pulse.phase, state.pulse.activePoll?.pollId]);

  useEffect(() => {
    if (state.arena.phase !== 'question') return;
    const interval = setInterval(() => dispatch({ type: 'TICK_ARENA' }), 1_000);
    const answerTimer = setTimeout(() => dispatch({ type: 'ADD_ARENA_ANSWERS' }), 1_200);
    return () => {
      clearInterval(interval);
      clearTimeout(answerTimer);
    };
  }, [state.arena.phase, state.arena.currentIndex]);

  // Reveal the leaderboard shortly after the demo student locks in an answer,
  // or when the question timer runs out — whichever comes first.
  useEffect(() => {
    if (state.arena.phase !== 'question' || state.arena.selectedOption === null) return;
    const timer = setTimeout(() => dispatch({ type: 'SHOW_ARENA_LEADERBOARD' }), 2_200);
    return () => clearTimeout(timer);
  }, [state.arena.phase, state.arena.selectedOption]);

  useEffect(() => {
    if (state.arena.phase !== 'question' || state.arena.countdown > 0) return;
    const timer = setTimeout(() => {
      dispatch({ type: 'ADD_ARENA_ANSWERS' });
      dispatch({ type: 'SHOW_ARENA_LEADERBOARD' });
    }, 800);
    return () => clearTimeout(timer);
  }, [state.arena.phase, state.arena.countdown]);

  const transcriptSegments = useMemo(() => getCurrentTranscriptSegments(state), [state]);

  const resetDemo = useCallback(() => {
    autoBookmarkSentRef.current = false;
    dispatch({ type: 'RESET_DEMO' });
    setTimeout(() => {
      dispatch({ type: 'START_ANCHOR' });
      dispatch({ type: 'ADVANCE_TIME', elapsedMs: 0 });
    }, 200);
  }, []);

  return {
    state,
    transcriptSegments,
    dispatch,
    actions: {
      startAnchor: () => {
        dispatch({ type: 'START_ANCHOR' });
        dispatch({ type: 'ADVANCE_TIME', elapsedMs: Math.max(0, stateRef.current.elapsedMs) });
      },
      stopAnchor: () => dispatch({ type: 'STOP_ANCHOR' }),
      generatePoll: () => dispatch({ type: 'GENERATE_POLL' }),
      updatePollDraft: (updates: { question?: string; options?: string[]; isFallback?: boolean }) =>
        dispatch({ type: 'UPDATE_POLL_DRAFT', updates }),
      launchPoll: () => dispatch({ type: 'LAUNCH_POLL' }),
      selectPollOption: (optionIndex: number) => dispatch({ type: 'SELECT_POLL_OPTION', optionIndex }),
      submitPollAnswer: () => dispatch({ type: 'SUBMIT_POLL_ANSWER' }),
      endPoll: () => dispatch({ type: 'END_POLL' }),
      resetPoll: () => dispatch({ type: 'RESET_POLL' }),
      generateArena: () => dispatch({ type: 'GENERATE_ARENA' }),
      appendArenaQuestions: () => dispatch({ type: 'APPEND_ARENA_QUESTIONS' }),
      updateArenaQuestion: (index: number, updates: Partial<Question>) =>
        dispatch({ type: 'UPDATE_ARENA_QUESTION', index, updates }),
      startArena: () => dispatch({ type: 'START_ARENA' }),
      selectArenaOption: (optionIndex: number) => dispatch({ type: 'SELECT_ARENA_OPTION', optionIndex }),
      showArenaLeaderboard: () => dispatch({ type: 'SHOW_ARENA_LEADERBOARD' }),
      nextArenaQuestion: () => dispatch({ type: 'NEXT_ARENA_QUESTION' }),
      endArena: () => dispatch({ type: 'END_ARENA' }),
      resetArena: () => dispatch({ type: 'RESET_ARENA' }),
      bookmarkCurrentTopic: (topicOverride?: string) => {
        dispatch({ type: 'BOOKMARK_CURRENT_TOPIC', topicOverride });
        return true;
      },
      removeBookmark: (index: number) => dispatch({ type: 'REMOVE_BOOKMARK', index }),
      endClass: () => dispatch({ type: 'END_CLASS' }),
      resetDemo,
    },
  };
}
