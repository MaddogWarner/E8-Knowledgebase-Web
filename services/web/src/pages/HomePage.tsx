import { Link } from 'react-router';
import { EvidenceUpload } from '../components/EvidenceUpload';
import { controls, getLevelContent } from '../data/controls';
import { useEvidence } from '../lib/EvidenceContext';
import { resolveIcon } from '../lib/icons';
import { isMaturityLevel } from '../lib/search';
import { controlComplete, isStepDone, levelsUpTo } from '../lib/status';
import { useLocalStorage } from '../lib/useLocalStorage';
import { useStepProgress } from '../lib/useStepProgress';
import type { MaturityLevel } from '../types';

function isBooleanString(value: string): value is 'true' | 'false' {
  return value === 'true' || value === 'false';
}

export function HomePage() {
  const [targetMaturity, setTargetMaturity] = useLocalStorage<MaturityLevel>('e8kb.targetMaturity', 'ml1', isMaturityLevel);
  const [hideComplete, setHideComplete] = useLocalStorage<'true' | 'false'>('e8kb.hideComplete', 'false', isBooleanString);
  const { evidence } = useEvidence();
  const { isTicked } = useStepProgress();
  const visibleControls = controls.filter((control) => hideComplete !== 'true' || !controlComplete(control, targetMaturity, isTicked, evidence));

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

      <section className="control-grid" aria-label="Essential Eight mitigations">
        {visibleControls.map((control) => {
          const Icon = resolveIcon(control.icon);
          const targetSteps = levelsUpTo(targetMaturity).flatMap((level) => getLevelContent(control, level).steps);
          const done = targetSteps.filter((step) => isStepDone(isTicked(step.id), evidence[step.id])).length;
          return (
            <Link key={control.id} to={`/control/${control.id}/ml1`} className="control-card">
              <Icon size={26} />
              <small>Mitigation {control.id}</small>
              <h2>{control.name}</h2>
              <p>{control.overview}</p>
              <span className="card-progress">{targetMaturity.toUpperCase()} · {done}/{targetSteps.length}</span>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
