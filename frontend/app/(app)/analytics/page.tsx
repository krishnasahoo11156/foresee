import { PageHeader } from "@/components/ui/PageHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { metrics } from "@/lib/data";

export default function AnalyticsPage() {
  return (
    <section className="page">
      <PageHeader eyebrow="Analytics" title="Behavior patterns, not guilt." description="Track reliability, plan stability, focus windows, and prediction error so the system learns without overwhelming the user." />
      <div className="grid grid-2">{metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}</div>
      <div className="card card-pad stack" style={{ marginTop: 16 }}>
        <h2>Weekly rhythm</h2>
        <div className="grid grid-4">{["Mon", "Tue", "Wed", "Thu"].map((day, index) => <div className="card card-pad" key={day}><strong>{day}</strong><div className="progress" style={{ marginTop: 12 }}><span style={{ width: `${60 + index * 8}%` }} /></div></div>)}</div>
      </div>
    </section>
  );
}
