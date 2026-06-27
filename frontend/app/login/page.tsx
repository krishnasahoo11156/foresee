import Link from "next/link";
import { Eye } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="auth-page">
      <section className="card auth-card stack" style={{ padding: "40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="brand-mark">
            <Eye size={20} />
          </span>
          <span 
            className="sketch-note" 
            style={{ 
              fontSize: "0.75rem", 
              padding: "4px 8px", 
              margin: 0, 
              transform: "rotate(3deg)" 
            }}
          >
            🎨 Mock Auth Mode
          </span>
        </div>
        
        <div style={{ margin: "12px 0 8px" }}>
          <p className="eyebrow" style={{ marginBottom: "6px" }}>
            <span className="sketch-highlight">Welcome to ForeSee</span>
          </p>
          <h1 style={{ fontSize: "28px", margin: "0 0 12px" }}>Sign in to your deadline cockpit.</h1>
          <p className="lead" style={{ fontSize: "14px", lineHeight: "1.5" }}>
            This frontend demo uses mock data. Firebase Auth and Google OAuth will plug into this exact flow later.
          </p>
        </div>

        <div className="stack" style={{ gap: "10px" }}>
          <Link className="button button-primary" href="/dashboard" style={{ width: "100%", minHeight: "44px" }}>
            Continue with Google
          </Link>
          <Link className="button button-secondary" href="/onboarding" style={{ width: "100%", minHeight: "44px" }}>
            Create Demo Profile
          </Link>
        </div>

        <div style={{ textAlign: "center", marginTop: "12px" }}>
          <Link href="/" className="muted" style={{ fontSize: "12px", textDecoration: "underline" }}>
            Back to landing page
          </Link>
        </div>
      </section>
    </main>
  );
}
