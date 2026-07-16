import type { ImplementationStep, OSScope } from '../types';

export function isOSScope(value: string): value is OSScope {
  return value === 'workstation' || value === 'server' || value === 'both';
}

export function stepInScope(step: ImplementationStep, scope: OSScope): boolean {
  return scope === 'both' || step.osScope === 'both' || step.osScope === scope;
}

export function stepsInScope(steps: ImplementationStep[], scope: OSScope): ImplementationStep[] {
  return steps.filter((step) => stepInScope(step, scope));
}
