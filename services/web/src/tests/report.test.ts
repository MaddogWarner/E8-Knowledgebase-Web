import { describe, expect, it } from 'vitest';
import { controls } from '../data/controls';
import { buildReportRows, toCsv } from '../lib/report';
import type { StepStatus } from '../types';

const notImplemented: StepStatus = { state: 'notImplemented' };
const implemented: StepStatus = { state: 'implemented' };

describe('compliance report export', () => {
  it('escapes CSV fields and excludes machine identifiers', () => {
    const firstStep = controls[0].ml1.steps[0];
    const rows = buildReportRows(
      controls.slice(0, 1),
      'ml1',
      (stepId) => stepId === firstStep.id ? { state: 'notApplicable', reason: 'Server, retired\napproved' } : notImplemented,
      {},
      'Default, Healthcare'
    );
    const csv = toCsv(rows);

    expect(csv).toContain('"Default, Healthcare"');
    expect(csv).toContain('"Server, retired\napproved"');
    expect(csv).not.toContain('Hostname');
    expect(csv).not.toContain('IPAddress');
    expect(csv).not.toContain('Username');
    expect(csv.endsWith('\r\n')).toBe(true);
  });

  it('omits out-of-scope steps and recalculates the control percentage', () => {
    const rows = buildReportRows(controls.slice(1, 2), 'ml1', () => implemented, {}, 'Servers', 'server');

    expect(rows.some((row) => row.StepId === '2-ml1-1')).toBe(false);
    expect(rows.some((row) => row.StepId === '2-ml1-2')).toBe(false);
    expect(rows).toHaveLength(2);
    expect(rows.every((row) => row.CompliancePercent === '100')).toBe(true);
  });
});
