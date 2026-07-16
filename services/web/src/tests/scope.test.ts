import { describe, expect, it } from 'vitest';
import { stepInScope, stepsInScope } from '../lib/scope';
import type { ImplementationStep, OSScope } from '../types';

function step(osScope: OSScope): ImplementationStep {
  return { id: osScope, title: osScope, description: osScope, osScope, ismControls: [], technicalDetails: [] };
}

describe('OS scope', () => {
  const workstation = step('workstation');
  const server = step('server');
  const both = step('both');

  it('shows every step under Both', () => {
    expect(stepsInScope([workstation, server, both], 'both')).toEqual([workstation, server, both]);
  });

  it('shows workstation and common steps under Workstation', () => {
    expect(stepInScope(workstation, 'workstation')).toBe(true);
    expect(stepInScope(server, 'workstation')).toBe(false);
    expect(stepInScope(both, 'workstation')).toBe(true);
  });

  it('shows server and common steps under Server', () => {
    expect(stepInScope(workstation, 'server')).toBe(false);
    expect(stepInScope(server, 'server')).toBe(true);
    expect(stepInScope(both, 'server')).toBe(true);
  });
});
