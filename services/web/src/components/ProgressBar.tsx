import type { StepDisplayState } from '../lib/status';

interface ProgressBarProps {
  evidenced: number;
  implemented: number;
  notApplicable: number;
  failed: number;
  remaining: number;
  label?: string;
  activeFilters?: StepDisplayState[];
  onToggleFilter?: (state: StepDisplayState) => void;
}

const legendItems: Array<{ state: StepDisplayState; label: string }> = [
  { state: 'evidenced', label: 'Evidence provided' },
  { state: 'implemented', label: 'Marked implemented' },
  { state: 'notApplicable', label: 'N/A' },
  { state: 'failed', label: 'Audit: non-compliant' },
  { state: 'remaining', label: 'Remaining' }
];

export function ProgressBar({
  evidenced,
  implemented,
  notApplicable,
  failed,
  remaining,
  label = 'steps',
  activeFilters = [],
  onToggleFilter
}: ProgressBarProps) {
  const total = evidenced + implemented + notApplicable + failed + remaining;
  const denominator = total - notApplicable;
  const done = evidenced + implemented;
  const percentage = denominator <= 0 ? 100 : Math.round((done / denominator) * 100);
  const counts: Record<StepDisplayState, number> = { evidenced, implemented, notApplicable, failed, remaining };

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
        {legendItems.map((item) => {
          const labelText = onToggleFilter ? `${item.label} · ${counts[item.state]}` : item.label;
          if (onToggleFilter) {
            return (
              <button
                key={item.state}
                type="button"
                className="legend-chip"
                aria-pressed={activeFilters.includes(item.state)}
                onClick={() => onToggleFilter(item.state)}
              >
                <i className={`legend-dot ${item.state}`} />
                {labelText}
              </button>
            );
          }

          return (
            <span key={item.state}>
              <i className={`legend-dot ${item.state}`} />
              {labelText}
            </span>
          );
        })}
      </div>
    </section>
  );
}
