"use client";

import { useState, useEffect, useRef } from "react";
import { Bot, Send, User, Calendar, Check, AlertTriangle, ArrowRight, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAuth } from "@/components/AuthProvider";
import { collection, query, onSnapshot, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { askCopilot, ProposedEvent } from "@/lib/geminiClient";
import { syncEventsToGoogleCalendar } from "@/lib/googleCalendar";
import { Task } from "@/lib/types";

interface Message {
  sender: "user" | "copilot";
  text: string;
  timestamp: Date;
  proposedEvents?: ProposedEvent[];
  eventsAdded?: boolean;
}

export default function CopilotPage() {
  const { user, profile, signInWithGoogle } = useAuth();
  const [tasksList, setTasksList] = useState<Task[]>([]);
  const [calendarMappings, setCalendarMappings] = useState<any[]>([]);
  const [subtasksList, setSubtasksList] = useState<any[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "copilot",
      text: "Hello! I am your ForeSee AI Copilot. I analyze your tasks, onboarding preferences, and calendar in real-time. Ask me 'How should I complete my tasks?' or 'Plan my coding project' and I will structure a focus schedule for you.",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [hasCalendarToken, setHasCalendarToken] = useState(false);
  const [apiActivationUrl, setApiActivationUrl] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    }, (err) => {
      console.warn("Failed to subscribe to tasks list:", err);
    });
    return unsub;
  }, [user]);

  // Check for local storage calendar token
  useEffect(() => {
    if (user) {
      setHasCalendarToken(!!localStorage.getItem(`google_calendar_token_${user.uid}`));
    }
  }, [user]);

  // Subscribe to calendar mappings
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "calendarMappings"));
    const unsub = onSnapshot(q, (snapshot) => {
      const items: any[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() });
      });
      setCalendarMappings(items);
    }, (err) => {
      console.warn("Failed to subscribe to calendar mappings:", err);
    });
    return unsub;
  }, [user]);

  // Subscribe to subtasks
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "subtasks"));
    const unsub = onSnapshot(q, (snapshot) => {
      const items: any[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() });
      });
      setSubtasksList(items);
    }, (err) => {
      console.warn("Failed to subscribe to subtasks list:", err);
    });
    return unsub;
  }, [user]);

  // Load chat messages from localStorage on mount
  useEffect(() => {
    if (!user) return;
    const cached = localStorage.getItem(`copilot_messages_${user.uid}`);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        // Convert timestamp strings back to Date objects
        const formatted = parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
        setMessages(formatted);
      } catch (err) {
        console.warn("Failed to parse cached copilot messages:", err);
      }
    }
  }, [user]);

  // Save chat messages to localStorage when they change
  useEffect(() => {
    if (!user || messages.length <= 1) return;
    localStorage.setItem(`copilot_messages_${user.uid}`, JSON.stringify(messages));
  }, [user, messages]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user) return;

    const userMsg = inputText.trim();
    setInputText("");
    setSuccessMessage("");
    setApiActivationUrl("");
    setMessages(prev => [...prev, { sender: "user", text: userMsg, timestamp: new Date() }]);
    setLoading(true);

    try {
      // Call Gemini with full DB context
      const response = await askCopilot(userMsg, tasksList, profile, calendarMappings, subtasksList);
      
      setMessages(prev => [...prev, {
        sender: "copilot",
        text: response.reasoning,
        proposedEvents: response.proposedEvents,
        timestamp: new Date()
      }]);
    } catch (err) {
      console.error("Failed to call copilot:", err);
      setMessages(prev => [...prev, {
        sender: "copilot",
        text: "I encountered a configuration issue while analyzing your calendar. Please try again or verify your settings.",
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvents = async (events: ProposedEvent[], messageIndex: number) => {
    if (!user || !events || events.length === 0) return;
    setLoading(true);
    setSuccessMessage("");
    setApiActivationUrl("");

    try {
      // 1. Check existing tasks and resolve/generate task IDs
      const syncedBlocks = [];
      const updatedTasks = [];

      for (const event of events) {
        const durationMs = new Date(event.endTime).getTime() - new Date(event.startTime).getTime();
        const durationHours = Math.max(0.5, Math.round((durationMs / (1000 * 60 * 60)) * 2) / 2);

        // Try to match with an existing task in tasksList by title
        const existingTask = tasksList.find(t => 
          event.title.toLowerCase().includes(t.title.toLowerCase()) || 
          t.title.toLowerCase().includes(event.title.toLowerCase())
        );

        let targetTaskId = "";

        if (existingTask) {
          targetTaskId = existingTask.taskId || existingTask.id || "";
          // Update existing task time and state in Firestore
          const taskDocRef = doc(db, "users", user.uid, "tasks", existingTask.id || "");
          const scheduledTimeStr = new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          
          await updateDoc(taskDocRef, {
            deadline: event.endTime,
            scheduledTime: scheduledTimeStr,
            calendarState: "synced",
            updatedAt: new Date().toISOString()
          });

          updatedTasks.push({ title: existingTask.title, id: targetTaskId });
        } else {
          // Create a new task in Firestore
          targetTaskId = `task_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
          const scheduledTimeStr = new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          
          await addDoc(collection(db, "users", user.uid, "tasks"), {
            taskId: targetTaskId,
            userId: user.uid,
            title: event.title,
            estimatedHours: durationHours,
            difficulty: "medium",
            deadline: event.endTime,
            isImportant: false,
            progress: 0,
            category: "Coding",
            taskType: "fixed_deadline",
            executionStyle: "single_session",
            energyRequirement: "medium",
            interruptionTolerance: "semi",
            estimatedConfidence: 80,
            motivationLevel: "neutral",
            requiresInternet: true,
            requirements: ["laptop"],
            dependencies: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            rescueCount: 0,
            planStabilityIndex: 100,
            behaviorScore: 100,
            riskScore: 10,
            riskLevel: "safe",
            riskTrend: "stable",
            calendarState: "synced",
            scheduledTime: scheduledTimeStr
          });

          updatedTasks.push({ title: event.title, id: targetTaskId });
        }

        // Add to calendar mapping blocks with task ID injected into description
        syncedBlocks.push({
          title: event.title,
          startTime: event.startTime,
          endTime: event.endTime,
          description: `${event.description} [ID: ${targetTaskId}]`,
          taskId: targetTaskId
        });
      }

      // 2. Sync to Google Calendar (injecting task ID in event descriptions)
      let calendarSyncNote = "";
      if (hasCalendarToken) {
        const eventsToSync = syncedBlocks.map(b => ({
          summary: b.title,
          description: b.description,
          startTime: b.startTime,
          endTime: b.endTime
        }));

        const syncRes = await syncEventsToGoogleCalendar(user.uid, eventsToSync);
        if (syncRes.success) {
          calendarSyncNote = ` Successfully synchronized ${syncRes.count} events to your actual Google Calendar.`;
        } else {
          if (syncRes.activationUrl) {
            setApiActivationUrl(syncRes.activationUrl);
            calendarSyncNote = " Google Calendar API is disabled in your cloud project. Activation link generated below.";
          } else {
            calendarSyncNote = ` Note: Calendar sync failed (${syncRes.error}).`;
          }
          if (!localStorage.getItem(`google_calendar_token_${user.uid}`)) {
            setHasCalendarToken(false);
          }
        }
      } else {
        calendarSyncNote = " Note: Google Calendar sync is offline. Authorize calendar access below.";
      }

      // 3. Create calendar mapping document in Firestore
      await addDoc(collection(db, "users", user.uid, "calendarMappings"), {
        mappingId: `map_${Date.now()}`,
        syncTimestamp: new Date().toISOString(),
        status: "synced",
        source: "AI Copilot Scheduler",
        scheduledBlocks: syncedBlocks,
        createdAt: serverTimestamp()
      });

      // 4. Perform any task shifts in the database
      for (const event of events) {
        if (event.shiftRequired && event.shiftedTaskId) {
          const shiftedTask = tasksList.find(t => t.id === event.shiftedTaskId || t.taskId === event.shiftedTaskId);
          if (shiftedTask) {
            const taskDocRef = doc(db, "users", user.uid, "tasks", shiftedTask.id || shiftedTask.taskId);
            
            // Shift task deadline forward by 24 hours to accommodate high priority task
            const oldDeadline = new Date(shiftedTask.deadline);
            const newDeadline = new Date(oldDeadline.getTime() + 24 * 3600 * 1000);
            
            await updateDoc(taskDocRef, {
              deadline: newDeadline.toISOString(),
              behaviorState: "slipping",
              lastActivity: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
            console.log(`AI shifted task "${shiftedTask.title}" deadline to: ${newDeadline.toISOString()}`);
          }
        }
      }

      setSuccessMessage(`Calendar Focus Blocks Synchronized Successfully!${calendarSyncNote}`);
      
      // Update state to mark this specific message as added so we preserve the proposed events list
      if (!apiActivationUrl) {
        setMessages(prev => prev.map((m, idx) => {
          if (idx === messageIndex) {
            return { ...m, eventsAdded: true };
          }
          return m;
        }));
      }
    } catch (err) {
      console.error("Failed to write schedule events:", err);
    } finally {
      setLoading(false);
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

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear your Copilot chat history?")) {
      setMessages([
        {
          sender: "copilot",
          text: "Hello! I am your ForeSee AI Copilot. I analyze your tasks, onboarding preferences, and calendar in real-time. Ask me 'How should I complete my tasks?' or 'Plan my coding project' and I will structure a focus schedule for you.",
          timestamp: new Date()
        }
      ]);
      if (user) {
        localStorage.removeItem(`copilot_messages_${user.uid}`);
      }
    }
  };

  return (
    <section className="page page-wide">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "24px", marginBottom: "32px" }}>
        <div style={{ flex: "1 1 500px" }}>
          <PageHeader 
            eyebrow="AI Copilot" 
            title="Ask what to do next." 
            description="ForeSee AI Copilot uses Gemini to reason about your priorities, avoid calendar conflicts, and dynamically structure focus events." 
          />
        </div>
        <div>
          <button className="button button-secondary" onClick={handleClearHistory} style={{ color: "var(--danger)", borderColor: "rgba(220,38,38,0.2)" }}>
            Clear chat history
          </button>
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
          <Check size={20} style={{ flexShrink: 0, marginTop: "2px" }} />
          <div>
            <strong style={{ fontSize: "15px", display: "block", marginBottom: "4px" }}>Status Notification</strong>
            <span style={{ fontSize: "13.5px" }}>{successMessage}</span>
          </div>
        </div>
      )}

      <div className="grid grid-3" style={{ gap: "32px", alignItems: "start" }}>
        {/* Chat Interface Column */}
        <div className="card card-pad" style={{ padding: "28px", gridColumn: "span 2", display: "flex", flexDirection: "column", height: "70vh", justifyContent: "space-between", background: "var(--surface)" }}>
          
          {/* Scrollable messages log */}
          <div style={{ overflowY: "auto", flex: 1, paddingRight: "8px", display: "flex", flexDirection: "column", gap: "20px", marginBottom: "20px" }}>
            {messages.map((msg, idx) => {
              const isCopilot = msg.sender === "copilot";
              return (
                <div key={idx} style={{ display: "flex", gap: "14px", alignItems: "flex-start", alignSelf: isCopilot ? "flex-start" : "flex-end", maxWidth: "85%" }}>
                  {isCopilot && (
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, var(--accent), var(--accent-2))", display: "grid", placeItems: "center", color: "white", flexShrink: 0 }}>
                      <Bot size={15} />
                    </div>
                  )}
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div 
                      style={{ 
                        background: isCopilot ? "var(--surface-soft)" : "var(--accent-soft)", 
                        color: "var(--text)", 
                        padding: "14px 20px", 
                        borderRadius: isCopilot ? "2px 14px 14px 14px" : "14px 14px 2px 14px",
                        fontSize: "14px",
                        lineHeight: "1.5",
                        border: isCopilot ? "1px solid var(--surface-line)" : "none"
                      }}
                    >
                      <strong style={{ color: isCopilot ? "var(--accent)" : "var(--text)", fontSize: "12px", display: "block", marginBottom: "4px" }}>
                        {isCopilot ? "ForeSee Assistant" : "You"}
                      </strong>
                      <span style={{ whiteSpace: "pre-line" }}>{msg.text}</span>
                    </div>

                    {/* Proposed Events Preview inside Copilot bubble */}
                    {isCopilot && msg.proposedEvents && msg.proposedEvents.length > 0 && (
                      <div className="card" style={{ padding: "18px", border: "1px solid var(--surface-line)", background: "var(--bg)", display: "flex", flexDirection: "column", gap: "14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--surface-line)", paddingBottom: "10px" }}>
                          <Calendar size={16} color="var(--accent)" />
                          <strong style={{ fontSize: "13px" }}>Proposed Focus Schedule Blocks</strong>
                        </div>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                          {msg.proposedEvents.map((evt, eIdx) => {
                            const startStr = new Date(evt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            const endStr = new Date(evt.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            const dateStr = new Date(evt.startTime).toLocaleDateString([], { month: 'short', day: 'numeric' });
                            
                            // Try to match the event with an existing task ID
                            const matchedTask = tasksList.find(t => 
                              evt.title.toLowerCase().includes(t.title.toLowerCase()) || 
                              t.title.toLowerCase().includes(evt.title.toLowerCase())
                            );
                            const taskIdToDisplay = matchedTask ? (matchedTask.taskId || matchedTask.id) : "Will generate";

                            return (
                              <div key={eIdx} style={{ padding: "12px", border: "1px solid var(--surface-line)", borderRadius: "8px", background: "var(--surface)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                                  <strong style={{ fontSize: "13.5px" }}>{evt.title}</strong>
                                  <span className="pill safe" style={{ fontSize: "9px" }}>{dateStr}</span>
                                </div>
                                <span className="muted" style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>Time Slot: {startStr} - {endStr}</span>
                                <span className="pill monitor" style={{ fontSize: "9px", display: "inline-block", marginBottom: "8px" }}>ID: {taskIdToDisplay}</span>
                                <p className="muted" style={{ fontSize: "12.5px", margin: 0 }}>{evt.description}</p>
                                
                                {evt.shiftRequired && (
                                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--warning)", marginTop: "10px", fontSize: "12px", fontWeight: 600 }}>
                                    <AlertTriangle size={12} />
                                    <span>Schedule Shift: Bump &quot;{evt.shiftedTaskTitle || 'lower priority'}&quot; deadline</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {msg.eventsAdded ? (
                          <div 
                            style={{ 
                              display: "flex", 
                              alignItems: "center", 
                              justifyContent: "center", 
                              gap: "8px", 
                              height: "38px", 
                              fontSize: "13px", 
                              fontWeight: 600,
                              color: "var(--success)",
                              background: "rgba(34, 197, 94, 0.08)",
                              border: "1px solid rgba(34, 197, 94, 0.18)",
                              borderRadius: "8px"
                            }}
                          >
                            Synced to Calendar ✓
                          </div>
                        ) : !hasCalendarToken ? (
                          <button 
                            onClick={handleAuthorizeCalendar}
                            className="button button-secondary" 
                            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", height: "38px", fontSize: "13px" }}
                          >
                            Authorize Google Calendar <ArrowRight size={14} />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleAddEvents(msg.proposedEvents!, idx)}
                            className="button button-primary" 
                            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", height: "38px", fontSize: "13px" }}
                          >
                            Add Events to Calendar <ArrowRight size={14} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {!isCopilot && (
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--surface-soft)", display: "grid", placeItems: "center", color: "var(--muted-strong)", flexShrink: 0 }}>
                      <User size={15} />
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, var(--accent), var(--accent-2))", display: "grid", placeItems: "center", color: "white", animation: "pulse 1.5s infinite" }}>
                  <Bot size={15} />
                </div>
                <span className="muted" style={{ fontWeight: 500 }}>ForeSee Copilot is analyzing scheduling windows and planning...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* User message input field */}
          <form onSubmit={handleSendMessage} style={{ borderTop: "1px solid var(--surface-line)", paddingTop: "20px" }}>
            <label className="label" style={{ marginBottom: "0" }}>
              <div style={{ position: "relative" }}>
                <textarea 
                  className="textarea" 
                  placeholder="Ask ForeSee to plan, shift tasks, or schedule events..." 
                  style={{ paddingRight: "60px", minHeight: "64px", maxHeight: "120px", resize: "none" }}
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
                <button 
                  type="submit"
                  disabled={loading || !inputText.trim()}
                  className="button button-primary" 
                  style={{ 
                    position: "absolute", 
                    bottom: "12px", 
                    right: "12px", 
                    width: "36px", 
                    height: "36px", 
                    borderRadius: "8px", 
                    padding: 0,
                    display: "grid",
                    placeItems: "center",
                    minHeight: "auto",
                    opacity: (!inputText.trim() || loading) ? 0.5 : 1
                  }}
                  aria-label="Send message"
                >
                  <Send size={15} />
                </button>
              </div>
            </label>
          </form>
        </div>

        {/* Sidebar Context Cards */}
        <div className="stack" style={{ gap: "20px" }}>
          <div className="card card-pad" style={{ padding: "20px", background: "var(--surface-soft)", border: "1px solid var(--surface-line)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <Sparkles size={16} color="var(--accent)" />
              <strong style={{ fontSize: "14px" }}>Schedule Intelligence</strong>
            </div>
            <p className="muted" style={{ lineHeight: "1.45", fontSize: "12.5px" }}>
              Try asking:
              <br />
              • <em>&quot;How should I complete my Coding task?&quot;</em>
              <br />
              • <em>&quot;What should I do first today?&quot;</em>
              <br />
              • <em>&quot;I am not available for task_1234 at 10 AM, reschedule it.&quot;</em>
            </p>
          </div>

          <div className="card card-pad" style={{ padding: "20px", border: "1px solid var(--surface-line)" }}>
            <h3 style={{ fontSize: "14px", marginBottom: "8px" }}>Active Keys Status</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12.5px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="muted">Primary Key:</span>
                <span style={{ color: "var(--success)", fontWeight: 600 }}>Active</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="muted">Rotation list:</span>
                <span className="muted">3 Keys Configured</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
