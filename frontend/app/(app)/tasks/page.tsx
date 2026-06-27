import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { TaskCard } from "@/components/ui/TaskCard";
import { tasks } from "@/lib/data";

export default function TasksPage() {
  return (
    <section className="page page-wide">
      <PageHeader
        eyebrow="Tasks"
        title="Every deadline, risk-scored."
        description="Create tasks in natural language, track subtasks, and let ForeSee keep the rescue options close."
        action={<button className="button button-primary"><Plus size={17} /> Add task</button>}
      />
      <div className="grid grid-3">
        {tasks.map((task) => <TaskCard task={task} key={task.id} />)}
      </div>
      <div className="card card-pad" style={{ marginTop: 16 }}>
        <table className="table">
          <thead><tr><th>Task</th><th>Deadline</th><th>Progress</th><th>Risk</th><th>Next action</th></tr></thead>
          <tbody>{tasks.map((task) => <tr key={task.id}><td><strong>{task.title}</strong><p className="muted">{task.category}</p></td><td>{task.deadline}</td><td>{task.progress}%</td><td><span className={`pill ${task.riskLevel}`}>{task.risk}%</span></td><td>{task.nextAction}</td></tr>)}</tbody>
        </table>
      </div>
    </section>
  );
}
