"use client";

import Link from "next/link";
import { ArrowRight, Moon, Sun } from "lucide-react";
import { Brand } from "@/components/layout/Sidebar";
import { useTheme } from "@/components/ThemeProvider";

export default function LandingPage() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <main className="hero">
      <nav className="marketing-nav">
        <Brand />
        <div className="marketing-links">
          <a href="#product">Product</a>
          <a href="#rescue">Rescue Solutions</a>
          <a href="#agents">Agents Registry</a>
        </div>
        <div className="btn-row" style={{ gap: "12px", alignItems: "center" }}>
          <button 
            className="theme-switch-btn" 
            onClick={toggleTheme} 
            aria-label="Change theme"
            title={`Toggle theme (currently ${theme})`}
          >
            {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
          </button>
          <Link className="button button-primary" href="/login">Open Demo</Link>
        </div>
      </nav>

      <section className="hero-inner">
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: "clamp(64px, 8vw, 96px)", 
              fontWeight: 900, 
              letterSpacing: "-0.04em", 
              background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)", 
              WebkitBackgroundClip: "text", 
              WebkitTextFillColor: "transparent", 
              lineHeight: 1 
            }}>
              4C
            </h1>
            <h2 style={{ 
              margin: "12px 0 0", 
              fontSize: "clamp(26px, 3.8vw, 40px)", 
              fontWeight: 700, 
              lineHeight: 1.2, 
              color: "var(--text)" 
            }}>
              See deadline trouble before it becomes panic.
            </h2>
          </div>
          <p className="lead" style={{ margin: 0 }}>
            ForeSee turns tasks, calendars, behavior patterns, and agentic planning into a calm control room for finishing important work on time.
          </p>

          <div className="grid grid-2" style={{ gap: "16px", marginTop: "8px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <strong style={{ fontSize: "14px", color: "var(--accent)" }}>1. Calendar Sync</strong>
              <p className="muted" style={{ margin: 0, fontSize: "12.5px", lineHeight: "1.4" }}>Integrates Google Calendar focus slots and due dates automatically.</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <strong style={{ fontSize: "14px", color: "var(--accent-2)" }}>2. Conflict Solver</strong>
              <p className="muted" style={{ margin: 0, fontSize: "12.5px", lineHeight: "1.4" }}>Resolves timeline conflicts and shifts tasks asynchronously.</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <strong style={{ fontSize: "14px", color: "var(--warning)" }}>3. Capacity Balancer</strong>
              <p className="muted" style={{ margin: 0, fontSize: "12.5px", lineHeight: "1.4" }}>Tracks daily capacity and keeps your focus rhythm healthy.</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <strong style={{ fontSize: "14px", color: "var(--accent)" }}>4. Cognitive Profile</strong>
              <p className="muted" style={{ margin: 0, fontSize: "12.5px", lineHeight: "1.4" }}>Learns daily productivity curves to suggest optimal times.</p>
            </div>
          </div>

          <div className="btn-row" style={{ marginTop: "12px" }}>
            <Link className="button button-primary" href="/onboarding">
              Sign in <ArrowRight size={16} />
            </Link>
            <Link className="button button-secondary" href="/login">
              Login
            </Link>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "360px", width: "100%" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={theme === "light" ? "/landingpagelight.png" : "/landingpagedark.png"} 
            alt="ForeSee Product Dashboard Preview" 
            style={{ 
              maxWidth: "80%", 
              height: "auto", 
              borderRadius: "12px", 
              objectFit: "contain",
              transition: "opacity 0.25s ease",
            }} 
          />
        </div>
      </section>
    </main>
  );
}
