import { PageHeader } from "@/components/ui/PageHeader";
import { schedule } from "@/lib/data";
import { Calendar, Clock, Lock } from "lucide-react";

export default function PlannerPage() {
  return (
    <section className="page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ flex: "1 1 500px" }}>
          <PageHeader 
            eyebrow="Planner" 
            title="A calendar built around focus capacity." 
            description="This page will become the Google Calendar sync surface. For now it shows the planned day and conflict-free focus blocks." 
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
          📅 <strong>Sync status:</strong> {"\"Mock mode active. Click 'Move' to optimize schedule blocks dynamically.\""}
        </div>
      </div>

      <div className="grid grid-3" style={{ marginBottom: "28px" }}>
        <div className="card card-pad" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "var(--accent-soft)", display: "grid", placeItems: "center", color: "var(--accent)" }}>
            <Clock size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0 }}>Focus Time</h3>
            <p className="muted" style={{ margin: 0 }}>5.5h scheduled today</p>
          </div>
        </div>
        <div className="card card-pad" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "var(--accent-2-soft)", display: "grid", placeItems: "center", color: "var(--accent-2)" }}>
            <Calendar size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0 }}>Calendar Sync</h3>
            <p className="muted" style={{ margin: 0 }}>Ready to sync</p>
          </div>
        </div>
        <div className="card card-pad" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "var(--accent-soft)", display: "grid", placeItems: "center", color: "var(--accent)" }}>
            <Lock size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0 }}>Quiet Hours</h3>
            <p className="muted" style={{ margin: 0 }}>10:30 PM - 7:30 AM</p>
          </div>
        </div>
      </div>

      <div className="card card-pad stack">
        <h2 style={{ margin: "0 0 12px" }}>Daily schedule flow</h2>
        <div className="timeline" style={{ paddingLeft: "16px", paddingRight: "8px" }}>
          {schedule.map(([time, type, title]) => (
            <div className="timeline-item" key={time}>
              <span className="time">{time}</span>
              <div 
                className="list-row" 
                style={{ 
                  flex: 1, 
                  margin: 0, 
                  padding: "14px 20px", 
                  boxShadow: "none" 
                }}
              >
                <div>
                  <strong style={{ fontSize: "14px" }}>{type}</strong>
                  <p className="muted" style={{ margin: "2px 0 0", fontSize: "12.5px" }}>{title}</p>
                </div>
                <button className="button button-secondary" style={{ minHeight: "32px", padding: "0 12px", fontSize: "12px" }}>
                  Move
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
