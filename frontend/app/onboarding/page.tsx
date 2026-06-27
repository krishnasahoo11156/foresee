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
  const { user, signInWithGoogle, saveUserProfile } = useAuth();
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

  useEffect(() => {
    if (user) {
      setGoogleConnected(true);
      setName(user.displayName ?? "");
      setUsername(user.email?.split("@")[0] ?? "");
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

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleConnected) {
      setAuthError("Please connect your Google account first.");
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
    saveUserProfile({
      name,
      username,
      password,
      profession,
      workStart,
      workEnd,
      deepWorkHours,
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
              <span className="muted" style={{ fontWeight: 600 }}>Step {step} of 2</span>
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

              <div style={{ display: "grid", gap: "16px" }}>
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
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--success)", fontSize: "13px", fontWeight: 500 }}>
                    <CheckCircle size={16} />
                    <span>Imported profile details successfully!</span>
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
              
              <div style={{ textAlign: "center", marginTop: "12px", fontSize: "12.5px" }}>
                <Link href="/" className="muted" style={{ textDecoration: "underline" }}>
                  Go back to landing page
                </Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleStep2Submit} className="stack" style={{ gap: "24px" }}>
              <div>
                <h1 style={{ margin: "0 0 8px", fontSize: "28px" }}>Configure your productivity parameters.</h1>
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

              <div style={{ marginTop: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--muted)", marginBottom: "6px" }}>
                  <span>Setup completion</span>
                  <strong>100%</strong>
                </div>
                <div className="progress">
                  <span style={{ width: "100%" }} />
                </div>
              </div>

              <div className="btn-row" style={{ marginTop: "8px", gap: "12px" }}>
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
                  onClick={() => setStep(1)}
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
