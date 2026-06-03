import { describe, expect, it } from 'vitest';
import fixtureCsv from './fixtures/audit-sample.csv?raw';
import { parseCsv } from '../lib/csv';
import { deriveEvidence } from '../lib/evidence';

describe('deriveEvidence', () => {
  it('drops MDE and AuditPolicy rows, maps clean E8 checks, and reports honest coverage', () => {
    const summary = deriveEvidence(parseCsv(fixtureCsv));

    expect(summary.totalE8).toBe(5);
    expect(summary.matched).toBe(4);
    expect(summary.controlsCovered).toBe(2);
    expect(summary.statuses['5-ml2-2']).toBe('pass');
    expect(summary.statuses['5-ml2-1']).toBe('fail');
    expect(summary.statuses['4-ml2-2']).toBe('pass');
    expect(summary.statuses).not.toHaveProperty('Secure Boot');
  });

  it('maps all curated clean checks by check identity and ignores the ML column', () => {
    const rows = [
      row('Memory Integrity / HVCI', 'PASS', '', 'ML1'),
      row('Credential Guard', 'PASS'),
      row('LSASS Protected Process Light (PPL)', 'PASS'),
      row('Process Creation Command Line Logging', 'PASS'),
      row('PowerShell Script Block Logging', 'PASS'),
      row('PowerShell Module Logging', 'PASS'),
      row('PowerShell v2 Engine Disabled', 'PASS'),
      row('PowerShell Constrained Language Mode', 'PASS')
    ];

    const summary = deriveEvidence(rows);

    expect(summary.matched).toBe(8);
    expect(summary.statuses['1-ml3-3']).toBe('pass');
    expect(summary.statuses['5-ml2-1']).toBe('pass');
    expect(summary.statuses['5-ml2-2']).toBe('pass');
    expect(summary.statuses['4-ml2-3']).toBe('pass');
    expect(summary.statuses['4-ml2-1']).toBe('pass');
    expect(summary.statuses['4-ml3-1']).toBe('pass');
    expect(summary.statuses['4-ml3-2']).toBe('pass');
  });

  it('rolls ASR up as pass only when all contributing ASR rows pass', () => {
    const passing = deriveEvidence([
      row('ASR: one', 'PASS'),
      row('ASR: two', 'PASS')
    ]);
    const failing = deriveEvidence([
      row('ASR: one', 'PASS'),
      row('ASR: two', 'FAIL')
    ]);

    expect(passing.statuses['4-ml2-2']).toBe('pass');
    expect(failing.statuses['4-ml2-2']).toBe('fail');
  });

  it('applies Status and Enabled evidence rules', () => {
    const summary = deriveEvidence([
      row('PowerShell v2 Engine Disabled', '', 'True'),
      row('PowerShell Constrained Language Mode', '', 'False'),
      row('Memory Integrity / HVCI', 'HIGH RISK'),
      row('Process Creation Command Line Logging', 'REVIEW')
    ]);

    expect(summary.statuses['4-ml3-1']).toBe('pass');
    expect(summary.statuses['4-ml3-2']).toBe('fail');
    expect(summary.statuses['1-ml3-3']).toBe('fail');
    expect(summary.statuses['4-ml2-3']).toBeUndefined();
    expect(summary.matched).toBe(4);
  });
});

function row(check: string, status = 'PASS', enabled = '', ml = 'ML3'): Record<string, string> {
  return {
    AssessmentType: 'E8',
    Category: 'Test',
    Check: check,
    ML: ml,
    Status: status,
    Enabled: enabled
  };
}
