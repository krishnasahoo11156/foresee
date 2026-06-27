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
          <a href="#rescue">Rescue Solutions</a>
          <a href="#agents">Agents Registry</a>
        </div>
        <Link className="button button-primary" href="/login">Open Demo</Link>
      </nav>

      <section className="hero-inner">
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <p className="eyebrow">
            <span className="sketch-highlight">AI-powered deadline rescue</span>
          </p>
          <h1 style={{ margin: "8px 0" }}>See deadline trouble before it becomes panic.</h1>
          <p className="lead" style={{ marginBottom: "16px" }}>
            ForeSee turns tasks, calendars, behavior patterns, and agentic planning into a calm control room for finishing important work on time.
          </p>
          <div className="btn-row" style={{ marginBottom: "16px" }}>
            <Link className="button button-primary" href="/dashboard">
              View Dashboard <ArrowRight size={16} />
            </Link>
            <Link className="button button-secondary" href="/onboarding">
              Try Onboarding
            </Link>
          </div>

          <div 
            className="sketch-note" 
            style={{ 
              maxWidth: "320px", 
              fontSize: "0.95rem",
              marginTop: "20px",
              transform: "rotate(-1.5deg)"
            }}
          >
            ✏️ <strong>Duality Delineation:</strong>
            <p style={{ margin: "4px 0 0", fontSize: "0.85rem", lineHeight: "1.3" }}>
              {"\"This platform represents a fusion of structured analytical scheduling and human artistic focus.\""}
            </p>
          </div>
        </div>

        <div className="hero-panel stack" id="product">
          <div className="metric">
            <span className="pill critical">Critical Risk</span>
            <strong>{tasks[0].risk}%</strong>
          </div>
          <h2 style={{ margin: "4px 0" }}>{tasks[0].title}</h2>
          <p className="muted" style={{ margin: "2px 0 12px" }}>Next action: {tasks[0].nextAction}</p>
          <div className="progress" style={{ marginBottom: "20px" }}><span style={{ width: `${tasks[0].progress}%` }} /></div>
          
          <div className="grid grid-3" style={{ gap: "12px", marginBottom: "20px" }}>
            <div className="card card-pad" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <LifeBuoy size={20} color="var(--accent)" />
              <h3 style={{ margin: 0, fontSize: "14px" }}>Rescue</h3>
              <p className="muted" style={{ margin: 0, fontSize: "11px", lineHeight: "1.3" }}>Compare recovery plans.</p>
            </div>
            <div className="card card-pad" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <Sparkles size={20} color="var(--accent-2)" />
              <h3 style={{ margin: 0, fontSize: "14px" }}>Simulate</h3>
              <p className="muted" style={{ margin: 0, fontSize: "11px", lineHeight: "1.3" }}>Predict likely outcomes.</p>
            </div>
            <div className="card card-pad" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <CalendarCheck size={20} color="var(--warning)" />
              <h3 style={{ margin: 0, fontSize: "14px" }}>Schedule</h3>
              <p className="muted" style={{ margin: 0, fontSize: "11px", lineHeight: "1.3" }}>Rebuild focus blocks.</p>
            </div>
          </div>
          
          <div className="list" id="rescue">
            {scenarios.slice(1).map((scenario) => (
              <div className="list-row" key={scenario.name} style={{ padding: "12px 16px" }}>
                <div>
                  <strong style={{ fontSize: "13.5px" }}>{scenario.name}</strong>
                  <p className="muted" style={{ margin: "2px 0 0", fontSize: "11.5px", lineHeight: "1.3" }}>{scenario.change}</p>
                </div>
                <span className="pill safe">{scenario.probability}%</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
