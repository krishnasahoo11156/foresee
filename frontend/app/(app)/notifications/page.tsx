import { PageHeader } from "@/components/ui/PageHeader";
import { notifications } from "@/lib/data";

export default function NotificationsPage() {
  return (
    <section className="page">
      <PageHeader eyebrow="Notifications" title="Signals that respect attention." description="In-app, push, and email notifications will share one preference system with quiet hours and escalation rules." />
      <div className="list">{notifications.map((note, index) => <div className="list-row" key={note}><div><strong>{index === 0 ? "Critical alert" : "Update"}</strong><p className="muted">{note}</p></div><span className="pill">{index === 0 ? "now" : "read"}</span></div>)}</div>
    </section>
  );
}
