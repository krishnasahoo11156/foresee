"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { 
  Calendar, 
  Clock, 
  Lock, 
  RefreshCw, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Trash2,
  CalendarDays,
  X,
  Play
} from "lucide-react";

// Mock interface for Schedule Items
interface ScheduleItem {
  id: string;
  time: string;
  type: string;
  title: string;
  isRescued: boolean;
  originalTime: string;
}

// Mock interface for Sync Logs
interface SyncLog {
  id: string;
  timestamp: string;
  action: string;
  type: "sync" | "rescue";
  description: string;
  details: string | null;
  changes?: {
    taskTitle: string;
    before: string;
    after: string;
  }[];
}

export default function PlannerPage() {
  // State for schedule items
  const [scheduleList, setScheduleList] = useState<ScheduleItem[]>([
    { id: "s1", time: "09:00", type: "Deep work", title: "Launch brief architecture narrative", isRescued: false, originalTime: "09:00" },
    { id: "s2", time: "11:00", type: "Review", title: "Risk model and simulation copy", isRescued: false, originalTime: "11:00" },
    { id: "s3", time: "14:00", type: "Build", title: "Rescue modal visual QA", isRescued: false, originalTime: "14:00" },
    { id: "s4", time: "16:30", type: "Admin", title: "Calendar OAuth checklist", isRescued: false, originalTime: "16:30" },
    { id: "s5", time: "19:00", type: "Demo", title: "Record walkthrough dry run", isRescued: false, originalTime: "19:00" }
  ]);

  // State for timeline logs
  const [timelineLogs, setTimelineLogs] = useState<SyncLog[]>([
    {
      id: "log-initial",
      timestamp: "08:30 AM",
      action: "Initial Account Sync",
      type: "sync",
      description: "Successfully imported 5 focus blocks from connected Google Calendar account.",
      details: "Connected profile: krishna@foresee.ai. Sync token refreshed."
    }
  ]);

  const [activeFilter, setActiveFilter] = useState<"all" | "sync" | "rescue">("all");
  const [movingItemId, setMovingItemId] = useState<string | null>(null);
  const [editTime, setEditTime] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  // Helper to get formatted current time
  const getFormattedTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Sync animation handler
  const triggerSync = (message: string) => {
    setIsSyncing(true);
    setSyncMessage(message);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncMessage("");
    }, 1200);
  };

  // Manual move handler
  const handleSaveMove = (id: string) => {
    if (!editTime.trim()) return;

    setScheduleList(prev => prev.map(item => {
      if (item.id === id) {
        // Log manual reschedule
        const logTime = getFormattedTime();
        const newLog: SyncLog = {
          id: `log-manual-${Date.now()}`,
          timestamp: logTime,
          action: "Manual Reschedule Detected",
          type: "sync",
          description: `User manually rescheduled "${item.type}" focus block.`,
          details: `Moved from ${item.time} to ${editTime}. Changes synced to Google Calendar.`,
          changes: [
            {
              taskTitle: item.title,
              before: item.time,
              after: editTime
            }
          ]
        };
        setTimelineLogs(prevLogs => [newLog, ...prevLogs]);
        triggerSync("Syncing manual reschedule to Google Calendar...");
        return { ...item, time: editTime };
      }
      return item;
    }));

    setMovingItemId(null);
    setEditTime("");
  };

  // AI Rescue simulation handler
  const handleSimulateRescue = () => {
    // Find unrescued items to shift
    const targetItem = scheduleList.find(item => item.id === "s2" || item.id === "s3");
    if (!targetItem) {
      alert("All events have already been adjusted by the Rescue Planner.");
      return;
    }

    const logTime = getFormattedTime();
    
    // Simulate AI Rescue shifts
    setScheduleList(prev => {
      const updated = prev.map(item => {
        if (item.id === "s2") {
          return { ...item, time: "12:15", isRescued: true };
        }
        if (item.id === "s3") {
          return { ...item, time: "15:30", isRescued: true };
        }
        return item;
      });

      // Log Rescue intervention
      const newLog: SyncLog = {
        id: `log-rescue-${Date.now()}`,
        timestamp: logTime,
        action: "Rescue Planner Intervention",
        type: "rescue",
        description: "AI detected a 45-minute focus deficit in Review block. Auto-shifting schedule.",
        details: "Rescheduled Review (+1h 15m) and Build (+1h 30m) to protect focus capacity. Synced updates to Google Calendar.",
        changes: [
          {
            taskTitle: "Risk model and simulation copy",
            before: "11:00",
            after: "12:15"
          },
          {
            taskTitle: "Rescue modal visual QA",
            before: "14:00",
            after: "15:30"
          }
        ]
      };
      setTimelineLogs(prevLogs => [newLog, ...prevLogs]);
      return updated;
    });

    triggerSync("AI Intervention: Re-optimizing Google Calendar schedule...");
  };

  // Reset demo state
  const handleResetDemo = () => {
    setScheduleList([
      { id: "s1", time: "09:00", type: "Deep work", title: "Launch brief architecture narrative", isRescued: false, originalTime: "09:00" },
      { id: "s2", time: "11:00", type: "Review", title: "Risk model and simulation copy", isRescued: false, originalTime: "11:00" },
      { id: "s3", time: "14:00", type: "Build", title: "Rescue modal visual QA", isRescued: false, originalTime: "14:00" },
      { id: "s4", time: "16:30", type: "Admin", title: "Calendar OAuth checklist", isRescued: false, originalTime: "16:30" },
      { id: "s5", time: "19:00", type: "Demo", title: "Record walkthrough dry run", isRescued: false, originalTime: "19:00" }
    ]);
    setTimelineLogs([
      {
        id: "log-initial",
        timestamp: "08:30 AM",
        action: "Initial Account Sync",
        type: "sync",
        description: "Successfully imported 5 focus blocks from connected Google Calendar account.",
        details: "Connected profile: krishna@foresee.ai. Sync token refreshed."
      }
    ]);
    triggerSync("Resetting calendar sync state...");
  };

  // Filtered log selector
  const filteredLogs = timelineLogs.filter(log => {
    if (activeFilter === "all") return true;
    return log.type === activeFilter;
  });

  return (
    <section className="page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "24px", marginBottom: "32px" }}>
        <div style={{ flex: "1 1 500px" }}>
          <PageHeader 
            eyebrow="Planner" 
            title="A calendar built around focus capacity." 
            description="Manage your day with focus-aware scheduling. Monitor how AI-driven Rescue Planner adjustments and manual updates automatically synchronize with Google Calendar." 
          />
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-3" style={{ marginBottom: "28px" }}>
        <div className="card card-pad" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "var(--accent-soft)", display: "grid", placeItems: "center", color: "var(--accent)" }}>
            <Clock size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0 }}>Focus Time</h3>
            <p className="muted" style={{ margin: 0 }}>5.5h scheduled today</p>
          </div>
        </div>
        <div className="card card-pad" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "var(--accent-2-soft)", display: "grid", placeItems: "center", color: "var(--accent-2)" }}>
            <CalendarDays size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0 }}>Calendar Sync</h3>
            <p className="muted" style={{ margin: 0 }}>Active • Connected</p>
          </div>
        </div>
        <div className="card card-pad" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "var(--accent-soft)", display: "grid", placeItems: "center", color: "var(--accent)" }}>
            <Lock size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0 }}>Quiet Hours</h3>
            <p className="muted" style={{ margin: 0 }}>10:30 PM - 7:30 AM</p>
          </div>
        </div>
      </div>

      {/* Main Content Splitted Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.9fr", gap: "32px", alignItems: "stretch" }}>
        
        {/* Left Side: Daily Schedule Flow */}
        <div className="card card-pad stack" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <h2 style={{ margin: "0 0 12px" }}>Daily schedule flow</h2>
          <div className="timeline" style={{ paddingRight: "8px" }}>
            {scheduleList.map((item) => (
              <div className="timeline-item" key={item.id}>
                <span className="time">{item.time}</span>
                <div 
                  className="list-row" 
                  style={{ 
                    flex: 1, 
                    margin: 0, 
                    padding: "14px 20px", 
                    boxShadow: "none",
                    border: item.isRescued ? "1px solid rgba(239, 68, 68, 0.25)" : "1px solid var(--surface-line)",
                    background: item.isRescued ? "rgba(239, 68, 68, 0.02)" : "var(--surface)"
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <strong style={{ fontSize: "14px" }}>{item.type}</strong>
                      {item.isRescued && (
                        <span 
                          style={{ 
                            fontSize: "10px", 
                            fontWeight: 700, 
                            color: "var(--danger)", 
                            background: "rgba(220, 38, 38, 0.08)", 
                            padding: "2px 6px", 
                            borderRadius: "4px" 
                          }}
                        >
                          Rescued
                        </span>
                      )}
                    </div>
                    <p className="muted" style={{ margin: "2px 0 0", fontSize: "12.5px" }}>{item.title}</p>

                    {/* Inline Time Editor */}
                    {movingItemId === item.id && (
                      <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "12px" }}>
                        <input
                          type="text"
                          value={editTime}
                          placeholder="e.g. 10:15"
                          onChange={(e) => setEditTime(e.target.value)}
                          className="input"
                          style={{ width: "90px", height: "30px", padding: "4px 8px", fontSize: "12.5px" }}
                        />
                        <button 
                          onClick={() => handleSaveMove(item.id)} 
                          className="button button-primary"
                          style={{ height: "30px", padding: "0 10px", fontSize: "12px" }}
                        >
                          Save
                        </button>
                        <button 
                          onClick={() => setMovingItemId(null)}
                          className="button button-ghost"
                          style={{ height: "30px", width: "30px", display: "grid", placeItems: "center", padding: 0 }}
                        >
                          <X size={15} />
                        </button>
                      </div>
                    )}
                  </div>

                  {movingItemId !== item.id && (
                    <button 
                      onClick={() => {
                        setMovingItemId(item.id);
                        setEditTime(item.time);
                      }}
                      className="button button-secondary" 
                      style={{ height: "32px", padding: "0 12px", fontSize: "12px", flexShrink: 0 }}
                    >
                      Move
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Google Calendar Integration Visualizer */}
        <div className="card card-pad stack" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          
          {/* Visualizer Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", borderBottom: "1px solid var(--surface-line)", paddingBottom: "16px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "99px", background: "#22c55e", boxShadow: "0 0 8px #22c55e", animation: "pulse 1.8s infinite" }} />
                <h2 style={{ margin: 0, fontSize: "18px" }}>Google Calendar Sync</h2>
              </div>
              <p className="muted" style={{ margin: "4px 0 0", fontSize: "12.5px" }}>Connected profile: <strong>krishna@foresee.ai</strong></p>
            </div>
            
            <div style={{ display: "flex", gap: "8px" }}>
              <button 
                onClick={handleSimulateRescue} 
                className="button button-secondary" 
                style={{ height: "34px", padding: "0 12px", fontSize: "12px", color: "var(--danger)", borderColor: "rgba(220,38,38,0.2)" }}
                title="Simulate a task delay and watch AI rescue and sync changes."
              >
                <Sparkles size={14} style={{ color: "var(--danger)" }} /> Simulate Rescue
              </button>
              <button 
                onClick={() => triggerSync("Synchronizing account blocks manually...")} 
                className="button button-secondary" 
                style={{ height: "34px", width: "34px", display: "grid", placeItems: "center", padding: 0 }}
                title="Trigger Manual Sync"
              >
                <RefreshCw size={14} className={isSyncing ? "spin-animation" : ""} />
              </button>
            </div>
          </div>

          {/* Sync Status Banner */}
          {isSyncing && (
            <div 
              style={{ 
                background: "rgba(59, 130, 246, 0.08)", 
                border: "1px solid rgba(59, 130, 246, 0.18)",
                borderRadius: "8px", 
                padding: "10px 16px", 
                display: "flex", 
                alignItems: "center", 
                gap: "12px",
                animation: "fadeIn 0.2s ease"
              }}
            >
              <RefreshCw size={14} className="spin-animation" style={{ color: "var(--accent)" }} />
              <span style={{ fontSize: "13px", color: "var(--accent)", fontWeight: 500 }}>{syncMessage}</span>
            </div>
          )}

          {/* Toolbar Filters */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", marginTop: "8px" }}>
            <div style={{ display: "flex", gap: "6px" }}>
              <button 
                onClick={() => setActiveFilter("all")} 
                className="button"
                style={{ 
                  height: "28px", 
                  padding: "0 10px", 
                  fontSize: "11.5px",
                  borderRadius: "6px",
                  background: activeFilter === "all" ? "var(--surface-soft)" : "transparent",
                  border: activeFilter === "all" ? "1px solid var(--surface-line)" : "none",
                  color: activeFilter === "all" ? "var(--text)" : "var(--muted)"
                }}
              >
                All Logs
              </button>
              <button 
                onClick={() => setActiveFilter("sync")} 
                className="button"
                style={{ 
                  height: "28px", 
                  padding: "0 10px", 
                  fontSize: "11.5px",
                  borderRadius: "6px",
                  background: activeFilter === "sync" ? "rgba(59, 130, 246, 0.08)" : "transparent",
                  border: activeFilter === "sync" ? "1px solid rgba(59, 130, 246, 0.18)" : "none",
                  color: activeFilter === "sync" ? "var(--accent)" : "var(--muted)"
                }}
              >
                Google Syncs
              </button>
              <button 
                onClick={() => setActiveFilter("rescue")} 
                className="button"
                style={{ 
                  height: "28px", 
                  padding: "0 10px", 
                  fontSize: "11.5px",
                  borderRadius: "6px",
                  background: activeFilter === "rescue" ? "rgba(239, 68, 68, 0.08)" : "transparent",
                  border: activeFilter === "rescue" ? "1px solid rgba(239, 68, 68, 0.18)" : "none",
                  color: "var(--danger)",
                  opacity: activeFilter === "rescue" ? 1 : 0.6
                }}
              >
                Rescue Actions
              </button>
            </div>

            <button 
              onClick={handleResetDemo}
              className="button button-ghost"
              style={{ height: "26px", fontSize: "11.5px", color: "var(--muted)", padding: "0 8px" }}
            >
              Reset Data
            </button>
          </div>

          {/* Timeline Feed Container */}
          <div 
            style={{ 
              flex: 1, 
              overflowY: "auto", 
              display: "grid", 
              gap: "14px", 
              maxHeight: "380px", 
              paddingRight: "4px",
              marginTop: "8px" 
            }}
          >
            {filteredLogs.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--muted)", border: "1px dashed var(--surface-line)", borderRadius: "8px" }}>
                No events found matching the filter criteria.
              </div>
            ) : (
              filteredLogs.map((log) => {
                const isRescue = log.type === "rescue";
                return (
                  <div 
                    key={log.id} 
                    style={{
                      border: isRescue ? "1px solid rgba(239, 68, 68, 0.25)" : "1px solid var(--surface-line)",
                      background: isRescue ? "rgba(239, 68, 68, 0.02)" : "var(--surface)",
                      borderRadius: "8px",
                      padding: "14px 16px",
                      position: "relative",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      animation: "fadeIn 0.25s ease"
                    }}
                  >
                    {/* Timestamp & Type Badge */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {isRescue ? (
                          <AlertTriangle size={14} style={{ color: "var(--danger)" }} />
                        ) : (
                          <CheckCircle2 size={14} style={{ color: "var(--accent)" }} />
                        )}
                        <strong style={{ fontSize: "13px", color: isRescue ? "var(--danger)" : "var(--text)" }}>
                          {log.action}
                        </strong>
                      </div>
                      <span className="muted" style={{ fontSize: "11.5px" }}>{log.timestamp}</span>
                    </div>

                    {/* Main Description */}
                    <p style={{ margin: 0, fontSize: "13px", lineHeight: "1.4" }}>
                      {log.description}
                    </p>

                    {/* Visual Before/After Diff */}
                    {log.changes && log.changes.length > 0 && (
                      <div 
                        style={{ 
                          background: isRescue ? "rgba(239, 68, 68, 0.05)" : "var(--surface-soft)", 
                          borderRadius: "6px", 
                          padding: "8px 12px", 
                          fontSize: "12px" 
                        }}
                      >
                        {log.changes.map((change, index) => (
                          <div key={index} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px", marginBottom: index < log.changes!.length - 1 ? "6px" : 0 }}>
                            <span style={{ fontWeight: 500 }}>{change.taskTitle}</span>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ textDecoration: "line-through", color: "var(--muted)" }}>{change.before}</span>
                              <ArrowRight size={12} className="muted" />
                              <span style={{ fontWeight: 600, color: isRescue ? "var(--danger)" : "var(--success)" }}>{change.after}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Extra Details */}
                    {log.details && (
                      <p className="muted" style={{ margin: 0, fontSize: "12px", borderTop: "1px solid var(--surface-line)", paddingTop: "8px" }}>
                        {log.details}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Inline Animation styles */}
      <style jsx global>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.5); }
          70% { box-shadow: 0 0 0 8px rgba(34, 197, 94, 0); }
          100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }
        .spin-animation {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(-360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
