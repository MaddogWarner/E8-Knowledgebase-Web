import { getLevelContent } from '../data/controls';
import type { EssentialControl, ImplementationStep, MaturityLevel, StepStatus } from '../types';

export type Evidence = 'pass' | 'fail' | undefined;
export type StepDisplayState = 'notApplicable' | 'evidenced' | 'failed' | 'implemented' | 'remaining';

export function classifyStep(status: StepStatus, evidence: Evidence): StepDisplayState {
  if (status.state === 'notApplicable') return 'notApplicable';
  if (evidence === 'pass') return 'evidenced';
  if (evidence === 'fail') return 'failed';
  if (status.state === 'implemented') return 'implemented';
  return 'remaining';
}

export function isStepDone(status: StepStatus, evidence: Evidence): boolean {
  const state = classifyStep(status, evidence);
  return state === 'evidenced' || state === 'implemented';
}

export function isStepCompleteOrNotApplicable(status: StepStatus, evidence: Evidence): boolean {
  return classifyStep(status, evidence) === 'notApplicable' || isStepDone(status, evidence);
}

export function levelsUpTo(target: MaturityLevel): MaturityLevel[] {
  if (target === 'ml1') return ['ml1'];
  if (target === 'ml2') return ['ml1', 'ml2'];
  return ['ml1', 'ml2', 'ml3'];
}

export function compliancePercentage(
  steps: ImplementationStep[],
  status: (stepId: string) => StepStatus,
  evidenceMap: Record<string, 'pass' | 'fail'>
): number {
  const notApplicable = steps.filter((step) => classifyStep(status(step.id), evidenceMap[step.id]) === 'notApplicable').length;
  const denominator = steps.length - notApplicable;
  if (steps.length === 0 || denominator <= 0) return 100;
  const complete = steps.filter((step) => isStepDone(status(step.id), evidenceMap[step.id])).length;
  return Math.round((complete / denominator) * 100);
}

export function controlComplete(
  control: EssentialControl,
  target: MaturityLevel,
  status: (stepId: string) => StepStatus,
  evidenceMap: Record<string, 'pass' | 'fail'>
): boolean {
  const targetSteps = levelsUpTo(target).flatMap((level) => getLevelContent(control, level).steps);
  return targetSteps.length > 0 && targetSteps.every((step) => isStepCompleteOrNotApplicable(status(step.id), evidenceMap[step.id]));
}

export function statusCounts(
  steps: ImplementationStep[],
  status: (stepId: string) => StepStatus,
  evidenceMap: Record<string, 'pass' | 'fail'>
): Record<StepDisplayState, number> {
  return steps.reduce<Record<StepDisplayState, number>>(
    (counts, step) => {
      counts[classifyStep(status(step.id), evidenceMap[step.id])] += 1;
      return counts;
    },
    { notApplicable: 0, evidenced: 0, failed: 0, implemented: 0, remaining: 0 }
  );
}
