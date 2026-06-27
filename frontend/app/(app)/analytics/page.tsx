import { PageHeader } from "@/components/ui/PageHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { metrics } from "@/lib/data";
import { BarChart3, Info } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <section className="page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ flex: "1 1 500px" }}>
          <PageHeader 
            eyebrow="Analytics" 
            title="Behavior patterns, not guilt." 
            description="Track reliability, plan stability, focus windows, and prediction error so the system learns without overwhelming the user." 
          />
        </div>
        <div 
          className="sketch-note" 
          style={{ 
            fontSize: "0.85rem", 
            maxWidth: "340px", 
            transform: "rotate(1.5deg)",
            marginBottom: "24px"
          }}
        >
          📈 <strong>Bias calculation:</strong> {"\"The model detected you underestimate design and copy-writing by 18%.\""}
        </div>
      </div>

      <div className="grid grid-2" style={{ gap: "20px", marginBottom: "28px" }}>
        {metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
      </div>

      <div className="card card-pad stack" style={{ padding: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ color: "var(--accent)", display: "flex" }}>
              <BarChart3 size={18} />
            </div>
            <h2 style={{ margin: 0, fontSize: "18px" }}>Weekly Focus Rhythm</h2>
          </div>
          <span className="muted" style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11.5px" }}>
            <Info size={12} /> Focus duration (hours)
          </span>
        </div>

        <div className="grid grid-4" style={{ gap: "16px", marginTop: "8px" }}>
          {[
            ["Mon", "5.2 hrs", 68],
            ["Tue", "6.4 hrs", 82],
            ["Wed", "4.8 hrs", 60],
            ["Thu", "5.8 hrs", 74]
          ].map(([day, hrs, pct]) => (
            <div 
              className="card card-pad" 
              key={day as string}
              style={{ 
                padding: "20px", 
                display: "flex", 
                flexDirection: "column", 
                gap: "10px",
                background: "var(--surface-soft)",
                border: "1px solid var(--surface-line)",
                boxShadow: "none"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong style={{ fontSize: "14px" }}>{day as string}</strong>
                <span className="muted" style={{ fontSize: "12px", fontWeight: "600" }}>{hrs as string}</span>
              </div>
              <div className="progress" style={{ height: "6px" }}>
                <span style={{ width: `${pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
