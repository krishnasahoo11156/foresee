"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Chrome, Lock, CheckCircle, Clock, Briefcase, ArrowRight, User } from "lucide-react";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleConnecting, setGoogleConnecting] = useState(false);
  
  // Form State
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [profession, setProfession] = useState("developer");
  const [workStart, setWorkStart] = useState("09:00");
  const [workEnd, setWorkEnd] = useState("18:00");
  const [deepWorkHours, setDeepWorkHours] = useState("4");

  const handleGoogleConnect = () => {
    setGoogleConnecting(true);
    setTimeout(() => {
      setGoogleConnected(true);
      setGoogleConnecting(false);
      setName("Krish Sahoo");
      setUsername("krishsahoo");
    }, 1200);
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !username || !password) return;
    setStep(2);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  return (
    <main className="onboarding-page">
      <div className="onboarding-form-col">
        <div style={{ maxWidth: "440px", width: "100%", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
            <span className="eyebrow" style={{ margin: 0 }}>Onboarding</span>
            <span className="muted" style={{ fontWeight: 600 }}>Step {step} of 2</span>
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
                  className="button"
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    background: googleConnected ? "var(--success)" : "#ea4335",
                    color: "white",
                    gap: "10px",
                    height: "44px"
                  }}
                >
                  <Chrome size={18} />
                  {googleConnecting ? "Connecting..." : googleConnected ? "Google Connected ✓" : "Sign in with Google"}
                </button>

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
                  <input
                    required
                    type="password"
                    className="input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </label>
              </div>

              <button
                type="submit"
                className="button button-primary"
                style={{ width: "100%", height: "44px", marginTop: "8px" }}
              >
                Continue Setup <ArrowRight size={16} />
              </button>
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
        <div style={{ width: "100%", maxWidth: "480px" }}>
          <ImagePlaceholder 
            label="Interactive dashboard onboarding illustration" 
            height="380px"
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
