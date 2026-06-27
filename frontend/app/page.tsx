import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Brand } from "@/components/layout/Sidebar";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";

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
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <p className="eyebrow">
            <span>AI-powered deadline rescue</span>
          </p>
          <h1 style={{ margin: 0, fontSize: "clamp(32px, 4.5vw, 48px)" }}>See deadline trouble before it becomes panic.</h1>
          <p className="lead" style={{ margin: 0 }}>
            ForeSee turns tasks, calendars, behavior patterns, and agentic planning into a calm control room for finishing important work on time.
          </p>
          <div className="btn-row" style={{ marginTop: "8px" }}>
            <Link className="button button-primary" href="/dashboard">
              View Dashboard <ArrowRight size={16} />
            </Link>
            <Link className="button button-secondary" href="/onboarding">
              Try Onboarding
            </Link>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <ImagePlaceholder 
            label="ForeSee Main Product Dashboard Screenshot / Concept Art" 
            height="460px"
          />
        </div>
      </section>
    </main>
  );
}
