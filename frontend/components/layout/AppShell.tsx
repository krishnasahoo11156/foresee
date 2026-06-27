"use client";

import { useState, useEffect } from "react";
import { Search, Sun, Moon } from "lucide-react";
import { Brand, Sidebar } from "@/components/layout/Sidebar";
import { useTheme } from "@/components/ThemeProvider";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--sidebar-w", collapsed ? "56px" : "260px");
  }, [collapsed]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div className="shell">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className="app-main">
        <div className="mobile-top">
          <Brand collapsed={collapsed} />
          <div className="btn-row" style={{ gap: "8px" }}>
            <button className="theme-switch-btn" onClick={toggleTheme} aria-label="Change theme">
              {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
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
              onClick={toggleTheme} 
              aria-label="Change theme" 
              title={`Current theme: ${theme}. Click to change.`}
              style={{ marginRight: "4px" }}
            >
              {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
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

