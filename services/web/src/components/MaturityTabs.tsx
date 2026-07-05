import { NavLink } from 'react-router';
import { maturityLevels } from '../data/controls';
import { isMaturityLevel } from '../lib/search';
import { useLocalStorage } from '../lib/useLocalStorage';
import type { MaturityLevel } from '../types';

interface MaturityTabsProps {
  controlId: number;
  activeLevel: MaturityLevel;
}

export function MaturityTabs({ controlId, activeLevel }: MaturityTabsProps) {
  const [targetMaturity] = useLocalStorage<MaturityLevel>('e8kb.targetMaturity', 'ml1', isMaturityLevel);
  const targetIndex = maturityLevels.findIndex((level) => level.id === targetMaturity);

  return (
    <div className="tabs" role="tablist" aria-label="Maturity levels">
      {maturityLevels.map((level, index) => {
        const beyondTarget = index > targetIndex;
        return (
          <NavLink
            key={level.id}
            to={`/control/${controlId}/${level.id}`}
            className={level.id === activeLevel ? 'tab active' : 'tab'}
            role="tab"
            aria-selected={level.id === activeLevel}
          >
            <span>{level.shortName}</span>
            {beyondTarget && <small aria-hidden="true">Beyond target</small>}
          </NavLink>
        );
      })}
    </div>
  );
}
