import { Link } from 'react-router';
import { controls } from '../data/controls';
import { resolveIcon } from '../lib/icons';

export function HomePage() {
  return (
    <div className="page-stack">
      <section className="page-heading">
        <p className="eyebrow">November 2023 model</p>
        <h1>Essential 8 Knowledge Base</h1>
        <p>
          A static, offline quick reference for administrators implementing ASD Essential Eight controls with built-in Windows OS tooling.
        </p>
      </section>

      <section className="control-grid" aria-label="Essential Eight mitigations">
        {controls.map((control) => {
          const Icon = resolveIcon(control.icon);
          return (
            <Link key={control.id} to={`/control/${control.id}/ml1`} className="control-card">
              <Icon size={26} />
              <small>Mitigation {control.id}</small>
              <h2>{control.name}</h2>
              <p>{control.overview}</p>
            </Link>
          );
        })}
      </section>
    </div>
  );
}

