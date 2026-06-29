"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { AnalyticsVisuals } from "@/components/ui/AnalyticsVisuals";
import { MetricCard } from "@/components/ui/MetricCard";
import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "@/components/ThemeProvider";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { calculateRiskAndClassification } from "@/lib/riskEngine";
import { BarChart3, Info } from "lucide-react";
import { Task } from "@/lib/types";

export default function AnalyticsPage() {
  const { theme } = useTheme();
  const { user, profile } = useAuth();
  const [tasksList, setTasksList] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to tasks
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "tasks"));
    const unsub = onSnapshot(q, (snapshot) => {
      const items: Task[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as Task);
      });
      setTasksList(items);
      setLoading(false);
    }, (err) => {
      console.warn("Failed to subscribe to analytics tasks:", err);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  if (loading) {
    return (
      <section className="page" style={{ padding: "48px", textAlign: "center" }}>
        <p className="lead">Loading analytics cockpit...</p>
      </section>
    );
  }

  // Calculate live metric properties
  const totalTasks = tasksList.length;
  const completedTasks = tasksList.filter(t => t.progress >= 100).length;
  const activeTasks = tasksList.filter(t => t.progress < 100);
  
  let totalRiskScore = 0;
  let criticalCount = 0;
  
  activeTasks.forEach(task => {
    const analysis = calculateRiskAndClassification(task, tasksList, profile);
    totalRiskScore += analysis.riskScore;
    if (analysis.riskLevel === "critical" || analysis.riskLevel === "danger") {
      criticalCount++;
    }
  });

  const averageRisk = activeTasks.length > 0 ? Math.round(totalRiskScore / activeTasks.length) : 0;
  
  // Profile settings
  const dailyCapacity = profile?.preferences?.deepWorkHours || 4;
  const reliability = profile?.metrics?.reliabilityScore || 88;
  const burnout = profile?.metrics?.burnoutScore || 15;
  const focusScore = profile?.metrics?.focusScore || 82;

  const displayMetrics = [
    { 
      label: "Deadline risk", 
      value: `${averageRisk}%`, 
      detail: `${criticalCount} critical blocker(s)`, 
      tone: averageRisk > 60 ? "danger" as const : averageRisk > 30 ? "monitor" as const : "safe" as const 
    },
    { 
      label: "Plan stability", 
      value: String(reliability), 
      detail: `${profile?.preferences?.calendarStrictness || 75}% calendar strictness`, 
      tone: reliability > 75 ? "safe" as const : "monitor" as const 
    },
    { 
      label: "Focus capacity", 
      value: `${dailyCapacity}h/day`, 
      detail: `Focus score: ${focusScore}`, 
      tone: "monitor" as const 
    },
    { 
      label: "Burnout score", 
      value: `${burnout}%`, 
      detail: burnout > 50 ? "High overload risk" : "Healthy pacing", 
      tone: burnout > 50 ? "danger" as const : "safe" as const 
    }
  ];

  // Group completed tasks by category for focus rhythm
  const categoriesList = ["Coding", "Research", "Assignment", "Exam"];
  const weeklyFocusData = categoriesList.map(cat => {
    const totalCatHours = tasksList
      .filter(t => t.category === cat)
      .reduce((sum, t) => sum + (t.estimatedHours || 2), 0);
    const completedCatHours = tasksList
      .filter(t => t.category === cat && t.progress >= 100)
      .reduce((sum, t) => sum + (t.estimatedHours || 2), 0);
    const percentage = totalCatHours > 0 ? Math.round((completedCatHours / totalCatHours) * 100) : 0;

    return {
      category: cat,
      hoursText: `${completedCatHours}h / ${totalCatHours}h done`,
      percentage
    };
  });

  return (
    <section className="page page-wide">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "24px", marginBottom: "32px" }}>
        <div style={{ flex: "1 1 500px" }}>
          <PageHeader 
            eyebrow="Analytics" 
            title="Productivity fingerprint cockpit" 
            description="Track real-time delay trends, plan execution stability, burnout indices, and AI scheduling precision." 
          />
        </div>
      </div>

      <div style={{ marginBottom: "32px" }}>
        <AnalyticsVisuals tasks={tasksList} profile={profile} />
      </div>

      <div className="grid grid-4" style={{ gap: "20px", marginBottom: "32px" }}>
        {displayMetrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
      </div>

      <div className="card card-pad stack" style={{ padding: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ color: "var(--accent)", display: "flex" }}>
              <BarChart3 size={18} />
            </div>
            <h2 style={{ margin: 0, fontSize: "18px" }}>Focus Category Rhythm</h2>
          </div>
          <span className="muted" style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11.5px" }}>
            <Info size={12} /> Hours completed relative to total allocated effort
          </span>
        </div>

        <div className="grid grid-4" style={{ gap: "16px", marginTop: "8px" }}>
          {weeklyFocusData.map((item) => (
            <div 
              className="card card-pad" 
              key={item.category}
              style={{ 
                padding: "20px", 
                display: "flex", 
                flexDirection: "column", 
                gap: "10px",
                background: "var(--surface-soft)",
                border: "1px solid var(--surface-line)",
                boxShadow: "none"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong style={{ fontSize: "14px" }}>{item.category}</strong>
                <span className="muted" style={{ fontSize: "12px", fontWeight: "600" }}>{item.hoursText}</span>
              </div>
              <div className="progress" style={{ height: "6px" }}>
                <span style={{ width: `${item.percentage}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
