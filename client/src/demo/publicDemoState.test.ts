import { describe, expect, it } from 'vitest';
import {
  applyPublicDemoEvent,
  createPublicDemoState,
  getCurrentTranscriptSegments,
} from './publicDemoState';
import { demoScenario } from './demoScenario';

describe('public demo state', () => {
  it('reveals lecture beats, topics, and glossary entries as time advances', () => {
    const initial = createPublicDemoState(demoScenario);

    expect(initial.topics).toHaveLength(0);
    expect(getCurrentTranscriptSegments(initial)).toHaveLength(0);

    const advanced = applyPublicDemoEvent(initial, { type: 'ADVANCE_TIME', elapsedMs: 24_000 });

    expect(getCurrentTranscriptSegments(advanced).map(segment => segment.text)).toEqual([
      demoScenario.transcriptBeats[0]!.text,
      demoScenario.transcriptBeats[1]!.text,
      demoScenario.transcriptBeats[2]!.text,
    ]);
    expect(advanced.topics.map(topic => topic.title)).toEqual([
      demoScenario.topics[0]!.title,
      demoScenario.topics[1]!.title,
    ]);
    expect(advanced.glossary.map(entry => entry.term)).toContain('Neural network');
  });

  it('launches a poll and records deterministic mock student responses', () => {
    const preview = applyPublicDemoEvent(createPublicDemoState(demoScenario), { type: 'GENERATE_POLL' });
    const live = applyPublicDemoEvent(preview, { type: 'LAUNCH_POLL' });
    const withResponses = applyPublicDemoEvent(live, { type: 'ADD_POLL_RESPONSES', count: 4 });
    const results = applyPublicDemoEvent(withResponses, { type: 'END_POLL' });

    expect(preview.pulse.phase).toBe('preview');
    expect(live.pulse.phase).toBe('live');
    expect(withResponses.pulse.responses.size).toBe(4);
    expect(results.pulse.phase).toBe('results');
    expect(results.pulse.activePoll?.totalResponses).toBe(4);
  });

  it('scores mock arena answers and exposes the final leaderboard', () => {
    let state = applyPublicDemoEvent(createPublicDemoState(demoScenario), { type: 'GENERATE_ARENA' });
    state = applyPublicDemoEvent(state, { type: 'START_ARENA' });
    state = applyPublicDemoEvent(state, { type: 'ADD_ARENA_ANSWERS' });
    state = applyPublicDemoEvent(state, { type: 'SHOW_ARENA_LEADERBOARD' });
    state = applyPublicDemoEvent(state, { type: 'NEXT_ARENA_QUESTION' });
    state = applyPublicDemoEvent(state, { type: 'ADD_ARENA_ANSWERS' });
    state = applyPublicDemoEvent(state, { type: 'SHOW_ARENA_LEADERBOARD' });
    state = applyPublicDemoEvent(state, { type: 'END_ARENA' });

    expect(state.arena.phase).toBe('finished');
    expect(state.arena.leaderboard.length).toBeGreaterThan(0);
    expect(state.arena.leaderboard[0]!.rank).toBe(1);
    expect(state.arena.questionAccuracy).toHaveLength(2);
  });

  it('bookmarks the current topic and ends class with recovery items ready', () => {
    let state = applyPublicDemoEvent(createPublicDemoState(demoScenario), { type: 'ADVANCE_TIME', elapsedMs: 18_000 });
    state = applyPublicDemoEvent(state, { type: 'BOOKMARK_CURRENT_TOPIC' });
    state = applyPublicDemoEvent(state, { type: 'AUTO_BOOKMARK_CUE' });
    state = applyPublicDemoEvent(state, { type: 'END_CLASS' });

    expect(state.meetingEnded).toBe(true);
    expect(state.bookmarks).toHaveLength(2);
    expect(state.recoveryItems).toEqual(demoScenario.recoveryItems);
  });
});
