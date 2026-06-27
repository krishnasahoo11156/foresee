import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MetricCard } from "@/components/ui/MetricCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { TaskCard } from "@/components/ui/TaskCard";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { metrics, notifications, schedule, tasks } from "@/lib/data";

export default function DashboardPage() {
  return (
    <section className="page page-wide">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "24px", marginBottom: "32px" }}>
        <div style={{ flex: "1 1 500px" }}>
          <PageHeader
            eyebrow="Dashboard"
            title="Good morning, Krish."
            description="Your deadlines are being watched, simulated, and reorganized into the next best move."
          />
        </div>
        <div>
          <Link className="button button-primary" href="/rescue">
            Review rescue plan <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <div className="grid grid-4" style={{ marginBottom: "32px" }}>
        {metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
      </div>

      <div className="grid grid-3" style={{ gap: "32px", alignItems: "start" }}>
        {/* Left Column: At-Risk & Focus Blocks */}
        <div style={{ display: "flex", flexDirection: "column", gap: "32px", gridColumn: "span 2" }}>
          <div className="card card-pad stack">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0 }}>At-risk work</h2>
              <Link href="/tasks" className="muted" style={{ fontSize: "12px", textDecoration: "underline" }}>View all tasks</Link>
            </div>
            <div className="grid grid-2" style={{ gap: "20px" }}>
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
                  <div style={{ padding: "2px 0" }}>
                    <strong style={{ fontSize: "13.5px" }}>{type}</strong>
                    <p className="muted" style={{ margin: "2px 0 0", fontSize: "12px" }}>{title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Visual Image & System Signals */}
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          <ImagePlaceholder label="Project productivity analysis visualization" height="260px" />

          <div className="card card-pad stack">
            <h2>Recent signals</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {notifications.slice(0, 3).map((note) => (
                <div className="list-row" key={note} style={{ padding: "12px 14px", fontSize: "12.5px", lineHeight: "1.4" }}>
                  <span>{note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
