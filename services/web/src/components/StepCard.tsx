import type { ImplementationStep } from '../types';
import { useEvidence } from '../lib/EvidenceContext';
import { classifyStep } from '../lib/status';
import { useStepProgress } from '../lib/useStepProgress';
import { CodeBlock } from './CodeBlock';

interface StepCardProps {
  step: ImplementationStep;
  index: number;
}

export function StepCard({ step, index }: StepCardProps) {
  const { evidence } = useEvidence();
  const { isTicked, toggle } = useStepProgress();
  const ticked = isTicked(step.id);
  const state = classifyStep(ticked, evidence[step.id]);
  const checked = state === 'evidenced' || ticked;
  const statusLabel = state === 'evidenced'
    ? 'Evidence provided'
    : state === 'failed'
      ? 'Audit: non-compliant'
      : state === 'self'
        ? 'Marked implemented'
        : null;

  return (
    <article className={`step-card ${state}`} id={step.id}>
      <div className="step-number">{index + 1}</div>
      <div className="step-content">
        <div className="step-title-row">
          <label className="step-checkbox">
            <input
              type="checkbox"
              checked={checked}
              disabled={state === 'evidenced'}
              onChange={() => toggle(step.id)}
              aria-label={`Mark ${step.title} implemented`}
            />
          </label>
          <h3>{step.title}</h3>
          {statusLabel && <span className={`status-badge ${state}`}>{statusLabel}</span>}
        </div>
        <p>{step.description}</p>
        <div className="technical-details">
          {step.technicalDetails.map((detail) => (
            <div key={detail} className="technical-detail">
              {technicalDetailLabel(detail) && <span className="type-chip">{technicalDetailLabel(detail)}</span>}
              <CodeBlock text={detail} />
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

const recognisedLabels = [
  'Command',
  'GPO',
  'Registry',
  'PowerShell',
  'Event log',
  'Event log path',
  'Deny path',
  'UI',
  'Reference',
  'Format',
  'Apply',
  'Create',
  'AD schema'
];

function technicalDetailLabel(detail: string): string | null {
  const match = /^([A-Za-z ]+):/.exec(detail);
  if (!match) return null;
  return recognisedLabels.includes(match[1]) ? match[1] : null;
}
