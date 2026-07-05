interface ProgressBarProps {
  evidenced: number;
  implemented: number;
  notApplicable: number;
  failed: number;
  remaining: number;
  label?: string;
}

export function ProgressBar({ evidenced, implemented, notApplicable, failed, remaining, label = 'steps' }: ProgressBarProps) {
  const total = evidenced + implemented + notApplicable + failed + remaining;
  const denominator = total - notApplicable;
  const done = evidenced + implemented;
  const percentage = denominator <= 0 ? 100 : Math.round((done / denominator) * 100);

  function width(count: number) {
    return total === 0 ? '0%' : `${(count / total) * 100}%`;
  }

  return (
    <section className="progress-panel" aria-label="Implementation progress">
      <div className="progress-heading">
        <h2>Implementation progress</h2>
        <span>{done} / {denominator} {label} · {percentage}%</span>
      </div>
      <div className="segmented-progress" role="img" aria-label={`${done} of ${denominator} ${label} complete, ${percentage}%`}>
        <span className="progress-segment evidenced" style={{ width: width(evidenced) }} />
        <span className="progress-segment implemented" style={{ width: width(implemented) }} />
        <span className="progress-segment notApplicable" style={{ width: width(notApplicable) }} />
        <span className="progress-segment failed" style={{ width: width(failed) }} />
        <span className="progress-segment remaining" style={{ width: width(remaining) }} />
      </div>
      <div className="progress-legend" aria-label="Progress legend">
        <span><i className="legend-dot evidenced" />Evidence provided</span>
        <span><i className="legend-dot implemented" />Marked implemented</span>
        <span><i className="legend-dot notApplicable" />N/A</span>
        <span><i className="legend-dot failed" />Audit: non-compliant</span>
        <span><i className="legend-dot remaining" />Remaining</span>
      </div>
    </section>
  );
}
