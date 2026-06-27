import { CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { scenarios, tasks } from "@/lib/data";

export default function RescuePage() {
  const task = tasks[0];
  return (
    <section className="page page-wide">
      <PageHeader eyebrow="Rescue Center" title="One critical task needs intervention." description="Compare simulated recovery paths, accept the highest probability plan, and later sync it to Calendar automatically." />
      <div className="grid grid-2">
        <div className="card card-pad stack">
          <span className="pill critical">Risk {task.risk}%</span>
          <h2>{task.title}</h2>
          <p className="muted">{task.nextAction}</p>
          <div className="progress"><span style={{ width: `${task.progress}%` }} /></div>
          <button className="button button-primary">Accept recommended rescue</button>
        </div>
        <div className="grid">
          {scenarios.map((scenario) => <div className="card card-pad metric" key={scenario.name}><div><h3>{scenario.name}</h3><p className="muted">{scenario.change}</p></div><span className="pill safe"><CheckCircle2 size={14} /> {scenario.probability}%</span></div>)}
        </div>
      </div>
    </section>
  );
}
