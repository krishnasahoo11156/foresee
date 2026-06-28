import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { tasks } from "@/lib/data";

type Task = (typeof tasks)[number] & { taskId?: string };

export function TaskCard({ task }: { task: Task }) {
  return (
    <Link className="card card-pad stack" href={`/tasks/${task.id}`}>
      <div className="metric">
        <span className={`pill ${task.riskLevel}`}>{task.riskLevel} risk</span>
        <ArrowRight size={18} color="var(--muted)" />
      </div>
      <div>
        <h3>{task.title}</h3>
        <p className="muted" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px", marginTop: "4px" }}>
          <span>{task.category}</span>
          <span>•</span>
          <span>{task.deadline}</span>
          <span className="pill monitor" style={{ fontSize: "9.5px", padding: "1px 6px", textTransform: "none", letterSpacing: "normal" }}>
            ID: {task.taskId || task.id}
          </span>
        </p>
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
