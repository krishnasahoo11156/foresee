"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, Play, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAuth } from "@/components/AuthProvider";
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { calculateRiskAndClassification } from "@/lib/riskEngine";
import { updateGoogleCalendarEvent, deleteGoogleCalendarEvent } from "@/lib/googleCalendar";
import { useRouter } from "next/navigation";

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [tasksList, setTasksList] = useState<any[]>([]);
  const [subtasksList, setSubtasksList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  // Subscribe to all subtasks for the task
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "subtasks"));
    const unsub = onSnapshot(q, (snapshot) => {
      const items: any[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.taskId === params.id) {
          items.push({ id: docSnap.id, ...data });
        }
      });
      items.sort((a, b) => (a.order || 0) - (b.order || 0));
      setSubtasksList(items);
    }, (err) => {
      console.warn("Failed to subscribe to subtasks:", err);
    });
    return unsub;
  }, [user, params.id]);

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

  // Calculate detailed analysis using original task reference and actual subtasks
  const originalTask = tasksList.find((item) => item.id === params.id || item.taskId === params.id);
  const analysis = calculateRiskAndClassification(originalTask, tasksList, profile, subtasksList);

  const handleToggleSubtask = async (subtask: any) => {
    if (!user || !originalTask) return;

    const newStatus = !subtask.isCompleted;
    const subtaskDocRef = doc(db, "users", user.uid, "subtasks", subtask.id || subtask.subtaskId);

    try {
      // 1. Update Subtask in Firestore
      await updateDoc(subtaskDocRef, {
        isCompleted: newStatus,
        completedAt: newStatus ? new Date().toISOString() : null
      });

      // 2. Sync to Google Calendar if linked
      const token = localStorage.getItem(`google_calendar_token_${user.uid}`);
      if (token && subtask.calendarEventId) {
        const cleanTitle = subtask.title.replace(/^✓\s*(Completed:\s*)?/, "").replace(/^\[Completed\]\s*/, "");
        const newSummary = newStatus ? `✓ Completed: ${cleanTitle}` : cleanTitle;
        try {
          await updateGoogleCalendarEvent(token, subtask.calendarEventId, { summary: newSummary });
        } catch (calErr) {
          console.warn("Failed to sync completion to Google Calendar:", calErr);
        }
      }

      // 3. Recalculate parent task progress & risk
      const updatedSubtasks = subtasksList.map(s => 
        s.subtaskId === subtask.subtaskId ? { ...s, isCompleted: newStatus } : s
      );
      const completedHours = updatedSubtasks.filter(s => s.isCompleted).reduce((sum, s) => sum + s.estimatedHours, 0);
      const totalHours = updatedSubtasks.reduce((sum, s) => sum + s.estimatedHours, 0);
      const newProgress = totalHours > 0 ? Math.min(100, Math.round((completedHours / totalHours) * 100)) : 0;

      // Recalculate risk using updated progress
      const updatedTaskObj = { ...originalTask, progress: newProgress };
      const newAnalysis = calculateRiskAndClassification(updatedTaskObj, tasksList, profile, updatedSubtasks);

      const taskDocRef = doc(db, "users", user.uid, "tasks", originalTask.id || originalTask.taskId);
      await updateDoc(taskDocRef, {
        progress: newProgress,
        riskScore: newAnalysis.riskScore,
        riskLevel: newAnalysis.riskLevel,
        completionProbability: newAnalysis.completionProbability,
        urgency: newAnalysis.urgency,
        importance: newAnalysis.importance,
        behaviorState: newAnalysis.behaviorState,
        calendarState: newAnalysis.calendarState,
        progressState: newAnalysis.progressState,
        updatedAt: new Date().toISOString()
      });

    } catch (err) {
      console.error("Failed to toggle subtask status:", err);
    }
  };

  const handleDeleteTask = async () => {
    if (!user || !originalTask) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      // 1. Delete associated subtasks from Google Calendar if token exists
      const token = localStorage.getItem(`google_calendar_token_${user.uid}`);
      if (token) {
        for (const subtask of subtasksList) {
          if (subtask.calendarEventId) {
            try {
              await deleteGoogleCalendarEvent(token, subtask.calendarEventId);
            } catch (calErr) {
              console.warn("Failed to delete Google Calendar event for subtask:", subtask.id || subtask.subtaskId, calErr);
            }
          }
        }
      }

      // 2. Delete subtasks from Firestore
      for (const subtask of subtasksList) {
        const subtaskDocId = subtask.id || subtask.subtaskId;
        if (subtaskDocId) {
          await deleteDoc(doc(db, "users", user.uid, "subtasks", subtaskDocId));
        }
      }

      // 3. Delete the parent task document
      await deleteDoc(doc(db, "users", user.uid, "tasks", originalTask.id || originalTask.taskId));

      // 4. Redirect to tasks list
      router.push("/tasks");
    } catch (err: any) {
      console.error("Failed to delete task:", err);
      setDeleteError(err.message || "An error occurred while deleting the task. Please try again.");
      setIsDeleting(false);
    }
  };

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
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button 
              className="button button-secondary" 
              onClick={() => setIsConfirmOpen(true)}
              style={{
                borderColor: "rgba(220, 38, 38, 0.4)",
                color: "#ef4444",
                background: "rgba(220, 38, 38, 0.05)",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s ease-in-out"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(220, 38, 38, 0.12)";
                e.currentTarget.style.borderColor = "#ef4444";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(220, 38, 38, 0.05)";
                e.currentTarget.style.borderColor = "rgba(220, 38, 38, 0.4)";
              }}
            >
              <Trash2 size={14} /> Delete task
            </button>
            {(analysis.riskLevel === "critical" || analysis.riskLevel === "danger") ? (
              <Link className="button button-primary" href="/rescue" style={{ background: "var(--danger)" }}>
                <Play size={14} /> Initiate Rescue Protocol
              </Link>
            ) : (
              <Link className="button button-secondary" href="/rescue">
                <Play size={14} /> Run rescue analysis
              </Link>
            )}
          </div>
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
            {subtasksList.length > 0 ? (
              subtasksList.map((subtask, index) => {
                const isDone = subtask.isCompleted;
                return (
                  <div 
                    className="list-row" 
                    key={subtask.id || subtask.subtaskId} 
                    style={{ 
                      padding: "14px 20px", 
                      margin: 0, 
                      boxShadow: "none",
                      opacity: isDone ? 0.7 : 1,
                      background: isDone ? "var(--surface-soft)" : "var(--surface)",
                      cursor: "pointer"
                    }}
                    onClick={() => handleToggleSubtask(subtask)}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <input 
                        type="checkbox"
                        checked={isDone}
                        onChange={() => {}} 
                        style={{ width: "16px", height: "16px", cursor: "pointer" }}
                      />
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--muted)", minWidth: "20px" }}>
                        0{index + 1}
                      </span>
                      <strong style={{ fontSize: "13.5px", fontWeight: isDone ? "500" : "600", textDecoration: isDone ? "line-through" : "none" }}>
                        {subtask.title}
                      </strong>
                      <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                        ({subtask.estimatedHours}h)
                      </span>
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
                      {isDone && <CheckCircle2 size={10} />} {isDone ? "completed" : "pending"}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="muted" style={{ padding: "12px", border: "1px dashed var(--surface-line)", borderRadius: "8px", textAlign: "center" }}>No subtasks defined for this task.</p>
            )}
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

      {/* Premium Deletion Confirmation Modal */}
      {isConfirmOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(10, 10, 10, 0.75)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "16px"
        }}>
          <div style={{
            position: "relative",
            maxWidth: "460px",
            width: "100%",
            padding: "32px",
            background: "var(--bg)",
            border: "1px solid var(--surface-line)",
            borderRadius: "16px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
            display: "flex",
            flexDirection: "column",
            gap: "20px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--danger)" }}>
              <div style={{
                background: "rgba(220, 38, 38, 0.1)",
                borderRadius: "50%",
                padding: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <Trash2 size={24} style={{ color: "#ef4444" }} />
              </div>
              <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "700", color: "var(--text)" }}>Delete Task?</h3>
            </div>

            <p className="muted" style={{ margin: 0, fontSize: "14.5px", lineHeight: "1.6" }}>
              Are you sure you want to delete <strong style={{ color: "var(--text)" }}>&ldquo;{originalTask.title}&rdquo;</strong>?
              This will permanently remove this task, its subtasks, and desync them from your Google Calendar. This action cannot be undone.
            </p>

            {subtasksList.length > 0 && (
              <div style={{
                background: "var(--surface-soft)",
                borderRadius: "8px",
                padding: "12px 16px",
                borderLeft: "3px solid #ef4444",
                fontSize: "13px"
              }}>
                <div className="muted" style={{ fontWeight: 600, marginBottom: "4px" }}>Items to be deleted:</div>
                <ul style={{ margin: 0, paddingLeft: "16px", color: "var(--muted)", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <li>Main task details and risk profile</li>
                  <li>{subtasksList.length} subtask{subtasksList.length > 1 ? "s" : ""} in execution plan</li>
                  {subtasksList.some(s => s.calendarEventId) && <li>Linked Google Calendar event blocks</li>}
                </ul>
              </div>
            )}

            {/* Error display if any */}
            {deleteError && (
              <div style={{
                background: "rgba(220, 38, 38, 0.05)",
                border: "1px solid #ef4444",
                borderRadius: "8px",
                color: "#ef4444",
                padding: "10px 14px",
                fontSize: "13px"
              }}>
                {deleteError}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
              <button
                type="button"
                className="button button-secondary"
                onClick={() => {
                  if (!isDeleting) {
                    setIsConfirmOpen(false);
                    setDeleteError(null);
                  }
                }}
                disabled={isDeleting}
                style={{ padding: "10px 20px", borderRadius: "8px", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="button"
                onClick={handleDeleteTask}
                disabled={isDeleting}
                style={{
                  background: "#ef4444",
                  color: "#fff",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  border: "none",
                  fontWeight: "600",
                  opacity: isDeleting ? 0.7 : 1
                }}
              >
                {isDeleting ? (
                  <>
                    <span className="spinner" />
                    Deleting...
                  </>
                ) : (
                  "Delete Permanently"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          display: inline-block;
        }
      `}</style>
    </section>
  );
}
