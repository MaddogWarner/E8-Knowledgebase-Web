interface ComplianceChartRow {
  id: number;
  name: string;
  implemented: number;
  notApplicable: number;
  pending: number;
}

interface ComplianceChartProps {
  rows: ComplianceChartRow[];
}

export function ComplianceChart({ rows }: ComplianceChartProps) {
  function width(count: number, total: number) {
    return total === 0 ? '0%' : `${(count / total) * 100}%`;
  }

  return (
    <div className="compliance-chart">
      <div className="progress-legend" aria-label="Compliance legend">
        <span><i className="legend-dot implemented" />Implemented</span>
        <span><i className="legend-dot notApplicable" />N/A</span>
        <span><i className="legend-dot remaining" />Pending</span>
      </div>
      {rows.map((row) => {
        const total = row.implemented + row.notApplicable + row.pending;
        return (
          <div key={row.id} className="chart-row">
            <span className="chart-label">{row.id}. {row.name}</span>
            <div className="chart-bar" aria-label={`${row.name}: ${row.implemented} implemented, ${row.notApplicable} not applicable, ${row.pending} pending`}>
              <span className="progress-segment implemented" style={{ width: width(row.implemented, total) }} />
              <span className="progress-segment notApplicable" style={{ width: width(row.notApplicable, total) }} />
              <span className="progress-segment remaining" style={{ width: width(row.pending, total) }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
