import { Printer } from 'lucide-react';
import { useEffect, useState } from 'react';
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
import { isOSScope, stepsInScope } from '../lib/scope';
import { classifyStep, isStepCompleteOrNotApplicable, isStepDone, statusCounts } from '../lib/status';
import { useLocalStorage } from '../lib/useLocalStorage';
import { useStepProgress } from '../lib/useStepProgress';
import type { MaturityLevel, Microsoft365LicenseMode, OSScope } from '../types';
import type { StepDisplayState } from '../lib/status';

export function ControlPage() {
  const { controlId, level } = useParams();
  const location = useLocation();
  const id = Number(controlId);
  const control = getControl(id);
  const activeLevel = isMaturityLevel(level) ? level : 'ml1';
  const [licenseMode] = useLocalStorage<Microsoft365LicenseMode>('e8kb.licenseMode', 'none', isLicenseMode);
  const [targetMaturity] = useLocalStorage<MaturityLevel>('e8kb.targetMaturity', 'ml1', isMaturityLevel);
  const [osScope] = useLocalStorage<OSScope>('e8kb.osScope', 'both', isOSScope);
  const { evidence } = useEvidence();
  const { status } = useStepProgress();
  const [activeFilters, setActiveFilters] = useState<StepDisplayState[]>([]);

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.slice(1));
      element?.scrollIntoView({ block: 'start' });
    }
  }, [location.hash, activeLevel]);

  useEffect(() => {
    setActiveFilters([]);
  }, [id]);

  if (!control) return <Navigate to="/not-found" replace />;
  if (level && !isMaturityLevel(level)) return <Navigate to={`/control/${id}/ml1`} replace />;

  const Icon = resolveIcon(control.icon);
  const content = getLevelContent(control, activeLevel);
  const allSteps = stepsInScope(maturityLevels.flatMap(({ id: maturityLevel }) => getLevelContent(control, maturityLevel).steps), osScope);
  const scopedLevelSteps = stepsInScope(content.steps, osScope);
  const progressCounts = statusCounts(allSteps, status, evidence);
  const levelNotApplicable = scopedLevelSteps.filter((step) => isStepCompleteOrNotApplicable(status(step.id), evidence[step.id]) && !isStepDone(status(step.id), evidence[step.id])).length;
  const levelTotal = scopedLevelSteps.length - levelNotApplicable;
  const levelDone = scopedLevelSteps.filter((step) => isStepDone(status(step.id), evidence[step.id])).length;
  const beyondTarget = maturityLevels.findIndex((item) => item.id === activeLevel) > maturityLevels.findIndex((item) => item.id === targetMaturity);
  const visibleSteps = activeFilters.length === 0
    ? scopedLevelSteps
    : scopedLevelSteps.filter((step) => activeFilters.includes(classifyStep(status(step.id), evidence[step.id])));

  function toggleFilter(state: StepDisplayState) {
    setActiveFilters((current) => current.includes(state)
      ? current.filter((item) => item !== state)
      : [...current, state]);
  }

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

      <ProgressBar {...progressCounts} activeFilters={activeFilters} onToggleFilter={toggleFilter} />

      <MaturityTabs controlId={control.id} activeLevel={activeLevel} />

      <section className="level-section">
        <p className="eyebrow">What {activeLevel.toUpperCase()} requires</p>
        <div className="level-title-row">
          <h2>{content.summary}</h2>
          {beyondTarget && <span className="beyond-chip">Beyond target</span>}
        </div>
        <p className="level-progress">{activeLevel.toUpperCase()} · {levelDone}/{levelTotal} steps implemented</p>
        {activeFilters.length > 0 && (
          <div className="filter-summary">
            <span>Showing {visibleSteps.length} of {scopedLevelSteps.length} steps</span>
            <button type="button" onClick={() => setActiveFilters([])}>Clear filters</button>
          </div>
        )}
        <div className="steps-list">
          {scopedLevelSteps.length === 0
            ? <p className="empty-state">No steps in this maturity level apply to the selected OS scope. Change it on the About page.</p>
            : visibleSteps.length > 0
            ? visibleSteps.map((step) => (
                <StepCard key={step.id} step={step} index={scopedLevelSteps.indexOf(step)} />
              ))
            : <p className="empty-state">No steps in this maturity level match the selected filters.</p>}
        </div>
      </section>

      {content.gapNote && <GapNote note={content.gapNote} />}
      <M365Additions controlId={control.id} level={activeLevel} licenseMode={licenseMode} />
    </div>
  );
}
