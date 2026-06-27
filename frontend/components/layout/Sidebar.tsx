"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Eye } from "lucide-react";
import { navSections } from "@/lib/data";

export function Brand() {
  return (
    <Link className="brand" href="/dashboard" aria-label="ForeSee dashboard">
      <span className="brand-mark"><Eye size={19} /></span>
      <span>ForeSee</span>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div>
        <Brand />
        {navSections.map((section) => (
          <nav className="nav-group" key={section.label} aria-label={section.label}>
            <div className="nav-label">{section.label}</div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link className={`nav-item ${active ? "active" : ""}`} href={item.href} key={item.href}>
                  <Icon size={17} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        ))}
      </div>
      <div 
        className="sketch-note" 
        style={{ 
          fontSize: "0.85rem", 
          padding: "6px 10px", 
          marginTop: "24px", 
          textAlign: "center",
          display: "block",
          transform: "rotate(-1deg)" 
        }}
      >
        🎨 Dev + Artist Duality
      </div>
    </aside>
  );
}
