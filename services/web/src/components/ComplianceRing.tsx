interface ComplianceRingProps {
  percentage: number;
}

export function ComplianceRing({ percentage }: ComplianceRingProps) {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const normalised = Math.max(0, Math.min(100, percentage));
  const offset = circumference - (normalised / 100) * circumference;

  return (
    <div className="compliance-ring" aria-label={`Overall compliance ${normalised}%`}>
      <div className="ring-visual">
        <svg viewBox="0 0 120 120" role="img">
          <circle className="ring-track" cx="60" cy="60" r={radius} />
          <circle
            className="ring-value"
            cx="60"
            cy="60"
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <strong>{normalised}%</strong>
      </div>
      <span>Overall</span>
    </div>
  );
}
