"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Laptop, Key, Database, Cpu, 
  Layers, Calendar, Play, RefreshCw, CheckCircle2 
} from "lucide-react";

interface LogEntry {
  time: string;
  text: string;
  type?: string;
}

export function SyncVisualizer() {
  const [activeSim, setActiveSim] = useState<string | null>(null);
  const [activeNodes, setActiveNodes] = useState<string[]>([]);
  const [activeLines, setActiveLines] = useState<string[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(true);

  const terminalBodyRef = useRef<HTMLDivElement | null>(null);
  const isMountedRef = useRef(true);
  const isAutoModeRef = useRef(true);

  // Keep ref in sync
  useEffect(() => {
    isAutoModeRef.current = isAutoMode;
    // If toggle is enabled, start run automatically if idle
    if (isAutoMode && !isSimulating && !isAutoRunning) {
      runAutoSequence();
    }
  }, [isAutoMode]);

  // Handle mount and unmount tracking
  useEffect(() => {
    isMountedRef.current = true;
    
    // Auto start on page load
    const startTimer = setTimeout(() => {
      if (isMountedRef.current && isAutoModeRef.current) {
        runAutoSequence();
      }
    }, 400);

    return () => {
      isMountedRef.current = false;
      clearTimeout(startTimer);
    };
  }, []);

  // Theme-responsive container-only auto-scroll (avoids parent page scrolling/jumping/flickering)
  useEffect(() => {
    const body = terminalBodyRef.current;
    if (body) {
      body.scrollTop = body.scrollHeight;
    }
  }, [logs]);

  const timestamp = () => {
    const d = new Date();
    const hrs = d.getHours().toString().padStart(2, "0");
    const mins = d.getMinutes().toString().padStart(2, "0");
    const secs = d.getSeconds().toString().padStart(2, "0");
    const ms = (d.getMilliseconds() / 10).toFixed(0).padStart(2, "0");
    return `[${hrs}:${mins}:${secs}.${ms}]`;
  };

  const runSimulation = (simType: string, onComplete?: () => void) => {
    if (isSimulating) return;
    setIsSimulating(true);
    setActiveSim(simType);
    setLogs([]);

    let steps: {
      log: string;
      nodes: string[];
      lines: string[];
      type?: string;
    }[] = [];

    if (simType === "auth") {
      steps = [
        { log: "🔑 Initializing Firebase Google OAuth sync...", nodes: ["client"], lines: [] },
        { log: "📡 Routing OAuth credentials through Google Identity Provider...", nodes: ["client"], lines: ["client-auth"] },
        { log: "🔐 Auth validation complete. User token successfully generated.", nodes: ["client", "auth"], lines: ["client-auth"] },
        { log: "✅ Auth session established. Profile data synced successfully.", nodes: ["client", "auth"], lines: ["client-auth"], type: "success" }
      ];
    } else if (simType === "firestore") {
      steps = [
        { log: "📦 Local state change captured: Task list priority recalibrated.", nodes: ["client"], lines: [] },
        { log: "⚡ Invoking write pipeline to Firestore node (us-central1)...", nodes: ["client"], lines: ["client-firestore"] },
        { log: "💾 Writing tasks, plans, and focus metrics documents to Firestore...", nodes: ["client", "firestore"], lines: ["client-firestore"] },
        { log: "✅ Transaction committed. Realtime UI synced successfully.", nodes: ["client", "firestore"], lines: ["client-firestore"], type: "success" }
      ];
    } else if (simType === "calendar") {
      steps = [
        { log: "📅 Triggering Google Calendar sync handler...", nodes: ["firestore"], lines: [] },
        { log: "🚀 Pub/Sub forwarding event payload to Cloud Run backend webhook...", nodes: ["firestore", "pubsub"], lines: ["firestore-pubsub"] },
        { log: "🔗 Resolving OAuth token and executing Google Calendar API patches...", nodes: ["firestore", "pubsub", "calendar"], lines: ["firestore-pubsub", "pubsub-calendar"] },
        { log: "✅ Calendar updated. Deep-work slots successfully mapped in Google Calendar.", nodes: ["firestore", "pubsub", "calendar"], lines: ["firestore-pubsub", "pubsub-calendar"], type: "success" }
      ];
    } else if (simType === "gemini") {
      steps = [
        { log: "🤖 Chat command: 'Organize next week to minimize context switching penalty'...", nodes: ["client"], lines: [] },
        { log: "🧠 Shipping task array and strictness settings to Gemini Pro model...", nodes: ["client", "gemini"], lines: ["client-gemini"] },
        { log: "💡 Gemini completed task parsing. Compiling focus schedule layout...", nodes: ["client", "gemini"], lines: ["client-gemini"] },
        { log: "💾 Writing structured agent schedules and risk levels to Firestore...", nodes: ["client", "gemini", "firestore"], lines: ["client-gemini", "gemini-firestore"] },
        { log: "✅ UI reactive rebuild complete. Focus blocks updated successfully.", nodes: ["client", "gemini", "firestore"], lines: ["client-gemini", "gemini-firestore"], type: "success" }
      ];
    }

    let i = 0;
    const executeStep = () => {
      if (!isMountedRef.current) return;
      if (i < steps.length) {
        const step = steps[i];
        setActiveNodes(step.nodes);
        setActiveLines(step.lines);
        setLogs((prev) => [...prev, { time: timestamp(), text: step.log, type: step.type }]);
        i++;
        setTimeout(executeStep, 1000);
      } else {
        setIsSimulating(false);
        setActiveSim(null);
        if (onComplete) {
          onComplete();
        }
      }
    };

    executeStep();
  };

  const runAutoSequence = () => {
    if (isSimulating || isAutoRunning || !isMountedRef.current || !isAutoModeRef.current) {
      return;
    }
    setIsAutoRunning(true);

    // Sequence chain with brief delays in between for clear visual path transitions
    runSimulation("auth", () => {
      if (!isMountedRef.current || !isAutoModeRef.current) {
        setIsAutoRunning(false);
        return;
      }
      setTimeout(() => {
        if (!isMountedRef.current || !isAutoModeRef.current) {
          setIsAutoRunning(false);
          return;
        }
        runSimulation("firestore", () => {
          if (!isMountedRef.current || !isAutoModeRef.current) {
            setIsAutoRunning(false);
            return;
          }
          setTimeout(() => {
            if (!isMountedRef.current || !isAutoModeRef.current) {
              setIsAutoRunning(false);
              return;
            }
            runSimulation("calendar", () => {
              if (!isMountedRef.current || !isAutoModeRef.current) {
                setIsAutoRunning(false);
                return;
              }
              setTimeout(() => {
                if (!isMountedRef.current || !isAutoModeRef.current) {
                  setIsAutoRunning(false);
                  return;
                }
                runSimulation("gemini", () => {
                  setIsAutoRunning(false);
                  // Loop back to start by calling runAutoSequence again if loop is still enabled!
                  if (isMountedRef.current && isAutoModeRef.current) {
                    setTimeout(() => {
                      if (isMountedRef.current && isAutoModeRef.current) {
                        runAutoSequence();
                      }
                    }, 1400);
                  }
                });
              }, 1200);
            });
          }, 1200);
        });
      }, 1200);
    });
  };

  const isNodeActive = (id: string) => activeNodes.includes(id);
  const isLineActive = (id: string) => activeLines.includes(id);

  return (
    <div className="sync-card">
      <div className="sync-header">
        <div>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>Google Cloud Sync Pipeline Simulator</h3>
          <p className="muted" style={{ margin: "2px 0 0 0", fontSize: "12px" }}>
            Select a pipeline to trigger mock GCP/Firebase data synchronization streams and logs.
          </p>
        </div>
        <div className="sync-actions" style={{ alignItems: "center" }}>
          <button 
            className={`sync-btn ${activeSim === "auth" ? "active" : ""}`}
            onClick={() => runSimulation("auth")}
            disabled={isSimulating || isAutoMode}
          >
            <Play size={10} />
            <span>OAuth Sync</span>
          </button>
          <button 
            className={`sync-btn ${activeSim === "firestore" ? "active" : ""}`}
            onClick={() => runSimulation("firestore")}
            disabled={isSimulating || isAutoMode}
          >
            <Play size={10} />
            <span>Firestore Write</span>
          </button>
          <button 
            className={`sync-btn ${activeSim === "calendar" ? "active" : ""}`}
            onClick={() => runSimulation("calendar")}
            disabled={isSimulating || isAutoMode}
          >
            <Play size={10} />
            <span>Calendar Push</span>
          </button>
          <button 
            className={`sync-btn ${activeSim === "gemini" ? "active" : ""}`}
            onClick={() => runSimulation("gemini")}
            disabled={isSimulating || isAutoMode}
          >
            <Play size={10} />
            <span>Gemini AI Parse</span>
          </button>

          <div style={{ width: "1px", height: "14px", background: "var(--surface-line)", margin: "0 4px" }}></div>

          {isAutoMode ? (
            <button 
              className="sync-btn active"
              onClick={() => setIsAutoMode(false)}
              style={{ borderColor: "var(--warning)" }}
            >
              <span className="relative flex h-2 w-2 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span>Pause Loop</span>
            </button>
          ) : (
            <button 
              className="sync-btn"
              onClick={() => setIsAutoMode(true)}
              disabled={isSimulating}
              style={{ borderColor: "var(--accent)" }}
            >
              <Play size={10} style={{ color: "var(--accent)" }} />
              <span>Resume Loop</span>
            </button>
          )}
        </div>
      </div>

      {/* SVG Pipeline Canvas */}
      <div className="sync-canvas-wrapper">
        <svg viewBox="0 0 800 220" className="sync-canvas">
          {/* SVG Definitions */}
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--surface-line)" />
            </marker>
          </defs>

          {/* Pipelines Lines */}
          {/* Client -> Auth */}
          <path 
            d="M 160 110 Q 220 50, 280 50" 
            className={`sync-line ${isLineActive("client-auth") ? "sync-line-active flow-orange" : ""}`} 
          />
          {/* Client -> Firestore */}
          <path 
            d="M 160 110 Q 220 170, 280 170" 
            className={`sync-line ${isLineActive("client-firestore") ? "sync-line-active flow-red" : ""}`} 
          />
          {/* Client -> Gemini */}
          <path 
            d="M 160 110 C 260 110, 420 10, 500 50" 
            className={`sync-line ${isLineActive("client-gemini") ? "sync-line-active flow-purple" : ""}`} 
          />
          {/* Gemini -> Firestore */}
          <path 
            d="M 500 50 Q 420 170, 400 170" 
            className={`sync-line ${isLineActive("gemini-firestore") ? "sync-line-active flow-red" : ""}`} 
          />
          {/* Firestore -> Cloud Run/PubSub */}
          <path 
            d="M 400 170 L 500 170" 
            className={`sync-line ${isLineActive("firestore-pubsub") ? "sync-line-active flow-green" : ""}`} 
          />
          {/* Cloud Run/PubSub -> Calendar */}
          <path 
            d="M 620 170 Q 670 110, 680 110" 
            className={`sync-line ${isLineActive("pubsub-calendar") ? "sync-line-active flow-cyan" : ""}`} 
          />

          {/* Node 1: Client UI */}
          <g className={`sync-node-group node-client ${isNodeActive("client") ? "node-active" : ""}`} onClick={() => runSimulation("firestore")}>
            <rect x="40" y="85" width="120" height="50" className="sync-node-rect" />
            <rect x="50" y="95" width="30" height="30" rx="6" className="sync-node-icon-bg" />
            <foreignObject x="57" y="102" width="16" height="16">
              <Laptop size={16} style={{ color: isNodeActive("client") ? "var(--accent)" : "var(--muted)" }} />
            </foreignObject>
            <text x="90" y="110" className="sync-node-title">Client App</text>
            <text x="90" y="122" className="sync-node-subtitle">Next.js UI</text>
          </g>

          {/* Node 2: Firebase Auth */}
          <g className={`sync-node-group node-auth ${isNodeActive("auth") ? "node-active" : ""}`} onClick={() => runSimulation("auth")}>
            <rect x="280" y="25" width="120" height="50" className="sync-node-rect" />
            <rect x="290" y="35" width="30" height="30" rx="6" className="sync-node-icon-bg" />
            <foreignObject x="297" y="42" width="16" height="16">
              <Key size={16} style={{ color: isNodeActive("auth") ? "#f59e0b" : "var(--muted)" }} />
            </foreignObject>
            <text x="330" y="50" className="sync-node-title">Firebase Auth</text>
            <text x="330" y="62" className="sync-node-subtitle">Google OAuth</text>
          </g>

          {/* Node 3: Firestore DB */}
          <g className={`sync-node-group node-firestore ${isNodeActive("firestore") ? "node-active" : ""}`} onClick={() => runSimulation("firestore")}>
            <rect x="280" y="145" width="120" height="50" className="sync-node-rect" />
            <rect x="290" y="155" width="30" height="30" rx="6" className="sync-node-icon-bg" />
            <foreignObject x="297" y="162" width="16" height="16">
              <Database size={16} style={{ color: isNodeActive("firestore") ? "#ef4444" : "var(--muted)" }} />
            </foreignObject>
            <text x="330" y="170" className="sync-node-title">Firestore DB</text>
            <text x="330" y="182" className="sync-node-subtitle">Realtime DB</text>
          </g>

          {/* Node 4: Gemini Core */}
          <g className={`sync-node-group node-gemini ${isNodeActive("gemini") ? "node-active" : ""}`} onClick={() => runSimulation("gemini")}>
            <rect x="500" y="25" width="120" height="50" className="sync-node-rect" />
            <rect x="510" y="35" width="30" height="30" rx="6" className="sync-node-icon-bg" />
            <foreignObject x="517" y="42" width="16" height="16">
              <Cpu size={16} style={{ color: isNodeActive("gemini") ? "#8b5cf6" : "var(--muted)" }} />
            </foreignObject>
            <text x="550" y="50" className="sync-node-title">Gemini AI</text>
            <text x="550" y="62" className="sync-node-subtitle">Parser API</text>
          </g>

          {/* Node 5: Pub/Sub Webhooks */}
          <g className={`sync-node-group node-pubsub ${isNodeActive("pubsub") ? "node-active" : ""}`} onClick={() => runSimulation("calendar")}>
            <rect x="500" y="145" width="120" height="50" className="sync-node-rect" />
            <rect x="510" y="155" width="30" height="30" rx="6" className="sync-node-icon-bg" />
            <foreignObject x="517" y="162" width="16" height="16">
              <Layers size={16} style={{ color: isNodeActive("pubsub") ? "#10b981" : "var(--muted)" }} />
            </foreignObject>
            <text x="550" y="170" className="sync-node-title">Pub/Sub Engine</text>
            <text x="550" y="182" className="sync-node-subtitle">Cloud Run Webhooks</text>
          </g>

          {/* Node 6: Google Calendar */}
          <g className={`sync-node-group node-calendar ${isNodeActive("calendar") ? "node-active" : ""}`} onClick={() => runSimulation("calendar")}>
            <rect x="640" y="85" width="120" height="50" className="sync-node-rect" />
            <rect x="650" y="95" width="30" height="30" rx="6" className="sync-node-icon-bg" />
            <foreignObject x="657" y="102" width="16" height="16">
              <Calendar size={16} style={{ color: isNodeActive("calendar") ? "var(--accent-2)" : "var(--muted)" }} />
            </foreignObject>
            <text x="690" y="110" className="sync-node-title">Google Calendar</text>
            <text x="690" y="122" className="sync-node-subtitle">Calendar REST API</text>
          </g>
        </svg>
      </div>

      {/* TERMINAL mock console */}
      <div className="sync-terminal">
        <div className="terminal-bar">
          <div className="terminal-dots">
            <span className="terminal-dot dot-red"></span>
            <span className="terminal-dot dot-yellow"></span>
            <span className="terminal-dot dot-green"></span>
          </div>
          <span className="terminal-title">Infrastructure Event Logger</span>
          <span style={{ width: "38px" }}></span>
        </div>
        <div className="terminal-body" ref={terminalBodyRef}>
          {logs.length === 0 ? (
            <div className="terminal-log-row" style={{ color: "var(--muted)" }}>
              <span>[00:00:00.00]</span>
              <span>System idling. Propose sync simulation to begin routing data.</span>
            </div>
          ) : (
            logs.map((log, idx) => (
              <div className="terminal-log-row" key={idx}>
                <span className="log-time">{log.time}</span>
                <span className={`log-text ${log.type === "success" ? "log-success" : ""}`}>
                  {log.text}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
