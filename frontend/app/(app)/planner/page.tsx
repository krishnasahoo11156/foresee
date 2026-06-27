import { PageHeader } from "@/components/ui/PageHeader";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { schedule } from "@/lib/data";
import { Calendar, Clock, Lock } from "lucide-react";

export default function PlannerPage() {
  return (
    <section className="page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "24px", marginBottom: "32px" }}>
        <div style={{ flex: "1 1 500px" }}>
          <PageHeader 
            eyebrow="Planner" 
            title="A calendar built around focus capacity." 
            description="This page will become the Google Calendar sync surface. For now it shows the planned day and conflict-free focus blocks." 
          />
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

      <div className="grid grid-3" style={{ gap: "32px", alignItems: "start" }}>
        <div className="card card-pad stack" style={{ gridColumn: "span 2" }}>
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
                  <button className="button button-secondary" style={{ height: "32px", padding: "0 12px", fontSize: "12px" }}>
                    Move
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <ImagePlaceholder label="Google Calendar integration timeline visualizer" height="340px" />
        </div>
      </div>
    </section>
  );
}
