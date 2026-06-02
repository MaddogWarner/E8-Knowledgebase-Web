import { appInfo } from '../data/appInfo';
import type { ReferenceLink } from '../types';

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
  return (
    <div className="page-stack narrow">
      <section className="page-heading">
        <h1>{appInfo.aboutTitle}</h1>
        <p>{appInfo.aboutDescription}</p>
        <p>{appInfo.contentScope}</p>
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

      <section className="content-section">
        <h2>References</h2>
        <LinkList links={appInfo.referenceLinks} />
      </section>
    </div>
  );
}

