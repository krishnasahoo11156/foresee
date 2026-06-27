"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LogOut, Search, Sun, Moon } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { Brand, Sidebar } from "@/components/layout/Sidebar";
import { useTheme } from "@/components/ThemeProvider";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--sidebar-w", collapsed ? "56px" : "260px");
  }, [collapsed]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const initials = user?.displayName
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "FS";

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
            <div className="avatar">{initials}</div>
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
            <Link className="button button-secondary" href="/tasks?new=true">New task</Link>
            <a className="user-chip" href="/profile" aria-label="Open profile">
              <span className="avatar">{initials}</span>
              <span>{user?.displayName ?? user?.email ?? "ForeSee user"}</span>
            </a>
            <button className="theme-switch-btn" onClick={signOut} aria-label="Sign out" title="Sign out">
              <LogOut size={16} />
            </button>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
