"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAuth } from "@/components/AuthProvider";
import { collection, query, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { updateGoogleCalendarEvent } from "@/lib/googleCalendar";
import { syncSubtasksAndCalendar } from "@/lib/calendarSyncEngine";
import { 
  Calendar, 
  Clock, 
  Lock, 
  RefreshCw, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  CalendarDays,
  X
} from "lucide-react";

// Interfaces
interface ScheduleItem {
  id: string;
  time: string;
  type: string;
  title: string;
  isRescued: boolean;
  originalTime: string;
  taskId?: string;
}

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
  const { user } = useAuth();
  
  // Real-time states
  const [dbTasks, setDbTasks] = useState<any[]>([]);
  const [dbSubtasks, setDbSubtasks] = useState<any[]>([]);
  const [dbMappings, setDbMappings] = useState<any[]>([]);
  const [scheduleList, setScheduleList] = useState<ScheduleItem[]>([]);
  const [timelineLogs, setTimelineLogs] = useState<SyncLog[]>([]);

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

  // Sync animation helper
  const triggerSync = (message: string) => {
    setIsSyncing(true);
    setSyncMessage(message);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncMessage("");
    }, 1200);
  };

  // Subscribe to user tasks in Firestore
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "tasks"));
    const unsub = onSnapshot(q, (snapshot) => {
      const items: any[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() });
      });
      setDbTasks(items);
    }, (err) => {
      console.warn("Failed to load tasks for planner:", err);
    });
    return unsub;
  }, [user]);

  // Subscribe to user subtasks in Firestore
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "subtasks"));
    const unsub = onSnapshot(q, (snapshot) => {
      const items: any[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() });
      });
      setDbSubtasks(items);
    }, (err) => {
      console.warn("Failed to load subtasks for planner:", err);
    });
    return unsub;
  }, [user]);

  // Subscribe to user calendarMappings in Firestore
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "calendarMappings"));
    const unsub = onSnapshot(q, (snapshot) => {
      const items: any[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() });
      });
      setDbMappings(items);
    }, (err) => {
      console.warn("Failed to load calendar mappings for planner:", err);
    });
    return unsub;
  }, [user]);

  // Merge Firestore subtasks into the Daily Schedule Flow timeline
  useEffect(() => {
    // 1. Gather all subtasks that have been scheduled (have startTime)
    const scheduledSubtasks = dbSubtasks.filter(s => s.startTime);
    
    if (scheduledSubtasks.length > 0) {
      // Map to ScheduleItem format
      const items: ScheduleItem[] = scheduledSubtasks.map(s => {
        const parentTask = dbTasks.find(t => t.id === s.taskId || t.taskId === s.taskId);
        const categoryLabel = parentTask?.category
          ? parentTask.category.charAt(0).toUpperCase() + parentTask.category.slice(1)
          : "Focus block";
        
        const start = new Date(s.startTime);
        const formattedTime = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        
        return {
          id: s.id || s.subtaskId,
          time: formattedTime,
          type: categoryLabel,
          title: parentTask ? `[${parentTask.title}] - ${s.title}` : s.title,
          isRescued: parentTask?.behaviorState === "slipping" || parentTask?.behaviorState === "rescued",
          originalTime: s.originalTime || formattedTime,
          taskId: s.taskId
        };
      });

      // Sort chronologically
      items.sort((a, b) => a.time.localeCompare(b.time));
      setScheduleList(items);
    } else {
      // Fallback premium mock schedule if database is empty
      setScheduleList([
        { id: "s1", time: "09:00", type: "Deep work", title: "Launch brief architecture narrative", isRescued: false, originalTime: "09:00", taskId: "task_mock_1" },
        { id: "s2", time: "11:00", type: "Review", title: "Risk model and simulation copy", isRescued: false, originalTime: "11:00", taskId: "task_mock_2" },
        { id: "s3", time: "14:00", type: "Build", title: "Rescue modal visual QA", isRescued: false, originalTime: "14:00", taskId: "task_mock_3" },
        { id: "s4", time: "16:30", type: "Admin", title: "Calendar OAuth checklist", isRescued: false, originalTime: "16:30", taskId: "task_mock_4" },
        { id: "s5", time: "19:00", type: "Demo", title: "Record walkthrough dry run", isRescued: false, originalTime: "19:00", taskId: "task_mock_5" }
      ]);
    }
  }, [dbSubtasks, dbTasks]);

  // Trigger subtask bidirectional sync on mount
  useEffect(() => {
    if (user) {
      syncSubtasksAndCalendar(user.uid).catch(err => {
        console.warn("Auto-sync on load failed:", err);
      });
    }
  }, [user]);

  // Construct Timeline Logs dynamically from Firestore calendarMappings
  useEffect(() => {
    if (dbMappings.length > 0) {
      const logs: SyncLog[] = [];
      
      // Sort mappings descending by creation date
      const sortedMappings = [...dbMappings].sort((a, b) => {
        const timeA = a.createdAt?.seconds ? a.createdAt.seconds : new Date(a.syncTimestamp || 0).getTime() / 1000;
        const timeB = b.createdAt?.seconds ? b.createdAt.seconds : new Date(b.syncTimestamp || 0).getTime() / 1000;
        return timeB - timeA;
      });

      sortedMappings.forEach((m) => {
        const dateObj = new Date(m.syncTimestamp);
        const logTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const isRescue = m.status === "rescued" || m.source?.toLowerCase().includes("rescue");
        
        logs.push({
          id: m.id,
          timestamp: logTime,
          action: m.status === "rescued" ? "Rescue Planner Intervention" : (m.action || "Google Calendar Sync"),
          type: isRescue ? "rescue" : "sync",
          description: m.description || `Synchronized ${m.scheduledBlocks?.length || 0} event focus block(s) to Google Calendar.`,
          details: m.source ? `Source: ${m.source}. Connected profile: krishna@foresee.ai.` : "Connected profile: krishna@foresee.ai.",
          changes: m.changes || (m.scheduledBlocks ? m.scheduledBlocks.map((b: any) => ({
            taskTitle: b.title,
            before: "Google Cal",
            after: b.startTime ? new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Scheduled"
          })) : [])
        });
      });

      setTimelineLogs(logs);
    } else {
      // Fallback mock initial sync log
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
    }
  }, [dbMappings]);

  // Manual Reschedule Move Handler (saves to Firestore)
  const handleSaveMove = async (id: string) => {
    if (!user || !editTime.trim()) return;

    // Check if the item is a real Firestore task/subtask or mock
    const targetItem = scheduleList.find(item => item.id === id);
    if (!targetItem) return;

    const logTime = getFormattedTime();

    try {
      const subtask = dbSubtasks.find(s => s.id === id || s.subtaskId === id);
      
      if (subtask) {
        // 1. Update subtask in Firestore
        const subtaskDocRef = doc(db, "users", user.uid, "subtasks", subtask.id || subtask.subtaskId);
        const start = new Date();
        const [hoursStr, minutesStr] = editTime.split(":");
        start.setHours(Number(hoursStr), Number(minutesStr), 0, 0);
        
        const duration = subtask.estimatedHours || 1.0;
        const end = new Date(start.getTime() + duration * 3600 * 1000);

        await updateDoc(subtaskDocRef, {
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          updatedAt: new Date().toISOString()
        });

        // 2. Sync to Google Calendar
        const token = localStorage.getItem(`google_calendar_token_${user.uid}`);
        if (token && subtask.calendarEventId) {
          try {
            await updateGoogleCalendarEvent(token, subtask.calendarEventId, {
              startTime: start.toISOString(),
              endTime: end.toISOString()
            });
          } catch (calErr) {
            console.warn("Failed to sync manual reschedule to Google Calendar:", calErr);
          }
        }

        // 3. Add calendar log
        await addDoc(collection(db, "users", user.uid, "calendarMappings"), {
          mappingId: `map_${Date.now()}`,
          syncTimestamp: new Date().toISOString(),
          status: "synced",
          action: "Manual Reschedule Sync",
          source: "User Planner Drag",
          description: `User manually rescheduled subtask focus block: "${subtask.title}"`,
          changes: [
            {
              taskTitle: subtask.title,
              before: targetItem.time,
              after: editTime
            }
          ],
          scheduledBlocks: [
            {
              title: subtask.title,
              startTime: start.toISOString(),
              endTime: end.toISOString(),
              description: `Focus session. [ID: ${subtask.subtaskId}]`,
              taskId: subtask.taskId
            }
          ],
          createdAt: serverTimestamp()
        });

        triggerSync("Syncing manual reschedule to Google Calendar...");
      } else if (targetItem.taskId && !targetItem.taskId.startsWith("task_mock_")) {
        // Fallback: original task level update
        const taskDocRef = doc(db, "users", user.uid, "tasks", targetItem.taskId);
        const newDeadlineDate = new Date();
        const [hours, minutes] = editTime.split(":");
        newDeadlineDate.setHours(Number(hours), Number(minutes), 0, 0);

        await updateDoc(taskDocRef, {
          scheduledTime: editTime,
          deadline: newDeadlineDate.toISOString(),
          calendarState: "synced",
          updatedAt: new Date().toISOString()
        });

        await addDoc(collection(db, "users", user.uid, "calendarMappings"), {
          mappingId: `map_${Date.now()}`,
          syncTimestamp: new Date().toISOString(),
          status: "synced",
          action: "Manual Reschedule Sync",
          source: "User Planner Drag",
          description: `User manually rescheduled focus block: "${targetItem.type}"`,
          changes: [
            {
              taskTitle: targetItem.title,
              before: targetItem.time,
              after: editTime
            }
          ],
          scheduledBlocks: [
            {
              title: targetItem.title,
              startTime: newDeadlineDate.toISOString(),
              endTime: new Date(newDeadlineDate.getTime() + 1.5 * 3600 * 1000).toISOString(),
              description: `Focus session. [ID: ${targetItem.taskId}]`,
              taskId: targetItem.taskId
            }
          ],
          createdAt: serverTimestamp()
        });

        triggerSync("Syncing manual reschedule to Google Calendar...");
      } else {
        // Fallback for mock items
        setScheduleList(prev => prev.map(item => {
          if (item.id === id) {
            return { ...item, time: editTime };
          }
          return item;
        }));

        const newLog: SyncLog = {
          id: `log-manual-mock-${Date.now()}`,
          timestamp: logTime,
          action: "Manual Reschedule Detected",
          type: "sync",
          description: `User manually rescheduled mock focus block "${targetItem.type}".`,
          details: `Moved from ${targetItem.time} to ${editTime}. Synced back to Google Calendar.`,
          changes: [
            {
              taskTitle: targetItem.title,
              before: targetItem.time,
              after: editTime
            }
          ]
        };
        setTimelineLogs(prevLogs => [newLog, ...prevLogs]);
        triggerSync("Syncing manual reschedule to Google Calendar...");
      }
    } catch (err) {
      console.error("Failed to update task schedule:", err);
    }

    setMovingItemId(null);
    setEditTime("");
  };

  // AI Rescue simulation handler (saves to Firestore)
  const handleSimulateRescue = async () => {
    if (!user) return;

    // Check if we have real subtasks in Firestore to rescue
    const uncompletedSubtasks = dbSubtasks.filter(s => s.startTime && !s.isCompleted);

    const logTime = getFormattedTime();

    try {
      if (uncompletedSubtasks.length > 0) {
        const changesList: any[] = [];
        const blocksList: any[] = [];
        const token = localStorage.getItem(`google_calendar_token_${user.uid}`);

        for (const subtask of uncompletedSubtasks) {
          const subtaskDocRef = doc(db, "users", user.uid, "subtasks", subtask.id || subtask.subtaskId);
          const oldStart = new Date(subtask.startTime);
          const oldTimeStr = oldStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
          
          const newStart = new Date(oldStart.getTime() + 2 * 3600 * 1000); // Shift by 2 hours
          const newEnd = new Date(new Date(subtask.endTime).getTime() + 2 * 3600 * 1000);
          const newTimeStr = newStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

          await updateDoc(subtaskDocRef, {
            startTime: newStart.toISOString(),
            endTime: newEnd.toISOString(),
            updatedAt: new Date().toISOString()
          });

          if (token && subtask.calendarEventId) {
            try {
              await updateGoogleCalendarEvent(token, subtask.calendarEventId, {
                startTime: newStart.toISOString(),
                endTime: newEnd.toISOString()
              });
            } catch (calErr) {
              console.warn("Failed to sync simulated shift to Google Calendar:", calErr);
            }
          }

          changesList.push({
            taskTitle: subtask.title,
            before: oldTimeStr,
            after: newTimeStr
          });

          blocksList.push({
            title: subtask.title,
            startTime: newStart.toISOString(),
            endTime: newEnd.toISOString(),
            description: `Shifted by AI Rescue Planner. [Subtask ID: ${subtask.subtaskId}]`,
            taskId: subtask.taskId
          });
        }

        // Add a new Rescue mapping log in Firestore
        await addDoc(collection(db, "users", user.uid, "calendarMappings"), {
          mappingId: `map_rescue_${Date.now()}`,
          syncTimestamp: new Date().toISOString(),
          status: "rescued",
          action: "Rescue Planner Intervention",
          source: "AI Co-Optimizer Graph",
          description: "AI shifted overlapping or non-important subtasks to resolve calendar conflicts.",
          changes: changesList,
          scheduledBlocks: blocksList,
          createdAt: serverTimestamp()
        });

        triggerSync("AI Intervention: Re-optimizing Google Calendar schedule...");
      } else {
        // Fallback for mock demo rescue simulation
        setScheduleList(prev => prev.map(item => {
          if (item.id === "s2") {
            return { ...item, time: "12:15", isRescued: true };
          }
          if (item.id === "s3") {
            return { ...item, time: "15:30", isRescued: true };
          }
          return item;
        }));

        // Log Rescue intervention in mock logs
        const newLog: SyncLog = {
          id: `log-rescue-mock-${Date.now()}`,
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
        triggerSync("AI Intervention: Re-optimizing Google Calendar schedule...");
      }
    } catch (err) {
      console.error("Failed to run AI Rescue simulation:", err);
    }
  };

  // Reset demo state
  const handleResetDemo = () => {
    // If user has real Firestore records, we reset them!
    if (user && dbTasks.length > 0) {
      dbTasks.forEach(async (task) => {
        if (task.scheduledTime) {
          const taskDocRef = doc(db, "users", user.uid, "tasks", task.id);
          let originalResetTime = task.originalTime || "09:00";
          
          await updateDoc(taskDocRef, {
            scheduledTime: originalResetTime,
            behaviorState: "stable",
            updatedAt: new Date().toISOString()
          });
        }
      });
    }

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
      <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1.65fr", gap: "32px", alignItems: "stretch" }}>
        
        {/* Left Side: Daily Schedule Flow */}
        <div className="card stack" style={{ display: "flex", flexDirection: "column", height: "100%", padding: "24px 20px 24px 16px" }}>
          <h2 style={{ margin: "0 0 12px" }}>Daily schedule flow</h2>
          <div className="timeline" style={{ paddingRight: "8px", gap: "26px" }}>
            {scheduleList.map((item) => {
              const isRescued = item.isRescued;
              const typeLower = item.type.toLowerCase();
              let borderLeftColor = "var(--accent)"; // fallback
              if (isRescued) {
                borderLeftColor = "var(--danger)";
              } else if (typeLower.includes("deep")) {
                borderLeftColor = "var(--accent)"; // neon blue
              } else if (typeLower.includes("review") || typeLower.includes("admin")) {
                borderLeftColor = "var(--warning)"; // orange/amber
              } else if (typeLower.includes("build") || typeLower.includes("code") || typeLower.includes("demo")) {
                borderLeftColor = "#8b5cf6"; // purple
              }

              return (
                <div className="timeline-item" key={item.id}>
                  <span className="time">{item.time}</span>
                  <div 
                    className="list-row" 
                    style={{ 
                      flex: 1, 
                      margin: 0, 
                      padding: "16px 20px", 
                      boxShadow: "none",
                      border: isRescued ? "1px solid rgba(239, 68, 68, 0.25)" : "1px solid var(--surface-line)",
                      borderLeft: `4px solid ${borderLeftColor}`,
                      background: isRescued ? "rgba(239, 68, 68, 0.02)" : "var(--surface)",
                      transition: "all 0.2s ease"
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
                      <p className="muted" style={{ margin: "4px 0 0", fontSize: "12.5px", lineHeight: "1.4" }}>{item.title}</p>
                      
                      {item.taskId && (
                        <span className="pill monitor" style={{ fontSize: "9px", display: "inline-block", marginTop: "6px", textTransform: "none", letterSpacing: "normal" }}>
                          ID: {item.taskId}
                        </span>
                      )}

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
              );
            })}
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
                onClick={async () => {
                  triggerSync("Synchronizing account blocks manually...");
                  try {
                    if (user) {
                      await syncSubtasksAndCalendar(user.uid);
                    }
                  } catch (err) {
                    console.error("Failed to sync subtasks manually:", err);
                  }
                }} 
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
                animation: "fadeIn 0.2s ease",
                marginTop: "12px"
              }}
            >
              <RefreshCw size={14} className="spin-animation" style={{ color: "var(--accent)" }} />
              <span style={{ fontSize: "13px", color: "var(--accent)", fontWeight: 500 }}>{syncMessage}</span>
            </div>
          )}

          {/* Toolbar Filters */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", marginTop: "12px" }}>
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
              maxHeight: "460px", 
              paddingRight: "4px",
              marginTop: "12px" 
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

          {/* Horizontal divider */}
          <div style={{ borderTop: "1px solid var(--surface-line)", margin: "20px 0 16px" }} />

          {/* Sync Coverage & Focus Analytics HUD */}
          <div>
            <h3 style={{ margin: "0 0 14px", fontSize: "14px", fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: "8px" }}>
              <Sparkles size={15} style={{ color: "var(--accent)" }} />
              Sync Coverage & Focus Analytics
            </h3>

            {/* Metric Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "18px" }}>
              <div style={{ background: "var(--surface-soft)", border: "1px solid var(--surface-line)", padding: "10px 12px", borderRadius: "6px" }}>
                <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Google Sync State</div>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--success)", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 4px #22c55e" }} />
                  ACTIVE
                </div>
              </div>
              <div style={{ background: "var(--surface-soft)", border: "1px solid var(--surface-line)", padding: "10px 12px", borderRadius: "6px" }}>
                <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Coverage Ratio</div>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text)", marginTop: "2px" }}>100% Synced</div>
              </div>
              <div style={{ background: "var(--surface-soft)", border: "1px solid var(--surface-line)", padding: "10px 12px", borderRadius: "6px" }}>
                <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Conflict Shield</div>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--accent)", marginTop: "2px" }}>ENGAGED</div>
              </div>
            </div>

            {/* Focus Allocation segmented bar */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--muted-strong)" }}>Focus Hours Allocation (5.5h total)</span>
                <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--accent)" }}>100% Scheduled</span>
              </div>
              <div style={{ display: "flex", height: "8px", borderRadius: "4px", overflow: "hidden", background: "var(--surface-line)" }}>
                {/* Deep Work: 55% */}
                <div style={{ width: "55%", background: "var(--accent)" }} title="Deep Work: 3.0h (55%)" />
                {/* Build/QA: 25% */}
                <div style={{ width: "25%", background: "#8b5cf6" }} title="Build/QA: 1.4h (25%)" />
                {/* Review/Admin: 20% */}
                <div style={{ width: "20%", background: "var(--warning)" }} title="Review & Admin: 1.1h (20%)" />
              </div>
              
              {/* Legend */}
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent)" }} />
                  <span style={{ fontSize: "11px", color: "var(--muted)" }}>Deep Work (3.0h)</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#8b5cf6" }} />
                  <span style={{ fontSize: "11px", color: "var(--muted)" }}>Build/QA (1.4h)</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--warning)" }} />
                  <span style={{ fontSize: "11px", color: "var(--muted)" }}>Review & Admin (1.1h)</span>
                </div>
              </div>
            </div>
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
