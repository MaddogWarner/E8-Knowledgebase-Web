import { Printer } from 'lucide-react';
import { useEffect } from 'react';
import { Navigate, useLocation, useParams } from 'react-router';
import { GapNote } from '../components/GapNote';
import { M365Additions } from '../components/M365Additions';
import { MaturityTabs } from '../components/MaturityTabs';
import { ProgressBar } from '../components/ProgressBar';
import { StepCard } from '../components/StepCard';
import { getControl, getLevelContent, maturityLevels, ml0GenericDescription } from '../data/controls';
import { useEvidence } from '../lib/EvidenceContext';
import { resolveIcon } from '../lib/icons';
import { isLicenseMode } from '../lib/license';
import { isMaturityLevel } from '../lib/search';
import { isStepCompleteOrNotApplicable, isStepDone, statusCounts } from '../lib/status';
import { useLocalStorage } from '../lib/useLocalStorage';
import { useStepProgress } from '../lib/useStepProgress';
import type { MaturityLevel, Microsoft365LicenseMode } from '../types';

export function ControlPage() {
  const { controlId, level } = useParams();
  const location = useLocation();
  const id = Number(controlId);
  const control = getControl(id);
  const activeLevel = isMaturityLevel(level) ? level : 'ml1';
  const [licenseMode] = useLocalStorage<Microsoft365LicenseMode>('e8kb.licenseMode', 'none', isLicenseMode);
  const [targetMaturity] = useLocalStorage<MaturityLevel>('e8kb.targetMaturity', 'ml1', isMaturityLevel);
  const { evidence } = useEvidence();
  const { status } = useStepProgress();

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.slice(1));
      element?.scrollIntoView({ block: 'start' });
    }
  }, [location.hash, activeLevel]);

  if (!control) return <Navigate to="/not-found" replace />;
  if (level && !isMaturityLevel(level)) return <Navigate to={`/control/${id}/ml1`} replace />;

  const Icon = resolveIcon(control.icon);
  const content = getLevelContent(control, activeLevel);
  const allSteps = maturityLevels.flatMap(({ id: maturityLevel }) => getLevelContent(control, maturityLevel).steps);
  const progressCounts = statusCounts(allSteps, status, evidence);
  const levelNotApplicable = content.steps.filter((step) => isStepCompleteOrNotApplicable(status(step.id), evidence[step.id]) && !isStepDone(status(step.id), evidence[step.id])).length;
  const levelTotal = content.steps.length - levelNotApplicable;
  const levelDone = content.steps.filter((step) => isStepDone(status(step.id), evidence[step.id])).length;
  const beyondTarget = maturityLevels.findIndex((item) => item.id === activeLevel) > maturityLevels.findIndex((item) => item.id === targetMaturity);

  return (
    <div className="page-stack">
      <section className="control-hero">
        <div className="hero-icon">
          <Icon size={34} />
        </div>
        <div>
          <p className="eyebrow">Mitigation {control.id}</p>
          <h1>{control.name}</h1>
          <p>{control.overview}</p>
        </div>
        <button type="button" className="print-button" onClick={() => window.print()}>
          <Printer size={18} />
          Print / Save as PDF
        </button>
      </section>

      <section className="ml0-block">
        <h2>ML0 baseline</h2>
        <p>{ml0GenericDescription}</p>
        <p>{control.ml0Description}</p>
      </section>

      <ProgressBar {...progressCounts} />

      <MaturityTabs controlId={control.id} activeLevel={activeLevel} />

      <section className="level-section">
        <p className="eyebrow">What {activeLevel.toUpperCase()} requires</p>
        <div className="level-title-row">
          <h2>{content.summary}</h2>
          {beyondTarget && <span className="beyond-chip">Beyond target</span>}
        </div>
        <p className="level-progress">{activeLevel.toUpperCase()} · {levelDone}/{levelTotal} steps implemented</p>
        <div className="steps-list">
          {content.steps.map((step, index) => (
            <StepCard key={step.id} step={step} index={index} />
          ))}
        </div>
      </section>

      {content.gapNote && <GapNote note={content.gapNote} />}
      <M365Additions controlId={control.id} level={activeLevel} licenseMode={licenseMode} />
    </div>
  );
}
