import { useCallback, useRef, useState } from 'react';
import type { PublicDemoEvent } from '../publicDemoState';
import type { TourStep } from './tourSteps';

export type TourStatus = 'active' | 'done';

interface UseTourOptions {
  steps: TourStep[];
  dispatch: (event: PublicDemoEvent) => void;
  /** Sync presentation state (pov, tabs, layout, panel) to the step being shown. */
  onStepChange: (step: TourStep) => void;
  onFinish: (reason: 'completed' | 'skipped') => void;
}

/**
 * Drives the guided walkthrough. Forward navigation applies each step's demo
 * events; backward navigation resets the scripted meeting and deterministically
 * replays every step up to the target, so Back always lands on the exact state
 * the step was designed around.
 */
export function useTour({ steps, dispatch, onStepChange, onFinish }: UseTourOptions) {
  const [status, setStatus] = useState<TourStatus>('active');
  const [stepIndex, setStepIndex] = useState(0);
  const stepIndexRef = useRef(0);

  const applyEffects = useCallback(
    (step: TourStep) => {
      step.effects?.forEach(dispatch);
    },
    [dispatch],
  );

  const goTo = useCallback(
    (index: number) => {
      const target = Math.max(0, Math.min(index, steps.length - 1));
      const current = stepIndexRef.current;
      if (target > current) {
        for (let i = current + 1; i <= target; i++) applyEffects(steps[i]!);
      } else if (target < current) {
        dispatch({ type: 'RESET_DEMO' });
        for (let i = 0; i <= target; i++) applyEffects(steps[i]!);
      }
      stepIndexRef.current = target;
      setStepIndex(target);
      onStepChange(steps[target]!);
    },
    [steps, applyEffects, dispatch, onStepChange],
  );

  const next = useCallback(() => {
    if (stepIndexRef.current >= steps.length - 1) {
      setStatus('done');
      onFinish('completed');
      return;
    }
    goTo(stepIndexRef.current + 1);
  }, [goTo, steps.length, onFinish]);

  const back = useCallback(() => {
    if (stepIndexRef.current === 0) return;
    goTo(stepIndexRef.current - 1);
  }, [goTo]);

  const skip = useCallback(() => {
    setStatus('done');
    onFinish('skipped');
  }, [onFinish]);

  const restart = useCallback(() => {
    dispatch({ type: 'RESET_DEMO' });
    stepIndexRef.current = 0;
    setStepIndex(0);
    setStatus('active');
    applyEffects(steps[0]!);
    onStepChange(steps[0]!);
  }, [dispatch, applyEffects, steps, onStepChange]);

  return {
    status,
    stepIndex,
    step: steps[stepIndex]!,
    totalSteps: steps.length,
    next,
    back,
    skip,
    restart,
  };
}
