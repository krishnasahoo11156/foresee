"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, Play } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAuth } from "@/components/AuthProvider";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { calculateRiskAndClassification } from "@/lib/riskEngine";

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

  // Dynamic capacity risk calculations utilizing the core math engine
  const getSortedTasksWithRisk = (tasks: any[]) => {
    return tasks.map((task) => {
      const analysis = calculateRiskAndClassification(task, tasks, profile);
      const deadline = new Date(task.deadline);
      const formattedDeadline = deadline.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
      });

      return {
        ...task,
        hours: task.estimatedHours || task.hours || 2,
        deadline: formattedDeadline,
        risk: analysis.riskScore,
        riskLevel: analysis.riskLevel,
        progress: task.progress || 0,
        effort: `${task.estimatedHours || task.hours || 0}h needed`,
        category: task.category ? task.category.toUpperCase() : "CODING"
      };
    });
  };

  const computedTasks = getSortedTasksWithRisk(tasksList);
  const task = computedTasks.find((item) => item.id === params.id || item.taskId === params.id);

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

  // Calculate detailed analysis using original task reference
  const originalTask = tasksList.find((item) => item.id === params.id || item.taskId === params.id);
  const analysis = calculateRiskAndClassification(originalTask, tasksList, profile);

  // Blocker dependencies
  const dependencies = originalTask.dependencies || [];

  return (
    <section className="page page-wide">
      <div style={{ marginBottom: "16px" }}>
        <Link href="/tasks" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--accent)" }}>
          <ArrowLeft size={14} /> Back to tasks list
        </Link>
      </div>

      <PageHeader 
        eyebrow={originalTask.category} 
        title={originalTask.title} 
        description={`${task.deadline} • Effort: ${task.effort}`} 
        action={
          (analysis.riskLevel === "critical" || analysis.riskLevel === "danger") ? (
            <Link className="button button-primary" href="/rescue" style={{ background: "var(--danger)" }}>
              <Play size={14} /> Initiate Rescue Protocol
            </Link>
          ) : (
            <Link className="button button-secondary" href="/rescue">
              <Play size={14} /> Run rescue analysis
            </Link>
          )
        } 
      />

      {/* Advanced Matrix & Risk Score Card Grid */}
      <div className="grid grid-2" style={{ gap: "24px", marginBottom: "24px" }}>
        {/* Risk Profile Card */}
        <div className="card card-pad stack" style={{ padding: "28px" }}>
          <div>
            <div className="metric" style={{ marginBottom: "16px" }}>
              <span className={`pill ${analysis.riskLevel}`} style={{ padding: "4px 10px", fontSize: "11px" }}>{analysis.riskLevel} risk</span>
              <strong style={{ fontSize: "20px", color: `var(--${analysis.riskLevel === 'safe' ? 'success' : analysis.riskLevel === 'monitor' ? 'warning' : 'danger'})` }}>
                {analysis.riskScore}% Unified Risk Score
              </strong>
            </div>
            
            <div style={{ margin: "20px 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
                <span className="muted">Completion Probability</span>
                <strong>{analysis.completionProbability}% probability</strong>
              </div>
              <div className="progress" style={{ height: "6px" }}>
                <span style={{ width: `${analysis.completionProbability}%` }} />
              </div>
            </div>
          </div>
          
          <div style={{ borderTop: "1px solid var(--surface-line)", paddingTop: "16px", marginTop: "8px" }}>
            <h4 style={{ margin: "0 0 12px", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)" }}>Risk Factor Analysis</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { label: "Time Pressure", val: analysis.factors.timePressure, color: "var(--accent)" },
                { label: "Workload Deficit", val: analysis.factors.workloadGap, color: "var(--accent-2)" },
                { label: "Behavior Delay", val: analysis.factors.behavior, color: "var(--warning)" },
                { label: "Dependency Delay", val: analysis.factors.dependency, color: "var(--danger)" },
                { label: "Burnout / Stress", val: analysis.factors.health, color: "var(--muted)" }
              ].map(fact => (
                <div key={fact.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12.5px" }}>
                  <span className="muted" style={{ minWidth: "120px" }}>{fact.label}</span>
                  <div className="progress" style={{ flex: 1, margin: "0 12px", height: "4px" }}>
                    <span style={{ width: `${fact.val}%`, background: fact.color }} />
                  </div>
                  <strong style={{ minWidth: "30px", textAlign: "right" }}>{fact.val}%</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Intelligence Matrix Card */}
        <div className="card card-pad" style={{ padding: "28px" }}>
          <h2 style={{ margin: "0 0 16px", fontSize: "18px" }}>Productivity Intelligence Matrix</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            {[
              { label: "Urgency State", val: analysis.urgency, state: "accent" },
              { label: "Importance State", val: analysis.importance, state: "danger" },
              { label: "Difficulty State", val: analysis.difficulty, state: "warning" },
              { label: "Behavioral State", val: analysis.behaviorState.replace('_', ' '), state: "monitor" },
              { label: "Planning State", val: analysis.planningState.replace('_', ' '), state: "safe" },
              { label: "Calendar State", val: analysis.calendarState.replace('_', ' '), state: "default" },
              { label: "Dependency State", val: analysis.dependencyState, state: "default" },
              { label: "Progress State", val: analysis.progressState.replace('_', ' '), state: "safe" }
            ].map(m => (
              <div key={m.label} style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "10px 14px", border: "1px solid var(--surface-line)", borderRadius: "8px", background: "var(--surface)" }}>
                <span className="muted" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.03em" }}>{m.label}</span>
                <span className={`pill ${m.state}`} style={{ fontSize: "11px", alignSelf: "flex-start", padding: "2px 8px" }}>{m.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-2" style={{ gap: "24px", marginBottom: "24px" }}>
        {/* Subtasks execution */}
        <div className="card card-pad stack" style={{ padding: "28px" }}>
          <h2 style={{ margin: 0, fontSize: "18px" }}>Subtask Execution plan</h2>
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

        {/* Requirements and Dependencies */}
        <div className="card card-pad stack" style={{ padding: "28px" }}>
          <h2 style={{ margin: "0 0 8px", fontSize: "18px" }}>Blocker & Dependencies</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {dependencies.length > 0 ? (
              dependencies.map((dependency: string) => (
                <div className="list-row" key={dependency} style={{ padding: "12px 16px", margin: 0, boxShadow: "none" }}>
                  <span style={{ fontSize: "13.5px", fontWeight: "600" }}>{dependency}</span>
                  <span className="pill monitor" style={{ padding: "2px 8px", fontSize: "9px" }}>open dependency</span>
                </div>
              ))
            ) : (
              <p className="muted" style={{ padding: "12px", border: "1px dashed var(--surface-line)", borderRadius: "8px", textAlign: "center" }}>No active dependencies defined for this task.</p>
            )}
          </div>
          
          <h2 style={{ margin: "16px 0 8px", fontSize: "18px" }}>Equipment & Environment</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {originalTask.requiresInternet && (
              <span className="pill safe">internet required</span>
            )}
            {originalTask.requirements && originalTask.requirements.length > 0 ? (
              originalTask.requirements.map((req: string) => (
                <span className="pill monitor" key={req}>{req}</span>
              ))
            ) : (
              <span className="pill default">standard desk setup</span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
