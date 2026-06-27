import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MetricCard } from "@/components/ui/MetricCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { TaskCard } from "@/components/ui/TaskCard";
import { health, metrics, notifications, schedule, tasks } from "@/lib/data";

export default function DashboardPage() {
  return (
    <section className="page page-wide">
      <PageHeader
        eyebrow="Dashboard"
        title="Good morning, Krish."
        description="Your deadlines are being watched, simulated, and reorganized into the next best move."
        action={<Link className="button button-primary" href="/rescue">Review rescue plan <ArrowRight size={17} /></Link>}
      />
      <div className="grid grid-4">
        {metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
      </div>
      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <div className="card card-pad stack">
          <h2>At-risk work</h2>
          <div className="grid grid-2">{tasks.slice(0, 2).map((task) => <TaskCard task={task} key={task.id} />)}</div>
        </div>
        <div className="card card-pad stack">
          <h2>Today</h2>
          <div className="timeline">{schedule.slice(0, 4).map(([time, type, title]) => <div className="timeline-item" key={time}><span className="time">{time}</span><div><strong>{type}</strong><p className="muted">{title}</p></div></div>)}</div>
        </div>
      </div>
      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <div className="card card-pad stack">
          <h2>System health</h2>
          {health.map((item) => {
            const Icon = item.icon;
            return <div className="list-row" key={item.label}><div><Icon size={18} /><strong>{item.label}</strong><p className="muted">{item.value}</p></div><span className="pill safe">ok</span></div>;
          })}
        </div>
        <div className="card card-pad stack">
          <h2>Recent signals</h2>
          {notifications.map((note) => <div className="list-row" key={note}><span>{note}</span></div>)}
        </div>
      </div>
    </section>
  );
}
