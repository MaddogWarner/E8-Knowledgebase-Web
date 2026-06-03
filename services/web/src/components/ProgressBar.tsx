interface ProgressBarProps {
  evidenced: number;
  self: number;
  failed: number;
  remaining: number;
  label?: string;
}

export function ProgressBar({ evidenced, self, failed, remaining, label = 'steps' }: ProgressBarProps) {
  const total = evidenced + self + failed + remaining;
  const done = evidenced + self;

  function width(count: number) {
    return total === 0 ? '0%' : `${(count / total) * 100}%`;
  }

  return (
    <section className="progress-panel" aria-label="Implementation progress">
      <div className="progress-heading">
        <h2>Implementation progress</h2>
        <span>{done} / {total} {label}</span>
      </div>
      <div className="segmented-progress" role="img" aria-label={`${done} of ${total} ${label} complete`}>
        <span className="progress-segment evidenced" style={{ width: width(evidenced) }} />
        <span className="progress-segment self" style={{ width: width(self) }} />
        <span className="progress-segment failed" style={{ width: width(failed) }} />
        <span className="progress-segment remaining" style={{ width: width(remaining) }} />
      </div>
      <div className="progress-legend" aria-label="Progress legend">
        <span><i className="legend-dot evidenced" />Evidence provided</span>
        <span><i className="legend-dot self" />Marked implemented</span>
        <span><i className="legend-dot failed" />Audit: non-compliant</span>
        <span><i className="legend-dot remaining" />Remaining</span>
      </div>
    </section>
  );
}
