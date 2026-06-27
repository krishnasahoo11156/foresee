"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { Activity, ToggleLeft } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function ProfilePage() {
  const { user, profile } = useAuth();

  // Load values with defaults
  const workingStyle = profile?.preferences?.workingStyle || "balanced";
  const capacity = profile?.preferences?.deepWorkHours || 4;
  const sessionLength = profile?.preferences?.preferredSessionLength || 45;
  const strictness = profile?.preferences?.calendarStrictness || 75;
  const contextCost = profile?.preferences?.contextSwitchingCost || 15;
  const recoveryTime = profile?.preferences?.focusRecoveryTime || 20;

  const styleText = 
    workingStyle === "morning" ? "Morning Person (7:00 AM - 12:00 PM)" :
    workingStyle === "night" ? "Night Owl (8:00 PM - 2:00 AM)" :
    "Balanced Focus (9:30 AM & 2:30 PM)";

  const displayName = profile?.name || user?.displayName || "User";

  return (
    <section className="page page-wide">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "24px", marginBottom: "32px" }}>
        <div style={{ flex: "1 1 500px" }}>
          <PageHeader 
            eyebrow="Profile" 
            title={`${displayName}'s productivity fingerprint`} 
            description="Your profile summarizes focus windows, execution reliability, calendar strictness parameters, and self-learned cognitive factors." 
          />
        </div>
      </div>

      <div style={{ marginBottom: "32px" }}>
        <ImagePlaceholder label="User focus intensity graph and cognitive load analytics dashboard" height="200px" />
      </div>

      <div className="grid grid-2" style={{ gap: "32px", alignItems: "stretch" }}>
        <div className="card card-pad stack" style={{ padding: "28px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--surface-line)", paddingBottom: "12px", marginBottom: "8px" }}>
              <Activity size={18} color="var(--accent)" />
              <h2 style={{ margin: 0, fontSize: "18px" }}>Focus Rhythm</h2>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                <span className="muted">Peak focus window:</span>
                <strong style={{ color: "var(--text)" }}>{styleText}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                <span className="muted">Daily deep work capacity:</span>
                <strong style={{ color: "var(--text)" }}>{capacity} hours</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                <span className="muted">Session Block Size:</span>
                <strong style={{ color: "var(--text)" }}>{sessionLength} minutes</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                <span className="muted">Learned planning bias:</span>
                <strong style={{ color: "var(--warning)" }}>Underestimates coding by {contextCost}%</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="card card-pad stack" style={{ padding: "28px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--surface-line)", paddingBottom: "12px", marginBottom: "8px" }}>
              <ToggleLeft size={18} color="var(--accent-2)" />
              <h2 style={{ margin: 0, fontSize: "18px" }}>System Constraints</h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                <span className="muted">Context Switching Cost:</span>
                <strong style={{ color: "var(--text)" }}>{contextCost} minutes</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                <span className="muted">Calendar Strictness:</span>
                <strong style={{ color: "var(--text)" }}>{strictness}% strictness</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                <span className="muted">Focus Recovery Target:</span>
                <strong style={{ color: "var(--text)" }}>{recoveryTime} minutes</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                <span className="muted">Rescue Consent Mode:</span>
                <strong style={{ color: "var(--text)" }}>Manual approval required</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
