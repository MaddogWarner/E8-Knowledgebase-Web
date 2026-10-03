import { attackMappings, attackTactics, attackTechniques, type AttackTechnique } from '../data/attack';
import { controls } from '../data/controls';
import type { MaturityLevel, OSScope, StepStatus } from '../types';
import { stepsInScope } from './scope';
import { classifyStep, isStepDone, levelsUpTo } from './status';

export type CoverageStatus = 'covered' | 'partial' | 'notCovered' | 'indirect' | 'notApplicable';
export interface TechniqueCoverage {
  technique: AttackTechnique;
  contributingTotal: number;
  contributingImplemented: number;
  supportingTotal: number;
  isIndirectOnly: boolean;
  isNotApplicable: boolean;
  status: CoverageStatus;
}
export const coverageLabels: Record<CoverageStatus, string> = {
  covered: 'Covered', partial: 'Partial', notCovered: 'Not covered', indirect: 'Indirect', notApplicable: 'Not applicable'
};
export const attackSteps = controls.flatMap((control) => (['ml1', 'ml2', 'ml3'] as const).flatMap((level) => control[level].steps.map((step) => ({ control, level, step }))));
export function inScopeStepIds(target: MaturityLevel, scope: OSScope, controlId?: number): Set<string> {
  return new Set(controls.filter((control) => controlId === undefined || control.id === controlId).flatMap((control) => stepsInScope(levelsUpTo(target).flatMap((level) => control[level].steps), scope).map((step) => step.id)));
}
export function mappingsForStep(stepId: string) {
  return attackMappings.filter((mapping) => mapping.stepId === stepId);
}
export function techniquesForControl(controlId: number, target: MaturityLevel, scope: OSScope) {
  const steps = inScopeStepIds(target, scope, controlId);
  const ids = new Set(attackMappings.filter((mapping) => steps.has(mapping.stepId)).map((mapping) => mapping.techniqueId));
  return attackTechniques.filter((technique) => ids.has(technique.id));
}
export function calculateCoverage(target: MaturityLevel, scope: OSScope, status: (id: string) => StepStatus, evidence: Record<string, 'pass' | 'fail'> = {}): TechniqueCoverage[] {
  const scopeIds = inScopeStepIds(target, scope);
  return attackTechniques.flatMap((technique) => {
    const mappings = attackMappings.filter((mapping) => mapping.techniqueId === technique.id && scopeIds.has(mapping.stepId));
    if (!mappings.length) return [];
    const original = new Set(mappings.filter((mapping) => mapping.relationships.some((rel) => rel !== 'Support')).map((mapping) => mapping.stepId));
    const contributing = [...original].filter((id) => classifyStep(status(id), evidence[id]) !== 'notApplicable');
    const supporting = new Set(mappings.filter((mapping) => mapping.relationships.includes('Support') && classifyStep(status(mapping.stepId), evidence[mapping.stepId]) !== 'notApplicable').map((mapping) => mapping.stepId));
    const implemented = contributing.filter((id) => isStepDone(status(id), evidence[id])).length;
    const isIndirectOnly = original.size === 0;
    const isNotApplicable = !isIndirectOnly && contributing.length === 0;
    const coverageStatus: CoverageStatus = isIndirectOnly ? 'indirect' : isNotApplicable ? 'notApplicable' : implemented === contributing.length ? 'covered' : implemented > 0 ? 'partial' : 'notCovered';
    return [{ technique, contributingTotal: contributing.length, contributingImplemented: implemented, supportingTotal: supporting.size, isIndirectOnly, isNotApplicable, status: coverageStatus }];
  });
}
export function groupCoverage(coverage: TechniqueCoverage[]) {
  return attackTactics.map((tactic) => ({ tactic, coverage: coverage.filter((item) => item.technique.tactics.includes(tactic)) })).filter((group) => group.coverage.length > 0);
}
