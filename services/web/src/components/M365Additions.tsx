import { licenseModes, protections } from '../data/m365';
import type { MaturityLevel, Microsoft365LicenseMode } from '../types';

interface M365AdditionsProps {
  controlId: number;
  level: MaturityLevel;
  licenseMode: Microsoft365LicenseMode;
}

export function M365Additions({ controlId, level, licenseMode }: M365AdditionsProps) {
  const additions = protections(controlId, level, licenseMode);

  if (additions.length === 0) return null;

  return (
    <section className="m365-additions">
      <div>
        <p className="eyebrow">Microsoft 365 additions</p>
        <h3>{licenseModes[licenseMode].displayName}</h3>
      </div>
      {additions.map((addition) => (
        <article key={addition.title} className="m365-addition">
          <h4>{addition.title}</h4>
          <p>{addition.coverage}</p>
          <ul>
            {addition.basicSettings.map((setting) => (
              <li key={setting}>{setting}</li>
            ))}
          </ul>
        </article>
      ))}
    </section>
  );
}

