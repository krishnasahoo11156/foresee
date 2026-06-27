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
