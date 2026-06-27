export function MetricCard({ label, value, detail, tone }: { label: string; value: string; detail: string; tone?: string }) {
  return (
    <div className="card card-pad stack">
      <div className="metric">
        <span className="muted">{label}</span>
        {tone ? <span className={`pill ${tone}`}>{tone}</span> : null}
      </div>
      <div className="metric-value">{value}</div>
      <p className="muted">{detail}</p>
    </div>
  );
}
