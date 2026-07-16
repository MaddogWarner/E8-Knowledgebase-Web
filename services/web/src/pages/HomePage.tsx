import { Link } from 'react-router';
import { ComplianceChart } from '../components/ComplianceChart';
import { ComplianceRing } from '../components/ComplianceRing';
import { EvidenceUpload } from '../components/EvidenceUpload';
import { controls, getLevelContent } from '../data/controls';
import { useEvidence } from '../lib/EvidenceContext';
import { resolveIcon } from '../lib/icons';
import { useProfiles } from '../lib/profiles';
import { buildReportRows, toCsv } from '../lib/report';
import { isMaturityLevel } from '../lib/search';
import { isOSScope, stepsInScope } from '../lib/scope';
import { compliancePercentage, controlComplete, isStepCompleteOrNotApplicable, isStepDone, levelsUpTo, statusCounts } from '../lib/status';
import { useLocalStorage } from '../lib/useLocalStorage';
import { useStepProgress } from '../lib/useStepProgress';
import type { MaturityLevel, OSScope, StepStateValue } from '../types';

function isBooleanString(value: string): value is 'true' | 'false' {
  return value === 'true' || value === 'false';
}

const printStateLabels: Record<StepStateValue, string> = {
  implemented: 'Implemented',
  notApplicable: 'Not applicable',
  notImplemented: 'Not implemented'
};

export function HomePage() {
  const [targetMaturity, setTargetMaturity] = useLocalStorage<MaturityLevel>('e8kb.targetMaturity', 'ml1', isMaturityLevel);
  const [hideComplete, setHideComplete] = useLocalStorage<'true' | 'false'>('e8kb.hideComplete', 'false', isBooleanString);
  const [osScope] = useLocalStorage<OSScope>('e8kb.osScope', 'both', isOSScope);
  const { evidence } = useEvidence();
  const { status } = useStepProgress();
  const { activeProfile } = useProfiles();
  const visibleControls = controls.filter((control) => hideComplete !== 'true' || !controlComplete(control, targetMaturity, status, evidence, osScope));
  const targetLevels = levelsUpTo(targetMaturity);
  const allTargetSteps = stepsInScope(controls.flatMap((control) => targetLevels.flatMap((level) => getLevelContent(control, level).steps)), osScope);
  const overallPercentage = compliancePercentage(allTargetSteps, status, evidence);
  const chartRows = controls.map((control) => {
    const targetSteps = stepsInScope(targetLevels.flatMap((level) => getLevelContent(control, level).steps), osScope);
    const counts = statusCounts(targetSteps, status, evidence);
    return {
      id: control.id,
      name: control.name,
      implemented: counts.evidenced + counts.implemented,
      notApplicable: counts.notApplicable,
      pending: counts.failed + counts.remaining
    };
  });

  function profileSlug() {
    return activeProfile.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'default';
  }

  function exportCsv() {
    const rows = buildReportRows(controls, targetMaturity, status, evidence, activeProfile.name, osScope);
    const blob = new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `e8kb-compliance-report-${profileSlug()}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="page-stack">
      <section className="page-heading">
        <p className="eyebrow">November 2023 model</p>
        <h1>Essential 8 Knowledge Base</h1>
        <p>
          A static, offline quick reference for administrators implementing ASD Essential Eight controls with built-in Windows OS tooling.
        </p>
        <div className="home-controls">
          <EvidenceUpload />
          <div className="target-controls" aria-label="Progress view controls">
            <label>
              <span>Target maturity</span>
              <select value={targetMaturity} onChange={(event) => setTargetMaturity(event.target.value as MaturityLevel)}>
                <option value="ml1">ML1</option>
                <option value="ml2">ML2</option>
                <option value="ml3">ML3</option>
              </select>
            </label>
            <label className="switch-row">
              <input
                type="checkbox"
                checked={hideComplete === 'true'}
                onChange={(event) => setHideComplete(event.target.checked ? 'true' : 'false')}
              />
              <span>Hide completed mitigations</span>
            </label>
          </div>
        </div>
      </section>

      <section className="dashboard-panel" aria-label="Compliance dashboard">
        <div className="dashboard-heading">
          <div>
            <p className="eyebrow">Compliance dashboard</p>
            <h2>{targetMaturity.toUpperCase()} target</h2>
          </div>
          <div className="dashboard-actions">
            <button type="button" className="print-button" onClick={exportCsv}>Export CSV</button>
            <button type="button" className="print-button" onClick={() => window.print()}>Print report</button>
          </div>
        </div>
        <div className="dashboard-grid">
          <ComplianceRing percentage={overallPercentage} />
          <ComplianceChart rows={chartRows} />
        </div>
      </section>

      <section className="control-grid" aria-label="Essential Eight mitigations">
        {visibleControls.map((control) => {
          const Icon = resolveIcon(control.icon);
          const targetSteps = stepsInScope(targetLevels.flatMap((level) => getLevelContent(control, level).steps), osScope);
          const notApplicable = targetSteps.filter((step) => isStepCompleteOrNotApplicable(status(step.id), evidence[step.id]) && !isStepDone(status(step.id), evidence[step.id])).length;
          const total = targetSteps.length - notApplicable;
          const done = targetSteps.filter((step) => isStepDone(status(step.id), evidence[step.id])).length;
          const complete = controlComplete(control, targetMaturity, status, evidence, osScope);
          return (
            <Link key={control.id} to={`/control/${control.id}/ml1`} className="control-card">
              <Icon size={26} />
              <small>Mitigation {control.id}</small>
              <h2>{control.name}</h2>
              <p>{control.overview}</p>
              <div className="card-footer-row">
                <span className="card-progress">{targetMaturity.toUpperCase()} · {done}/{total}</span>
                {complete && <span className="completion-chip">Complete</span>}
              </div>
            </Link>
          );
        })}
      </section>

      <section className="print-report-list" aria-label="Printable compliance report">
        <h2>Compliance report</h2>
        {controls.map((control) => (
          <div key={control.id}>
            <h3>{control.id}. {control.name}</h3>
            <ul>
              {targetLevels.flatMap((level) => stepsInScope(getLevelContent(control, level).steps, osScope).map((step) => (
                <li key={step.id}>
                  <strong>{level.toUpperCase()}:</strong> {step.title} — {printStateLabels[status(step.id).state]}
                </li>
              )))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}
