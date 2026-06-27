import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, Play } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { tasks } from "@/lib/data";

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  const task = tasks.find((item) => item.id === params.id) ?? tasks[0];
  return (
    <section className="page">
      <div style={{ marginBottom: "16px" }}>
        <Link href="/tasks" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--accent)" }}>
          <ArrowLeft size={14} /> Back to tasks list
        </Link>
      </div>

      <PageHeader 
        eyebrow={task.category} 
        title={task.title} 
        description={`${task.deadline} • Effort remaining: ${task.effort}`} 
        action={<Link className="button button-primary" href="/rescue"><Play size={14} /> Run rescue analysis</Link>} 
      />

      <div className="grid grid-2" style={{ gap: "20px", marginBottom: "20px" }}>
        <div className="card card-pad stack" style={{ padding: "28px", justifyContent: "space-between" }}>
          <div>
            <div className="metric" style={{ marginBottom: "16px" }}>
              <span className={`pill ${task.riskLevel}`} style={{ padding: "4px 10px" }}>{task.riskLevel} risk</span>
              <strong style={{ fontSize: "20px", color: `var(--${task.riskLevel === 'safe' ? 'success' : task.riskLevel === 'monitor' ? 'warning' : 'danger'})` }}>
                {task.risk}% deadline risk
              </strong>
            </div>
            
            <div style={{ margin: "20px 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
                <span className="muted">Work block progress</span>
                <strong>{task.progress}%</strong>
              </div>
              <div className="progress" style={{ height: "6px" }}>
                <span style={{ width: `${task.progress}%` }} />
              </div>
            </div>
          </div>
          
          <p className="muted" style={{ margin: 0, fontSize: "13.5px", lineHeight: "1.4" }}>
            <strong>Next Action:</strong> {task.nextAction}
          </p>
        </div>

        <div className="card card-pad stack" style={{ padding: "28px" }}>
          <h2 style={{ margin: "0 0 8px", fontSize: "18px" }}>Blocker & Dependencies</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {task.dependencies.map((dependency) => (
              <div className="list-row" key={dependency} style={{ padding: "12px 16px", margin: 0, boxShadow: "none" }}>
                <span style={{ fontSize: "13.5px", fontWeight: "600" }}>{dependency}</span>
                <span className="pill monitor" style={{ padding: "2px 8px", fontSize: "9px" }}>open blocker</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card card-pad stack" style={{ padding: "28px" }}>
        <h2 style={{ margin: 0, fontSize: "18px" }}>Subtask execution plan</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
          {[
            ["Clarify output deliverables", "done"],
            ["Schedule dedicated focus block", "done"],
            ["Complete main narrative draft", "next"],
            ["Review against judging rules and ship", "next"]
          ].map(([item, status], index) => {
            const isDone = status === "done";
            return (
              <div 
                className="list-row" 
                key={item} 
                style={{ 
                  padding: "14px 20px", 
                  margin: 0, 
                  boxShadow: "none",
                  opacity: isDone ? 0.7 : 1,
                  background: isDone ? "var(--surface-soft)" : "var(--surface)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--muted)", minWidth: "20px" }}>
                    0{index + 1}
                  </span>
                  <strong style={{ fontSize: "13.5px", fontWeight: isDone ? "500" : "600", textDecoration: isDone ? "line-through" : "none" }}>
                    {item}
                  </strong>
                </div>
                <span 
                  className={`pill ${isDone ? "safe" : "default"}`} 
                  style={{ 
                    padding: "2px 8px", 
                    fontSize: "9px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  {isDone && <CheckCircle2 size={10} />} {status}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
