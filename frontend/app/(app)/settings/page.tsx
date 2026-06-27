"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { useTheme } from "@/components/ThemeProvider";
import { Settings, Save, ShieldCheck, Moon } from "lucide-react";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <section className="page">
      <PageHeader 
        eyebrow="Settings" 
        title="Keep the system calm and personal." 
        description="Theme, notification, privacy, and rescue consent settings live here before Firebase persistence is added." 
      />

      <div className="grid grid-2" style={{ alignItems: "start", gap: "32px" }}>
        <div className="card card-pad stack" style={{ gap: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--surface-line)", paddingBottom: "12px" }}>
            <Settings size={18} color="var(--accent)" />
            <h2 style={{ margin: 0, fontSize: "18px" }}>Preference Options</h2>
          </div>

          <div className="stack" style={{ gap: "20px" }}>
            <label className="label">
              <span>Theme Interface Mode</span>
              <select 
                className="select" 
                value={theme} 
                onChange={(e) => setTheme(e.target.value as any)}
                style={{ maxWidth: "320px" }}
              >
                <option value="light">Light theme (Clean & High Contrast)</option>
                <option value="dark">Dark theme (Sleek & Professional)</option>
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

        <div className="stack" style={{ gap: "16px" }}>
          <ImagePlaceholder label="Settings configuration overview layout" height="240px" />
          <div className="card card-pad" style={{ background: "var(--surface-soft)" }}>
            <h3 style={{ marginBottom: "8px" }}>Syncing Preference Profiles</h3>
            <p className="muted" style={{ lineHeight: "1.45" }}>
              These settings are saved locally to your current browser session. Enabling authentication in the next phase will sync these preferences automatically to your Firebase database profile.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
