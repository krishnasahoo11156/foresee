"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/components/AuthProvider";
import { 
  Settings, Save, ShieldCheck, Moon, 
  Zap, Calendar, Brain, Check, RefreshCw 
} from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { profile, saveUserProfile } = useAuth();

  // Local state for all settings
  const [quietHours, setQuietHours] = useState("10:30 PM to 7:30 AM");
  const [rescueConsent, setRescueConsent] = useState("preview");
  const [deepWorkHours, setDeepWorkHours] = useState(4);
  const [contextSwitchingCost, setContextSwitchingCost] = useState(15);
  const [calendarStrictness, setCalendarStrictness] = useState(75);
  const [focusRecoveryTime, setFocusRecoveryTime] = useState(20);
  const [workingStyle, setWorkingStyle] = useState("balanced");
  
  // UI States
  const [showToast, setShowToast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load initial preferences
  useEffect(() => {
    const prefs = profile?.preferences;
    const localPrefsStr = localStorage.getItem("mock_profile_preferences");
    const localPrefs = localPrefsStr ? JSON.parse(localPrefsStr) : null;
    const activePrefs = prefs || localPrefs;
    
    if (activePrefs) {
      if (activePrefs.quietHours) setQuietHours(activePrefs.quietHours);
      if (activePrefs.rescueConsent) setRescueConsent(activePrefs.rescueConsent);
      if (activePrefs.deepWorkHours !== undefined) setDeepWorkHours(Number(activePrefs.deepWorkHours));
      if (activePrefs.contextSwitchingCost !== undefined) setContextSwitchingCost(Number(activePrefs.contextSwitchingCost));
      if (activePrefs.calendarStrictness !== undefined) setCalendarStrictness(Number(activePrefs.calendarStrictness));
      if (activePrefs.focusRecoveryTime !== undefined) setFocusRecoveryTime(Number(activePrefs.focusRecoveryTime));
      if (activePrefs.workingStyle) setWorkingStyle(activePrefs.workingStyle);
    }
  }, [profile]);

  // Save changes handler
  // Save changes handler
  const handleSave = async () => {
    setIsSaving(true);
    
    const databasePreferences = {
      quietHours,
      rescueConsent,
      deepWorkHours: String(deepWorkHours),
      contextSwitchingCost: String(contextSwitchingCost),
      calendarStrictness: String(calendarStrictness),
      focusRecoveryTime: String(focusRecoveryTime),
      workingStyle,
      theme
    };

    const updatedPreferences = {
      quietHours,
      rescueConsent,
      deepWorkHours: Number(deepWorkHours),
      contextSwitchingCost: Number(contextSwitchingCost),
      calendarStrictness: Number(calendarStrictness),
      focusRecoveryTime: Number(focusRecoveryTime),
      workingStyle,
      theme
    };

    // 1. Try to sync to database if authenticated
    try {
      await saveUserProfile(databasePreferences);
    } catch (err) {
      console.warn("Could not sync preferences to database:", err);
    }

    // 2. Write to local storage (acts as fallback and syncs local guest mode)
    localStorage.setItem("mock_profile_preferences", JSON.stringify(updatedPreferences));

    // 3. Dispatch storage sync events so components like ProductivityAnalytics sync immediately
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new CustomEvent("preferencesUpdated", { detail: updatedPreferences }));

    setIsSaving(false);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  // Cancel / Reset handler
  const handleCancel = () => {
    const prefs = profile?.preferences;
    const localPrefsStr = localStorage.getItem("mock_profile_preferences");
    const localPrefs = localPrefsStr ? JSON.parse(localPrefsStr) : null;
    const activePrefs = prefs || localPrefs;
    
    if (activePrefs) {
      setQuietHours(activePrefs.quietHours || "10:30 PM to 7:30 AM");
      setRescueConsent(activePrefs.rescueConsent || "preview");
      setDeepWorkHours(Number(activePrefs.deepWorkHours !== undefined ? activePrefs.deepWorkHours : 4));
      setContextSwitchingCost(Number(activePrefs.contextSwitchingCost !== undefined ? activePrefs.contextSwitchingCost : 15));
      setCalendarStrictness(Number(activePrefs.calendarStrictness !== undefined ? activePrefs.calendarStrictness : 75));
      setFocusRecoveryTime(Number(activePrefs.focusRecoveryTime !== undefined ? activePrefs.focusRecoveryTime : 20));
      setWorkingStyle(activePrefs.workingStyle || "balanced");
    } else {
      // Load defaults
      setQuietHours("10:30 PM to 7:30 AM");
      setRescueConsent("preview");
      setDeepWorkHours(4);
      setContextSwitchingCost(15);
      setCalendarStrictness(75);
      setFocusRecoveryTime(20);
      setWorkingStyle("balanced");
    }
  };

  // SVG Gauge calculations
  // Circle perimeter = 2 * Math.PI * r (r=32 => perimeter = 201)
  const getStrokeDashOffset = (percent: number) => {
    const perimeter = 201;
    return perimeter - (percent / 100) * perimeter;
  };

  // Convert raw settings values to gauge percentages
  const focusPercent = ((deepWorkHours - 2) / (8 - 2)) * 100;
  const strictnessPercent = calendarStrictness;
  const switchingPercent = ((contextSwitchingCost - 5) / (45 - 5)) * 100;
  const autonomyPercent = rescueConsent === "apply" ? 100 : 40;

  // Calibrate current persona
  const getCalibration = () => {
    if (calendarStrictness > 80 && contextSwitchingCost > 25) {
      return {
        title: "High-Friction Executor",
        desc: "Your calendar is extremely rigid, but context-switching overhead is significant. Be cautious: rapid task switches are highly likely to induce fatigue and timeline slips.",
        tone: "cal-warning",
      };
    }
    if (deepWorkHours >= 6 && contextSwitchingCost <= 15) {
      return {
        title: "Deep Flow Specialist",
        desc: "High daily capacity combined with low switching overhead. Excellent configuration for prolonged deep focus sessions. Your schedule has low scheduling friction.",
        tone: "cal-success",
      };
    }
    if (rescueConsent === "apply" && calendarStrictness < 60) {
      return {
        title: "Autonomous Coordinator",
        desc: "High trust in autonomous rescheduling paired with a flexible schedule. The simulation engine has maximum freedom to self-optimize your day quietly.",
        tone: "cal-optimal",
      };
    }
    return {
      title: "Balanced Co-Pilot",
      desc: "A balanced configuration between manual calendar oversight and automated planning recommendations. Offers stable cognitive reserves.",
      tone: "cal-normal",
    };
  };

  const cal = getCalibration();

  return (
    <section className="page page-wide">
      <PageHeader 
        eyebrow="Settings" 
        title="Keep the system calm and personal." 
        description="Theme, notification, privacy, and rescue consent settings live here before Firebase persistence is added." 
      />

      {/* Floating Success Toast */}
      {showToast && (
        <div className="hud-toast">
          <Check size={16} color="var(--success)" />
          <span className="hud-toast-text">Settings Saved & Synchronized</span>
        </div>
      )}

      <div className="grid grid-2" style={{ alignItems: "start", gap: "32px" }}>
        
        {/* Preference Options Card */}
        <div className="card card-pad stack" style={{ gap: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--surface-line)", paddingBottom: "12px" }}>
            <Settings size={18} color="var(--accent)" />
            <h2 style={{ margin: 0, fontSize: "18px" }}>Preference Options</h2>
          </div>

          <div className="stack" style={{ gap: "20px" }}>
            
            {/* Theme Select */}
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

            {/* Working Style Select */}
            <label className="label">
              <span>Working Focus Style</span>
              <select 
                className="select" 
                value={workingStyle} 
                onChange={(e) => setWorkingStyle(e.target.value)}
                style={{ maxWidth: "320px" }}
              >
                <option value="morning">Morning Peak Style (7:00 AM - 12:00 PM)</option>
                <option value="balanced">Balanced Focus Style (Dual Peak)</option>
                <option value="night">Night Owl Style (8:00 PM - 2:00 AM)</option>
              </select>
            </label>
            
            {/* Quiet Hours */}
            <label className="label">
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Moon size={14} /> Quiet hours (Silenced alerts)
              </span>
              <input 
                className="input" 
                value={quietHours} 
                onChange={(e) => setQuietHours(e.target.value)}
                style={{ maxWidth: "320px" }} 
              />
            </label>
            
            {/* Rescue Consent */}
            <label className="label">
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <ShieldCheck size={14} /> Autonomous rescue consent
              </span>
              <select 
                className="select" 
                value={rescueConsent} 
                onChange={(e) => setRescueConsent(e.target.value)}
                style={{ maxWidth: "320px" }}
              >
                <option value="preview">Preview only (approval required)</option>
                <option value="apply">Apply automatically after agent simulation</option>
              </select>
            </label>

            <hr style={{ border: "none", borderTop: "1px solid var(--surface-line)", margin: "8px 0" }} />

            {/* SLIDERS FOR PRODUCTIVITY FINGERPRINT */}
            
            {/* Deep Work Slider */}
            <div className="hud-slider-group">
              <div className="hud-slider-label">
                <span>Daily Deep Work Capacity</span>
                <span className="hud-slider-value">{deepWorkHours} hours</span>
              </div>
              <input 
                type="range" 
                min="2" 
                max="8" 
                step="0.5" 
                className="hud-slider"
                value={deepWorkHours}
                onChange={(e) => setDeepWorkHours(Number(e.target.value))}
              />
            </div>

            {/* Calendar Strictness Slider */}
            <div className="hud-slider-group">
              <div className="hud-slider-label">
                <span>Calendar Strictness Rate</span>
                <span className="hud-slider-value">{calendarStrictness}% strict</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="100" 
                step="5" 
                className="hud-slider"
                value={calendarStrictness}
                onChange={(e) => setCalendarStrictness(Number(e.target.value))}
              />
            </div>

            {/* Context Switching Cost Slider */}
            <div className="hud-slider-group">
              <div className="hud-slider-label">
                <span>Context Switching Penalty</span>
                <span className="hud-slider-value">{contextSwitchingCost} minutes</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="45" 
                step="5" 
                className="hud-slider"
                value={contextSwitchingCost}
                onChange={(e) => setContextSwitchingCost(Number(e.target.value))}
              />
            </div>

            {/* Focus Recovery Slider */}
            <div className="hud-slider-group">
              <div className="hud-slider-label">
                <span>Focus Recovery Target</span>
                <span className="hud-slider-value">{focusRecoveryTime} minutes</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="60" 
                step="5" 
                className="hud-slider"
                value={focusRecoveryTime}
                onChange={(e) => setFocusRecoveryTime(Number(e.target.value))}
              />
            </div>

          </div>

          {/* Action Buttons */}
          <div className="btn-row" style={{ borderTop: "1px solid var(--surface-line)", paddingTop: "20px", marginTop: "8px" }}>
            <button 
              className="button button-primary" 
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />} 
              {isSaving ? "Saving..." : "Save changes"}
            </button>
            <button className="button button-secondary" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>

        {/* Visual Signature HUD Column */}
        <div className="stack" style={{ gap: "20px" }}>
          
          <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700, color: "var(--muted)", marginBottom: "-8px" }}>
            Cognitive Signature HUD
          </div>

          <div className="hud-gauge-grid">
            
            {/* Gauge 1: Capacity */}
            <div className="hud-gauge-card gauge-blue">
              <div className="hud-gauge-circle-container">
                <svg className="hud-gauge-svg">
                  <circle cx="40" cy="40" r="32" className="hud-gauge-circle-bg" />
                  <circle 
                    cx="40" 
                    cy="40" 
                    r="32" 
                    className="hud-gauge-circle-value" 
                    strokeDasharray="201" 
                    strokeDashoffset={getStrokeDashOffset(focusPercent)}
                  />
                </svg>
                <div className="hud-gauge-inner-text">
                  <span>{deepWorkHours}h</span>
                </div>
                <div className="hud-gauge-icon-wrapper">
                  <Zap size={10} />
                </div>
              </div>
              <span className="hud-gauge-label">Focus Bandwidth</span>
            </div>

            {/* Gauge 2: Calendar Rigidity */}
            <div className="hud-gauge-card gauge-purple">
              <div className="hud-gauge-circle-container">
                <svg className="hud-gauge-svg">
                  <circle cx="40" cy="40" r="32" className="hud-gauge-circle-bg" />
                  <circle 
                    cx="40" 
                    cy="40" 
                    r="32" 
                    className="hud-gauge-circle-value" 
                    strokeDasharray="201" 
                    strokeDashoffset={getStrokeDashOffset(strictnessPercent)}
                  />
                </svg>
                <div className="hud-gauge-inner-text">
                  <span>{calendarStrictness}%</span>
                </div>
                <div className="hud-gauge-icon-wrapper">
                  <Calendar size={10} />
                </div>
              </div>
              <span className="hud-gauge-label">Calendar Rigidity</span>
            </div>

            {/* Gauge 3: Latency */}
            <div className="hud-gauge-card gauge-pink">
              <div className="hud-gauge-circle-container">
                <svg className="hud-gauge-svg">
                  <circle cx="40" cy="40" r="32" className="hud-gauge-circle-bg" />
                  <circle 
                    cx="40" 
                    cy="40" 
                    r="32" 
                    className="hud-gauge-circle-value" 
                    strokeDasharray="201" 
                    strokeDashoffset={getStrokeDashOffset(switchingPercent)}
                  />
                </svg>
                <div className="hud-gauge-inner-text">
                  <span>{contextSwitchingCost}m</span>
                </div>
                <div className="hud-gauge-icon-wrapper">
                  <Brain size={10} />
                </div>
              </div>
              <span className="hud-gauge-label">Switching Cost</span>
            </div>

            {/* Gauge 4: Autonomy */}
            <div className="hud-gauge-card gauge-teal">
              <div className="hud-gauge-circle-container">
                <svg className="hud-gauge-svg">
                  <circle cx="40" cy="40" r="32" className="hud-gauge-circle-bg" />
                  <circle 
                    cx="40" 
                    cy="40" 
                    r="32" 
                    className="hud-gauge-circle-value" 
                    strokeDasharray="201" 
                    strokeDashoffset={getStrokeDashOffset(autonomyPercent)}
                  />
                </svg>
                <div className="hud-gauge-inner-text" style={{ fontSize: "11px" }}>
                  <span>{rescueConsent === "apply" ? "Auto" : "Co-Pilot"}</span>
                </div>
                <div className="hud-gauge-icon-wrapper">
                  <ShieldCheck size={10} />
                </div>
              </div>
              <span className="hud-gauge-label">Autonomy Level</span>
            </div>

          </div>

          {/* Calibrated Persona Card */}
          <div className={`hud-calibration-card ${cal.tone}`}>
            <span className="hud-cal-eyebrow">Calibrated Persona</span>
            <h4 className="hud-cal-title">{cal.title}</h4>
            <p className="hud-cal-desc">{cal.desc}</p>
          </div>

          {/* Sync info box */}
          <div className="card card-pad" style={{ background: "var(--surface-soft)", padding: "20px 24px" }}>
            <h3 style={{ marginBottom: "8px", fontSize: "14px", fontWeight: 700 }}>Syncing Preference Profiles</h3>
            <p className="muted" style={{ lineHeight: "1.45", fontSize: "12.5px" }}>
              These settings are saved locally to your current browser session. Enabling authentication in the next phase will sync these preferences automatically to your Firebase database profile.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
