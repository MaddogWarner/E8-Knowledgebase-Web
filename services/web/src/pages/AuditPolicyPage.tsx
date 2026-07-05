import { auditPolicyEntries, auditPolicyOverview, type AuditRecommendation } from '../data/auditPolicy';

const recommendationClass: Record<AuditRecommendation, string> = {
  Success: 'success',
  Failure: 'failure',
  'Success & Failure': 'both',
  'Not Recommended': 'not-recommended'
};

export function AuditPolicyPage() {
  const categories = Array.from(new Set(auditPolicyEntries.map((entry) => entry.category)));
  const overviewParagraphs = auditPolicyOverview.split('\n\n').filter(Boolean);

  return (
    <div className="page-stack">
      <section className="page-heading">
        <p className="eyebrow">Reference</p>
        <h1>Windows Audit Policy</h1>
        {overviewParagraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </section>

      {categories.map((category) => (
        <section key={category} className="audit-section">
          <h2>{category}</h2>
          <div className="audit-table">
            <div className="audit-row audit-header">
              <span>Name</span>
              <span>Recommendation</span>
              <span>Description</span>
              <span>Considerations</span>
            </div>
            {auditPolicyEntries.filter((entry) => entry.category === category).map((entry) => (
              <div key={entry.id} id={entry.id} className="audit-row">
                <div>
                  <strong>{entry.name}</strong>
                  {entry.domainControllerOnly && <span className="dc-chip">DC only</span>}
                </div>
                <div>
                  <span className={`recommendation-chip ${recommendationClass[entry.recommendation]}`}>{entry.recommendation}</span>
                </div>
                <p>{entry.description}</p>
                <p>{entry.considerations}</p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
