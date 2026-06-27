import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { tasks } from "@/lib/data";

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  const task = tasks.find((item) => item.id === params.id) ?? tasks[0];
  return (
    <section className="page">
      <PageHeader eyebrow={task.category} title={task.title} description={`${task.deadline} - ${task.effort}`} action={<Link className="button button-primary" href="/rescue">Generate rescue</Link>} />
      <div className="grid grid-2">
        <div className="card card-pad stack">
          <div className="metric"><span className={`pill ${task.riskLevel}`}>{task.riskLevel}</span><strong>{task.risk}% risk</strong></div>
          <div className="progress"><span style={{ width: `${task.progress}%` }} /></div>
          <p className="muted">Next action: {task.nextAction}</p>
        </div>
        <div className="card card-pad stack">
          <h2>Dependencies</h2>
          {task.dependencies.map((dependency) => <div className="list-row" key={dependency}><span>{dependency}</span><span className="pill monitor">open</span></div>)}
        </div>
      </div>
      <div className="card card-pad stack" style={{ marginTop: 16 }}>
        <h2>Subtask plan</h2>
        {["Clarify output", "Schedule focus block", "Complete main draft", "Review and ship"].map((item, index) => <div className="list-row" key={item}><strong>{index + 1}. {item}</strong><span className="pill">{index < 2 ? "done" : "next"}</span></div>)}
      </div>
    </section>
  );
}
