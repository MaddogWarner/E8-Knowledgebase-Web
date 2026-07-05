import { useEffect, useState } from 'react';
import { verificationDetails } from '../data/verification';
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
  const { status, setStatus } = useStepProgress();
  const stepStatus = status(step.id);
  const [reason, setReason] = useState(stepStatus.reason ?? '');
  const state = classifyStep(stepStatus, evidence[step.id]);
  const verification = verificationDetails[step.id] ?? [];
  const statusLabel = state === 'evidenced'
    ? 'Evidence provided'
    : state === 'failed'
      ? 'Audit: non-compliant'
      : state === 'implemented'
        ? 'Marked implemented'
        : state === 'notApplicable'
          ? 'Not applicable'
          : null;

  useEffect(() => {
    setReason(stepStatus.reason ?? '');
  }, [stepStatus.reason, stepStatus.state]);

  function saveReason() {
    if (stepStatus.state === 'notApplicable') {
      setStatus(step.id, { state: 'notApplicable', reason });
    }
  }

  return (
    <article className={`step-card ${state}`} id={step.id}>
      <div className="step-number">{index + 1}</div>
      <div className="step-content">
        <div className="step-title-row">
          <h3>{step.title}</h3>
          {statusLabel && <span className={`status-badge ${state}`}>{statusLabel}</span>}
        </div>
        {step.ismControls.length > 0 && (
          <div className="ism-capsules" aria-label={`ISM controls: ${step.ismControls.join(', ')}`}>
            {step.ismControls.map((control) => (
              <span key={control} className="ism-capsule">{control}</span>
            ))}
          </div>
        )}
        <div className="step-status-control" role="radiogroup" aria-label={`Implementation status for ${step.title}`}>
          <button
            type="button"
            role="radio"
            aria-checked={stepStatus.state === 'notImplemented'}
            className={stepStatus.state === 'notImplemented' ? 'active' : ''}
            onClick={() => setStatus(step.id, { state: 'notImplemented' })}
          >
            Not implemented
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={stepStatus.state === 'implemented'}
            className={stepStatus.state === 'implemented' ? 'active' : ''}
            onClick={() => setStatus(step.id, { state: 'implemented' })}
          >
            Implemented
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={stepStatus.state === 'notApplicable'}
            className={stepStatus.state === 'notApplicable' ? 'active' : ''}
            onClick={() => setStatus(step.id, { state: 'notApplicable', reason })}
          >
            N/A
          </button>
        </div>
        {stepStatus.state === 'notApplicable' && (
          <div className="na-reason">
            <label>
              <span>N/A reason</span>
              <input
                type="text"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                onBlur={saveReason}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.currentTarget.blur();
                  }
                }}
                placeholder="Optional local reason"
              />
            </label>
            {stepStatus.reason && <p>{stepStatus.reason}</p>}
          </div>
        )}
        <p>{step.description}</p>
        <div className="technical-details">
          {step.technicalDetails.map((detail) => (
            <div key={detail} className="technical-detail">
              {technicalDetailLabel(detail) && <span className="type-chip">{technicalDetailLabel(detail)}</span>}
              <CodeBlock text={detail} />
            </div>
          ))}
        </div>
        {verification.length > 0 && (
          <div className="verification-details">
            <h4>Verify</h4>
            {verification.map((detail) => (
              <div key={detail.command} className="technical-detail">
                <span className="type-chip">Verify</span>
                <CodeBlock text={detail.command} />
                {detail.note && <p>{detail.note}</p>}
              </div>
            ))}
          </div>
        )}
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
