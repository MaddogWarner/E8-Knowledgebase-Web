import { auditPolicyEntries, auditPolicyOverview, type AuditRecommendation } from '../data/auditPolicy';
import { useEvidence } from '../lib/EvidenceContext';
import type { AuditPolicyEntryEvidence, AuditPolicyEntryState } from '../lib/evidence';

const recommendationClass: Record<AuditRecommendation, string> = {
  Success: 'success',
  Failure: 'failure',
  'Success & Failure': 'both',
  'Not Recommended': 'not-recommended'
};

const auditStateLabels: Record<AuditPolicyEntryState, string> = {
  compliant: 'Compliant',
  nonCompliant: 'Non-compliant',
  review: 'Review'
};

function auditEvidenceDetail(evidence: AuditPolicyEntryEvidence): string | null {
  const parts = [
    evidence.current ? `Current: ${evidence.current}` : '',
    evidence.expected ? `Expected: ${evidence.expected}` : ''
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(' — ') : null;
}

export function AuditPolicyPage() {
  const { summary } = useEvidence();
  const categories = Array.from(new Set(auditPolicyEntries.map((entry) => entry.category)));
  const overviewParagraphs = auditPolicyOverview.split('\n\n').filter(Boolean);
  const evidenceSummary = summary && summary.totalAuditPolicy > 0 ? summary : null;

  return (
    <div className="page-stack">
      <section className="page-heading">
        <p className="eyebrow">Reference</p>
        <h1>Windows Audit Policy</h1>
        {overviewParagraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </section>

      {evidenceSummary && (
        <section className="evidence-summary audit-evidence-summary">
          <p>Matched {evidenceSummary.matchedAuditPolicyEntries} of {evidenceSummary.totalAuditPolicy} audit-policy checks from the uploaded report.</p>
          {evidenceSummary.unmatchedAuditPolicyChecks.length > 0 && (
            <details className="evidence-disclosure">
              <summary>{evidenceSummary.unmatchedAuditPolicyChecks.length} audit-policy checks have no entry on this page</summary>
              <ul>
                {evidenceSummary.unmatchedAuditPolicyChecks.map((check) => (
                  <li key={check}>{check}</li>
                ))}
              </ul>
            </details>
          )}
        </section>
      )}

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
            {auditPolicyEntries.filter((entry) => entry.category === category).map((entry) => {
              const entryEvidence = evidenceSummary?.auditPolicyEntryStates[entry.id];
              const detail = entryEvidence && entryEvidence.state !== 'compliant' ? auditEvidenceDetail(entryEvidence) : null;

              return (
                <div key={entry.id} id={entry.id} className="audit-row">
                  <div>
                    <div className="audit-entry-name">
                      <strong>{entry.name}</strong>
                      {entryEvidence && (
                        <span className={`audit-status-chip ${entryEvidence.state}`}>{auditStateLabels[entryEvidence.state]}</span>
                      )}
                      {entry.domainControllerOnly && <span className="dc-chip">DC only</span>}
                    </div>
                    {detail && <p className="audit-evidence-detail">{detail}</p>}
                  </div>
                  <div>
                    <span className={`recommendation-chip ${recommendationClass[entry.recommendation]}`}>{entry.recommendation}</span>
                  </div>
                  <p>{entry.description}</p>
                  <p>{entry.considerations}</p>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
