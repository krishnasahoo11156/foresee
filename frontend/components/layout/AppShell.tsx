import { Search } from "lucide-react";
import { Brand, Sidebar } from "@/components/layout/Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell">
      <Sidebar />
      <main className="app-main">
        <div className="mobile-top">
          <Brand />
          <div className="avatar">KS</div>
        </div>
        <header className="topbar">
          <label className="search">
            <Search size={17} />
            <input placeholder="Search tasks, plans, agents..." aria-label="Search ForeSee" />
          </label>
          <div className="btn-row">
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
