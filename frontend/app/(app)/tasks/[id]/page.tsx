"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, Play } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAuth } from "@/components/AuthProvider";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  const { user, profile } = useAuth();
  const [tasksList, setTasksList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to all tasks to calculate sorted risk ranking
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "tasks"));
    const unsub = onSnapshot(q, (snapshot) => {
      const items: any[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setTasksList(items);
      setLoading(false);
    }, (err) => {
      console.warn("Failed to fetch task details:", err);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  if (loading) {
    return (
      <section className="page" style={{ padding: "48px", textAlign: "center" }}>
        <p className="lead">Loading task details...</p>
      </section>
    );
  }

  const dailyCapacity = Number(profile?.preferences?.deepWorkHours || 4);

  // Scored calculations
  const getSortedTasksWithRisk = (tasks: any[], capacity: number) => {
    const sorted = [...tasks].sort((a, b) => {
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });

    const now = new Date();

    return sorted.map((task, idx) => {
      const deadline = new Date(task.deadline);
      const diffMs = deadline.getTime() - now.getTime();
      const daysRemaining = Math.max(0.1, diffMs / (1000 * 60 * 60 * 24));
      const totalCapacity = daysRemaining * capacity;

      let allocatedHours = 0;
      for (let i = 0; i <= idx; i++) {
        allocatedHours += Number(sorted[i].hours || 0);
      }

      const buffer = totalCapacity - allocatedHours;

      let riskLevel: "critical" | "danger" | "monitor" | "safe" = "safe";
      let riskPercentage = 15;

      if (buffer < 0) {
        riskLevel = "critical";
        const ratio = totalCapacity > 0 ? allocatedHours / totalCapacity : 2;
        riskPercentage = Math.min(99, Math.round(80 + (ratio - 1) * 20));
      } else if (buffer <= 1.5) {
        riskLevel = "monitor";
        riskPercentage = Math.round(55 + (1.5 - buffer) * 15);
      } else {
        riskLevel = "safe";
        riskPercentage = Math.max(5, Math.round(35 - (buffer - 1.5) * 5));
      }

      const formattedDeadline = deadline.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
      });

      return {
        ...task,
        deadline: formattedDeadline,
        risk: riskPercentage,
        riskLevel,
        progress: task.progress || 0,
        effort: `${task.hours || 0}h needed`,
        category: task.difficulty ? task.difficulty.toUpperCase() : "MEDIUM"
      };
    });
  };

  const computedTasks = getSortedTasksWithRisk(tasksList, dailyCapacity);
  const task = computedTasks.find((item) => item.id === params.id);

  if (!task) {
    return (
      <section className="page">
        <div style={{ marginBottom: "16px" }}>
          <Link href="/tasks" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--accent)" }}>
            <ArrowLeft size={14} /> Back to tasks list
          </Link>
        </div>
        <div className="card card-pad" style={{ padding: "48px", textAlign: "center" }}>
          <h2 style={{ margin: 0 }}>Task not found</h2>
          <p className="muted" style={{ marginTop: "8px" }}>The requested task does not exist or has been deleted.</p>
        </div>
      </section>
    );
  }

  // Blocker dependencies fallback
  const dependencies = task.isImportant ? ["High priority focus block", "Subtask breakdown"] : ["Standard task integration"];

  return (
    <section className="page">
      <div style={{ marginBottom: "16px" }}>
        <Link href="/tasks" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--accent)" }}>
          <ArrowLeft size={14} /> Back to tasks list
        </Link>
      </div>

      <PageHeader 
        eyebrow={task.category} 
        title={task.title} 
        description={`${task.deadline} • Effort remaining: ${task.effort}`} 
        action={<Link className="button button-primary" href="/rescue"><Play size={14} /> Run rescue analysis</Link>} 
      />

      <div className="grid grid-2" style={{ gap: "20px", marginBottom: "20px" }}>
        <div className="card card-pad stack" style={{ padding: "28px", justifyContent: "space-between" }}>
          <div>
            <div className="metric" style={{ marginBottom: "16px" }}>
              <span className={`pill ${task.riskLevel}`} style={{ padding: "4px 10px" }}>{task.riskLevel} risk</span>
              <strong style={{ fontSize: "20px", color: `var(--${task.riskLevel === 'safe' ? 'success' : task.riskLevel === 'monitor' ? 'warning' : 'danger'})` }}>
                {task.risk}% deadline risk
              </strong>
            </div>
            
            <div style={{ margin: "20px 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
                <span className="muted">Work block progress</span>
                <strong>{task.progress}%</strong>
              </div>
              <div className="progress" style={{ height: "6px" }}>
                <span style={{ width: `${task.progress}%` }} />
              </div>
            </div>
          </div>
          
          <p className="muted" style={{ margin: 0, fontSize: "13.5px", lineHeight: "1.4" }}>
            <strong>Risk Status:</strong> {task.riskLevel === "critical" || task.riskLevel === "danger" ? "Critical time deficit. Action needed immediately." : task.riskLevel === "monitor" ? "Tight capacity buffer. Maintain steady schedule." : "Healthy capacity buffer."}
          </p>
        </div>

        <div className="card card-pad stack" style={{ padding: "28px" }}>
          <h2 style={{ margin: "0 0 8px", fontSize: "18px" }}>Blocker & Dependencies</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {dependencies.map((dependency) => (
              <div className="list-row" key={dependency} style={{ padding: "12px 16px", margin: 0, boxShadow: "none" }}>
                <span style={{ fontSize: "13.5px", fontWeight: "600" }}>{dependency}</span>
                <span className="pill monitor" style={{ padding: "2px 8px", fontSize: "9px" }}>open blocker</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card card-pad stack" style={{ padding: "28px" }}>
        <h2 style={{ margin: 0, fontSize: "18px" }}>Subtask execution plan</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
          {[
            ["Clarify output deliverables", "done"],
            ["Schedule dedicated focus block", "done"],
            ["Complete main narrative draft", "next"],
            ["Review against scheduling rules and ship", "next"]
          ].map(([item, status], index) => {
            const isDone = status === "done";
            return (
              <div 
                className="list-row" 
                key={item} 
                style={{ 
                  padding: "14px 20px", 
                  margin: 0, 
                  boxShadow: "none",
                  opacity: isDone ? 0.7 : 1,
                  background: isDone ? "var(--surface-soft)" : "var(--surface)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--muted)", minWidth: "20px" }}>
                    0{index + 1}
                  </span>
                  <strong style={{ fontSize: "13.5px", fontWeight: isDone ? "500" : "600", textDecoration: isDone ? "line-through" : "none" }}>
                    {item}
                  </strong>
                </div>
                <span 
                  className={`pill ${isDone ? "safe" : "default"}`} 
                  style={{ 
                    padding: "2px 8px", 
                    fontSize: "9px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  {isDone && <CheckCircle2 size={10} />} {status}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
