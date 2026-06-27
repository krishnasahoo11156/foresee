import Link from "next/link";

export default function OnboardingPage() {
  return (
    <main className="auth-page">
      <section className="card auth-card stack" style={{ padding: "40px", width: "min(480px, 100%)" }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <p className="eyebrow" style={{ margin: 0 }}>
              <span className="sketch-highlight">Step 2 of 3</span>
            </p>
            <span 
              className="sketch-note" 
              style={{ 
                fontSize: "0.75rem", 
                padding: "3px 6px", 
                margin: 0, 
                transform: "rotate(-2deg)" 
              }}
            >
              ✍️ Profile Config
            </span>
          </div>
          <h1 style={{ fontSize: "28px", margin: "8px 0 12px" }}>Teach ForeSee how you work.</h1>
          <p className="lead" style={{ fontSize: "14px", lineHeight: "1.5" }}>
            A short setup captures your focus hours, workload comfort, and rescue preferences.
          </p>
        </div>

        <div className="stack" style={{ gap: "16px", margin: "8px 0" }}>
          <label className="label">
            <span>Primary goal</span>
            <input className="input" defaultValue="Ship the hackathon demo calmly" placeholder="e.g. Finish writing proposal" />
          </label>
          
          <label className="label">
            <span>Best focus window</span>
            <select className="select" defaultValue="morning">
              <option value="morning">Morning, 9 AM to 12 PM</option>
              <option value="afternoon">Afternoon, 1 PM to 4 PM</option>
              <option value="evening">Evening, 6 PM to 9 PM</option>
            </select>
          </label>
          
          <label className="label">
            <span>Daily deep-work capacity</span>
            <input className="input" defaultValue="5.5 hours" placeholder="e.g. 4 hours" />
          </label>
        </div>

        <div style={{ margin: "4px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--muted)", marginBottom: "6px" }}>
            <span>Onboarding progress</span>
            <strong>66%</strong>
          </div>
          <div className="progress">
            <span style={{ width: "66%" }} />
          </div>
        </div>

        <div className="btn-row" style={{ marginTop: "8px", justifyContent: "space-between" }}>
          <Link className="button button-primary" href="/dashboard" style={{ flex: 1 }}>
            Finish Setup
          </Link>
          <Link className="button button-ghost" href="/dashboard">
            Skip for now
          </Link>
        </div>
      </section>
    </main>
  );
}
