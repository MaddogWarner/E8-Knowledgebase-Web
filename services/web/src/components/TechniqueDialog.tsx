import { Link } from 'react-router';
import { attackMappings, attackRelationships, type AttackTechnique } from '../data/attack';
import { appInfo } from '../data/appInfo';
import { attackSteps, inScopeStepIds } from '../lib/attack';
import { useEvidence } from '../lib/EvidenceContext';
import { isMaturityLevel } from '../lib/search';
import { isOSScope } from '../lib/scope';
import { classifyStep } from '../lib/status';
import { stepStateLabels } from '../lib/audit';
import { useStepProgress } from '../lib/useStepProgress';
import { useLocalStorage } from '../lib/useLocalStorage';
import type { MaturityLevel, OSScope } from '../types';
import { Modal } from './Modal';

export function TechniqueDialog({ technique, onClose }: { technique: AttackTechnique; onClose: () => void }) {
  const { status } = useStepProgress();
  const { evidence } = useEvidence();
  const [target] = useLocalStorage<MaturityLevel>('e8kb.targetMaturity', 'ml1', isMaturityLevel);
  const [scope] = useLocalStorage<OSScope>('e8kb.osScope', 'both', isOSScope);
  const scopeIds = inScopeStepIds(target, scope);
  const mappings = attackMappings.filter((mapping) => mapping.techniqueId === technique.id);
  return <Modal title={`${technique.id} ${technique.name}`} onClose={onClose}>
    <div className="attack-chips">{technique.tactics.map((tactic) => <span className="attack-chip" key={tactic}>{tactic}</span>)}</div>
    {attackRelationships.map((relationship) => {
      const entries = mappings.filter((mapping) => mapping.relationships.includes(relationship));
      if (!entries.length) return null;
      return <section className="content-section" key={relationship}><h3>{relationship}</h3><ul className="technique-steps">
        {entries.map((mapping) => {
          const item = attackSteps.find((item) => item.step.id === mapping.stepId)!;
          const state = classifyStep(status(item.step.id), evidence[item.step.id]);
          const label = state === 'evidenced' ? 'Evidence provided' : state === 'failed' ? 'Audit: non-compliant' : stepStateLabels[status(item.step.id).state];
          return <li key={mapping.stepId}>
            <span className={`status-badge ${state}`}><span aria-hidden="true">{state === 'implemented' || state === 'evidenced' ? '✓' : state === 'notApplicable' ? '−' : '○'} </span>{label}</span>
            <p>{item.control.name} <span className="type-chip">{item.level.toUpperCase()}</span></p>
            <Link to={`/control/${item.control.id}/${item.level}#${item.step.id}`} onClick={onClose}>{item.step.title}</Link>
            {!scopeIds.has(item.step.id) && <p>Not in your current scope</p>}
            {mapping.note && <p>{mapping.note}</p>}
          </li>;
        })}
      </ul></section>;
    })}
    <p>{appInfo.attackDisclaimer}</p>
    <a href={technique.url} target="_blank" rel="noopener noreferrer">View on attack.mitre.org</a>
  </Modal>;
}
