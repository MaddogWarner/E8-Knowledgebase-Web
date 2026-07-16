import { useState } from 'react';
import { appInfo } from '../data/appInfo';
import { useProfiles } from '../lib/profiles';
import { isOSScope } from '../lib/scope';
import { useLocalStorage } from '../lib/useLocalStorage';
import type { OSScope, ReferenceLink } from '../types';

// Defined here rather than in appInfo.ts, which is generator-owned.
const buildLinks: ReferenceLink[] = [
  {
    title: 'Essential 8 Knowledge Base on GitHub',
    url: 'https://github.com/MaddogWarner/E8-Knowledgebase-Web'
  },
  {
    title: 'E8 hardening audit & policy compliance checker (assessment script)',
    url: 'https://github.com/MaddogWarner/e8-hardening-audit-policy-compliance-checker'
  }
];

function LinkList({ links }: { links: ReferenceLink[] }) {
  return (
    <ul className="link-list">
      {links.map((link) => (
        <li key={link.url}>
          <a href={link.url} target="_blank" rel="noopener noreferrer">
            {link.title}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function AboutPage() {
  const { activeProfile, resetActiveProfile, resetAllAppData } = useProfiles();
  const [confirming, setConfirming] = useState<'profile' | 'all' | null>(null);
  const [osScope, setOsScope] = useLocalStorage<OSScope>('e8kb.osScope', 'both', isOSScope);

  function confirmReset() {
    if (confirming === 'profile') resetActiveProfile();
    if (confirming === 'all') resetAllAppData();
    setConfirming(null);
  }

  return (
    <div className="page-stack narrow">
      <section className="page-heading">
        <h1>{appInfo.aboutTitle}</h1>
        <p>{appInfo.aboutDescription}</p>
        <p>{appInfo.contentScope}</p>
      </section>

      <section className="content-section preferences-section">
        <h2>Preferences</h2>
        <h3>OS scope</h3>
        <div className="scope-segmented-control" role="radiogroup" aria-label="OS scope">
          {(['workstation', 'server', 'both'] as const).map((scope) => (
            <button key={scope} type="button" role="radio" aria-checked={osScope === scope} className={osScope === scope ? 'active' : ''} onClick={() => setOsScope(scope)}>
              {scope[0].toUpperCase() + scope.slice(1)}
            </button>
          ))}
        </div>
        <p>OS scope hides implementation steps that don't apply to the selected environment and recalculates compliance over the remaining steps.</p>
      </section>

      <section className="content-section">
        <h2>{appInfo.aboutMeTitle}</h2>
        <p>{appInfo.aboutMeDescription}</p>
        <LinkList links={appInfo.authorLinks} />
      </section>

      <section className="content-section">
        <h2>{appInfo.privacyTitle}</h2>
        <p>{appInfo.privacyPolicy}</p>
        <LinkList links={[appInfo.privacyPolicyLink]} />
      </section>

      <section className="content-section reset-section">
        <h2>Reset app data</h2>
        <p>
          Clear implementation tracking, N/A reasons, Microsoft 365 licence mode, target maturity, hide-completed and OS scope preferences. Theme preference is retained.
        </p>
        <div className="reset-actions">
          <button type="button" className="print-button danger" onClick={() => setConfirming('profile')}>Reset this profile</button>
          <button type="button" className="print-button danger" onClick={() => setConfirming('all')}>Delete all app data</button>
        </div>
        {confirming && (
          <div className="reset-confirm" role="dialog" aria-modal="false" aria-labelledby="reset-title">
            <h3 id="reset-title">{confirming === 'profile' ? `Reset ${activeProfile.name}?` : 'Delete all app data?'}</h3>
            <p>
              {confirming === 'profile'
                ? 'This clears tracking data for the active profile only.'
                : 'This clears every Essential 8 Knowledge Base profile and recreates a Default profile.'}
            </p>
            <div className="reset-actions">
              <button type="button" className="print-button danger" onClick={confirmReset}>Confirm reset</button>
              <button type="button" className="print-button" onClick={() => setConfirming(null)}>Cancel</button>
            </div>
          </div>
        )}
      </section>

      <section className="content-section">
        <h2>References</h2>
        <LinkList links={appInfo.referenceLinks} />
      </section>

      <section className="content-section">
        <h2>About this build</h2>
        <p>
          Version {__APP_VERSION__} · Built {formatBuildDate(__BUILD_DATE__)}
        </p>
        <LinkList links={buildLinks} />
      </section>
    </div>
  );
}

function formatBuildDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}
