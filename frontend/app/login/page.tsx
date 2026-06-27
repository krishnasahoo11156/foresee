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
          <span className="pill" style={{ fontSize: "11px" }}>
            Mock Auth Mode
          </span>
        </div>
        
        <div style={{ margin: "16px 0 8px" }}>
          <p className="eyebrow" style={{ marginBottom: "6px" }}>
            Welcome to ForeSee
          </p>
          <h1 style={{ fontSize: "26px", margin: "0 0 12px" }}>Sign in to your deadline cockpit.</h1>
          <p className="lead" style={{ fontSize: "14.5px", lineHeight: "1.5" }}>
            This frontend demo uses mock data. Firebase Auth and Google OAuth will plug into this exact flow later.
          </p>
        </div>

        <div className="stack" style={{ gap: "12px", marginTop: "12px" }}>
          <Link className="button button-primary" href="/dashboard" style={{ width: "100%", height: "42px" }}>
            Continue with Google
          </Link>
          <Link className="button button-secondary" href="/onboarding" style={{ width: "100%", height: "42px" }}>
            Create Demo Profile
          </Link>
        </div>

        <div style={{ textAlign: "center", marginTop: "16px" }}>
          <Link href="/" className="muted" style={{ fontSize: "12.5px", textDecoration: "underline" }}>
            Back to landing page
          </Link>
        </div>
      </section>
    </main>
  );
}
