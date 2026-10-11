import { describe, expect, it } from 'vitest';
import { controls } from '../data/controls';
import { buildReportRows, toCsv, type ReportRow } from '../lib/report';
import type { StepStatus } from '../types';

const notImplemented: StepStatus = { state: 'notImplemented' };
const implemented: StepStatus = { state: 'implemented' };

describe('compliance report export', () => {
  const emptyRow: ReportRow = {
    GeneratedDate: '', Profile: '', TargetMaturity: '', ControlId: '', ControlName: '',
    Level: '', StepId: '', StepTitle: '', ISMControls: '', State: '', Reason: '',
    Evidence: '', CompliancePercent: ''
  };

  it.each([
    ['equals', '=1+1', "'=1+1"],
    ['plus', '+1', "'+1"],
    ['minus', '-1', "'-1"],
    ['at sign', '@SUM(A1)', "'@SUM(A1)"],
    ['tab', '\t=1', "'\t=1"],
    ['carriage return', '\r=1', `"'\r=1"`]
  ])('neutralises a field starting with %s', (_name, value, expected) => {
    const csv = toCsv([{ ...emptyRow, Profile: value }]);
    expect(csv.slice(csv.indexOf('\r\n') + 2)).toBe(`,${expected}${','.repeat(11)}\r\n`);
  });

  it('neutralises before quoting and escaping embedded quotes', () => {
    const csv = toCsv([{ ...emptyRow, Profile: '=HYPERLINK("x","y")' }]);
    expect(csv.slice(csv.indexOf('\r\n') + 2)).toBe(`,"'=HYPERLINK(""x"",""y"")"${','.repeat(11)}\r\n`);
  });

  it.each([
    ['Implemented', 'Implemented'],
    ['ML2', 'ML2'],
    ['a,b', '"a,b"']
  ])('preserves ordinary value %s', (value, expected) => {
    const csv = toCsv([{ ...emptyRow, Profile: value }]);
    expect(csv.slice(csv.indexOf('\r\n') + 2)).toBe(`,${expected}${','.repeat(11)}\r\n`);
  });

  it('neutralises a formula-leading reason in a generated report row', () => {
    const firstStep = controls[0].ml1.steps[0];
    const rows = buildReportRows(
      controls.slice(0, 1),
      'ml1',
      (stepId) => stepId === firstStep.id ? { state: 'notApplicable', reason: '=1+1' } : notImplemented,
      {}
    );

    expect(rows[0].Reason).toBe('=1+1');
    expect(toCsv(rows).split('\r\n')[1]).toBe(
      `${rows[0].GeneratedDate},Default,ML1,${rows[0].ControlId},${rows[0].ControlName},ML1,${firstStep.id},${firstStep.title},${rows[0].ISMControls},Not Applicable,'=1+1,,${rows[0].CompliancePercent}`
    );
  });

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
