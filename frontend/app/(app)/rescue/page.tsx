"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, ShieldAlert, Sparkles, Calendar, AlertTriangle, Check, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAuth } from "@/components/AuthProvider";
import { collection, query, onSnapshot, updateDoc, doc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { calculateRiskAndClassification, generateRescueStrategies } from "@/lib/riskEngine";
import { syncEventsToGoogleCalendar } from "@/lib/googleCalendar";
import { Task, RescueStrategy } from "@/lib/types";
import Link from "next/link";

export default function RescuePage() {
  const { user, profile, signInWithGoogle } = useAuth();
  const [tasksList, setTasksList] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [selectedStrategyName, setSelectedStrategyName] = useState<string>("Focused Sprint");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [actionLoading, setActionLoading] = useState(false);
  const [hasCalendarToken, setHasCalendarToken] = useState(false);
  const [apiActivationUrl, setApiActivationUrl] = useState("");

  // Subscribe to tasks
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "tasks"));
    const unsub = onSnapshot(q, (snapshot) => {
      const items: Task[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as Task);
      });
      setTasksList(items);
      setLoading(false);
    }, (err) => {
      console.warn("Failed to subscribe to tasks list:", err);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  // Check for local storage calendar token
  useEffect(() => {
    if (user) {
      setHasCalendarToken(!!localStorage.getItem(`google_calendar_token_${user.uid}`));
    }
  }, [user]);

  // Identify critical or danger tasks
  const rescueCandidates = tasksList.filter(t => {
    if (t.progress >= 100) return false;
    const analysis = calculateRiskAndClassification(t, tasksList, profile);
    return analysis.riskLevel === "critical" || analysis.riskLevel === "danger";
  });

  // Set default selection
  useEffect(() => {
    if (rescueCandidates.length > 0 && !selectedTaskId) {
      setSelectedTaskId(rescueCandidates[0].id || rescueCandidates[0].taskId);
    }
  }, [rescueCandidates, selectedTaskId]);

  if (loading) {
    return (
      <section className="page" style={{ padding: "48px", textAlign: "center" }}>
        <p className="lead">Scanning timeline for critical risks...</p>
      </section>
    );
  }

  // Find selected task
  const activeTask = tasksList.find(t => t.id === selectedTaskId || t.taskId === selectedTaskId);
  
  // Calculate strategies for current active task
  let strategies: RescueStrategy[] = [];
  let riskDetails: any = null;
  
  if (activeTask) {
    riskDetails = calculateRiskAndClassification(activeTask, tasksList, profile);
    strategies = generateRescueStrategies(activeTask, profile);
  }

  const handleAcceptRescue = async () => {
    if (!user || !activeTask || !riskDetails) return;
    setActionLoading(true);
    setSuccessMessage("");
    setApiActivationUrl("");

    try {
      const chosenStrategy = strategies.find(s => s.name === selectedStrategyName) || strategies[0];
      
      // 1. Sync to actual Google Calendar via REST API if token is present
      let calendarSyncNote = "";
      if (hasCalendarToken) {
        const eventsToSync = chosenStrategy.dailyWorkSchedule.map((block: any) => ({
          summary: `${block.title}: Rescue Focus Block`,
          description: `Automatically scheduled via ForeSee Rescue Engine. Strategy: ${chosenStrategy.name}`,
          startTime: block.startTime,
          endTime: block.endTime
        }));

        const syncRes = await syncEventsToGoogleCalendar(user.uid, eventsToSync);
        if (syncRes.success) {
          calendarSyncNote = ` Successfully synchronized ${syncRes.count} events to your Google Calendar.`;
        } else {
          if (syncRes.activationUrl) {
            setApiActivationUrl(syncRes.activationUrl);
            calendarSyncNote = " Google Calendar API is disabled in your cloud project. Activation link generated below.";
          } else {
            calendarSyncNote = ` Note: Calendar sync failed (${syncRes.error}).`;
          }
          // If token was expired/invalid, reset token state
          if (!localStorage.getItem(`google_calendar_token_${user.uid}`)) {
            setHasCalendarToken(false);
          }
        }
      } else {
        calendarSyncNote = " Note: Google Calendar sync is currently offline. Authorize calendar access to sync schedule.";
      }

      // 2. Create a rescue plan record in Firestore
      const planRef = await addDoc(collection(db, "users", user.uid, "rescuePlans"), {
        planId: `plan_${Date.now()}`,
        taskId: activeTask.id || activeTask.taskId,
        timestamp: new Date().toISOString(),
        status: "accepted",
        strategy: chosenStrategy,
        createdAt: serverTimestamp()
      });

      // 3. Simulate calendar sync events by writing to calendarMappings collection
      await addDoc(collection(db, "users", user.uid, "calendarMappings"), {
        mappingId: `map_${Date.now()}`,
        taskId: activeTask.id || activeTask.taskId,
        planId: planRef.id,
        scheduledBlocks: chosenStrategy.dailyWorkSchedule,
        syncTimestamp: new Date().toISOString(),
        status: "synced",
        source: "Rescue Engine"
      });

      // 4. Update the task state to reflect rescue recovery in progress
      const taskDocRef = doc(db, "users", user.uid, "tasks", activeTask.id || activeTask.taskId);
      await updateDoc(taskDocRef, {
        riskScore: Math.round(activeTask.riskScore * 0.5), // Halve the risk score upon committing to rescue
        riskLevel: "monitor", // Transition to monitor
        behaviorState: "recovering",
        rescueCount: (activeTask.rescueCount || 0) + 1,
        lastActivity: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Show success
      setSuccessMessage(`Rescue Action Complete! Accepted "${chosenStrategy.name}".${calendarSyncNote}`);
      
      if (!apiActivationUrl) {
        setSelectedTaskId("");
      }
    } catch (err) {
      console.error("Rescue plan action failed:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAuthorizeCalendar = async () => {
    try {
      await signInWithGoogle();
      setHasCalendarToken(true);
      setSuccessMessage("Google Calendar access authorized successfully!");
    } catch (err) {
      console.error("Calendar authorization failed:", err);
    }
  };

  return (
    <section className="page page-wide">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "24px", marginBottom: "32px" }}>
        <div style={{ flex: "1 1 500px" }}>
          <PageHeader 
            eyebrow="Rescue Center" 
            title="AI deadline rescue command center" 
            description="Automatically intercept deadline delays, construct custom focus schedules, and lock down your calendar before failures trigger." 
          />
        </div>
      </div>

      {/* Calendar Auth Banner */}
      {!hasCalendarToken && (
        <div 
          className="card card-pad" 
          style={{ 
            background: "rgba(234,179,8,0.06)", 
            border: "1px solid rgba(234,179,8,0.18)", 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            padding: "14px 20px", 
            borderRadius: "10px", 
            marginBottom: "28px" 
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <AlertTriangle size={18} style={{ color: "var(--warning)" }} />
            <span style={{ fontSize: "13.5px" }}>Google Calendar sync is offline. Authorize calendar access to sync your schedules.</span>
          </div>
          <button 
            onClick={handleAuthorizeCalendar} 
            className="button button-secondary"
            style={{ fontSize: "12px", padding: "6px 12px", minHeight: "auto" }}
          >
            Authorize Google Calendar
          </button>
        </div>
      )}

      {/* API Disabled Action Link */}
      {apiActivationUrl && (
        <div 
          className="card card-pad stack" 
          style={{ 
            background: "rgba(239,68,68,0.06)", 
            border: "1px solid rgba(239,68,68,0.18)", 
            padding: "20px 24px", 
            borderRadius: "12px", 
            marginBottom: "28px",
            gap: "12px" 
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <AlertTriangle size={20} style={{ color: "var(--danger)" }} />
            <strong style={{ fontSize: "15.5px", color: "var(--danger)" }}>Google Calendar API Needs Activation</strong>
          </div>
          <p className="muted" style={{ fontSize: "13.5px", margin: 0, lineHeight: 1.45 }}>
            The Google Calendar API is not yet activated on your Google Cloud/Firebase project. Click the button below to enable it in your Google Developer Console, wait a few moments, and retry.
          </p>
          <div>
            <a 
              href={apiActivationUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="button button-primary"
              style={{ display: "inline-flex", background: "var(--danger)", justifyContent: "center", textDecoration: "none" }}
            >
              Enable Google Calendar API
            </a>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="card card-pad" style={{ background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.18)", color: "var(--success)", padding: "18px 24px", borderRadius: "12px", marginBottom: "28px", display: "flex", alignItems: "flex-start", gap: "12px" }}>
          <CheckCircle2 size={20} style={{ flexShrink: 0, marginTop: "2px" }} />
          <div>
            <strong style={{ fontSize: "15px", display: "block", marginBottom: "4px" }}>Status Notification</strong>
            <span style={{ fontSize: "13.5px" }}>{successMessage}</span>
          </div>
        </div>
      )}

      {rescueCandidates.length === 0 ? (
        <div className="card card-pad" style={{ padding: "64px", textAlign: "center", border: "1px dashed var(--surface-line)", borderRadius: "16px" }}>
          <div style={{ background: "var(--accent-soft)", width: "54px", height: "54px", borderRadius: "50%", display: "grid", placeItems: "center", margin: "0 auto 20px", color: "var(--accent)" }}>
            <Sparkles size={24} />
          </div>
          <h2 style={{ fontSize: "20px", marginBottom: "8px" }}>Your Timeline is Safe</h2>
          <p className="muted" style={{ maxWidth: "460px", margin: "0 auto 24px" }}>
            The deadline rescue watchdogs have scanned your task queue and calendar commitments. No tasks currently exceed safety risk levels.
          </p>
          <Link href="/tasks" className="button button-secondary">
            View active tasks list
          </Link>
        </div>
      ) : (
        <div className="stack" style={{ gap: "24px" }}>
          {/* Selector if multiple tasks need rescue */}
          {rescueCandidates.length > 1 && (
            <div className="card card-pad" style={{ padding: "18px 24px", display: "flex", alignItems: "center", gap: "16px" }}>
              <strong style={{ fontSize: "14px", color: "var(--muted-strong)" }}>Select task to resolve:</strong>
              <select 
                className="select" 
                style={{ maxWidth: "320px" }}
                value={selectedTaskId}
                onChange={e => {
                  setSelectedTaskId(e.target.value);
                  setSuccessMessage("");
                }}
              >
                {rescueCandidates.map(c => (
                  <option key={c.id || c.taskId} value={c.id || c.taskId}>{c.title}</option>
                ))}
              </select>
            </div>
          )}

          {activeTask && riskDetails && (
            <div className="grid grid-2" style={{ gap: "28px" }}>
              {/* Left Column: Risk Diagnostics */}
              <div className="card card-pad stack" style={{ padding: "32px", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                    <span className="pill critical" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <ShieldAlert size={14} /> Risk {riskDetails.riskScore}%
                    </span>
                    <strong style={{ color: "var(--danger)", fontSize: "14px" }}>{riskDetails.riskLevel.toUpperCase()} State</strong>
                  </div>
                  <h2 style={{ fontSize: "24px", lineHeight: "1.25", marginBottom: "8px" }}>{activeTask.title}</h2>
                  <p className="muted" style={{ fontSize: "13.5px", marginBottom: "20px" }}>
                    <strong>Task Category:</strong> {activeTask.category} • <strong>Effort Needed:</strong> {activeTask.estimatedHours || 0} hours
                  </p>
                  
                  <div style={{ margin: "24px 0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
                      <span className="muted">Initial completion probability</span>
                      <strong>{riskDetails.completionProbability}%</strong>
                    </div>
                    <div className="progress">
                      <span style={{ width: `${riskDetails.completionProbability}%` }} />
                    </div>
                  </div>

                  <div style={{ borderTop: "1px solid var(--surface-line)", paddingTop: "20px", marginTop: "20px" }}>
                    <h3 style={{ fontSize: "14px", marginBottom: "12px", color: "var(--muted-strong)" }}>Primary Failure Factors</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {[
                        { label: "Time Scarcity", val: riskDetails.factors.timePressure, color: "var(--accent)" },
                        { label: "Focus Workload Gap", val: riskDetails.factors.workloadGap, color: "var(--accent-2)" },
                        { label: "Behavioral Delay Factor", val: riskDetails.factors.behavior, color: "var(--warning)" },
                        { label: "Prerequisite Blockers", val: riskDetails.factors.dependency, color: "var(--danger)" }
                      ].map(f => (
                        <div key={f.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "13px" }}>
                          <span className="muted">{f.label}</span>
                          <span style={{ fontWeight: 600, color: f.val > 50 ? "var(--danger)" : "var(--text)" }}>{f.val}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: "32px" }}>
                  <button 
                    onClick={handleAcceptRescue}
                    disabled={actionLoading}
                    className="button button-primary" 
                    style={{ width: "100%", height: "46px", background: "var(--danger)", justifyContent: "center" }}
                  >
                    {actionLoading ? "Deploying Rescue..." : `Deploy Selected: "${selectedStrategyName}"`}
                  </button>
                </div>
              </div>

              {/* Right Column: Rescue Strategies Comparison */}
              <div className="grid" style={{ gap: "16px" }}>
                {strategies.map((strategy) => {
                  const isSelected = strategy.name === selectedStrategyName;
                  return (
                    <div 
                      className="card card-pad metric" 
                      key={strategy.name}
                      onClick={() => setSelectedStrategyName(strategy.name)}
                      style={{ 
                        border: isSelected ? "2px solid var(--accent)" : "1px solid var(--surface-line)",
                        boxShadow: isSelected ? "var(--shadow-md)" : "var(--shadow)",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "stretch",
                        padding: "20px 24px",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <h3 style={{ margin: 0, fontSize: "16px" }}>{strategy.name}</h3>
                          {strategy.finalRecommendation && (
                            <span className="pill safe" style={{ fontSize: "9px", padding: "1px 6px" }}>Recommended</span>
                          )}
                        </div>
                        <span 
                          className={`pill ${strategy.predictedSuccessProbability > 75 ? "safe" : strategy.predictedSuccessProbability > 50 ? "monitor" : "critical"}`}
                          style={{ 
                            display: "inline-flex", 
                            alignItems: "center", 
                            gap: "6px", 
                            fontSize: "12px", 
                            padding: "4px 8px",
                            fontWeight: 700 
                          }}
                        >
                          Success: {strategy.predictedSuccessProbability}%
                        </span>
                      </div>

                      <p className="muted" style={{ margin: "0 0 12px", fontSize: "13px", lineHeight: "1.4" }}>{strategy.description}</p>
                      
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "12.5px", borderTop: "1px solid var(--surface-line)", paddingTop: "12px" }}>
                        <div>
                          <strong style={{ color: "var(--muted)" }}>Trade-offs:</strong>
                          <ul style={{ margin: "4px 0 0", paddingLeft: "16px", color: "var(--muted-strong)" }}>
                            {strategy.tradeOffs.map(t => <li key={t}>{t}</li>)}
                          </ul>
                        </div>
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                            <span className="muted">Stress impact:</span>
                            <span style={{ fontWeight: 600, color: strategy.estimatedStressImpact === 'high' ? 'var(--danger)' : 'var(--success)' }}>{strategy.estimatedStressImpact}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span className="muted">Calendar blocks:</span>
                            <span style={{ fontWeight: 600 }}>{strategy.dailyWorkSchedule.length} days</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
