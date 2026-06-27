"use client";

import { Search, Sun, Moon, Compass } from "lucide-react";
import { Brand, Sidebar } from "@/components/layout/Sidebar";
import { useTheme } from "@/components/ThemeProvider";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === "dark") setTheme("ocean");
    else if (theme === "ocean") setTheme("light");
    else setTheme("dark");
  };

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun size={17} />;
      case "ocean":
        return <Compass size={17} />;
      case "dark":
      default:
        return <Moon size={17} />;
    }
  };

  return (
    <div className="shell">
      <Sidebar />
      <main className="app-main">
        <div className="mobile-top">
          <Brand />
          <div className="btn-row" style={{ gap: "8px" }}>
            <button className="theme-switch-btn" onClick={cycleTheme} aria-label="Change theme">
              {getThemeIcon()}
            </button>
            <div className="avatar">KS</div>
          </div>
        </div>
        <header className="topbar">
          <label className="search">
            <Search size={17} />
            <input placeholder="Search tasks, plans, agents..." aria-label="Search ForeSee" />
          </label>
          <div className="btn-row">
            <button 
              className="theme-switch-btn" 
              onClick={cycleTheme} 
              aria-label="Change theme" 
              title={`Current theme: ${theme}. Click to change.`}
              style={{ marginRight: "4px" }}
            >
              {getThemeIcon()}
            </button>
            <a className="button button-secondary" href="/tasks">New task</a>
            <a className="user-chip" href="/profile" aria-label="Open profile">
              <span className="avatar">KS</span>
              <span>Krish</span>
            </a>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}

