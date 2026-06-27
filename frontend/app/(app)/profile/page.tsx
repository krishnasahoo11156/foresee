import { PageHeader } from "@/components/ui/PageHeader";
import { User, Activity, ToggleLeft } from "lucide-react";

export default function ProfilePage() {
  return (
    <section className="page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ flex: "1 1 500px" }}>
          <PageHeader 
            eyebrow="Profile" 
            title="Krish's productivity fingerprint." 
            description="The profile summarizes focus windows, reliability, preferred nudges, and learned planning bias." 
          />
        </div>
        <div 
          className="sketch-note" 
          style={{ 
            fontSize: "0.85rem", 
            maxWidth: "340px", 
            transform: "rotate(-1.5deg)",
            marginBottom: "24px"
          }}
        >
          🎨 <strong>Personal signature:</strong> {"\"I structure code during the day and sketch interface ideas at night.\""}
        </div>
      </div>

      <div className="grid grid-2" style={{ gap: "24px" }}>
        <div className="card card-pad stack" style={{ padding: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--surface-line)", paddingBottom: "12px", marginBottom: "8px" }}>
            <Activity size={18} color="var(--accent)" />
            <h2 style={{ margin: 0, fontSize: "18px" }}>Work Pattern</h2>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
              <span className="muted">Peak focus window:</span>
              <strong style={{ color: "var(--text)" }}>9:00 AM to 11:00 AM</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
              <span className="muted">Daily focus capacity:</span>
              <strong style={{ color: "var(--text)" }}>5.5 hours</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
              <span className="muted">Learned planning bias:</span>
              <strong style={{ color: "var(--warning)" }}>Underestimates writing by 18%</strong>
            </div>
          </div>
        </div>

        <div className="card card-pad stack" style={{ padding: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--surface-line)", paddingBottom: "12px", marginBottom: "8px" }}>
            <ToggleLeft size={18} color="var(--accent-2)" />
            <h2 style={{ margin: 0, fontSize: "18px" }}>System Preferences</h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
              <span className="muted">Nudge tone style:</span>
              <strong style={{ color: "var(--text)" }}>Direct but calm</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
              <span className="muted">Rescue consent mode:</span>
              <strong style={{ color: "var(--text)" }}>Manual approval required</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
              <span className="muted">Default task split block:</span>
              <strong style={{ color: "var(--text)" }}>45 to 70 minute slots</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
