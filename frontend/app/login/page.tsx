import Link from "next/link";
import { Eye } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="auth-page">
      <section className="card auth-card stack">
        <span className="brand-mark"><Eye size={20} /></span>
        <div>
          <p className="eyebrow">Welcome to ForeSee</p>
          <h1>Sign in to your deadline cockpit.</h1>
          <p className="lead">This frontend demo uses mock data. Firebase Auth and Google OAuth will plug into this exact flow later.</p>
        </div>
        <Link className="button button-primary" href="/dashboard">Continue with Google</Link>
        <Link className="button button-secondary" href="/onboarding">Create demo profile</Link>
      </section>
    </main>
  );
}
