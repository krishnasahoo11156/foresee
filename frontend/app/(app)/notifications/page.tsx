import { PageHeader } from "@/components/ui/PageHeader";
import { NotificationCenter } from "@/components/ui/NotificationCenter";

export default function NotificationsPage() {
  return (
    <section className="page page-wide">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "24px", marginBottom: "32px" }}>
        <div style={{ flex: "1 1 500px" }}>
          <PageHeader 
            eyebrow="Notifications" 
            title="Signals that respect attention." 
            description="In-app, push, and email notifications share one preference system with quiet hours and escalation rules." 
          />
        </div>
      </div>

      <div style={{ marginBottom: "32px" }}>
        <NotificationCenter />
      </div>
    </section>
  );
}
