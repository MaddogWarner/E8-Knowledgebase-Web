import { getLevelContent } from '../data/controls';
import type { EssentialControl, MaturityLevel } from '../types';

export type Evidence = 'pass' | 'fail' | undefined;
export type StepState = 'evidenced' | 'failed' | 'self' | 'remaining';

export function classifyStep(ticked: boolean, evidence: Evidence): StepState {
  if (evidence === 'pass') return 'evidenced';
  if (evidence === 'fail') return 'failed';
  if (ticked) return 'self';
  return 'remaining';
}

export function isStepDone(ticked: boolean, evidence: Evidence): boolean {
  return classifyStep(ticked, evidence) === 'evidenced' || classifyStep(ticked, evidence) === 'self';
}

export function levelsUpTo(target: MaturityLevel): MaturityLevel[] {
  if (target === 'ml1') return ['ml1'];
  if (target === 'ml2') return ['ml1', 'ml2'];
  return ['ml1', 'ml2', 'ml3'];
}

export function controlComplete(
  control: EssentialControl,
  target: MaturityLevel,
  ticked: (stepId: string) => boolean,
  evidenceMap: Record<string, 'pass' | 'fail'>
): boolean {
  const targetSteps = levelsUpTo(target).flatMap((level) => getLevelContent(control, level).steps);
  return targetSteps.length > 0 && targetSteps.every((step) => isStepDone(ticked(step.id), evidenceMap[step.id]));
}
