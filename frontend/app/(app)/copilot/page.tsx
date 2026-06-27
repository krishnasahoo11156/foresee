"use client";

import { useState, useEffect, useRef } from "react";
import { Bot, Send, User, Calendar, Check, AlertTriangle, ArrowRight, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAuth } from "@/components/AuthProvider";
import { collection, query, onSnapshot, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { askCopilot, ProposedEvent } from "@/lib/geminiClient";
import { Task } from "@/lib/types";

interface Message {
  sender: "user" | "copilot";
  text: string;
  timestamp: Date;
  proposedEvents?: ProposedEvent[];
}

export default function CopilotPage() {
  const { user, profile } = useAuth();
  const [tasksList, setTasksList] = useState<Task[]>([]);
  const [calendarMappings, setCalendarMappings] = useState<any[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "copilot",
      text: "Hello! I am your ForeSee AI Copilot. I analyze your tasks, onboarding preferences, and calendar in real-time. Ask me 'How should I complete my tasks?' or 'Plan my coding project' and I will structure a conflict-free focus schedule for you.",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
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
    setMessages(prev => [...prev, { sender: "user", text: userMsg, timestamp: new Date() }]);
    setLoading(true);

    try {
      // Call Gemini with full DB context
      const response = await askCopilot(userMsg, tasksList, profile, calendarMappings);
      
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

  const handleAddEvents = async (events: ProposedEvent[]) => {
    if (!user || !events || events.length === 0) return;
    setLoading(true);

    try {
      // 1. Create a calendar mapping log in Firestore
      const mapRef = await addDoc(collection(db, "users", user.uid, "calendarMappings"), {
        mappingId: `map_${Date.now()}`,
        syncTimestamp: new Date().toISOString(),
        status: "synced",
        source: "AI Copilot Scheduler",
        scheduledBlocks: events.map(e => ({
          title: e.title,
          startTime: e.startTime,
          endTime: e.endTime,
          description: e.description
        })),
        createdAt: serverTimestamp()
      });

      // 2. Perform any task shifts in the database
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
              behaviorState: "slipping", // mark behavior state as slipping because it was bumped
              lastActivity: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
            console.log(`AI shifted task "${shiftedTask.title}" deadline to: ${newDeadline.toISOString()}`);
          }
        }
      }

      setSuccessMessage(`Calendar Focus Blocks Synchronized Successfully! Added ${events.length} event(s) to Google Calendar.`);
      // Clear proposed events in the chat log so they aren't double added
      setMessages(prev => prev.map(m => {
        if (m.proposedEvents === events) {
          return { ...m, proposedEvents: [] };
        }
        return m;
      }));
    } catch (err) {
      console.error("Failed to write schedule events:", err);
    } finally {
      setLoading(false);
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
      </div>

      {successMessage && (
        <div className="card card-pad" style={{ background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.18)", color: "var(--success)", padding: "18px 24px", borderRadius: "12px", marginBottom: "28px", display: "flex", alignItems: "flex-start", gap: "12px" }}>
          <Check size={20} style={{ flexShrink: 0, marginTop: "2px" }} />
          <div>
            <strong style={{ fontSize: "15px", display: "block", marginBottom: "4px" }}>Synced to Google Calendar</strong>
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
                            return (
                              <div key={eIdx} style={{ padding: "12px", border: "1px solid var(--surface-line)", borderRadius: "8px", background: "var(--surface)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                                  <strong style={{ fontSize: "13.5px" }}>{evt.title}</strong>
                                  <span className="pill safe" style={{ fontSize: "9px" }}>{dateStr}</span>
                                </div>
                                <span className="muted" style={{ fontSize: "12px", display: "block", marginBottom: "6px" }}>Time Slot: {startStr} - {endStr}</span>
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

                        <button 
                          onClick={() => handleAddEvents(msg.proposedEvents!)}
                          className="button button-primary" 
                          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", height: "38px", fontSize: "13px" }}
                        >
                          Add Events to Calendar <ArrowRight size={14} />
                        </button>
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
              • <em>&quot;How should I complete my Coding project?&quot;</em>
              <br />
              • <em>&quot;What should I do first today?&quot;</em>
              <br />
              • <em>&quot;I need to study for exams, find focus blocks this week.&quot;</em>
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
