import { useEffect, useState } from 'react';
import { attackTechniques, type AttackTechnique } from '../data/attack';
import { mappingsForStep } from '../lib/attack';
import { readAudit, noteTextMaxLength, stepStateLabels } from '../lib/audit';
import { useProfiles } from '../lib/profiles';
import { useLocalStorage } from '../lib/useLocalStorage';
import { Modal } from './Modal';
import { TechniqueDialog } from './TechniqueDialog';
import { verificationDetails } from '../data/verification';
import type { ImplementationStep, StepStateValue } from '../types';
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
  const { storageKey } = useProfiles();
  const [deepAudit] = useLocalStorage<'true' | 'false'>('e8kb.deepAudit', 'false', isBooleanString);
  const entries = readAudit(storageKey('auditTrail'))[step.id] ?? [];
  const [pending, setPending] = useState<StepStateValue | null>(null);
  const [note, setNote] = useState('');
  const [technique, setTechnique] = useState<AttackTechnique | null>(null);
  const mappings = mappingsForStep(step.id);
  const mapped = attackTechniques.filter((technique) => mappings.some((mapping) => mapping.techniqueId === technique.id));
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

  function requestChange(state: StepStateValue) {
    if (deepAudit === 'true' && state !== stepStatus.state) {
      setNote(state === 'notApplicable' ? reason : '');
      setPending(state);
    } else setStatus(step.id, { state, ...(state === 'notApplicable' ? { reason } : {}) });
  }

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
          {step.osScope !== 'both' && <span className="step-scope-badge" aria-label={`OS scope: ${step.osScope}`}>{step.osScope[0].toUpperCase() + step.osScope.slice(1)}</span>}
          {statusLabel && <span className={`status-badge ${state}`}>{statusLabel}</span>}
        </div>
        {step.ismControls.length > 0 && (
          <div className="ism-capsules" aria-label={`ISM controls: ${step.ismControls.join(', ')}`}>
            {step.ismControls.map((control) => (
              <span key={control} className="ism-capsule">{control}</span>
            ))}
          </div>
        )}
        {mapped.length > 0 && <div className="attack-chips" aria-label="ATT&CK techniques">{mapped.map((item) => <button type="button" className="attack-chip" key={item.id} aria-label={`${item.id} ${item.name}`} onClick={() => setTechnique(item)}>{item.id}</button>)}</div>}
        <div className="step-status-control" role="radiogroup" aria-label={`Implementation status for ${step.title}`}>
          <button
            type="button"
            role="radio"
            aria-checked={stepStatus.state === 'notImplemented'}
            className={stepStatus.state === 'notImplemented' ? 'active' : ''}
            onClick={() => requestChange('notImplemented')}
          >
            Not implemented
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={stepStatus.state === 'implemented'}
            className={stepStatus.state === 'implemented' ? 'active' : ''}
            onClick={() => requestChange('implemented')}
          >
            Implemented
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={stepStatus.state === 'notApplicable'}
            className={stepStatus.state === 'notApplicable' ? 'active' : ''}
            onClick={() => requestChange('notApplicable')}
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
                maxLength={noteTextMaxLength}
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
        {deepAudit === 'true' && entries.length > 0 && <details className="audit-history"><summary>History ({entries.length})</summary><ol>{[...entries].reverse().map((entry) => <li key={entry.id}>
          <strong>{stepStateLabels[entry.previousState]} → {stepStateLabels[entry.newState]}</strong>
          <time dateTime={entry.timestamp}>{new Date(entry.timestamp).toLocaleDateString('en-AU', { day: '2-digit', month: '2-digit', year: 'numeric' })} {new Date(entry.timestamp).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: false })}</time>
          {entry.note && <p>{entry.note}</p>}
        </li>)}</ol></details>}
        {pending && <Modal title={pending === 'notApplicable' ? 'N/A reason' : 'Add Audit Note'} onClose={() => setPending(null)}>
          <form onSubmit={(event) => { event.preventDefault(); setStatus(step.id, { state: pending, ...(pending === 'notApplicable' ? { reason: note } : {}) }, note); setPending(null); }}>
            <label>{pending === 'notApplicable' ? 'N/A reason' : 'Optional audit note'}<input type="text" maxLength={noteTextMaxLength} value={note} onChange={(event) => setNote(event.target.value)} /></label>
            <div className="reset-actions"><button type="submit">Save</button><button type="button" onClick={() => setPending(null)}>Cancel</button></div>
          </form>
        </Modal>}
        {technique && <TechniqueDialog technique={technique} onClose={() => setTechnique(null)} />}
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

function isBooleanString(value: string): value is 'true' | 'false' {
  return value === 'true' || value === 'false';
}
