import { PageHeader } from "@/components/ui/PageHeader";
import { schedule } from "@/lib/data";

export default function PlannerPage() {
  return (
    <section className="page">
      <PageHeader eyebrow="Planner" title="A calendar built around focus capacity." description="This page will become the Google Calendar sync surface. For now it shows the planned day and conflict-free focus blocks." />
      <div className="card card-pad timeline">
        {schedule.map(([time, type, title]) => <div className="timeline-item" key={time}><span className="time">{time}</span><div className="list-row"><div><strong>{type}</strong><p className="muted">{title}</p></div><button className="button button-secondary">Move</button></div></div>)}
      </div>
    </section>
  );
}
