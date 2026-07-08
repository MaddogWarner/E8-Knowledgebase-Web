import { describe, expect, it } from 'vitest';
import fixtureCsv from './fixtures/audit-sample.csv?raw';
import { parseCsv } from '../lib/csv';
import { deriveEvidence } from '../lib/evidence';

describe('deriveEvidence', () => {
  it('maps clean E8 and AuditPolicy checks, drops MDE rows, and reports honest coverage', () => {
    const summary = deriveEvidence(parseCsv(fixtureCsv));

    expect(summary.totalE8).toBe(11);
    expect(summary.matched).toBe(9);
    expect(summary.totalAuditPolicy).toBe(5);
    expect(summary.matchedAuditPolicy).toBe(1);
    expect(summary.matchedAuditPolicyEntries).toBe(4);
    expect(summary.unmatchedAuditPolicyChecks).toEqual(['Security Event Log Size']);
    expect(summary.controlsCovered).toBe(2);
    expect(summary.statuses['5-ml2-2']).toBe('pass');
    expect(summary.statuses['5-ml2-1']).toBe('fail');
    expect(summary.statuses['4-ml2-1']).toBe('fail');
    expect(summary.statuses['4-ml2-2']).toBe('fail');
    expect(summary.statuses['4-ml2-3']).toBe('fail');
    expect(summary.statuses['4-ml3-1']).toBeUndefined();
    expect(summary.statuses['4-ml3-2']).toBeUndefined();
    expect(summary.statuses).not.toHaveProperty('Secure Boot');
    expect(summary.unmatchedChecks).toEqual(['Secure Boot', 'Defender Real-Time Protection']);
    expect(summary.auditPolicyEntryStates['process-creation']).toEqual({
      state: 'nonCompliant',
      current: 'Process creation auditing disabled',
      expected: 'Success'
    });
    expect(summary.auditPolicyEntryStates.logon).toEqual({ state: 'compliant' });
    expect(summary.auditPolicyEntryStates['special-logon']).toEqual({
      state: 'review',
      current: 'Success',
      expected: 'Success and Failure'
    });
    expect(summary.auditPolicyEntryStates['detailed-file-share']).toEqual({ state: 'compliant' });
  });

  it('maps all curated clean checks by check identity and ignores the ML column', () => {
    const rows = [
      row('Memory Integrity / HVCI', 'PASS', '', 'ML1'),
      row('Credential Guard', 'PASS'),
      row('LSASS Protected Process Light (PPL)', 'PASS'),
      row('Process Creation Command Line Logging', 'PASS'),
      row('PowerShell Script Block Logging', 'PASS'),
      row('PowerShell Module Logging', 'PASS'),
      row('PowerShell Transcription', 'PASS'),
      row('PowerShell v2 Engine Disabled', 'PASS'),
      row('PowerShell Constrained Language Mode', 'PASS')
    ];

    const summary = deriveEvidence(rows);

    expect(summary.matched).toBe(9);
    expect(summary.statuses['1-ml3-3']).toBe('pass');
    expect(summary.statuses['5-ml2-1']).toBe('pass');
    expect(summary.statuses['5-ml2-2']).toBe('pass');
    expect(summary.statuses['4-ml2-3']).toBe('pass');
    expect(summary.statuses['4-ml2-1']).toBe('pass');
    expect(summary.statuses['4-ml3-1']).toBe('pass');
    expect(summary.statuses['4-ml3-2']).toBe('pass');
  });

  it('rolls PowerShell logging checks into one step with fail beating pass', () => {
    const summary = deriveEvidence([
      row('PowerShell Module Logging', 'PASS'),
      row('PowerShell Script Block Logging', 'FAIL'),
      row('PowerShell Transcription', 'PASS')
    ]);

    expect(summary.statuses['4-ml2-1']).toBe('fail');
    expect(summary.matched).toBe(3);
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

  it('treats ASR audit and warn modes as fail evidence', () => {
    const summary = deriveEvidence([
      row('ASR: one', 'AUDIT', 'False'),
      row('ASR: two', 'REVIEW', 'False')
    ]);

    expect(summary.statuses['4-ml2-2']).toBe('fail');
    expect(summary.matched).toBe(2);
  });

  it('applies Status and Enabled evidence rules', () => {
    const summary = deriveEvidence([
      row('PowerShell v2 Engine Disabled', '', 'True'),
      row('PowerShell Constrained Language Mode', '', 'False'),
      row('Memory Integrity / HVCI', 'HIGH RISK'),
      row('Process Creation Command Line Logging', 'REVIEW'),
      row('Credential Guard', 'AUDIT'),
      row('LSASS Protected Process Light (PPL)', 'N/A'),
      row('PowerShell Module Logging', 'NOT SUPPORTED')
    ]);

    expect(summary.statuses['4-ml3-1']).toBe('pass');
    expect(summary.statuses['4-ml3-2']).toBe('fail');
    expect(summary.statuses['1-ml3-3']).toBe('fail');
    expect(summary.statuses['4-ml2-3']).toBeUndefined();
    expect(summary.statuses['5-ml2-1']).toBe('fail');
    expect(summary.statuses['5-ml2-2']).toBeUndefined();
    expect(summary.statuses['4-ml2-1']).toBeUndefined();
    expect(summary.matched).toBe(7);
  });

  it('maps AuditPolicy Process Creation and rolls it up with E8 evidence', () => {
    const summary = deriveEvidence([
      row('Process Creation Command Line Logging', 'PASS'),
      row('Audit Process Creation', 'FAIL', 'False', 'ML2', 'AuditPolicy'),
      row('Audit Logon', 'FAIL', 'False', 'ML2', 'AuditPolicy')
    ]);

    expect(summary.totalE8).toBe(1);
    expect(summary.matched).toBe(1);
    expect(summary.totalAuditPolicy).toBe(2);
    expect(summary.matchedAuditPolicy).toBe(1);
    expect(summary.statuses['4-ml2-3']).toBe('fail');
  });

  it('derives AuditPolicy entry states from status and enabled values', () => {
    const summary = deriveEvidence([
      row('Audit Logon', 'PASS', 'False', 'ML2', 'AuditPolicy'),
      row('Audit Logoff', 'FAIL', 'True', 'ML2', 'AuditPolicy'),
      row('Audit Registry', 'REVIEW', 'True', 'ML2', 'AuditPolicy'),
      row('Audit File Share', 'NOT SUPPORTED', 'False', 'ML2', 'AuditPolicy'),
      row('Audit File System', 'N/A', 'False', 'ML2', 'AuditPolicy'),
      row('Audit Kernel Object', '', 'True', 'ML2', 'AuditPolicy'),
      row('Audit Process Termination', '', 'False', 'ML2', 'AuditPolicy')
    ]);

    expect(summary.auditPolicyEntryStates.logon).toEqual({ state: 'compliant' });
    expect(summary.auditPolicyEntryStates.logoff?.state).toBe('nonCompliant');
    expect(summary.auditPolicyEntryStates.registry?.state).toBe('review');
    expect(summary.auditPolicyEntryStates['file-share']).toBeUndefined();
    expect(summary.auditPolicyEntryStates['file-system']).toBeUndefined();
    expect(summary.auditPolicyEntryStates['kernel-object']).toEqual({ state: 'compliant' });
    expect(summary.auditPolicyEntryStates['process-termination']?.state).toBe('nonCompliant');
  });

  it('rolls AuditPolicy entry duplicates up with non-compliant beating review and compliant', () => {
    const summary = deriveEvidence([
      row('Audit Logon', 'PASS', 'True', 'ML2', 'AuditPolicy'),
      row('Audit Logon', 'REVIEW', 'True', 'ML2', 'AuditPolicy', {
        detail: 'Success',
        requiredSetting: 'Success and Failure'
      }),
      row('Audit Logon', 'FAIL', 'False', 'ML2', 'AuditPolicy', {
        detail: 'No Auditing',
        requiredSetting: 'Success and Failure'
      }),
      row('Audit Logon', 'FAIL', 'False', 'ML2', 'AuditPolicy', {
        detail: 'Failure',
        requiredSetting: 'Success and Failure'
      })
    ]);

    expect(summary.auditPolicyEntryStates.logon).toEqual({
      state: 'nonCompliant',
      current: 'No Auditing',
      expected: 'Success and Failure'
    });
    expect(summary.matchedAuditPolicyEntries).toBe(1);
  });

  it('keeps AuditPolicy current and expected details only for non-compliant and review states', () => {
    const summary = deriveEvidence([
      row('Audit Logon', 'PASS', 'True', 'ML2', 'AuditPolicy', {
        detail: 'Success and Failure',
        rawValue: 'Success and Failure',
        requiredSetting: 'Success and Failure'
      }),
      row('Audit Logoff', 'FAIL', 'False', 'ML2', 'AuditPolicy', {
        rawValue: 'No Auditing',
        requiredSetting: 'Success'
      }),
      row('Audit Special Logon', 'REVIEW', 'True', 'ML2', 'AuditPolicy', {
        detail: 'Success',
        rawValue: 'Failure',
        requiredSetting: 'Success and Failure'
      })
    ]);

    expect(summary.auditPolicyEntryStates.logon).toEqual({ state: 'compliant' });
    expect(summary.auditPolicyEntryStates.logoff).toEqual({
      state: 'nonCompliant',
      current: 'No Auditing',
      expected: 'Success'
    });
    expect(summary.auditPolicyEntryStates['special-logon']).toEqual({
      state: 'review',
      current: 'Success',
      expected: 'Success and Failure'
    });
  });

  it('collects deduped unmatched checks from E8 rows only with original casing', () => {
    const summary = deriveEvidence([
      row('Secure Boot', 'PASS'),
      row('secure boot', 'FAIL'),
      row('Defender Real-Time Protection', 'FAIL'),
      row('Audit Logon', 'FAIL', 'False', 'ML2', 'AuditPolicy'),
      row('Defender Antivirus Exclusion', 'REVIEW', 'False', 'ML1', 'MDE')
    ]);

    expect(summary.unmatchedChecks).toEqual(['Secure Boot', 'Defender Real-Time Protection']);
    expect(summary.totalAuditPolicy).toBe(1);
    expect(summary.matchedAuditPolicy).toBe(0);
  });

  it('collects deduped unmatched AuditPolicy checks with original casing', () => {
    const summary = deriveEvidence([
      row('Security Event Log Size', 'FAIL', 'False', 'ML2', 'AuditPolicy'),
      row('security event log size', 'PASS', 'True', 'ML2', 'AuditPolicy'),
      row('NTLM Outgoing Traffic Auditing', 'FAIL', 'False', 'ML2', 'AuditPolicy'),
      row('Audit Logon', 'N/A', 'False', 'ML2', 'AuditPolicy')
    ]);

    expect(summary.unmatchedAuditPolicyChecks).toEqual(['Security Event Log Size', 'NTLM Outgoing Traffic Auditing']);
    expect(summary.matchedAuditPolicyEntries).toBe(0);
    expect(summary.totalAuditPolicy).toBe(4);
    expect(summary.matchedAuditPolicy).toBe(0);
  });
});

function row(
  check: string,
  status = 'PASS',
  enabled = '',
  ml = 'ML3',
  assessmentType = 'E8',
  values: { detail?: string; rawValue?: string; requiredSetting?: string } = {}
): Record<string, string> {
  return {
    AssessmentType: assessmentType,
    Category: 'Test',
    Check: check,
    ML: ml,
    Status: status,
    Enabled: enabled,
    Detail: values.detail ?? '',
    RawValue: values.rawValue ?? '',
    RequiredSetting: values.requiredSetting ?? ''
  };
}
