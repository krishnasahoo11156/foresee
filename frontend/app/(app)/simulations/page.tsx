import { PageHeader } from "@/components/ui/PageHeader";
import { scenarios } from "@/lib/data";
import { Sparkles, TrendingUp } from "lucide-react";

export default function SimulationsPage() {
  return (
    <section className="page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ flex: "1 1 500px" }}>
          <PageHeader 
            eyebrow="Future Simulation" 
            title="Forecast the work before it slips." 
            description="Scenario cards mirror the future simulation agent output: probability, plan deltas, and recommended intervention." 
          />
        </div>
        <div 
          className="sketch-note" 
          style={{ 
            fontSize: "0.85rem", 
            maxWidth: "340px", 
            transform: "rotate(1deg)",
            marginBottom: "24px"
          }}
        >
          🔮 <strong>Monte Carlo Simulator:</strong> {"\"Running 1,200 permutations every hour to calculate deadline slippage risk.\""}
        </div>
      </div>

      <div className="grid grid-2" style={{ gap: "20px" }}>
        {scenarios.map((scenario) => {
          const tone = scenario.probability > 80 ? "safe" : scenario.probability > 50 ? "monitor" : "critical";
          return (
            <div className="card card-pad stack" key={scenario.name} style={{ padding: "28px" }}>
              <div className="metric">
                <h2 style={{ margin: 0, fontSize: "18px" }}>{scenario.name}</h2>
                <span className={`pill ${tone}`} style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <TrendingUp size={11} /> {scenario.probability}% success
                </span>
              </div>
              <p className="muted" style={{ margin: "4px 0 12px", minHeight: "40px", lineHeight: "1.4" }}>
                {scenario.change}
              </p>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--muted)", marginBottom: "6px" }}>
                  <span>Probability score</span>
                  <strong>{scenario.probability}%</strong>
                </div>
                <div className="progress">
                  <span style={{ width: `${scenario.probability}%`, background: `var(--${tone === 'safe' ? 'success' : tone === 'monitor' ? 'warning' : 'danger'})` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
