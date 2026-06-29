"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { MonteCarloChart } from "@/components/ui/MonteCarloChart";
import { scenarios } from "@/lib/data";
import { TrendingUp } from "lucide-react";

export default function SimulationsPage() {
  const [uncertainty, setUncertainty] = useState(35);
  const [buffer, setBuffer] = useState(1);

  // Recalculate success rates dynamically based on sliders
  const dynamicScenarios = scenarios.map((scenario) => {
    let success = scenario.probability;

    if (scenario.name === "Current Plan") {
      success = Math.round(41 + (buffer * 14) - ((uncertainty - 35) * 0.6));
    } else if (scenario.name === "Focused Sprint") {
      success = Math.round(76 + (buffer * 8) - ((uncertainty - 35) * 0.3));
    } else if (scenario.name === "Scope Compression") {
      success = Math.round(84 + (buffer * 5) - ((uncertainty - 35) * 0.15));
    } else if (scenario.name === "Emergency Rescue") {
      success = Math.round(91 + (buffer * 2.5) - ((uncertainty - 35) * 0.08));
    }

    const finalSuccess = Math.max(5, Math.min(99, success));
    const tone = finalSuccess > 80 ? "safe" : finalSuccess > 50 ? "monitor" : "critical";

    return {
      ...scenario,
      probability: finalSuccess,
      tone
    };
  });

  return (
    <section className="page page-wide">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "24px", marginBottom: "32px" }}>
        <div style={{ flex: "1 1 500px" }}>
          <PageHeader 
            eyebrow="Future Simulation" 
            title="Forecast the work before it slips." 
            description="Run thousands of simulated trials. Recalculate success rates dynamically by adjusting uncertainty factors and buffer margins." 
          />
        </div>
      </div>

      <div style={{ marginBottom: "32px" }}>
        <MonteCarloChart 
          uncertainty={uncertainty} 
          setUncertainty={setUncertainty} 
          buffer={buffer} 
          setBuffer={setBuffer} 
        />
      </div>

      <div className="grid grid-2" style={{ gap: "20px" }}>
        {dynamicScenarios.map((scenario) => {
          return (
            <div className="card card-pad stack" key={scenario.name} style={{ padding: "28px" }}>
              <div className="metric" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>{scenario.name}</h2>
                <span className={`pill ${scenario.tone}`} style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <TrendingUp size={11} /> {scenario.probability}% success
                </span>
              </div>
              <p className="muted" style={{ margin: "10px 0 16px", minHeight: "36px", lineHeight: "1.45", fontSize: "13px" }}>
                {scenario.change}
              </p>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--muted)", marginBottom: "6px" }}>
                  <span>Probability score</span>
                  <strong>{scenario.probability}%</strong>
                </div>
                <div className="progress">
                  <span 
                    style={{ 
                      width: `${scenario.probability}%`, 
                      background: `var(--${scenario.tone === 'safe' ? 'success' : scenario.tone === 'monitor' ? 'warning' : 'danger'})`,
                      transition: "width 0.3s ease" 
                    }} 
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
