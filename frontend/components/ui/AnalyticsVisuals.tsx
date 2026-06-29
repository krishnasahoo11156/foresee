"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  TrendingUp, Calendar, AlertTriangle, Info, Clock, 
  Activity, ArrowRight, ShieldCheck, RefreshCw 
} from "lucide-react";
import { Task } from "@/lib/types";

interface AnalyticsVisualsProps {
  tasks: Task[];
  profile: any;
}

interface VectorItem {
  id: number;
  title: string;
  category: string;
  startDay: number;
  endDay: number;
  startDev: number;
  endDev: number;
  tone: "blue" | "orange" | "red" | "green" | "purple";
  status: string;
  velocity: number;
  deadline: string;
}

interface HeatmapCell {
  dayIndex: number;
  timeIndex: number;
  risk: number; // 0: healthy, 1: focus block, 2: monitor risk, 3: critical risk
  tasks: string[];
  switchingPenalty: number;
}

export function AnalyticsVisuals({ tasks, profile }: AnalyticsVisualsProps) {
  const [activeTab, setActiveTab] = useState<"trajectory" | "heatmap" | "risk">("trajectory");
  const [hoveredVector, setHoveredVector] = useState<number | null>(0); // Default to first item
  const [hoveredCell, setHoveredCell] = useState<{ day: number; time: number } | null>({ day: 1, time: 3 }); // Default cell
  const [isAutoCycling, setIsAutoCycling] = useState(true);

  // 1. Vector Trajectory Data definition
  const vectors: VectorItem[] = useMemo(() => [
    {
      id: 0,
      title: "Finalize hackathon launch brief",
      category: "Submission",
      startDay: 1,
      endDay: 4,
      startDev: 0,
      endDev: 4.8,
      tone: "red",
      status: "Critical delay due to cross-functional dependency blocks.",
      velocity: 0.64,
      deadline: "Today, 8:00 PM"
    },
    {
      id: 1,
      title: "Test Google Calendar rescue sync",
      category: "Integration",
      startDay: 2,
      endDay: 6,
      startDev: 0,
      endDev: 2.2,
      tone: "orange",
      status: "Slight slippage (OAuth refresh pathway validation pending).",
      velocity: 0.86,
      deadline: "Tomorrow, 11:00 AM"
    },
    {
      id: 2,
      title: "Review agent prompt library",
      category: "Agents",
      startDay: 3,
      endDay: 8,
      startDev: 0,
      endDev: -2.0,
      tone: "green",
      status: "Pacing early. Prompt cache hit rates exceeding 92%.",
      velocity: 1.15,
      deadline: "Monday, 5:00 PM"
    },
    {
      id: 3,
      title: "Record 4-minute product walkthrough",
      category: "Demo",
      startDay: 5,
      endDay: 9,
      startDev: 0,
      endDev: 6.8,
      tone: "red",
      status: "Major blocker. Awaiting final frontend UI QA approve state.",
      velocity: 0.52,
      deadline: "Wednesday, 7:30 PM"
    },
    {
      id: 4,
      title: "Risk Engine model formulas check",
      category: "Simulation",
      startDay: 4,
      endDay: 7,
      startDev: 0,
      endDev: 0,
      tone: "blue",
      status: "Synchronized pacing. Zero timeline deviations recorded.",
      velocity: 1.0,
      deadline: "Thursday, 12:00 PM"
    }
  ], []);

  // 2. Heatmap Grid Matrix (7 days x 7 time blocks)
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const timeBlocks = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"];

  const heatmapMatrix: HeatmapCell[][] = useMemo(() => {
    return daysOfWeek.map((_, dIdx) => {
      return timeBlocks.map((_, tIdx) => {
        // Setup fixed realistic risk densities for dashboard visuals
        let risk = 0;
        let cellTasks: string[] = [];
        let switchingPenalty = 0;

        if (dIdx === 0 && tIdx === 2) {
          risk = 2;
          cellTasks = ["Launch brief check-in", "Rescue sync sync"];
          switchingPenalty = 42;
        } else if (dIdx === 1 && tIdx === 3) {
          risk = 3;
          cellTasks = ["OAuth pathway debug", "Risk formulas walkthrough", "Review prompt library"];
          switchingPenalty = 84;
        } else if (dIdx === 2 && tIdx === 1) {
          risk = 1;
          cellTasks = ["Focused Sprint Deep Work"];
          switchingPenalty = 5;
        } else if (dIdx === 3 && tIdx === 4) {
          risk = 2;
          cellTasks = ["Simulation QA dry run", "Status write"];
          switchingPenalty = 38;
        } else if (dIdx === 4 && tIdx === 3) {
          risk = 3;
          cellTasks = ["Walkthrough recording dry run", "GCP wiring mapping review"];
          switchingPenalty = 78;
        } else if (dIdx === 4 && tIdx === 1) {
          risk = 1;
          cellTasks = ["Deep Work: Onboarding flow check"];
          switchingPenalty = 8;
        } else if ((dIdx === 2 || dIdx === 3) && tIdx === 0) {
          risk = 1;
          cellTasks = ["Morning Sync & Planning"];
          switchingPenalty = 12;
        }

        return {
          dayIndex: dIdx,
          timeIndex: tIdx,
          risk,
          tasks: cellTasks,
          switchingPenalty
        };
      });
    });
  }, [daysOfWeek, timeBlocks]);

  // 3. Historical Risk Tracker (7 days data)
  const historicalRisk = useMemo(() => [
    { day: "Mon", value: 42, alerts: 1 },
    { day: "Tue", value: 55, alerts: 2 },
    { day: "Wed", value: 38, alerts: 0 },
    { day: "Thu", value: 78, alerts: 3 },
    { day: "Fri", value: 82, alerts: 4 },
    { day: "Sat", value: 52, alerts: 1 },
    { day: "Sun", value: 64, alerts: 2 }
  ], []);

  // Compute Bezier spline area path for risk values 0..100 mapping to SVG Y = 200..30
  const splinePath = useMemo(() => {
    const coords = historicalRisk.map((item, idx) => {
      const x = 70 + idx * 105;
      const y = 200 - (item.value / 100) * 160;
      return { x, y };
    });

    let d = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const curr = coords[i];
      const next = coords[i + 1];
      const cpX1 = curr.x + 45;
      const cpY1 = curr.y;
      const cpX2 = next.x - 45;
      const cpY2 = next.y;
      d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${next.x} ${next.y}`;
    }

    const areaD = `${d} L ${coords[coords.length - 1].x} 200 L ${coords[0].x} 200 Z`;
    const lineD = d;
    return { area: areaD, line: lineD, coords };
  }, [historicalRisk]);

  const activeVectorData = hoveredVector !== null ? vectors[hoveredVector] : null;

  // Auto-cycling for delay vectors in trajectory tab
  useEffect(() => {
    if (!isAutoCycling || activeTab !== "trajectory") return;
    const interval = setInterval(() => {
      setHoveredVector((prev) => {
        if (prev === null) return 0;
        return (prev + 1) % vectors.length;
      });
    }, 2000); // Cycle every 2 seconds
    return () => clearInterval(interval);
  }, [isAutoCycling, activeTab, vectors.length]);

  const activeCellData = useMemo(() => {
    if (!hoveredCell) return null;
    return heatmapMatrix[hoveredCell.day][hoveredCell.time];
  }, [hoveredCell, heatmapMatrix]);

  return (
    <div className="av-card">
      <div className="av-header">
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Activity size={18} style={{ color: "var(--accent)" }} />
          <span style={{ fontSize: "14px", fontWeight: 700 }}>Telemetry Visualizers</span>
        </div>
        <div className="av-tab-row">
          <button 
            className={`av-tab-btn ${activeTab === "trajectory" ? "active" : ""}`}
            onClick={() => setActiveTab("trajectory")}
          >
            <TrendingUp size={13} />
            <span>Delay Vector Trajectory</span>
          </button>
          <button 
            className={`av-tab-btn ${activeTab === "heatmap" ? "active" : ""}`}
            onClick={() => setActiveTab("heatmap")}
          >
            <Calendar size={13} />
            <span>Timeline Risk Heatmap</span>
          </button>
          <button 
            className={`av-tab-btn ${activeTab === "risk" ? "active" : ""}`}
            onClick={() => setActiveTab("risk")}
          >
            <AlertTriangle size={13} />
            <span>Risk Tracker History</span>
          </button>
        </div>
      </div>

      <div className="av-content-split">
        {/* LEFT COLUMN: THE ACTIVE GRAPH CHART */}
        <div className="av-chart-panel">
          
          {/* TAB 1: DELAY VECTOR TRAJECTORY */}
          {activeTab === "trajectory" && (
            <svg 
              viewBox="0 0 760 220" 
              className="seq-canvas"
              onMouseEnter={() => setIsAutoCycling(false)}
              onMouseLeave={() => setIsAutoCycling(true)}
            >
              {/* Definitions */}
              <defs>
                <marker id="arrowhead" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--muted)" />
                </marker>
              </defs>

              {/* Grid Lines */}
              {[-4, -2, 0, 2, 4, 6, 8].map((val) => {
                const y = 160 - val * 13;
                return (
                  <g key={val}>
                    <line x1="50" y1={y} x2="720" y2={y} className="av-grid-line" style={{ strokeDasharray: val === 0 ? "" : "4 4", stroke: val === 0 ? "var(--muted)" : "var(--surface-line)" }} />
                    <text x="32" y={y + 3} className="av-axis-text" textAnchor="middle">{val > 0 ? `+${val}h` : `${val}h`}</text>
                  </g>
                );
              })}

              {/* Day column ticks */}
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((day) => {
                const x = 60 + day * 60;
                return (
                  <g key={day}>
                    <line x1={x} y1="30" x2={x} y2="200" className="av-grid-line" style={{ strokeDasharray: "4 4", stroke: "var(--surface-line)" }} />
                    <text x={x} y="214" className="av-axis-text" textAnchor="middle">Day {day}</text>
                  </g>
                );
              })}

              {/* Render Vectors */}
              {vectors.map((vec, idx) => {
                const startX = 60 + vec.startDay * 60;
                const endX = 60 + vec.endDay * 60;
                const startY = 160 - vec.startDev * 13;
                const endY = 160 - vec.endDev * 13;
                const controlX1 = startX + 45;
                const controlY1 = startY;
                const controlX2 = endX - 45;
                const controlY2 = endY;

                const pathString = `M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`;
                const isActive = hoveredVector === idx;
                const vectorClass = vec.tone === "blue" ? "vector-blue" :
                                    vec.tone === "orange" ? "vector-orange" :
                                    vec.tone === "red" ? "vector-red" :
                                    vec.tone === "green" ? "vector-green" : "vector-purple";

                return (
                  <g 
                    key={vec.id} 
                    className={`av-vector-group ${isActive ? "active" : ""}`}
                    onMouseEnter={() => setHoveredVector(idx)}
                  >
                    {/* Glow outline path */}
                    <path d={pathString} className="av-vector-path-glow" style={{ stroke: `var(--${vec.tone === 'blue' ? 'accent' : vec.tone === 'red' ? 'danger' : vec.tone === 'green' ? 'success' : vec.tone === 'orange' ? 'warning' : 'accent-2'})` }} />
                    
                    {/* Solid path vector */}
                    <path 
                      d={pathString} 
                      className={`av-vector-path ${vectorClass}`} 
                      markerEnd="url(#arrowhead)"
                    />

                    {/* Nodes at end points */}
                    <circle cx={startX} cy={startY} r="3" className="av-vector-node" style={{ fill: `var(--${vec.tone === 'blue' ? 'accent' : vec.tone === 'red' ? 'danger' : vec.tone === 'green' ? 'success' : vec.tone === 'orange' ? 'warning' : 'accent-2'})` }} />
                    <circle cx={endX} cy={endY} r="4" className="av-vector-node" style={{ fill: `var(--${vec.tone === 'blue' ? 'accent' : vec.tone === 'red' ? 'danger' : vec.tone === 'green' ? 'success' : vec.tone === 'orange' ? 'warning' : 'accent-2'})` }} />
                  </g>
                );
              })}
            </svg>
          )}

          {/* TAB 2: TIMELINE RISK HEATMAP */}
          {activeTab === "heatmap" && (
            <div className="av-heatmap-container">
              {/* Header labels: Hour slots */}
              <div className="av-heatmap-header-row">
                {timeBlocks.map((time) => (
                  <span className="av-heatmap-header-label" key={time}>{time}</span>
                ))}
              </div>

              {/* Grid rows */}
              {daysOfWeek.map((dayName, dIdx) => (
                <div className="av-heatmap-row" key={dayName}>
                  <span className="av-heatmap-row-label">{dayName.substring(0, 3)}</span>
                  <div className="av-heatmap-cells">
                    {heatmapMatrix[dIdx].map((cell, tIdx) => {
                      const isActive = hoveredCell?.day === dIdx && hoveredCell?.time === tIdx;
                      
                      // Cell color based on risk score
                      const cellBg = cell.risk === 3 ? "rgba(239, 68, 68, 0.4)" : // critical crimson
                                     cell.risk === 2 ? "rgba(245, 158, 11, 0.3)" : // monitor amber
                                     cell.risk === 1 ? "rgba(16, 185, 129, 0.25)" : // focus block green
                                     "var(--surface-soft)"; // healthy / idle
                      const cellBorder = cell.risk === 3 ? "1px solid #ef4444" :
                                         cell.risk === 2 ? "1px solid #f59e0b" :
                                         cell.risk === 1 ? "1px solid #10b981" :
                                         "1px solid var(--surface-line)";

                      return (
                        <div 
                          className={`av-heatmap-cell ${isActive ? "active" : ""}`}
                          key={tIdx}
                          style={{ background: cellBg, border: cellBorder }}
                          onMouseEnter={() => setHoveredCell({ day: dIdx, time: tIdx })}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: RISK TRACKER HISTORY */}
          {activeTab === "risk" && (
            <svg viewBox="0 0 760 220" className="seq-canvas">
              {/* Grid lines */}
              {[0, 20, 40, 60, 80, 100].map((val) => {
                const y = 200 - (val / 100) * 160;
                return (
                  <g key={val}>
                    <line x1="50" y1={y} x2="720" y2={y} className="av-grid-line" style={{ strokeDasharray: "4 4", stroke: "var(--surface-line)" }} />
                    <text x="32" y={y + 3} className="av-axis-text" textAnchor="middle">{val}%</text>
                  </g>
                );
              })}

              {/* Area spline fill */}
              <path d={splinePath.area} className="av-area-spline" />

              {/* Spline stroke line */}
              <path d={splinePath.line} className="av-line-spline" />

              {/* Nodes and Labels */}
              {splinePath.coords.map((pt, idx) => {
                const item = historicalRisk[idx];
                return (
                  <g key={idx}>
                    <circle cx={pt.x} cy={pt.y} r="4" className="av-data-node" />
                    <text x={pt.x} y="214" className="av-axis-text" textAnchor="middle">{item.day}</text>
                    <text x={pt.x} y={pt.y - 10} className="av-axis-text" textAnchor="middle" style={{ fontWeight: 700, fill: "var(--text)" }}>{item.value}%</text>
                  </g>
                );
              })}
            </svg>
          )}

        </div>

        {/* RIGHT COLUMN: METADATA DETAILS SIDEBAR */}
        <div className="av-details-sidebar">
          
          {/* TRAJECTORY SIDEBAR DETAILS */}
          {activeTab === "trajectory" && activeVectorData && (
            <div className="av-details-card">
              <div className="av-details-title-row">
                <div>
                  <h4 className="av-details-title">{activeVectorData.title}</h4>
                  <p className="av-details-subtitle">{activeVectorData.category} Integration</p>
                </div>
                <span className={`pill ${activeVectorData.tone === 'green' ? 'safe' : activeVectorData.tone === 'blue' ? 'default' : activeVectorData.tone === 'orange' ? 'monitor' : 'critical'}`} style={{ fontSize: "9px", padding: "2px 6px" }}>
                  {activeVectorData.endDev > 4 ? "Critical" : activeVectorData.endDev > 0 ? "Delayed" : activeVectorData.endDev < 0 ? "Early" : "Stable"}
                </span>
              </div>
              <div className="av-details-row">
                <span className="av-details-label">Active Window:</span>
                <span className="av-details-val" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  Day {activeVectorData.startDay} <ArrowRight size={10} /> Day {activeVectorData.endDay}
                </span>
              </div>
              <div className="av-details-row">
                <span className="av-details-label">Deviation Hours:</span>
                <span className="av-details-val" style={{ color: activeVectorData.endDev > 3 ? "var(--danger)" : activeVectorData.endDev > 0 ? "var(--warning)" : activeVectorData.endDev < 0 ? "var(--success)" : "var(--text)" }}>
                  {activeVectorData.endDev > 0 ? `+${activeVectorData.endDev}h (Slipped)` : activeVectorData.endDev < 0 ? `${activeVectorData.endDev}h (Ahead)` : "0.0h (On Track)"}
                </span>
              </div>
              <div className="av-details-row">
                <span className="av-details-label">Orchestration Velocity:</span>
                <span className="av-details-val">{activeVectorData.velocity.toFixed(2)}x</span>
              </div>
              <div className="av-details-row">
                <span className="av-details-label">Calculated Deadline:</span>
                <span className="av-details-val">{activeVectorData.deadline}</span>
              </div>
              <div style={{ marginTop: "4px", fontSize: "12px", borderTop: "1px solid var(--surface-line)", paddingTop: "8px", lineHeight: "1.4" }}>
                <strong style={{ display: "block", marginBottom: "2px", fontSize: "11px", color: "var(--muted-strong)" }}>Diagnostic Status:</strong>
                <span className="muted">{activeVectorData.status}</span>
              </div>
            </div>
          )}

          {/* HEATMAP SIDEBAR DETAILS */}
          {activeTab === "heatmap" && activeCellData && (
            <div className="av-details-card">
              <div className="av-details-title-row">
                <div>
                  <h4 className="av-details-title">
                    {daysOfWeek[hoveredCell?.day || 0]} Block
                  </h4>
                  <p className="av-details-subtitle">
                    Time: {timeBlocks[hoveredCell?.time || 0]} - {timeBlocks[(hoveredCell?.time || 0) + 1] || "22:00"}
                  </p>
                </div>
                <span className={`pill ${activeCellData.risk === 3 ? 'critical' : activeCellData.risk === 2 ? 'monitor' : activeCellData.risk === 1 ? 'safe' : 'default'}`} style={{ fontSize: "9px", padding: "2px 6px" }}>
                  {activeCellData.risk === 3 ? "Critical Overlap" : 
                   activeCellData.risk === 2 ? "High Congestion" :
                   activeCellData.risk === 1 ? "Focus Block" : "Healthy spacing"}
                </span>
              </div>
              <div className="av-details-row">
                <span className="av-details-label">Overlapping Tasks:</span>
                <span className="av-details-val">{activeCellData.tasks.length}</span>
              </div>
              <div className="av-details-row">
                <span className="av-details-label">Context Switching cost:</span>
                <span className="av-details-val" style={{ color: activeCellData.switchingPenalty > 50 ? "var(--danger)" : "var(--text)" }}>
                  {activeCellData.switchingPenalty}%
                </span>
              </div>
              {activeCellData.tasks.length > 0 && (
                <div style={{ marginTop: "4px", fontSize: "12px", borderTop: "1px solid var(--surface-line)", paddingTop: "8px" }}>
                  <strong style={{ display: "block", marginBottom: "4px", fontSize: "11px", color: "var(--muted-strong)" }}>Scheduled Tasks:</strong>
                  <ul style={{ margin: 0, paddingLeft: "16px", color: "var(--text)" }}>
                    {activeCellData.tasks.map((tName, i) => (
                      <li key={i} style={{ marginBottom: "2px" }}>{tName}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div style={{ marginTop: "4px", fontSize: "12.5px", background: "var(--surface)", border: "1px solid var(--surface-line)", padding: "8px 12px", borderRadius: "6px" }}>
                {activeCellData.risk === 3 ? (
                  <span style={{ color: "var(--danger)" }}>
                    ⚠️ <strong>Rescue Alert:</strong> Resolve conflict immediately by deferring low priority task to Tuesday morning.
                  </span>
                ) : activeCellData.risk === 2 ? (
                  <span style={{ color: "var(--warning)" }}>
                    ⚡ <strong>Congestion Warning:</strong> Avoid multitasking. Focus on the core submission brief.
                  </span>
                ) : activeCellData.risk === 1 ? (
                  <span style={{ color: "var(--success)" }}>
                    🛡️ <strong>Focus Secured:</strong> Zero notifications allowed. Peak capacity pacing.
                  </span>
                ) : (
                  <span style={{ color: "var(--muted)" }}>
                    ✓ <strong>Optimal window:</strong> Perfect for admin tasks or scheduling team check-ins.
                  </span>
                )}
              </div>
            </div>
          )}

          {/* RISK LOG TRACKER SIDEBAR */}
          {activeTab === "risk" && (
            <div className="av-details-card" style={{ gap: "10px" }}>
              <div className="av-details-title-row" style={{ paddingBottom: "6px", marginBottom: "4px" }}>
                <div>
                  <h4 className="av-details-title">Risk Engine telemetry Log</h4>
                  <p className="av-details-subtitle">Recent automated alerts</p>
                </div>
                <Clock size={14} style={{ color: "var(--muted)" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", overflowY: "auto", maxHeight: "150px" }}>
                <div style={{ fontSize: "11px", lineHeight: "1.4", padding: "6px 8px", background: "rgba(239, 68, 68, 0.08)", borderLeft: "2.5px solid #ef4444", borderRadius: "0 4px 4px 0" }}>
                  <div style={{ fontWeight: 700, color: "#ef4444" }}>1h ago: High-Friction Context Switching</div>
                  <span className="muted">Monday calendar blocks have overloaded capacity thresholds.</span>
                </div>
                <div style={{ fontSize: "11px", lineHeight: "1.4", padding: "6px 8px", background: "rgba(245, 158, 11, 0.08)", borderLeft: "2.5px solid #f59e0b", borderRadius: "0 4px 4px 0" }}>
                  <div style={{ fontWeight: 700, color: "#f59e0b" }}>4h ago: Task &apos;Calendar Sync&apos; Risk Spike</div>
                  <span className="muted">Workload variance exceeded 60% probability.</span>
                </div>
                <div style={{ fontSize: "11px", lineHeight: "1.4", padding: "6px 8px", background: "rgba(16, 185, 129, 0.08)", borderLeft: "2.5px solid #10b981", borderRadius: "0 4px 4px 0" }}>
                  <div style={{ fontWeight: 700, color: "#10b981" }}>1d ago: Rescue Simulation Committed</div>
                  <span className="muted">Rescheduled 2 focus blocks successfully.</span>
                </div>
                <div style={{ fontSize: "11px", lineHeight: "1.4", padding: "6px 8px", background: "var(--surface)", borderLeft: "2.5px solid var(--muted)", borderRadius: "0 4px 4px 0" }}>
                  <div style={{ fontWeight: 700, color: "var(--muted-strong)" }}>3d ago: Auto-scheduled Focus Slot</div>
                  <span className="muted">70m deep-work slot generated.</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
