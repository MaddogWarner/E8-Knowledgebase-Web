import { Upload, X } from 'lucide-react';
import { useRef } from 'react';
import { useEvidence } from '../lib/EvidenceContext';

const auditToolUrl = 'https://github.com/MaddogWarner/e8-hardening-audit-policy-compliance-checker';

export function EvidenceUpload() {
  const { applyCsv, clear, summary } = useEvidence();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      if (typeof reader.result === 'string') applyCsv(reader.result);
    });
    reader.readAsText(file);
  }

  function clearEvidence() {
    clear();
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <section className="evidence-upload" aria-label="CSV evidence upload">
      <div>
        <p className="eyebrow">CSV evidence</p>
        <p>
          Upload a CSV from the <a href={auditToolUrl} target="_blank" rel="noopener noreferrer">E8 hardening audit and policy compliance checker</a>. Processing is local to this browser session.
        </p>
        {summary && (
          <p className="evidence-summary">
            Matched {summary.matched} of {summary.totalE8} E8 checks across {summary.controlsCovered} mitigations. MDE and audit-policy rows ignored.
          </p>
        )}
      </div>
      <div className="upload-actions">
        <label className="file-upload">
          <Upload size={17} />
          <span>Upload CSV</span>
          <input ref={inputRef} type="file" accept=".csv,text/csv" onChange={(event) => handleFile(event.target.files?.[0])} />
        </label>
        <button type="button" className="icon-button" onClick={clearEvidence} disabled={!summary}>
          <X size={17} />
          Clear
        </button>
      </div>
    </section>
  );
}
