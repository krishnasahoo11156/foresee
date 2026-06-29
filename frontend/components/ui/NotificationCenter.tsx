"use client";

import { useState, useEffect } from "react";
import { 
  Bell, AlertTriangle, Info, Trash2, Shield, 
  Settings, Cloud, Laptop, MessageSquare, Play, X, Mail, Database
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

interface AlertItem {
  id: number;
  type: "critical" | "warning" | "info";
  category: string;
  text: string;
  time: string;
  isUnread: boolean;
}

interface ToastItem {
  id: number;
  text: string;
  type: "critical" | "warning" | "info";
  isSlidingOut?: boolean;
}

export function NotificationCenter() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: 1,
      type: "critical",
      category: "Risk Engine",
      text: "Launch brief crossed critical risk threshold.",
      time: "10m ago",
      isUnread: true
    },
    {
      id: 2,
      type: "warning",
      category: "FCM Dispatch",
      text: "Calendar sync task has a new blocker: OAuth consent screen missing test user.",
      time: "1h ago",
      isUnread: false
    },
    {
      id: 3,
      type: "info",
      category: "Scheduler",
      text: "Plan stability improved after accepting focused sprint rescue.",
      time: "1d ago",
      isUnread: false
    }
  ]);

  // Preference Settings States
  const [enablePush, setEnablePush] = useState(true);
  const [enableEmail, setEnableEmail] = useState(true);
  const [enableSMS, setEnableSMS] = useState(false);
  const [quietHours, setQuietHours] = useState(true);

  // Cloud FCM pipeline simulation states
  const [simStep, setSimStep] = useState(0); // 0: idle, 1: firestore, 2: functions, 3: fcm, 4: client
  const [isSimulating, setIsSimulating] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const handleSimulateTrigger = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimStep(1);

    // Run SVG flow step intervals
    const durations = [800, 800, 800, 800];
    let currentStep = 1;

    const executeNextStep = () => {
      if (currentStep < 4) {
        currentStep++;
        setSimStep(currentStep);
        setTimeout(executeNextStep, durations[currentStep - 1]);
      } else {
        // Step 4 finished - Deliver Notification!
        const newId = Date.now();
        const alertText = "⚠️ CRITICAL DELAY: Walkthrough recording has slipped to +6.8h. Auto-rescue dispatched.";
        
        // 1. Add to active in-app alerts list
        setAlerts(prev => [
          {
            id: newId,
            type: "critical",
            category: "Risk Engine",
            text: alertText,
            time: "Just now",
            isUnread: true
          },
          ...prev
        ]);

        // 2. Add floating browser HUD toast if Push Notifications are enabled
        if (enablePush) {
          const toastObj: ToastItem = {
            id: newId,
            text: alertText,
            type: "critical"
          };
          setToasts(prev => [...prev, toastObj]);

          // Trigger slide-out animation before removing
          setTimeout(() => {
            setToasts(prev => prev.map(t => t.id === newId ? { ...t, isSlidingOut: true } : t));
          }, 4000);

          // Clean up toast item from overlay list after slide-out finishes
          setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== newId));
          }, 4400);
        }

        // 3. Dispatch POST email request if enabled
        if (enableEmail) {
          const recipientEmail = user?.email || "krishna.sahoo@foresee.com";
          const recipientName = user?.displayName || "Krish Sahoo";

          fetch("/api/send-email", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              to: recipientEmail,
              subject: "⚠️ FORESEE CRITICAL RISK ALERT",
              text: alertText,
              userName: recipientName
            })
          })
          .then(res => res.json())
          .then(data => {
            setAlerts(prev => [
              {
                id: Date.now() + 1,
                type: "info",
                category: "Email Dispatch",
                text: `📧 Email alert dispatched to: ${recipientEmail} (${data.mode === 'real' ? 'Delivered via Resend API' : 'Logged to server console terminal'})`,
                time: "Just now",
                isUnread: false
              },
              ...prev
            ]);
          })
          .catch(err => {
            console.error("Failed to dispatch email:", err);
          });
        }

        // Reset simulator
        setIsSimulating(false);
        setSimStep(0);
      }
    };

    setTimeout(executeNextStep, durations[0]);
  };

  const handleDismiss = (id: number) => {
    setAlerts(prev => prev.filter(item => item.id !== id));
  };

  const handleMarkAllRead = () => {
    setAlerts(prev => prev.map(item => ({ ...item, isUnread: false })));
  };

  const handleDismissToast = (id: number) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, isSlidingOut: true } : t));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 400);
  };

  return (
    <div className="nc-card">
      
      {/* Dynamic Browser Overlay HUD Toast Notifications */}
      <div className="nc-toast-container">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className={`nc-toast-card ${toast.isSlidingOut ? "slide-out" : ""}`}
          >
            <div 
              style={{ 
                width: "28px", 
                height: "28px", 
                borderRadius: "6px", 
                background: "rgba(220, 38, 38, 0.1)", 
                display: "grid", 
                placeItems: "center", 
                color: "var(--danger)",
                flexShrink: 0
              }}
            >
              <AlertTriangle size={14} />
            </div>
            <div style={{ flex: 1 }}>
              <strong style={{ fontSize: "12.5px", color: "var(--danger)" }}>Critical Alert (FCM)</strong>
              <p className="muted" style={{ margin: "2px 0 0", fontSize: "11.5px", lineHeight: "1.3" }}>
                {toast.text}
              </p>
            </div>
            <button 
              className="nc-dismiss-btn" 
              onClick={() => handleDismissToast(toast.id)}
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>

      {/* TOP SECTION: GCP CLOUD FCM SIMULATOR */}
      <div className="nc-flow-panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "16px" }}>
          <div>
            <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
              <Cloud size={16} style={{ color: "var(--accent)" }} />
              GCP / Firebase Push Notification Delivery Flow
            </h4>
            <p className="muted" style={{ margin: "2px 0 0 0", fontSize: "11.5px" }}>
              Simulate Firestore writing a task change, triggering Cloud Functions, and routing via Firebase Cloud Messaging.
            </p>
          </div>
          <button 
            className="mc-run-btn"
            onClick={handleSimulateTrigger}
            disabled={isSimulating}
          >
            <Play size={10} />
            <span>{isSimulating ? "Simulating Cloud Trigger..." : "Simulate Cloud Trigger"}</span>
          </button>
        </div>

        {/* SVG FCM Pipeline */}
        <svg viewBox="0 0 600 130" className="seq-canvas" style={{ minHeight: "130px" }}>
          <defs>
            <marker id="flow-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--surface-line)" />
            </marker>
            <marker id="flow-arrow-active" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--accent)" />
            </marker>
          </defs>

          {/* Pipelines lines */}
          <line 
            x1="120" y1="50" x2="180" y2="50" 
            className={`nc-flow-line ${simStep === 1 ? "nc-flow-line-active flow-red" : ""}`}
            markerEnd={simStep === 1 ? "url(#flow-arrow-active)" : "url(#flow-arrow)"}
            style={{ stroke: simStep === 1 ? "var(--danger)" : "" }}
          />
          <line 
            x1="280" y1="50" x2="340" y2="50" 
            className={`nc-flow-line ${simStep === 2 ? "nc-flow-line-active flow-purple" : ""}`}
            markerEnd={simStep === 2 ? "url(#flow-arrow-active)" : "url(#flow-arrow)"}
            style={{ stroke: simStep === 2 ? "#8b5cf6" : "" }}
          />
          <line 
            x1="440" y1="50" x2="500" y2="50" 
            className={`nc-flow-line ${simStep === 3 ? "nc-flow-line-active flow-blue" : ""}`}
            markerEnd={simStep === 3 ? "url(#flow-arrow-active)" : "url(#flow-arrow)"}
            style={{ stroke: simStep === 3 ? "var(--accent)" : "" }}
          />

          {/* Node 1: Firestore */}
          <g className={`nc-flow-node ${simStep === 1 ? "nc-flow-node-active node-firestore" : ""}`}>
            <rect x="20" y="25" width="100" height="50" className="nc-flow-node-rect" />
            <foreignObject x="30" y="35" width="14" height="14">
              <Database size={14} style={{ color: simStep === 1 ? "var(--danger)" : "var(--muted)" }} />
            </foreignObject>
            <text x="68" y="48" className="nc-flow-text" textAnchor="middle">Firestore</text>
            <text x="68" y="60" className="nc-flow-text" textAnchor="middle" style={{ fontSize: "7px", opacity: 0.6 }}>Task Risk {">"} 80%</text>
          </g>

          {/* Node 2: Cloud Functions */}
          <g className={`nc-flow-node ${simStep === 2 ? "nc-flow-node-active node-functions" : ""}`}>
            <rect x="180" y="25" width="100" height="50" className="nc-flow-node-rect" />
            <foreignObject x="190" y="35" width="14" height="14">
              <Cloud size={14} style={{ color: simStep === 2 ? "#8b5cf6" : "var(--muted)" }} />
            </foreignObject>
            <text x="230" y="48" className="nc-flow-text" textAnchor="middle">Cloud Funcs</text>
            <text x="230" y="60" className="nc-flow-text" textAnchor="middle" style={{ fontSize: "7px", opacity: 0.6 }}>onCreate Trigger</text>
          </g>

          {/* Node 3: FCM Server */}
          <g className={`nc-flow-node ${simStep === 3 ? "nc-flow-node-active node-fcm" : ""}`}>
            <rect x="340" y="25" width="100" height="50" className="nc-flow-node-rect" />
            <foreignObject x="350" y="35" width="14" height="14">
              <MessageSquare size={14} style={{ color: simStep === 3 ? "#ffca28" : "var(--muted)" }} />
            </foreignObject>
            <text x="390" y="48" className="nc-flow-text" textAnchor="middle">Firebase FCM</text>
            <text x="390" y="60" className="nc-flow-text" textAnchor="middle" style={{ fontSize: "7px", opacity: 0.6 }}>Push Broadcast</text>
          </g>

          {/* Node 4: Web Client */}
          <g className={`nc-flow-node ${simStep === 4 ? "nc-flow-node-active node-client" : ""}`}>
            <rect x="500" y="25" width="80" height="50" className="nc-flow-node-rect" />
            <foreignObject x="510" y="35" width="14" height="14">
              <Laptop size={14} style={{ color: simStep === 4 ? "var(--accent)" : "var(--muted)" }} />
            </foreignObject>
            <text x="540" y="48" className="nc-flow-text" textAnchor="middle">Web Client</text>
            <text x="540" y="60" className="nc-flow-text" textAnchor="middle" style={{ fontSize: "7px", opacity: 0.6 }}>HUD Toast Popup</text>
          </g>
        </svg>

        {/* Running Simulation status display */}
        {isSimulating && (
          <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--accent)", textAlign: "center", marginTop: "8px", animation: "pulse 1.5s infinite" }}>
            {simStep === 1 && "⚡ Step 1: Evaluating write changes in Firestore..."}
            {simStep === 2 && "🚀 Step 2: Google Cloud Function triggered. Routing Pub/Sub payloads..."}
            {simStep === 3 && "📡 Step 3: FCM server identifying client push tokens and broadcasting Webpush..."}
            {simStep === 4 && "✓ Step 4: Notification packet delivered to browser. HUD trigger active."}
          </div>
        )}
      </div>

      {/* BOTTOM LAYOUT SPLIT */}
      <div className="nc-layout-split">
        {/* PREF 1: IN-APP ALERTS LOG LIST */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
              <Bell size={16} style={{ color: "var(--accent)" }} />
              Notification Inbox ({alerts.filter(a => a.isUnread).length} unread)
            </h4>
            {alerts.length > 0 && (
              <button 
                className="seq-btn" 
                style={{ padding: "4px 8px", fontSize: "10.5px" }}
                onClick={handleMarkAllRead}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="nc-list">
            {alerts.length === 0 ? (
              <div style={{ padding: "32px", textAlign: "center", border: "1px dashed var(--surface-line)", borderRadius: "8px" }}>
                <span className="muted" style={{ fontSize: "12.5px" }}>Inbox empty. Simulating a Cloud Trigger will push new alerts here.</span>
              </div>
            ) : (
              alerts.map(item => {
                const borderClass = item.type === "critical" ? "nc-border-critical" :
                                    item.type === "warning" ? "nc-border-warning" : "nc-border-info";
                const bgClass = item.type === "critical" ? "nc-bg-critical" :
                                item.type === "warning" ? "nc-bg-warning" : "nc-bg-info";

                return (
                  <div 
                    key={item.id} 
                    className={`nc-item-row ${item.isUnread ? "unread" : ""} ${borderClass}`}
                  >
                    <div className={`nc-item-icon-wrapper ${bgClass}`}>
                      {item.type === "critical" ? <AlertTriangle size={15} /> : <Bell size={15} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "10px" }}>
                        <span style={{ fontSize: "10px", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>
                          {item.category}
                        </span>
                        <span className="muted" style={{ fontSize: "10px" }}>{item.time}</span>
                      </div>
                      <p className="muted" style={{ margin: "2px 0 0 0", fontSize: "12px", lineHeight: "1.4", color: item.isUnread ? "var(--text)" : "var(--muted-strong)" }}>
                        {item.text}
                      </p>
                    </div>
                    <button 
                      className="nc-dismiss-btn"
                      onClick={() => handleDismiss(item.id)}
                      title="Dismiss alert"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* PREF 2: QUIET HOURS & CHANNELS CONFIG */}
        <div>
          <h4 className="nc-section-title">
            <Settings size={16} style={{ color: "var(--accent)" }} />
            Notification Policy Config
          </h4>
          <div className="nc-config-card">
            
            {/* Preference: Push Notification */}
            <div className="nc-preference-row">
              <div className="nc-pref-info">
                <span className="nc-pref-label">Web Browser Push Notifications</span>
                <span className="nc-pref-desc">Fires sliding desktop HUD toasts on screen.</span>
              </div>
              <div style={{ display: "flex" }}>
                <input 
                  type="checkbox" 
                  id="enable-push" 
                  className="nc-switch-input"
                  checked={enablePush}
                  onChange={(e) => setEnablePush(e.target.checked)}
                />
                <label htmlFor="enable-push" className="nc-switch-label" />
              </div>
            </div>

            {/* Preference: Email Summaries */}
            <div className="nc-preference-row">
              <div className="nc-pref-info">
                <span className="nc-pref-label">Escalation Email Dispatches</span>
                <span className="nc-pref-desc">Sends recovery plans directly to inbox.</span>
              </div>
              <div style={{ display: "flex" }}>
                <input 
                  type="checkbox" 
                  id="enable-email" 
                  className="nc-switch-input"
                  checked={enableEmail}
                  onChange={(e) => setEnableEmail(e.target.checked)}
                />
                <label htmlFor="enable-email" className="nc-switch-label" />
              </div>
            </div>

            {/* Preference: SMS Alerts */}
            <div className="nc-preference-row">
              <div className="nc-pref-info">
                <span className="nc-pref-label">SMS Emergency Paging</span>
                <span className="nc-pref-desc">Pagers Krish Sahoo phone on severe blockages.</span>
              </div>
              <div style={{ display: "flex" }}>
                <input 
                  type="checkbox" 
                  id="enable-sms" 
                  className="nc-switch-input"
                  checked={enableSMS}
                  onChange={(e) => setEnableSMS(e.target.checked)}
                />
                <label htmlFor="enable-sms" className="nc-switch-label" />
              </div>
            </div>

            {/* Preference: Quiet Hours */}
            <div 
              style={{ 
                borderTop: "1px solid var(--surface-line)", 
                paddingTop: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "12px"
              }}
            >
              <div className="nc-preference-row">
                <div className="nc-pref-info">
                  <span className="nc-pref-label">Quiet Hours Blockage</span>
                  <span className="nc-pref-desc">Mute all Level 1/2 dispatches between 22:00 - 07:00.</span>
                </div>
                <div style={{ display: "flex" }}>
                  <input 
                    type="checkbox" 
                    id="quiet-hours" 
                    className="nc-switch-input"
                    checked={quietHours}
                    onChange={(e) => setQuietHours(e.target.checked)}
                  />
                  <label htmlFor="quiet-hours" className="nc-switch-label" />
                </div>
              </div>

              <div 
                style={{ 
                  display: "flex", 
                  gap: "8px", 
                  alignItems: "center", 
                  fontSize: "11px", 
                  color: "var(--muted-strong)",
                  background: "var(--surface)", 
                  padding: "8px 12px", 
                  borderRadius: "6px",
                  border: "1px solid var(--surface-line)"
                }}
              >
                <Shield size={12} style={{ color: "var(--accent)", flexShrink: 0 }} />
                <span>
                  {quietHours ? (
                    <strong>Enabled:</strong>
                  ) : (
                    <strong>Deactivated:</strong>
                  )}{" "}
                  Level 3 critical exceptions bypass quiet hours to guarantee calendar safety.
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
      
    </div>
  );
}
