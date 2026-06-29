"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/AuthProvider";
import { 
  Zap, Brain, Coffee, AlertTriangle, 
  Sparkles, Calendar, ArrowRight, Play, Pause
} from "lucide-react";

type SlotTask = "none" | "focus" | "meeting" | "admin" | "emergency" | "recovery";

interface SlotConfig {
  time: string;
  label: string;
  task: SlotTask;
}

export function ProductivityAnalytics() {
  const { profile } = useAuth();

  // Load profile variables with defaults
  const userStyle = profile?.preferences?.workingStyle || "balanced";
  const capacity = Number(profile?.preferences?.deepWorkHours || 4);
  const contextCost = Number(profile?.preferences?.contextSwitchingCost || 15);
  const recoveryTime = Number(profile?.preferences?.focusRecoveryTime || 20);

  // States
  const [workingStyle, setWorkingStyle] = useState<string>("balanced");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [preset, setPreset] = useState<string>("custom");

  // Slots for the simulator (9am, 11am, 2pm, 4pm)
  const [slots, setSlots] = useState<SlotConfig[]>([
    { time: "9:00 AM", label: "Early Session", task: "none" },
    { time: "11:00 AM", label: "Late Morning", task: "none" },
    { time: "2:00 PM", label: "Afternoon Block", task: "none" },
    { time: "4:00 PM", label: "End of Day", task: "none" },
  ]);

  // Sync with profile preferences on mount/update
  useEffect(() => {
    if (userStyle) {
      setWorkingStyle(userStyle);
    }
  }, [userStyle]);

  // Hours array from 8am to 6pm
  const hours = [
    "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM"
  ];

  // Helper to generate base curves based on working style
  const getBaseData = (style: string) => {
    // Return [focusArray, loadArray]
    switch (style) {
      case "morning":
        return {
          focus: [60, 85, 95, 90, 75, 45, 55, 60, 45, 30, 20],
          load: [20, 28, 34, 38, 42, 38, 48, 52, 58, 50, 38]
        };
      case "night":
        return {
          focus: [20, 25, 30, 38, 48, 45, 60, 75, 85, 92, 98],
          load: [25, 32, 36, 40, 42, 38, 42, 48, 52, 58, 62]
        };
      case "balanced":
      default:
        return {
          focus: [45, 75, 90, 85, 65, 45, 75, 85, 70, 50, 30],
          load: [22, 30, 36, 40, 42, 38, 45, 50, 55, 48, 35]
        };
    }
  };

  // Compute graph curves by applying interactive simulator modifiers
  const chartData = (() => {
    const { focus: baseFocus, load: baseLoad } = getBaseData(workingStyle);
    const modifiedFocus = [...baseFocus];
    const modifiedLoad = [...baseLoad];

    // Map slot items to their corresponding index in the hours array
    // slots[0] = 9am -> index 1
    // slots[1] = 11am -> index 3
    // slots[2] = 2pm -> index 6
    // slots[3] = 4pm -> index 8
    const indexMapping: { [key: number]: SlotTask } = {
      1: slots[0].task,
      3: slots[1].task,
      6: slots[2].task,
      8: slots[3].task,
    };

    // Apply modifiers slot by slot
    Object.keys(indexMapping).forEach((idxStr) => {
      const idx = parseInt(idxStr);
      const task = indexMapping[idx];

      if (task === "focus") {
        // Boost Focus
        modifiedFocus[idx] = Math.min(100, modifiedFocus[idx] + 25);
        if (idx + 1 < modifiedFocus.length) {
          modifiedFocus[idx + 1] = Math.min(100, modifiedFocus[idx + 1] + 15); // momentum
        }
        // Moderate Load increase
        modifiedLoad[idx] = Math.min(100, modifiedLoad[idx] + 12);
      } else if (task === "meeting") {
        // Depress Focus
        modifiedFocus[idx] = Math.max(15, modifiedFocus[idx] - 30);
        // Increase Load
        modifiedLoad[idx] = Math.min(100, modifiedLoad[idx] + 18);
      } else if (task === "admin") {
        // Lower Focus
        modifiedFocus[idx] = Math.max(30, modifiedFocus[idx] - 15);
        // Slight Load increase
        modifiedLoad[idx] = Math.min(100, modifiedLoad[idx] + 8);
      } else if (task === "emergency") {
        // Severe Focus Penalty
        modifiedFocus[idx] = Math.max(10, modifiedFocus[idx] - 50);
        if (idx + 1 < modifiedFocus.length) {
          modifiedFocus[idx + 1] = Math.max(10, modifiedFocus[idx + 1] - 25); // residual distraction
        }
        // Severe Load Spike, penalized heavily by contextSwitchingCost
        const switchingPenalty = Math.round(contextCost * 1.2);
        modifiedLoad[idx] = Math.min(100, modifiedLoad[idx] + 35 + switchingPenalty);
        if (idx + 1 < modifiedLoad.length) {
          modifiedLoad[idx + 1] = Math.min(100, modifiedLoad[idx + 1] + 20 + Math.round(switchingPenalty * 0.5));
        }
      } else if (task === "recovery") {
        // Focus drops (brain rest)
        modifiedFocus[idx] = Math.max(10, modifiedFocus[idx] - 40);
        // Load drops heavily, helped by focusRecoveryTime
        const recoveryBenefit = Math.round(recoveryTime * 0.8);
        modifiedLoad[idx] = Math.max(10, modifiedLoad[idx] - 25 - recoveryBenefit);
        if (idx + 1 < modifiedLoad.length) {
          modifiedLoad[idx + 1] = Math.max(10, modifiedLoad[idx + 1] - 15);
        }
      }
    });

    // Scale focus curve by daily capacity (relative to default 4 hours)
    const capacityMultiplier = capacity / 4;
    const finalFocus = modifiedFocus.map(val => {
      let scaled = val * capacityMultiplier;
      // Cap at 100, floor at 10
      return Math.round(Math.max(10, Math.min(100, scaled)));
    });

    const finalLoad = modifiedLoad.map(val => Math.round(Math.max(10, Math.min(100, val))));

    return { focus: finalFocus, load: finalLoad };
  })();

  // Build SVG path strings
  const getSvgCoordinates = (dataArray: number[]) => {
    return dataArray.map((val, i) => {
      const x = 50 + i * 70; // Map X from 50 to 750 (total width 800)
      const y = 230 - (val / 100) * 190; // Map Y from 40 to 230 (total height 250)
      return { x, y };
    });
  };

  const focusPoints = getSvgCoordinates(chartData.focus);
  const loadPoints = getSvgCoordinates(chartData.load);

  const getCurvePath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return "";
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const cpX1 = curr.x + 24;
      const cpY1 = curr.y;
      const cpX2 = next.x - 24;
      const cpY2 = next.y;
      d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${next.x} ${next.y}`;
    }
    return d;
  };

  const focusPath = getCurvePath(focusPoints);
  const loadPath = getCurvePath(loadPoints);

  const focusArea = focusPath ? `${focusPath} L 750 230 L 50 230 Z` : "";
  const loadArea = loadPath ? `${loadPath} L 750 230 L 50 230 Z` : "";

  // Apply Presets
  const applyPreset = (type: string) => {
    setPreset(type);
    if (type === "ideal") {
      setSlots([
        { time: "9:00 AM", label: "Early Session", task: "focus" },
        { time: "11:00 AM", label: "Late Morning", task: "none" },
        { time: "2:00 PM", label: "Afternoon Block", task: "focus" },
        { time: "4:00 PM", label: "End of Day", task: "recovery" },
      ]);
    } else if (type === "chaotic") {
      setSlots([
        { time: "9:00 AM", label: "Early Session", task: "meeting" },
        { time: "11:00 AM", label: "Late Morning", task: "emergency" },
        { time: "2:00 PM", label: "Afternoon Block", task: "meeting" },
        { time: "4:00 PM", label: "End of Day", task: "emergency" },
      ]);
    } else if (type === "recovery") {
      setSlots([
        { time: "9:00 AM", label: "Early Session", task: "focus" },
        { time: "11:00 AM", label: "Late Morning", task: "recovery" },
        { time: "2:00 PM", label: "Afternoon Block", task: "admin" },
        { time: "4:00 PM", label: "End of Day", task: "recovery" },
      ]);
    } else {
      // Reset
      setSlots([
        { time: "9:00 AM", label: "Early Session", task: "none" },
        { time: "11:00 AM", label: "Late Morning", task: "none" },
        { time: "2:00 PM", label: "Afternoon Block", task: "none" },
        { time: "4:00 PM", label: "End of Day", task: "none" },
      ]);
    }
  };

  const updateSlotTask = (index: number, task: SlotTask) => {
    setPreset("custom");
    const updated = [...slots];
    updated[index].task = task;
    setSlots(updated);
  };

  // Mouse move handler for synchronized timeline scrubber
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svgRect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - svgRect.left;
    const mouseY = e.clientY - svgRect.top;

    // Relative X coordinate inside SVG (viewBox coordinates)
    const svgX = (mouseX / svgRect.width) * 800;
    
    // Nearest hour index
    const clampedX = Math.max(50, Math.min(750, svgX));
    const nearestIndex = Math.round((clampedX - 50) / 70);

    setHoveredIndex(nearestIndex);
    // Tooltip position (in relative pixels)
    setTooltipPos({
      x: mouseX,
      y: mouseY
    });
  };

  // Calculate day scores
  const dayStats = (() => {
    const avgFocus = Math.round(chartData.focus.reduce((sum, v) => sum + v, 0) / chartData.focus.length);
    const avgLoad = Math.round(chartData.load.reduce((sum, v) => sum + v, 0) / chartData.load.length);
    
    // Cognitive efficiency = Focus - Load + 50 (capped at 100)
    const efficiency = Math.min(100, Math.max(0, avgFocus - avgLoad + 50));
    
    let safetyStatus = "Balanced Output";
    let statusClass = "status-normal";
    if (avgLoad > 65) {
      safetyStatus = "Overload Danger";
      statusClass = "status-overload";
    } else if (avgFocus > 70 && avgLoad < 40) {
      safetyStatus = "Peak Flow Zone";
      statusClass = "status-optimal";
    } else if (avgFocus < 45 && avgLoad < 30) {
      safetyStatus = "Mental Recovery";
      statusClass = "status-recovery";
    }

    return { efficiency, avgFocus, avgLoad, safetyStatus, statusClass };
  })();

  const hoverFocusVal = hoveredIndex !== null ? chartData.focus[hoveredIndex] : 0;
  const hoverLoadVal = hoveredIndex !== null ? chartData.load[hoveredIndex] : 0;

  // Determine hover hour status description
  const getHoverStatus = (focusVal: number, loadVal: number) => {
    if (loadVal > 75) return { text: "Cognitive Overload!", tone: "status-overload" };
    if (focusVal >= 80 && loadVal <= 45) return { text: "Optimal Peak Flow", tone: "status-optimal" };
    if (focusVal <= 30 && loadVal <= 35) return { text: "Cognitive Cooling", tone: "status-recovery" };
    return { text: "Moderate Activity", tone: "status-normal" };
  };

  const hoverStatus = getHoverStatus(hoverFocusVal, hoverLoadVal);

  return (
    <div className="prod-analytics-card">
      <div className="prod-header">
        <div className="prod-title-group">
          <h3>Interactive Focus & Cognitive Load Simulator</h3>
          <p>Scrub the chart to explore hourly load points, and toggle simulated schedule events below.</p>
        </div>
        <div className="prod-controls">
          <select 
            className="prod-select"
            value={workingStyle}
            onChange={(e) => {
              setPreset("custom");
              setWorkingStyle(e.target.value);
            }}
          >
            <option value="morning">Morning Peak Style</option>
            <option value="balanced">Balanced Dual-Peak Style</option>
            <option value="night">Night Owl Style</option>
          </select>

          <div style={{ display: "flex", gap: "6px" }}>
            <button 
              className={`prod-preset-btn ${preset === "ideal" ? "active" : ""}`}
              onClick={() => applyPreset("ideal")}
            >
              Ideal Focus Run
            </button>
            <button 
              className={`prod-preset-btn ${preset === "chaotic" ? "active" : ""}`}
              onClick={() => applyPreset("chaotic")}
            >
              Stress Heavy Day
            </button>
            <button 
              className={`prod-preset-btn ${preset === "recovery" ? "active" : ""}`}
              onClick={() => applyPreset("recovery")}
            >
              Balanced Flow
            </button>
            <button 
              className="prod-preset-btn"
              onClick={() => applyPreset("reset")}
              title="Reset Toggles"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* SVG CHART CANVAS */}
      <div className="prod-chart-container">
        {/* Render tooltip dynamically */}
        {hoveredIndex !== null && (
          <div 
            className="prod-tooltip" 
            style={{ 
              position: "absolute",
              left: `${tooltipPos.x + 20}px`,
              top: `${Math.max(10, Math.min(100, tooltipPos.y - 60))}px`,
            }}
          >
            <div className="prod-tooltip-time">{hours[hoveredIndex]}</div>
            <div className="prod-tooltip-row">
              <span className="prod-tooltip-label">
                <span className="prod-tooltip-indicator indicator-focus"></span>
                Focus Level:
              </span>
              <span className="prod-tooltip-value">{hoverFocusVal}%</span>
            </div>
            <div className="prod-tooltip-row">
              <span className="prod-tooltip-label">
                <span className="prod-tooltip-indicator indicator-load"></span>
                Cognitive Load:
              </span>
              <span className="prod-tooltip-value">{hoverLoadVal}%</span>
            </div>
            <div className={`prod-tooltip-status ${hoverStatus.tone}`}>
              {hoverStatus.text}
            </div>
          </div>
        )}

        <svg 
          viewBox="0 0 800 250" 
          className="prod-svg"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {/* Defs for chart curves gradients */}
          <defs>
            <linearGradient id="focus-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.01" />
            </linearGradient>
            <linearGradient id="load-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ec4899" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((gridVal) => {
            const y = 230 - (gridVal / 100) * 190;
            return (
              <g key={gridVal}>
                <line x1="50" y1={y} x2="750" y2={y} className="prod-grid-line" />
                <text x="25" y={y + 4} className="prod-axis-text" textAnchor="middle">{gridVal}%</text>
              </g>
            );
          })}

          {/* Hours axes */}
          {hours.map((hr, idx) => {
            const x = 50 + idx * 70;
            const isLabelVisible = idx % 2 === 0 || idx === hours.length - 1; // Filter label density for clarity
            return (
              <g key={hr}>
                <line x1={x} y1="40" x2={x} y2="230" className="prod-grid-line" style={{ opacity: 0.5 }} />
                {isLabelVisible && (
                  <text x={x} y="246" className="prod-axis-text" textAnchor="middle">{hr.replace(":00 ", "")}</text>
                )}
              </g>
            );
          })}

          {/* Fill Areas under lines */}
          <path d={focusArea} fill="url(#focus-gradient)" className="prod-chart-area" />
          <path d={loadArea} fill="url(#load-gradient)" className="prod-chart-area" />

          {/* Line Curves */}
          <path d={focusPath} className="prod-chart-line line-focus" />
          <path d={loadPath} className="prod-chart-line line-load" />

          {/* Vertical Scrubber Line & Intersection Nodes */}
          {hoveredIndex !== null && (
            <g>
              <line 
                x1={50 + hoveredIndex * 70} 
                y1="40" 
                x2={50 + hoveredIndex * 70} 
                y2="230" 
                className="prod-scrubber-line" 
              />
              <circle 
                cx={focusPoints[hoveredIndex].x} 
                cy={focusPoints[hoveredIndex].y} 
                r={6} 
                className="prod-scrubber-dot-focus" 
              />
              <circle 
                cx={loadPoints[hoveredIndex].x} 
                cy={loadPoints[hoveredIndex].y} 
                r={6} 
                className="prod-scrubber-dot-load" 
              />
            </g>
          )}
        </svg>
      </div>

      {/* INTERACTIVE SLOTS CONSOLE */}
      <div className="prod-simulator-section">
        <div className="prod-sim-header">
          <Calendar size={13} />
          <span>Simulate Workspace Events & Tasks</span>
        </div>
        <div className="prod-slots-grid">
          {slots.map((slot, index) => (
            <div className="prod-slot-card" key={index}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="prod-slot-time">{slot.time}</span>
                <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                  {slot.label}
                </span>
              </div>
              <select
                className="prod-slot-select"
                value={slot.task}
                onChange={(e) => updateSlotTask(index, e.target.value as SlotTask)}
              >
                <option value="none">Standard Schedule</option>
                <option value="focus">💻 Deep Work Block</option>
                <option value="meeting">👥 Team Sync Meeting</option>
                <option value="admin">✉ Inbox & Admin</option>
                <option value="emergency">🚨 Emergency Fire-drill</option>
                <option value="recovery">☕ Focus Recovery Break</option>
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* METRIC BOXES SUMMARY */}
      <div className="prod-summary-metrics">
        <div className="prod-summary-box">
          <span className="prod-summary-label">Cognitive Efficiency</span>
          <div className="prod-summary-val">{dayStats.efficiency}%</div>
          <div className="prod-summary-sub">Avg Focus: {dayStats.avgFocus}% | Avg Load: {dayStats.avgLoad}%</div>
        </div>
        <div className="prod-summary-box">
          <span className="prod-summary-label">System Performance</span>
          <div className="prod-summary-val" style={{ color: "var(--accent)" }}>
            {dayStats.avgFocus > 60 ? "Optimal Capacity" : "Low Momentum"}
          </div>
          <div className="prod-summary-sub">Scaled by {capacity}h deep-work allocation</div>
        </div>
        <div className="prod-summary-box">
          <span className="prod-summary-label">Overload Safety Status</span>
          <div className={`prod-summary-val`} style={{ 
            color: dayStats.avgLoad > 65 ? "var(--danger)" : 
                   dayStats.avgFocus > 70 && dayStats.avgLoad < 40 ? "var(--success)" : "var(--text)" 
          }}>
            {dayStats.safetyStatus}
          </div>
          <div className="prod-summary-sub">Switch cost penalty: {contextCost} min</div>
        </div>
      </div>
    </div>
  );
}
