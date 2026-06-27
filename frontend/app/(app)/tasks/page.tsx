import { Plus, TableProperties } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { TaskCard } from "@/components/ui/TaskCard";
import { tasks } from "@/lib/data";
import Link from "next/link";

export default function TasksPage() {
  return (
    <section className="page page-wide">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ flex: "1 1 500px" }}>
          <PageHeader
            eyebrow="Tasks"
            title="Every deadline, risk-scored."
            description="Create tasks in natural language, track subtasks, and let ForeSee keep the rescue options close."
            action={<button className="button button-primary"><Plus size={16} /> Add task</button>}
          />
        </div>
        <div 
          className="sketch-note" 
          style={{ 
            fontSize: "0.85rem", 
            maxWidth: "320px", 
            transform: "rotate(1.5deg)",
            marginBottom: "24px"
          }}
        >
          ✏️ <strong>Natural Language parsing:</strong> {"\"Try writing 'Review prompt library by Mon 5pm' in the input box later.\""}
        </div>
      </div>

      <div className="grid grid-3" style={{ marginBottom: "32px", gap: "20px" }}>
        {tasks.map((task) => <TaskCard task={task} key={task.id} />)}
      </div>

      <div className="card card-pad" style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <div style={{ color: "var(--accent)" }}>
            <TableProperties size={18} />
          </div>
          <h2 style={{ margin: 0, fontSize: "18px" }}>Detailed deadine matrix</h2>
        </div>
        
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: "40%" }}>Task details</th>
                <th>Deadline</th>
                <th>Progress</th>
                <th>Risk score</th>
                <th>Next milestone action</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} style={{ cursor: "pointer" }}>
                  <td>
                    <Link href={`/tasks/${task.id}`} style={{ display: "block" }}>
                      <strong style={{ fontSize: "14px", color: "var(--text)" }}>{task.title}</strong>
                      <p className="muted" style={{ margin: "2px 0 0", fontSize: "12px" }}>{task.category}</p>
                    </Link>
                  </td>
                  <td style={{ fontSize: "13.5px" }}>{task.deadline}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "120px" }}>
                      <div className="progress" style={{ flex: 1, height: "4px" }}>
                        <span style={{ width: `${task.progress}%` }} />
                      </div>
                      <span style={{ fontSize: "12px", fontWeight: "600" }}>{task.progress}%</span>
                    </div>
                  </td>
                  <td>
                    <span className={`pill ${task.riskLevel}`} style={{ padding: "2px 8px", fontSize: "11px", fontWeight: 700 }}>
                      {task.risk}%
                    </span>
                  </td>
                  <td style={{ fontSize: "13px", color: "var(--muted-strong)" }}>{task.nextAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
