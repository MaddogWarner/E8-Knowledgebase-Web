import { getLevelContent } from '../data/controls';
import type { EssentialControl, MaturityLevel, StepStatus } from '../types';
import { classifyStep, compliancePercentage, levelsUpTo } from './status';

export interface ReportRow {
  GeneratedDate: string;
  Profile: string;
  TargetMaturity: string;
  ControlId: string;
  ControlName: string;
  Level: string;
  StepId: string;
  StepTitle: string;
  ISMControls: string;
  State: string;
  Reason: string;
  Evidence: string;
  CompliancePercent: string;
}

const headers: Array<keyof ReportRow> = [
  'GeneratedDate',
  'Profile',
  'TargetMaturity',
  'ControlId',
  'ControlName',
  'Level',
  'StepId',
  'StepTitle',
  'ISMControls',
  'State',
  'Reason',
  'Evidence',
  'CompliancePercent'
];

function displayState(status: StepStatus) {
  if (status.state === 'implemented') return 'Implemented';
  if (status.state === 'notApplicable') return 'Not Applicable';
  return 'Not Implemented';
}

export function buildReportRows(
  controls: EssentialControl[],
  target: MaturityLevel,
  status: (stepId: string) => StepStatus,
  evidenceMap: Record<string, 'pass' | 'fail'>,
  profile = 'Default'
): ReportRow[] {
  const generatedDate = new Date().toISOString();

  return controls.flatMap((control) => {
    const targetSteps = levelsUpTo(target).flatMap((level) => getLevelContent(control, level).steps);
    const controlPercent = compliancePercentage(targetSteps, status, evidenceMap).toString();

    return levelsUpTo(target).flatMap((level) => getLevelContent(control, level).steps.map((step) => {
      const stepStatus = status(step.id);
      const evidence = evidenceMap[step.id] ?? '';
      const classified = classifyStep(stepStatus, evidenceMap[step.id]);

      return {
        GeneratedDate: generatedDate,
        Profile: profile,
        TargetMaturity: target.toUpperCase(),
        ControlId: String(control.id),
        ControlName: control.name,
        Level: level.toUpperCase(),
        StepId: step.id,
        StepTitle: step.title,
        ISMControls: step.ismControls.join(' '),
        State: classified === 'evidenced' ? 'Implemented' : displayState(stepStatus),
        Reason: stepStatus.reason ?? '',
        Evidence: evidence,
        CompliancePercent: controlPercent
      };
    }));
  });
}

function escapeCsv(value: string) {
  if (/[",\n\r;]/.test(value)) return `"${value.replaceAll('"', '""')}"`;
  return value;
}

export function toCsv(rows: ReportRow[]): string {
  const lines = [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => escapeCsv(row[header])).join(','))
  ];
  return `${lines.join('\r\n')}\r\n`;
}
