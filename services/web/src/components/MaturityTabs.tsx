import { NavLink } from 'react-router';
import { maturityLevels } from '../data/controls';
import type { MaturityLevel } from '../types';

interface MaturityTabsProps {
  controlId: number;
  activeLevel: MaturityLevel;
}

export function MaturityTabs({ controlId, activeLevel }: MaturityTabsProps) {
  return (
    <div className="tabs" role="tablist" aria-label="Maturity levels">
      {maturityLevels.map((level) => (
        <NavLink
          key={level.id}
          to={`/control/${controlId}/${level.id}`}
          className={level.id === activeLevel ? 'tab active' : 'tab'}
          role="tab"
          aria-selected={level.id === activeLevel}
        >
          {level.shortName}
        </NavLink>
      ))}
    </div>
  );
}

