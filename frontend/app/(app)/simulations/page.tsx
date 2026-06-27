import { PageHeader } from "@/components/ui/PageHeader";
import { scenarios } from "@/lib/data";

export default function SimulationsPage() {
  return (
    <section className="page">
      <PageHeader eyebrow="Future Simulation" title="Forecast the work before it slips." description="Scenario cards mirror the future simulation agent output: probability, plan deltas, and recommended intervention." />
      <div className="grid grid-2">
        {scenarios.map((scenario) => <div className="card card-pad stack" key={scenario.name}><div className="metric"><h2>{scenario.name}</h2><span className="pill safe">{scenario.probability}% success</span></div><p className="muted">{scenario.change}</p><div className="progress"><span style={{ width: `${scenario.probability}%` }} /></div></div>)}
      </div>
    </section>
  );
}
