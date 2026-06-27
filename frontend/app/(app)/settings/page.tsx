"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { useTheme } from "@/components/ThemeProvider";
import { Settings, Save, ShieldCheck, Moon } from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <section className="page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ flex: "1 1 500px" }}>
          <PageHeader 
            eyebrow="Settings" 
            title="Keep the system calm and personal." 
            description="Theme, notification, privacy, and rescue consent settings live here before Firebase persistence is added." 
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
          ⚙️ <strong>Configuration:</strong> {"\"Toggle between Light, Dark, or Ocean theme. Layout transitions instantly.\""}
        </div>
      </div>

      <div className="card card-pad stack" style={{ padding: "32px", gap: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--surface-line)", paddingBottom: "12px" }}>
          <Settings size={18} color="var(--accent)" />
          <h2 style={{ margin: 0, fontSize: "18px" }}>Preference Options</h2>
        </div>

        <div className="stack" style={{ gap: "20px" }}>
          <label className="label">
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              Theme Interface Mode
            </span>
            <select 
              className="select" 
              value={theme} 
              onChange={(e) => setTheme(e.target.value as any)}
              style={{ maxWidth: "320px" }}
            >
              <option value="light">Light theme (Clean & High Contrast)</option>
              <option value="dark">Dark theme (Sleek & Glowing Accents)</option>
              <option value="ocean">Ocean theme (Calming Navy & Teal)</option>
            </select>
          </label>
          
          <label className="label">
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Moon size={14} /> Quiet hours (Silenced alerts)
            </span>
            <input className="input" defaultValue="10:30 PM to 7:30 AM" style={{ maxWidth: "320px" }} />
          </label>
          
          <label className="label">
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <ShieldCheck size={14} /> Autonomous rescue consent
            </span>
            <select className="select" defaultValue="preview" style={{ maxWidth: "320px" }}>
              <option value="preview">Preview only (approval required)</option>
              <option value="apply">Apply automatically after agent simulation</option>
            </select>
          </label>
        </div>

        <div className="btn-row" style={{ borderTop: "1px solid var(--surface-line)", paddingTop: "20px", marginTop: "8px" }}>
          <button className="button button-primary">
            <Save size={14} /> Save changes
          </button>
          <button className="button button-secondary">
            Cancel
          </button>
        </div>
      </div>
    </section>
  );
}
