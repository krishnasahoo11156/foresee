"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Chrome, Lock, CheckCircle, Clock, Briefcase, ArrowRight, User, Sun, Moon, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "@/components/ThemeProvider";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, signInWithGoogle, signInAsGuest, saveUserProfile, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [step, setStep] = useState(1);
  const [googleConnected, setGoogleConnected] = useState(Boolean(user));
  const [googleConnecting, setGoogleConnecting] = useState(false);
  const [authError, setAuthError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Form State
  const [name, setName] = useState(user?.displayName ?? "");
  const [username, setUsername] = useState(user?.email?.split("@")[0] ?? "");
  const [password, setPassword] = useState("");
  const [profession, setProfession] = useState("developer");
  const [workStart, setWorkStart] = useState("09:00");
  const [workEnd, setWorkEnd] = useState("18:00");
  const [deepWorkHours, setDeepWorkHours] = useState("4");

  // Advanced Onboarding parameters
  const [workingStyle, setWorkingStyle] = useState("balanced");
  const [preferredSessionLength, setPreferredSessionLength] = useState("45");
  const [maxDailyDeepWork, setMaxDailyDeepWork] = useState("4");
  const [maxTotalWork, setMaxTotalWork] = useState("8");
  const [weekendAvailability, setWeekendAvailability] = useState(false);
  const [lunchStart, setLunchStart] = useState("13:00");
  const [lunchEnd, setLunchEnd] = useState("14:00");
  const [meetingHeavy, setMeetingHeavy] = useState(false);
  const [notificationPreference, setNotificationPreference] = useState("medium");
  const [calendarStrictness, setCalendarStrictness] = useState("75");
  const [procrastinationLevel, setProcrastinationLevel] = useState("2");
  const [averageSleep, setAverageSleep] = useState("7.5");
  const [stressLevel, setStressLevel] = useState("medium");
  const [riskTolerance, setRiskTolerance] = useState("medium");
  const [taskSwitchingAbility, setTaskSwitchingAbility] = useState("medium");
  const [contextSwitchingCost, setContextSwitchingCost] = useState("15");
  const [breakFrequency, setBreakFrequency] = useState("50");
  const [focusRecoveryTime, setFocusRecoveryTime] = useState("20");

  useEffect(() => {
    if (user) {
      setGoogleConnected(true);
      setName(user.displayName ?? "");
      setUsername(user.email?.split("@")[0] ?? "");
    } else {
      setGoogleConnected(false);
      setName("");
      setUsername("");
      setPassword("");
    }
  }, [user]);

  const handleGoogleConnect = async () => {
    setAuthError("");
    setGoogleConnecting(true);
    try {
      const signedInUser = await signInWithGoogle();
      
      const docRef = doc(db, "users", signedInUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().password) {
        setAuthError("You have already logged in with this account.");
        setGoogleConnected(false);
        await signOut();
        return;
      }

      setGoogleConnected(true);
      setName(signedInUser.displayName ?? "");
      setUsername(signedInUser.email?.split("@")[0] ?? "");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Google sign-in failed.";
      setAuthError(message);
    } finally {
      setGoogleConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await signOut();
      setGoogleConnected(false);
      setName("");
      setUsername("");
      setPassword("");
      setAuthError("");
    } catch (err) {
      console.warn("Failed to disconnect Google account:", err);
    }
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleConnected && localStorage.getItem("foresee-guest-mode") !== "true") {
      setAuthError("Please connect Google account or use Guest Mode first.");
      return;
    }
    if (!name || !username || !password) return;

    saveUserProfile({
      name,
      username,
      password
    }).catch((error) => {
      console.warn("Failed to save credentials in step 1:", error);
    });

    setStep(2);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  const handleStep3Submit = (e: React.FormEvent) => {
    e.preventDefault();
    saveUserProfile({
      name,
      username,
      password,
      profession,
      workStart,
      workEnd,
      deepWorkHours,
      workingStyle,
      preferredSessionLength,
      maxDailyDeepWork,
      maxTotalWork,
      weekendAvailability,
      lunchStart,
      lunchEnd,
      meetingHeavy,
      notificationPreference,
      calendarStrictness,
      procrastinationLevel,
      averageSleep,
      stressLevel,
      riskTolerance,
      taskSwitchingAbility,
      contextSwitchingCost,
      breakFrequency,
      focusRecoveryTime,
      theme
    }).catch((error) => {
      console.warn("Failed to save user profile preferences to database:", error);
    });
    router.push("/dashboard");
  };

  return (
    <main className="onboarding-page">
      <div className="onboarding-form-col">
        <div style={{ maxWidth: "440px", width: "100%", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
            <span className="eyebrow" style={{ margin: 0 }}>Onboarding</span>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button 
                type="button"
                className="theme-switch-btn" 
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                aria-label="Change theme"
                title={`Toggle theme (currently ${theme})`}
                style={{ width: "30px", height: "30px", borderRadius: "6px" }}
              >
                {theme === "light" ? <Moon size={14} /> : <Sun size={14} />}
              </button>
              <span className="muted" style={{ fontWeight: 600 }}>Step {step} of 3</span>
            </div>
          </div>

          {step === 1 ? (
            <form onSubmit={handleStep1Submit} className="stack" style={{ gap: "24px" }}>
              <div>
                <h1 style={{ margin: "0 0 8px", fontSize: "28px" }}>Create your workspace.</h1>
                <p className="lead" style={{ fontSize: "14px" }}>
                  Connect your Google calendar to import tasks, or set up a standard profile.
                </p>
              </div>

              <div style={{ display: "grid", gap: "12px" }}>
                <button
                  type="button"
                  onClick={handleGoogleConnect}
                  disabled={googleConnected || googleConnecting}
                  style={{
                    width: "100%",
                    height: "44px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "12px",
                    background: googleConnected ? "var(--surface-soft)" : "#ffffff",
                    color: googleConnected ? "var(--success)" : "#1f1f1f",
                    border: googleConnected ? "1px solid var(--success)" : "1px solid #dadce0",
                    borderRadius: "8px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                    fontWeight: 500,
                    fontSize: "14px",
                    cursor: googleConnected ? "default" : "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  {googleConnected ? (
                    <CheckCircle size={18} style={{ color: "var(--success)" }} />
                  ) : (
                    <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                    </svg>
                  )}
                  <span>
                    {googleConnecting ? "Connecting..." : googleConnected ? "Google Connected ✓" : "Sign in with Google"}
                  </span>
                </button>

                {!googleConnected && (
                  <button
                    type="button"
                    onClick={() => {
                      signInAsGuest();
                      setGoogleConnected(true);
                      setName("Guest Practitioner");
                      setUsername("guest");
                    }}
                    style={{
                      width: "100%",
                      height: "44px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "12px",
                      background: "var(--surface-soft)",
                      color: "var(--text)",
                      border: "1px solid var(--surface-line)",
                      borderRadius: "8px",
                      fontWeight: 500,
                      fontSize: "14px",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <span>Continue as Guest / Developer Bypass</span>
                  </button>
                )}

                {authError && (
                  <div className="muted" style={{ color: "var(--danger)", fontSize: "13px", lineHeight: "1.4" }}>
                    {authError === "You have already logged in with this account." ? (
                      <span>
                        You have already logged in with this account. Please{" "}
                        <Link href="/login" style={{ textDecoration: "underline", color: "var(--danger)", fontWeight: 700 }}>
                          Log in here
                        </Link>.
                      </span>
                    ) : (
                      authError
                    )}
                  </div>
                )}

                {googleConnected && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--success)", fontSize: "13px", fontWeight: 500 }}>
                      <CheckCircle size={16} />
                      <span>Imported profile details successfully!</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleDisconnect}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--accent)",
                        textDecoration: "underline",
                        cursor: "pointer",
                        fontSize: "12px",
                        textAlign: "left",
                        padding: 0,
                        width: "fit-content"
                      }}
                    >
                      Use a different Google account
                    </button>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%", margin: "8px 0" }}>
                <div style={{ flex: 1, height: "1px", background: "var(--surface-line)" }}></div>
                <span className="muted" style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Credentials</span>
                <div style={{ flex: 1, height: "1px", background: "var(--surface-line)" }}></div>
              </div>

              <div className="stack" style={{ gap: "16px" }}>
                <label className="label">
                  <span>Full name</span>
                  <input
                    required
                    className="input"
                    placeholder="e.g. Krish Sahoo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>

                <label className="label">
                  <span>Username</span>
                  <input
                    required
                    className="input"
                    placeholder="e.g. krishsahoo"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </label>

                <label className="label">
                  <span>Password</span>
                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <input
                      required={!googleConnected}
                      type={showPassword ? "text" : "password"}
                      className="input"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ paddingRight: "40px", width: "100%" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setShowPassword(false);
                      }}
                      style={{
                        position: "absolute",
                        right: "12px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--muted)",
                        padding: 0,
                        display: "flex",
                        alignItems: "center"
                      }}
                      title="Click to toggle, double click to lock hidden"
                    >
                      {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                  </div>
                </label>
              </div>

              <button
                type="submit"
                className="button button-primary"
                style={{ width: "100%", height: "44px", marginTop: "8px" }}
              >
                Continue Setup <ArrowRight size={16} />
              </button>
              
              <div style={{ textAlign: "center", marginTop: "16px", fontSize: "13px" }}>
                <span className="muted">Already have an account? </span>
                <Link href="/login" style={{ textDecoration: "underline", color: "var(--accent)", fontWeight: 500 }}>
                  Login
                </Link>
              </div>
              
              <div style={{ textAlign: "center", marginTop: "16px" }}>
                <Link href="/" className="button-red-landing" style={{ width: "100%" }}>
                  Go back to landing page
                </Link>
              </div>
            </form>
          ) : step === 2 ? (
            <form onSubmit={handleStep2Submit} className="stack" style={{ gap: "24px" }}>
              <div>
                <h1 style={{ margin: "0 0 8px", fontSize: "28px" }}>Schedule & Focus Profile</h1>
                <p className="lead" style={{ fontSize: "14px" }}>
                  ForeSee uses these constraints to design your timeline and suggest rescues.
                </p>
              </div>

              <div className="stack" style={{ gap: "16px" }}>
                <label className="label">
                  <span>Profession / Focus Area</span>
                  <select
                    className="select"
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                  >
                    <option value="developer">Software Engineer / Dev</option>
                    <option value="designer">UI/UX Designer / Artist</option>
                    <option value="manager">Product Manager / Lead</option>
                    <option value="student">Student / Researcher</option>
                    <option value="writer">Content Creator / Writer</option>
                    <option value="other">Other Profession</option>
                  </select>
                </label>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <label className="label">
                    <span>Workday start</span>
                    <input
                      type="time"
                      className="input"
                      value={workStart}
                      onChange={(e) => setWorkStart(e.target.value)}
                    />
                  </label>
                  <label className="label">
                    <span>Workday end</span>
                    <input
                      type="time"
                      className="input"
                      value={workEnd}
                      onChange={(e) => setWorkEnd(e.target.value)}
                    />
                  </label>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <label className="label">
                    <span>Lunch start</span>
                    <input
                      type="time"
                      className="input"
                      value={lunchStart}
                      onChange={(e) => setLunchStart(e.target.value)}
                    />
                  </label>
                  <label className="label">
                    <span>Lunch end</span>
                    <input
                      type="time"
                      className="input"
                      value={lunchEnd}
                      onChange={(e) => setLunchEnd(e.target.value)}
                    />
                  </label>
                </div>

                <label className="label">
                  <span>Working Style</span>
                  <select
                    className="select"
                    value={workingStyle}
                    onChange={(e) => setWorkingStyle(e.target.value)}
                  >
                    <option value="morning">Morning Person (Active 7 AM - 12 PM)</option>
                    <option value="balanced">Balanced Focus (Peaks 9:30 AM & 2:30 PM)</option>
                    <option value="night">Night Owl (Active 8 PM - 2 AM)</option>
                  </select>
                </label>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", alignItems: "center" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px" }}>
                    <input
                      type="checkbox"
                      checked={weekendAvailability}
                      onChange={(e) => setWeekendAvailability(e.target.checked)}
                      style={{ width: "16px", height: "16px", cursor: "pointer" }}
                    />
                    <span>Available on weekends</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px" }}>
                    <input
                      type="checkbox"
                      checked={meetingHeavy}
                      onChange={(e) => setMeetingHeavy(e.target.checked)}
                      style={{ width: "16px", height: "16px", cursor: "pointer" }}
                    />
                    <span>Meeting-heavy workday</span>
                  </label>
                </div>

                <label className="label">
                  <span>Daily deep work target (Hours)</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="0.5"
                      className="input"
                      style={{ padding: 0 }}
                      value={deepWorkHours}
                      onChange={(e) => setDeepWorkHours(e.target.value)}
                    />
                    <strong style={{ fontSize: "15px", width: "48px", textAlign: "right" }}>{deepWorkHours}h</strong>
                  </div>
                </label>
              </div>

              <div style={{ marginTop: "12.5px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--muted)", marginBottom: "6px" }}>
                  <span>Setup completion</span>
                  <strong>66%</strong>
                </div>
                <div className="progress">
                  <span style={{ width: "66%" }} />
                </div>
              </div>

              <div className="btn-row" style={{ marginTop: "8px", display: "flex", gap: "12px" }}>
                <button
                  type="submit"
                  className="button button-primary"
                  style={{ flex: 1, height: "44px" }}
                >
                  Continue parameters <ArrowRight size={16} />
                </button>
                <button
                  type="button"
                  className="button button-ghost"
                  onClick={() => setStep(1)}
                  style={{ height: "44px" }}
                >
                  Back
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleStep3Submit} className="stack" style={{ gap: "24px" }}>
              <div>
                <h1 style={{ margin: "0 0 8px", fontSize: "28px" }}>Behavioral & Cognitive Profile</h1>
                <p className="lead" style={{ fontSize: "14px" }}>
                  These parameters feed directly into the adaptive risk calculations and check-in schedules.
                </p>
              </div>

              <div className="stack" style={{ gap: "16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <label className="label">
                    <span>Procrastination Level</span>
                    <select
                      className="select"
                      value={procrastinationLevel}
                      onChange={(e) => setProcrastinationLevel(e.target.value)}
                    >
                      <option value="1">Level 1 (Very proactive)</option>
                      <option value="2">Level 2 (Normal)</option>
                      <option value="3">Level 3 (Occasional delays)</option>
                      <option value="4">Level 4 (Procrastinator)</option>
                      <option value="5">Level 5 (Severe procrastinator)</option>
                    </select>
                  </label>
                  <label className="label">
                    <span>Average Daily Sleep</span>
                    <select
                      className="select"
                      value={averageSleep}
                      onChange={(e) => setAverageSleep(e.target.value)}
                    >
                      <option value="5">Under 6 hours</option>
                      <option value="6.5">6 - 7 hours</option>
                      <option value="7.5">7 - 8 hours</option>
                      <option value="8.5">8 - 9 hours</option>
                      <option value="9.5">9+ hours</option>
                    </select>
                  </label>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <label className="label">
                    <span>Max Total Work (Hours)</span>
                    <input
                      type="number"
                      min="1"
                      max="16"
                      className="input"
                      value={maxTotalWork}
                      onChange={(e) => setMaxTotalWork(e.target.value)}
                    />
                  </label>
                  <label className="label">
                    <span>Preferred Session (Mins)</span>
                    <select
                      className="select"
                      value={preferredSessionLength}
                      onChange={(e) => setPreferredSessionLength(e.target.value)}
                    >
                      <option value="25">25 mins (Pomodoro)</option>
                      <option value="45">45 mins (Balanced)</option>
                      <option value="90">90 mins (Deep Sprint)</option>
                      <option value="120">120 mins (Heavy Work)</option>
                    </select>
                  </label>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <label className="label">
                    <span>Stress Level</span>
                    <select
                      className="select"
                      value={stressLevel}
                      onChange={(e) => setStressLevel(e.target.value as any)}
                    >
                      <option value="low">Low stress</option>
                      <option value="medium">Medium stress</option>
                      <option value="high">High stress / Burned out</option>
                    </select>
                  </label>
                  <label className="label">
                    <span>Risk Tolerance</span>
                    <select
                      className="select"
                      value={riskTolerance}
                      onChange={(e) => setRiskTolerance(e.target.value as any)}
                    >
                      <option value="low">Low (Conservative buffers)</option>
                      <option value="medium">Medium (Moderate buffers)</option>
                      <option value="high">High (Tight timelines)</option>
                    </select>
                  </label>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <label className="label">
                    <span>Context Switch (Mins)</span>
                    <input
                      type="number"
                      className="input"
                      value={contextSwitchingCost}
                      onChange={(e) => setContextSwitchingCost(e.target.value)}
                    />
                  </label>
                  <label className="label">
                    <span>Calendar Strictness</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        step="5"
                        className="input"
                        style={{ padding: 0 }}
                        value={calendarStrictness}
                        onChange={(e) => setCalendarStrictness(e.target.value)}
                      />
                      <span style={{ fontSize: "13px", fontWeight: "600", minWidth: "35px" }}>{calendarStrictness}%</span>
                    </div>
                  </label>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <label className="label">
                    <span>Break Frequency (Mins)</span>
                    <input
                      type="number"
                      className="input"
                      value={breakFrequency}
                      onChange={(e) => setBreakFrequency(e.target.value)}
                    />
                  </label>
                  <label className="label">
                    <span>Focus Recovery (Mins)</span>
                    <input
                      type="number"
                      className="input"
                      value={focusRecoveryTime}
                      onChange={(e) => setFocusRecoveryTime(e.target.value)}
                    />
                  </label>
                </div>
              </div>

              <div style={{ marginTop: "12.5px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--muted)", marginBottom: "6px" }}>
                  <span>Setup completion</span>
                  <strong>100%</strong>
                </div>
                <div className="progress">
                  <span style={{ width: "100%" }} />
                </div>
              </div>

              <div className="btn-row" style={{ marginTop: "8px", display: "flex", gap: "12px" }}>
                <button
                  type="submit"
                  className="button button-primary"
                  style={{ flex: 1, height: "44px" }}
                >
                  Save Settings & Launch
                </button>
                <button
                  type="button"
                  className="button button-ghost"
                  onClick={() => setStep(2)}
                  style={{ height: "44px" }}
                >
                  Back
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="onboarding-visual-col">
        <div style={{ width: "100%", maxWidth: "480px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={theme === "light" ? "/onboarding1light.png" : "/onboarding1dark.png"} 
            alt="ForeSee Onboarding illustration" 
            style={{ 
              maxWidth: "100%", 
              maxHeight: "360px",
              height: "auto", 
              borderRadius: "12px", 
              objectFit: "contain",
              transition: "opacity 0.25s ease",
            }} 
          />
          <div style={{ marginTop: "24px", textAlign: "center" }}>
            <h3 style={{ fontSize: "16px", marginBottom: "8px" }}>Adaptive Productivity Engine</h3>
            <p className="muted" style={{ fontSize: "13px", lineHeight: "1.4" }}>
              ForeSee calibrates daily deep-work capacity against your real focus history. By scheduling around your natural peak focus, we prevent last-minute deadline stress.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
