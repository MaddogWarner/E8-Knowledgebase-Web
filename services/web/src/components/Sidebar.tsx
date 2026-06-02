import { Cloud, Info, ShieldCheck } from 'lucide-react';
import { NavLink } from 'react-router';
import { controls } from '../data/controls';
import { resolveIcon } from '../lib/icons';

export function Sidebar() {
  return (
    <aside className="sidebar">
      <NavLink to="/" className="brand">
        <ShieldCheck size={26} />
        <span>Essential 8 Knowledge Base</span>
      </NavLink>
      <nav aria-label="Primary navigation">
        {controls.map((control) => {
          const Icon = resolveIcon(control.icon);
          return (
            <NavLink key={control.id} to={`/control/${control.id}/ml1`} className="nav-item">
              <Icon size={18} />
              <span>
                <small>Mitigation {control.id}</small>
                {control.name}
              </span>
            </NavLink>
          );
        })}
        <NavLink to="/m365" className="nav-item">
          <Cloud size={18} />
          <span>Microsoft 365 Additional Controls</span>
        </NavLink>
        <NavLink to="/about" className="nav-item">
          <Info size={18} />
          <span>About & Privacy</span>
        </NavLink>
      </nav>
    </aside>
  );
}
