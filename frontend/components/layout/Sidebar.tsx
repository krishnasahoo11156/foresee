"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Eye, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { navSections } from "@/lib/data";
import { useAuth } from "@/components/AuthProvider";

export function Brand({ collapsed }: { collapsed?: boolean }) {
  return (
    <Link className="brand" href="/dashboard" aria-label="ForeSee dashboard">
      <span className="brand-mark"><Eye size={19} /></span>
      <span className="brand-text">ForeSee</span>
    </Link>
  );
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { signOut } = useAuth();

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-inner">
        <Brand collapsed={collapsed} />
        {navSections.map((section) => (
          <nav className="nav-group" key={section.label} aria-label={section.label}>
            <div className="nav-label">{section.label}</div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link className={`nav-item ${active ? "active" : ""}`} href={item.href} key={item.href}>
                  <Icon size={17} />
                  <span className="nav-item-text">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        ))}
      </div>
      <div className="sidebar-footer">
        <button className="sidebar-home-link logout-btn-red" onClick={signOut}>
          <LogOut size={17} />
          <span className="sidebar-home-text">Log Out</span>
        </button>
        <button className="sidebar-collapse-btn" onClick={onToggle} aria-label="Collapse sidebar">
          {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
          <span className="sidebar-collapse-text">Collapse menu</span>
        </button>
      </div>
    </aside>
  );
}
