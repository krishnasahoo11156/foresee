import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { tasks } from "@/lib/data";

type Task = (typeof tasks)[number];

export function TaskCard({ task }: { task: Task }) {
  return (
    <Link className="card card-pad stack" href={`/tasks/${task.id}`}>
      <div className="metric">
        <span className={`pill ${task.riskLevel}`}>{task.riskLevel} risk</span>
        <ArrowRight size={18} color="var(--muted)" />
      </div>
      <div>
        <h3>{task.title}</h3>
        <p className="muted">{task.category} - {task.deadline}</p>
      </div>
      <div className="progress" aria-label={`${task.progress}% complete`}>
        <span style={{ width: `${task.progress}%` }} />
      </div>
      <div className="metric">
        <span className="muted"><Clock size={14} /> {task.effort}</span>
        <strong>{task.risk}%</strong>
      </div>
    </Link>
  );
}
