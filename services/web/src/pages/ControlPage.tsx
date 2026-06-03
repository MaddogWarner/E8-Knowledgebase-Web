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
import { classifyStep, type StepState } from '../lib/status';
import { useLocalStorage } from '../lib/useLocalStorage';
import { useStepProgress } from '../lib/useStepProgress';
import type { Microsoft365LicenseMode } from '../types';

export function ControlPage() {
  const { controlId, level } = useParams();
  const location = useLocation();
  const id = Number(controlId);
  const control = getControl(id);
  const activeLevel = isMaturityLevel(level) ? level : 'ml1';
  const [licenseMode] = useLocalStorage<Microsoft365LicenseMode>('e8kb.licenseMode', 'none', isLicenseMode);
  const { evidence } = useEvidence();
  const { isTicked } = useStepProgress();

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
  const progressCounts = allSteps.reduce<Record<StepState, number>>(
    (counts, step) => {
      counts[classifyStep(isTicked(step.id), evidence[step.id])] += 1;
      return counts;
    },
    { evidenced: 0, self: 0, failed: 0, remaining: 0 }
  );
  const levelDone = content.steps.filter((step) => {
    const state = classifyStep(isTicked(step.id), evidence[step.id]);
    return state === 'evidenced' || state === 'self';
  }).length;

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
        <h2>{content.summary}</h2>
        <p className="level-progress">{activeLevel.toUpperCase()} · {levelDone}/{content.steps.length} steps implemented</p>
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
