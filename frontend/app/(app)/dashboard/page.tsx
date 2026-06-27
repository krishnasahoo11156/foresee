import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { MetricCard } from "@/components/ui/MetricCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { TaskCard } from "@/components/ui/TaskCard";
import { health, metrics, notifications, schedule, tasks } from "@/lib/data";

export default function DashboardPage() {
  return (
    <section className="page page-wide">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ flex: "1 1 500px" }}>
          <PageHeader
            eyebrow="Dashboard"
            title="Good morning, Krish."
            description="Your deadlines are being watched, simulated, and reorganized into the next best move."
            action={<Link className="button button-primary" href="/rescue">Review rescue plan <ArrowRight size={16} /></Link>}
          />
        </div>
        <div 
          className="sketch-note" 
          style={{ 
            fontSize: "0.85rem", 
            maxWidth: "340px", 
            transform: "rotate(1deg)",
            alignSelf: "center",
            marginBottom: "24px"
          }}
        >
          💡 <strong>Productivity Insight:</strong> {"\"You are 18% faster at writing tasks between 9:00 AM and 11:00 AM.\""}
        </div>
      </div>

      <div className="grid grid-4" style={{ marginBottom: "28px" }}>
        {metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
      </div>

      <div className="grid grid-2" style={{ marginBottom: "28px" }}>
        <div className="card card-pad stack">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ margin: 0 }}>At-risk work</h2>
            <Link href="/tasks" className="muted" style={{ fontSize: "12px", textDecoration: "underline" }}>View all tasks</Link>
          </div>
          <div className="grid grid-2" style={{ gap: "16px" }}>
            {tasks.slice(0, 2).map((task) => <TaskCard task={task} key={task.id} />)}
          </div>
        </div>

        <div className="card card-pad stack">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ margin: 0 }}>Today{"'"}s focus blocks</h2>
            <Link href="/planner" className="muted" style={{ fontSize: "12px", textDecoration: "underline" }}>Open planner</Link>
          </div>
          <div className="timeline" style={{ padding: "8px 0" }}>
            {schedule.slice(0, 4).map(([time, type, title]) => (
              <div className="timeline-item" key={time}>
                <span className="time">{time}</span>
                <div style={{ padding: "4px 0" }}>
                  <strong style={{ fontSize: "14px" }}>{type}</strong>
                  <p className="muted" style={{ margin: "2px 0 0", fontSize: "12.5px" }}>{title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card card-pad stack">
          <h2>System health</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {health.map((item) => {
              const Icon = item.icon;
              return (
                <div className="list-row" key={item.label} style={{ padding: "12px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ color: "var(--accent)", display: "flex" }}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <strong style={{ fontSize: "13.5px" }}>{item.label}</strong>
                      <p className="muted" style={{ margin: "2px 0 0", fontSize: "12px" }}>{item.value}</p>
                    </div>
                  </div>
                  <span className="pill safe" style={{ padding: "2px 8px" }}>online</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card card-pad stack">
          <h2>Recent signals</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {notifications.slice(0, 3).map((note) => (
              <div className="list-row" key={note} style={{ padding: "14px 18px", fontSize: "13px", lineHeight: "1.4" }}>
                <span>{note}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
