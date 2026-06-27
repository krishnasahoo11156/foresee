import { CheckCircle2, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { scenarios, tasks } from "@/lib/data";

export default function RescuePage() {
  const task = tasks[0];
  return (
    <section className="page page-wide">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "24px", marginBottom: "32px" }}>
        <div style={{ flex: "1 1 500px" }}>
          <PageHeader 
            eyebrow="Rescue Center" 
            title="One critical task needs intervention." 
            description="Compare simulated recovery paths, accept the highest probability plan, and sync it to your calendar automatically." 
          />
        </div>
      </div>

      <div style={{ marginBottom: "32px" }}>
        <ImagePlaceholder label="Calendar rescue path projection simulation chart" height="240px" />
      </div>

      <div className="grid grid-2" style={{ gap: "28px" }}>
        <div className="card card-pad stack" style={{ padding: "32px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <span className="pill critical" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <ShieldAlert size={14} /> Risk {task.risk}%
              </span>
              <strong style={{ color: "var(--danger)", fontSize: "14px" }}>Critical State</strong>
            </div>
            <h2 style={{ fontSize: "24px", lineHeight: "1.25", marginBottom: "8px" }}>{task.title}</h2>
            <p className="muted" style={{ fontSize: "14px", marginBottom: "20px" }}><strong>Next Action:</strong> {task.nextAction}</p>
            
            <div style={{ margin: "24px 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
                <span className="muted">Overall progress</span>
                <strong>{task.progress}%</strong>
              </div>
              <div className="progress">
                <span style={{ width: `${task.progress}%` }} />
              </div>
            </div>
          </div>
          
          <button className="button button-primary" style={{ width: "100%", height: "42px" }}>
            Accept Recommended Rescue Plan
          </button>
        </div>

        <div className="grid" style={{ gap: "16px" }}>
          {scenarios.map((scenario) => {
            const isRecommended = scenario.name === "Focused Sprint";
            return (
              <div 
                className="card card-pad metric" 
                key={scenario.name}
                style={{ 
                  border: isRecommended ? "2px solid var(--accent)" : "1px solid var(--surface-line)",
                  boxShadow: isRecommended ? "var(--shadow-md)" : "var(--shadow)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "20px 24px"
                }}
              >
                <div style={{ flex: 1, paddingRight: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <h3 style={{ margin: 0, fontSize: "16px" }}>{scenario.name}</h3>
                    {isRecommended && (
                      <span className="pill safe" style={{ fontSize: "9px", padding: "1px 6px" }}>Recommended</span>
                    )}
                  </div>
                  <p className="muted" style={{ margin: 0, fontSize: "12.5px", lineHeight: "1.4" }}>{scenario.change}</p>
                </div>
                <span 
                  className={`pill ${scenario.probability > 75 ? "safe" : scenario.probability > 50 ? "monitor" : "critical"}`}
                  style={{ 
                    display: "inline-flex", 
                    alignItems: "center", 
                    gap: "6px", 
                    fontSize: "13px", 
                    padding: "6px 12px",
                    fontWeight: 700 
                  }}
                >
                  <CheckCircle2 size={13} /> {scenario.probability}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
