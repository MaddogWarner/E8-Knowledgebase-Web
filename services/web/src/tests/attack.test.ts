import { describe, expect, it } from 'vitest';
import { attackMappings, attackTactics, attackTechniques } from '../data/attack';
import { appInfo } from '../data/appInfo';
import { controls } from '../data/controls';
import { calculateCoverage, groupCoverage, mappingsForStep, techniquesForControl } from '../lib/attack';
import { iosToWebStepId, webToIosStepId } from '../lib/stepIds.mjs';
import { search } from '../lib/search';
import type { StepStatus } from '../types';
const steps = controls.flatMap((control) => (['ml1', 'ml2', 'ml3'] as const).flatMap((level) => control[level].steps));
const remaining = (): StepStatus => ({ state: 'notImplemented' });

describe('Swift ATT&CK data and ID compatibility', () => {
  it('preserves all 67 web IDs in both directions, including first and last steps', () => {
    expect(steps).toHaveLength(67);
    for (const step of steps) expect(iosToWebStepId(webToIosStepId(step.id)!)).toBe(step.id);
    expect(iosToWebStepId('1-1-0')).toBe('1-ml1-1');
    expect(iosToWebStepId('8-3-2')).toBe('8-ml3-3');
    expect(webToIosStepId('1-ml1-0')).toBeNull();
    expect(iosToWebStepId('1-ml1-1')).toBeNull();
  });
  it('has 35 unique, mapped techniques and precisely 65 mapped valid steps', () => {
    expect(attackTechniques).toHaveLength(35);
    expect(new Set(attackTechniques.map((item) => item.id)).size).toBe(35);
    const ids = new Set(steps.map((step) => step.id));
    for (const mapping of attackMappings) {
      expect(ids.has(mapping.stepId)).toBe(true);
      expect(attackTechniques.some((technique) => technique.id === mapping.techniqueId)).toBe(true);
    }
    expect(new Set(attackMappings.map((mapping) => mapping.stepId)).size).toBe(65);
    expect(mappingsForStep('2-ml1-3')).toEqual([]);
    expect(mappingsForStep('6-ml1-3')).toEqual([]);
    for (const technique of attackTechniques) expect(attackMappings.some((mapping) => mapping.techniqueId === technique.id)).toBe(true);
    expect(attackTactics).toEqual(['Initial Access', 'Execution', 'Persistence', 'Privilege Escalation', 'Stealth', 'Defense Impairment', 'Credential Access', 'Lateral Movement', 'Collection', 'Impact']);
    for (const technique of attackTechniques) for (const tactic of technique.tactics) expect(attackTactics).toContain(tactic);
  });
  it('pins the MITRE attribution exactly and resolves Swift interpolation', () => {
    expect(appInfo.attackAttribution).toBe('© 2026 The MITRE Corporation. This work is reproduced and distributed with the permission of The MITRE Corporation. MITRE ATT&CK® and ATT&CK® are registered trademarks of The MITRE Corporation.');
    expect(appInfo.attackVersionNote).toBe('Mapped against MITRE ATT&CK® Enterprise v19.1, released 28 April 2026.');
  });
});
describe('coverage', () => {
  it('handles not-covered, covered, partial, all-N/A and indirect-only', () => {
    expect(calculateCoverage('ml3', 'both', remaining).find((item) => item.technique.id === 'T1059')?.status).toBe('notCovered');
    const done = (): StepStatus => ({ state: 'implemented' });
    expect(calculateCoverage('ml3', 'both', done).find((item) => item.technique.id === 'T1059')?.status).toBe('covered');
    const partial = (id: string): StepStatus => ({ state: id === '1-ml1-4' ? 'implemented' : 'notImplemented' });
    expect(calculateCoverage('ml3', 'both', partial).find((item) => item.technique.id === 'T1059')?.status).toBe('partial');
    const na = (): StepStatus => ({ state: 'notApplicable' });
    const coverage = calculateCoverage('ml3', 'both', na).find((item) => item.technique.id === 'T1059')!;
    expect(coverage.status).toBe('notApplicable');
    expect(coverage.contributingTotal).toBe(0);
    expect(coverage.supportingTotal).toBe(0);
    expect(calculateCoverage('ml1', 'both', remaining).find((item) => item.technique.id === 'T1059')?.status).toBe('notCovered');
    expect(calculateCoverage('ml2', 'both', remaining).find((item) => item.technique.id === 'T1021')?.status).toBe('indirect');
  });
  it('shares evidence precedence: pass completes, failure overrides manual completion, manual N/A wins', () => {
    const id = '3-ml1-2';
    const lookup = (manual: StepStatus, evidence: 'pass' | 'fail') => calculateCoverage('ml1', 'both', (step) => step === id ? manual : remaining(), { [id]: evidence }).find((item) => item.technique.id === 'T1059.005')!;
    expect(lookup(remaining(), 'pass').status).toBe('partial');
    expect(lookup({ state: 'implemented' }, 'fail').status).toBe('notCovered');
    expect(lookup({ state: 'notApplicable' }, 'pass').contributingImplemented).toBe(0);
    expect(lookup({ state: 'notApplicable' }, 'pass').contributingTotal).toBe(1);
  });
  it('narrows target and OS scope and deduplicates techniques before tactic grouping', () => {
    const ml1 = calculateCoverage('ml1', 'both', remaining);
    const ml3 = calculateCoverage('ml3', 'both', remaining);
    expect(ml3.length).toBeGreaterThan(ml1.length);
    expect(techniquesForControl(3, 'ml1', 'server')).toEqual([]);
    const ids = new Set(ml3.map((item) => item.technique.id));
    const grouped = groupCoverage(ml3).flatMap((group) => group.coverage);
    expect(grouped.length).toBeGreaterThan(ids.size);
    expect(new Set(grouped.map((item) => item.technique.id))).toEqual(ids);
  });
});
describe('technique search', () => {
  it('finds sub-techniques by their parent and mapping notes case-insensitively', () => {
    expect(search('t1059').some((result) => result.matchedTechniques?.some((line) => line.startsWith('T1059.001')))).toBe(true);
    expect(search('commodity loaders').some((result) => result.id === '1-ml1-3')).toBe(true);
  });
});
