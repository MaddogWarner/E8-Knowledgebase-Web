import { describe, expect, it } from 'vitest';
import { controls } from '../data/controls';
import { classifyStep, controlComplete, isStepDone, levelsUpTo } from '../lib/status';

describe('status helpers', () => {
  it('classifies step state with evidence precedence', () => {
    expect(classifyStep(true, 'pass')).toBe('evidenced');
    expect(classifyStep(true, 'fail')).toBe('failed');
    expect(classifyStep(false, 'fail')).toBe('failed');
    expect(classifyStep(true, undefined)).toBe('self');
    expect(classifyStep(false, undefined)).toBe('remaining');
  });

  it('treats evidenced and self-attested steps as done', () => {
    expect(isStepDone(false, 'pass')).toBe(true);
    expect(isStepDone(true, undefined)).toBe(true);
    expect(isStepDone(true, 'fail')).toBe(false);
    expect(isStepDone(false, undefined)).toBe(false);
  });

  it('returns maturity levels up to the selected target', () => {
    expect(levelsUpTo('ml1')).toEqual(['ml1']);
    expect(levelsUpTo('ml2')).toEqual(['ml1', 'ml2']);
    expect(levelsUpTo('ml3')).toEqual(['ml1', 'ml2', 'ml3']);
  });

  it('checks control completion relative to target maturity', () => {
    const control = controls[0];
    const ml1StepIds = control.ml1.steps.map((step) => step.id);
    const allStepIds = new Set(ml1StepIds);

    expect(controlComplete(control, 'ml1', (stepId) => allStepIds.has(stepId), {})).toBe(true);
    expect(controlComplete(control, 'ml2', (stepId) => allStepIds.has(stepId), {})).toBe(false);
    expect(controlComplete(control, 'ml1', (stepId) => allStepIds.has(stepId), { [ml1StepIds[0]]: 'fail' })).toBe(false);
    expect(controlComplete(control, 'ml1', () => false, Object.fromEntries(ml1StepIds.map((stepId) => [stepId, 'pass'])))).toBe(true);
  });
});
