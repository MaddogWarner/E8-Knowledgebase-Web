import { controls } from '../data/controls';
import { stepIdsForCheck } from '../data/auditMapping';

export interface EvidenceSummary {
  statuses: Record<string, 'pass' | 'fail'>;
  totalE8: number;
  matched: number;
  controlsCovered: number;
}

type RowEvidence = 'pass' | 'fail' | undefined;

function evidenceForRow(row: Record<string, string>): RowEvidence {
  const status = (row.Status ?? '').trim().toUpperCase();
  const enabled = (row.Enabled ?? '').trim();

  if (status === 'PASS') return 'pass';
  if (status === 'FAIL' || status === 'HIGH RISK') return 'fail';
  if (!status && enabled === 'True') return 'pass';
  if (!status && enabled === 'False') return 'fail';
  return undefined;
}

function controlIdForStep(stepId: string): number | undefined {
  const id = Number(stepId.split('-')[0]);
  return controls.some((control) => control.id === id) ? id : undefined;
}

export function deriveEvidence(rows: Array<Record<string, string>>): EvidenceSummary {
  const stepRows: Record<string, RowEvidence[]> = {};
  let totalE8 = 0;
  let matched = 0;
  const coveredControls = new Set<number>();

  for (const row of rows) {
    if ((row.AssessmentType ?? '').trim() !== 'E8') continue;
    totalE8 += 1;

    const stepIds = stepIdsForCheck(row.Check ?? '');
    if (stepIds.length === 0) continue;

    matched += 1;
    const rowEvidence = evidenceForRow(row);

    for (const stepId of stepIds) {
      const controlId = controlIdForStep(stepId);
      if (controlId) coveredControls.add(controlId);
      stepRows[stepId] = [...(stepRows[stepId] ?? []), rowEvidence];
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
    controlsCovered: coveredControls.size
  };
}
