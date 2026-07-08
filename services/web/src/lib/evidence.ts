import { controls } from '../data/controls';
import { auditPolicyEntryIdForCheck, stepIdsForAuditPolicyCheck, stepIdsForCheck } from '../data/auditMapping';

export type AuditPolicyEntryState = 'compliant' | 'nonCompliant' | 'review';

export interface AuditPolicyEntryEvidence {
  state: AuditPolicyEntryState;
  current?: string;
  expected?: string;
}

export interface EvidenceSummary {
  statuses: Record<string, 'pass' | 'fail'>;
  totalE8: number;
  matched: number;
  totalAuditPolicy: number;
  matchedAuditPolicy: number;
  auditPolicyEntryStates: Record<string, AuditPolicyEntryEvidence>;
  matchedAuditPolicyEntries: number;
  unmatchedAuditPolicyChecks: string[];
  controlsCovered: number;
  unmatchedChecks: string[];
}

type RowEvidence = 'pass' | 'fail' | undefined;

function evidenceForRow(row: Record<string, string>): RowEvidence {
  const status = (row.Status ?? '').trim().toUpperCase();
  const enabled = (row.Enabled ?? '').trim();
  const check = (row.Check ?? '').trim().toLowerCase();

  if (status === 'PASS') return 'pass';
  if (status === 'FAIL' || status === 'HIGH RISK' || status === 'AUDIT') return 'fail';
  if (status === 'REVIEW' && check.startsWith('asr:')) return 'fail';
  if (!status && enabled === 'True') return 'pass';
  if (!status && enabled === 'False') return 'fail';
  return undefined;
}

function auditPolicyEntryEvidenceForRow(row: Record<string, string>): AuditPolicyEntryEvidence | undefined {
  const status = (row.Status ?? '').trim().toUpperCase();
  const enabled = (row.Enabled ?? '').trim();
  let state: AuditPolicyEntryState | undefined;

  if (status === 'PASS') state = 'compliant';
  else if (status === 'FAIL' || status === 'HIGH RISK') state = 'nonCompliant';
  else if (status === 'REVIEW') state = 'review';
  else if (!status && enabled === 'True') state = 'compliant';
  else if (!status && enabled === 'False') state = 'nonCompliant';

  if (!state) return undefined;
  if (state === 'compliant') return { state };

  const current = (row.Detail ?? '').trim() || (row.RawValue ?? '').trim();
  const expected = (row.RequiredSetting ?? '').trim();
  return {
    state,
    ...(current ? { current } : {}),
    ...(expected ? { expected } : {})
  };
}

const auditPolicyEntryStatePrecedence: Record<AuditPolicyEntryState, number> = {
  compliant: 1,
  review: 2,
  nonCompliant: 3
};

function controlIdForStep(stepId: string): number | undefined {
  const id = Number(stepId.split('-')[0]);
  return controls.some((control) => control.id === id) ? id : undefined;
}

export function deriveEvidence(rows: Array<Record<string, string>>): EvidenceSummary {
  const stepRows: Record<string, RowEvidence[]> = {};
  let totalE8 = 0;
  let matched = 0;
  let totalAuditPolicy = 0;
  let matchedAuditPolicy = 0;
  const auditPolicyEntryStates: Record<string, AuditPolicyEntryEvidence> = {};
  const coveredControls = new Set<number>();
  const unmatchedChecks: string[] = [];
  const seenUnmatchedChecks = new Set<string>();
  const unmatchedAuditPolicyChecks: string[] = [];
  const seenUnmatchedAuditPolicyChecks = new Set<string>();

  function addEvidence(stepIds: string[], rowEvidence: RowEvidence) {
    for (const stepId of stepIds) {
      const controlId = controlIdForStep(stepId);
      if (controlId) coveredControls.add(controlId);
      stepRows[stepId] = [...(stepRows[stepId] ?? []), rowEvidence];
    }
  }

  function addAuditPolicyEntryEvidence(entryId: string, rowEvidence: AuditPolicyEntryEvidence | undefined) {
    if (!rowEvidence) return;
    const existing = auditPolicyEntryStates[entryId];
    if (!existing || auditPolicyEntryStatePrecedence[rowEvidence.state] > auditPolicyEntryStatePrecedence[existing.state]) {
      auditPolicyEntryStates[entryId] = rowEvidence;
    }
  }

  for (const row of rows) {
    const assessmentType = (row.AssessmentType ?? '').trim();

    if (assessmentType === 'E8') {
      totalE8 += 1;

      const check = row.Check ?? '';
      const stepIds = stepIdsForCheck(check);
      if (stepIds.length === 0) {
        const normalised = check.trim().toLowerCase();
        if (normalised && !seenUnmatchedChecks.has(normalised)) {
          seenUnmatchedChecks.add(normalised);
          unmatchedChecks.push(check.trim());
        }
        continue;
      }

      matched += 1;
      addEvidence(stepIds, evidenceForRow(row));
      continue;
    }

    if (assessmentType === 'AuditPolicy') {
      totalAuditPolicy += 1;

      const check = row.Check ?? '';
      const entryId = auditPolicyEntryIdForCheck(check);
      if (entryId) {
        addAuditPolicyEntryEvidence(entryId, auditPolicyEntryEvidenceForRow(row));
      } else {
        const normalised = check.trim().toLowerCase();
        if (normalised && !seenUnmatchedAuditPolicyChecks.has(normalised)) {
          seenUnmatchedAuditPolicyChecks.add(normalised);
          unmatchedAuditPolicyChecks.push(check.trim());
        }
      }

      const stepIds = stepIdsForAuditPolicyCheck(check);
      if (stepIds.length === 0) continue;

      matchedAuditPolicy += 1;
      addEvidence(stepIds, evidenceForRow(row));
    }
  }

  const statuses = Object.entries(stepRows).reduce<Record<string, 'pass' | 'fail'>>((result, [stepId, evidence]) => {
    const contributing = evidence.filter((item): item is 'pass' | 'fail' => item === 'pass' || item === 'fail');
    if (contributing.length === 0) return result;
    result[stepId] = contributing.some((item) => item === 'fail') ? 'fail' : 'pass';
    return result;
  }, {});

  return {
    statuses,
    totalE8,
    matched,
    totalAuditPolicy,
    matchedAuditPolicy,
    auditPolicyEntryStates,
    matchedAuditPolicyEntries: Object.keys(auditPolicyEntryStates).length,
    unmatchedAuditPolicyChecks,
    controlsCovered: coveredControls.size,
    unmatchedChecks
  };
}
