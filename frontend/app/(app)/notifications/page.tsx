import { AlertTriangle, Bell } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { notifications } from "@/lib/data";

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

      <div className="grid grid-3" style={{ gap: "32px", alignItems: "start" }}>
        <div className="list" style={{ gap: "12px", gridColumn: "span 2" }}>
          {notifications.map((note, index) => {
            const isCritical = index === 0;
            return (
              <div 
                className="list-row" 
                key={note}
                style={{ 
                  padding: "18px 24px",
                  borderLeft: isCritical ? "4px solid var(--danger)" : "1px solid var(--surface-line)",
                  display: "flex",
                  alignItems: "center",
                  gap: "20px"
                }}
              >
                <div 
                  style={{ 
                    width: "36px", 
                    height: "36px", 
                    borderRadius: "8px", 
                    background: isCritical ? "rgba(220, 38, 38, 0.1)" : "var(--surface-soft)",
                    display: "grid",
                    placeItems: "center",
                    color: isCritical ? "var(--danger)" : "var(--accent)",
                    flexShrink: 0
                  }}
                >
                  {isCritical ? <AlertTriangle size={16} /> : <Bell size={16} />}
                </div>
                
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: "14px", color: isCritical ? "var(--danger)" : "var(--text)" }}>
                    {isCritical ? "Critical Alert" : "System Update"}
                  </strong>
                  <p className="muted" style={{ margin: "4px 0 0", fontSize: "13px", lineHeight: "1.4" }}>
                    {note}
                  </p>
                </div>

                <span 
                  className={`pill ${isCritical ? "critical" : "default"}`}
                  style={{ 
                    padding: "3px 9px", 
                    fontSize: "10px", 
                    fontWeight: 700 
                  }}
                >
                  {isCritical ? "new" : "read"}
                </span>
              </div>
            );
          })}
        </div>

        <div>
          <ImagePlaceholder label="Push notification delivery and quiet hours overview graphic" height="280px" />
        </div>
      </div>
    </section>
  );
}
