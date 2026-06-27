import Link from "next/link";

export default function OnboardingPage() {
  return (
    <main className="auth-page">
      <section className="card auth-card stack">
        <p className="eyebrow">Step 2 of 3</p>
        <h1>Teach ForeSee how you work.</h1>
        <p className="lead">A short setup captures your focus hours, workload comfort, and rescue preferences.</p>
        <label className="label">Primary goal<input className="input" defaultValue="Ship the hackathon demo calmly" /></label>
        <label className="label">Best focus window<select className="select" defaultValue="morning"><option value="morning">Morning, 9 AM to 12 PM</option><option>Afternoon</option><option>Evening</option></select></label>
        <label className="label">Daily deep-work capacity<input className="input" defaultValue="5.5 hours" /></label>
        <div className="progress"><span style={{ width: "66%" }} /></div>
        <div className="btn-row">
          <Link className="button button-primary" href="/dashboard">Finish setup</Link>
          <Link className="button button-ghost" href="/dashboard">Skip for now</Link>
        </div>
      </section>
    </main>
  );
}
