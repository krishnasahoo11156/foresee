import { AlertTriangle, Bell, Info } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { notifications } from "@/lib/data";

export default function NotificationsPage() {
  return (
    <section className="page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ flex: "1 1 500px" }}>
          <PageHeader 
            eyebrow="Notifications" 
            title="Signals that respect attention." 
            description="In-app, push, and email notifications share one preference system with quiet hours and escalation rules." 
          />
        </div>
        <div 
          className="sketch-note" 
          style={{ 
            fontSize: "0.85rem", 
            maxWidth: "300px", 
            transform: "rotate(-1deg)",
            marginBottom: "24px"
          }}
        >
          🔕 <strong>Attention Shield:</strong> {"\"Notifications are silenced during your scheduled quiet hours.\""}
        </div>
      </div>

      <div className="list" style={{ gap: "12px" }}>
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
    </section>
  );
}
