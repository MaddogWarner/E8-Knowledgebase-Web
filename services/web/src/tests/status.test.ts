import { describe, expect, it } from 'vitest';
import { controls } from '../data/controls';
import { classifyStep, compliancePercentage, controlComplete, isStepDone, levelsUpTo } from '../lib/status';
import type { StepStatus } from '../types';

const implemented: StepStatus = { state: 'implemented' };
const notApplicable: StepStatus = { state: 'notApplicable', reason: 'Covered by compensating control' };
const notImplemented: StepStatus = { state: 'notImplemented' };

describe('status helpers', () => {
  it('classifies step state with N/A and evidence precedence', () => {
    expect(classifyStep(notApplicable, 'pass')).toBe('notApplicable');
    expect(classifyStep(implemented, 'pass')).toBe('evidenced');
    expect(classifyStep(implemented, 'fail')).toBe('failed');
    expect(classifyStep(notImplemented, 'fail')).toBe('failed');
    expect(classifyStep(implemented, undefined)).toBe('implemented');
    expect(classifyStep(notImplemented, undefined)).toBe('remaining');
  });

  it('treats evidenced and implemented steps as done', () => {
    expect(isStepDone(notImplemented, 'pass')).toBe(true);
    expect(isStepDone(implemented, undefined)).toBe(true);
    expect(isStepDone(implemented, 'fail')).toBe(false);
    expect(isStepDone(notApplicable, 'pass')).toBe(false);
    expect(isStepDone(notImplemented, undefined)).toBe(false);
  });

  it('returns maturity levels up to the selected target', () => {
    expect(levelsUpTo('ml1')).toEqual(['ml1']);
    expect(levelsUpTo('ml2')).toEqual(['ml1', 'ml2']);
    expect(levelsUpTo('ml3')).toEqual(['ml1', 'ml2', 'ml3']);
  });

  it('calculates compliance with N/A excluded from the denominator', () => {
    const steps = controls[0].ml1.steps;
    const statuses: Record<string, StepStatus> = {
      [steps[0].id]: implemented,
      [steps[1].id]: notApplicable,
      [steps[2].id]: notImplemented,
      [steps[3].id]: notImplemented
    };

    expect(compliancePercentage(steps, (stepId) => statuses[stepId] ?? notImplemented, {})).toBe(33);
    expect(compliancePercentage(steps.slice(0, 1), () => notApplicable, {})).toBe(100);
  });

  it('checks control completion relative to target maturity and accepts N/A', () => {
    const control = controls[0];
    const ml1StepIds = control.ml1.steps.map((step) => step.id);
    const statuses = Object.fromEntries(ml1StepIds.map((stepId) => [stepId, implemented])) as Record<string, StepStatus>;

    expect(controlComplete(control, 'ml1', (stepId) => statuses[stepId] ?? notImplemented, {}, 'both')).toBe(true);
    expect(controlComplete(control, 'ml2', (stepId) => statuses[stepId] ?? notImplemented, {}, 'both')).toBe(false);
    expect(controlComplete(control, 'ml1', (stepId) => statuses[stepId] ?? notImplemented, { [ml1StepIds[0]]: 'fail' }, 'both')).toBe(false);
    expect(controlComplete(control, 'ml1', () => notApplicable, {}, 'both')).toBe(true);
  });

  it('checks completion over only the selected OS scope', () => {
    const control = controls[1];
    const commonStepIds = control.ml1.steps.filter((step) => step.osScope === 'both').map((step) => step.id);
    const statuses = Object.fromEntries(commonStepIds.map((stepId) => [stepId, implemented])) as Record<string, StepStatus>;

    expect(controlComplete(control, 'ml1', (stepId) => statuses[stepId] ?? notImplemented, {}, 'server')).toBe(true);
    expect(controlComplete(control, 'ml1', (stepId) => statuses[stepId] ?? notImplemented, {}, 'both')).toBe(false);
  });
});
