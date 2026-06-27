import Link from "next/link";
import { ArrowRight, CalendarCheck, LifeBuoy, Sparkles } from "lucide-react";
import { Brand } from "@/components/layout/Sidebar";
import { scenarios, tasks } from "@/lib/data";

export default function LandingPage() {
  return (
    <main className="hero">
      <nav className="marketing-nav">
        <Brand />
        <div className="marketing-links">
          <a href="#product">Product</a>
          <a href="#rescue">Rescue</a>
          <a href="#agents">Agents</a>
        </div>
        <Link className="button button-primary" href="/login">Open demo</Link>
      </nav>

      <section className="hero-inner">
        <div>
          <p className="eyebrow">AI-powered deadline rescue</p>
          <h1>See deadline trouble before it becomes panic.</h1>
          <p className="lead">
            ForeSee turns tasks, calendars, behavior patterns, and agentic planning into a calm control room for finishing important work on time.
          </p>
          <div className="btn-row">
            <Link className="button button-primary" href="/dashboard">View dashboard <ArrowRight size={17} /></Link>
            <Link className="button button-secondary" href="/onboarding">Try onboarding</Link>
          </div>
        </div>

        <div className="hero-panel stack" id="product">
          <div className="metric">
            <span className="pill critical">critical risk</span>
            <strong>{tasks[0].risk}%</strong>
          </div>
          <h2>{tasks[0].title}</h2>
          <p className="muted">{tasks[0].nextAction}</p>
          <div className="progress"><span style={{ width: `${tasks[0].progress}%` }} /></div>
          <div className="grid grid-3">
            <div className="card card-pad"><LifeBuoy /><h3>Rescue</h3><p className="muted">Compare recovery plans.</p></div>
            <div className="card card-pad"><Sparkles /><h3>Simulate</h3><p className="muted">Predict likely outcomes.</p></div>
            <div className="card card-pad"><CalendarCheck /><h3>Schedule</h3><p className="muted">Rebuild focus blocks.</p></div>
          </div>
          <div className="list" id="rescue">
            {scenarios.slice(1).map((scenario) => (
              <div className="list-row" key={scenario.name}>
                <div><strong>{scenario.name}</strong><p className="muted">{scenario.change}</p></div>
                <span className="pill safe">{scenario.probability}%</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
