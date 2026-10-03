import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { TechniqueDialog } from '../components/TechniqueDialog';
import type { AttackTechnique } from '../data/attack';
import { appInfo } from '../data/appInfo';
import { getControl } from '../data/controls';
import { calculateCoverage, coverageLabels, groupCoverage, techniquesForControl } from '../lib/attack';
import { useEvidence } from '../lib/EvidenceContext';
import { isOSScope } from '../lib/scope';
import { isMaturityLevel } from '../lib/search';
import { useLocalStorage } from '../lib/useLocalStorage';
import { useStepProgress } from '../lib/useStepProgress';
import type { MaturityLevel, OSScope } from '../types';

export function AttackPage() {
  const [params] = useSearchParams();
  const control = getControl(Number(params.get('control')));
  const [target] = useLocalStorage<MaturityLevel>('e8kb.targetMaturity', 'ml1', isMaturityLevel);
  const [scope] = useLocalStorage<OSScope>('e8kb.osScope', 'both', isOSScope);
  const { status } = useStepProgress();
  const { evidence } = useEvidence();
  const [selected, setSelected] = useState<AttackTechnique | null>(null);
  const controlIds = control ? new Set(techniquesForControl(control.id, target, scope).map((technique) => technique.id)) : null;
  const coverage = calculateCoverage(target, scope, status, evidence).filter((item) => !controlIds || controlIds.has(item.technique.id));
  const untallied = coverage.filter((item) => item.status === 'indirect' || item.status === 'notApplicable').length;
  return <div className="page-stack">
    <section className="page-heading"><h1>{control ? `${control.name} — ATT&CK` : 'MITRE ATT&CK® Coverage'}</h1></section>
    <section className="content-section"><h2>Summary</h2>
      <div className="coverage-summary">{(['covered', 'partial', 'notCovered'] as const).map((state) => <div className={`coverage-tile ${state}`} key={state}><strong>{coverage.filter((item) => item.status === state).length}</strong><span>{coverageLabels[state]}</span></div>)}</div>
      <p>Measured against your target of {target.toUpperCase()}, {scope[0].toUpperCase() + scope.slice(1)} scope.</p>
      {untallied > 0 && <p>{untallied} further {untallied === 1 ? 'technique is' : 'techniques are'} listed below as Indirect or Not applicable and are not counted above.</p>}
      <p>{appInfo.attackCoverageCaveat}</p>
    </section>
    {groupCoverage(coverage).map((group) => <section className="content-section" key={group.tactic}><h2>{group.tactic} ({group.coverage.length})</h2>
      <div className="coverage-list">{group.coverage.map((item) => <button type="button" className="coverage-row" key={item.technique.id} onClick={() => setSelected(item.technique)}>
        <span className="attack-chip">{item.technique.id}</span><strong>{item.technique.name}</strong><span className={`coverage-badge ${item.status}`}>{coverageLabels[item.status]}</span><span>{item.contributingImplemented} of {item.contributingTotal} steps</span>
      </button>)}</div>
    </section>)}
    <p>A technique that belongs to several tactics appears under each. Techniques with no steps in your current maturity and OS scope are not listed. {appInfo.attackDisclaimerShort}</p>
    {selected && <TechniqueDialog technique={selected} onClose={() => setSelected(null)} />}
  </div>;
}
