import { useState, useMemo } from "react";
import Link from "next/link";
import { Calendar, AlertTriangle, CheckCircle2, Info, ArrowRight, Clock } from "lucide-react";

interface TimelineHeatmapProps {
  tasks: any[];
  subtasks?: any[];
  dailyCapacity: number;
}

export function TimelineHeatmap({ tasks, subtasks = [], dailyCapacity }: TimelineHeatmapProps) {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);

  // Generate 14 days of timeline data starting from today
  const timelineDays = useMemo(() => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 14; i++) {
      const current = new Date(today);
      current.setDate(today.getDate() + i);

      // Filter tasks due on this specific day
      const dayTasks = tasks.filter((task) => {
        if (!task.deadline) return false;
        const d = new Date(task.deadline);
        return (
          d.getFullYear() === current.getFullYear() &&
          d.getMonth() === current.getMonth() &&
          d.getDate() === current.getDate()
        );
      });

      // Filter subtasks scheduled on this specific day
      const daySubtasks = subtasks.filter((subtask) => {
        if (!subtask.startTime) return false;
        const sd = new Date(subtask.startTime);
        return (
          sd.getFullYear() === current.getFullYear() &&
          sd.getMonth() === current.getMonth() &&
          sd.getDate() === current.getDate()
        );
      });

      const totalHours = subtasks.length > 0
        ? daySubtasks.reduce((sum, s) => sum + (s.estimatedHours || 0), 0)
        : dayTasks.reduce((sum, task) => sum + (task.estimatedHours || task.hours || 0), 0);

      // Classify the day's risk level based on workload vs capacity
      let riskLevel: "safe" | "monitor" | "danger" | "empty" = "empty";
      const hasWork = subtasks.length > 0 ? daySubtasks.length > 0 : dayTasks.length > 0;
      
      if (hasWork) {
        if (totalHours <= dailyCapacity) {
          riskLevel = "safe";
        } else if (totalHours <= dailyCapacity * 1.5) {
          riskLevel = "monitor";
        } else {
          riskLevel = "danger";
        }
      }

      days.push({
        index: i,
        date: current,
        dayName: current.toLocaleDateString(undefined, { weekday: "short" }),
        dateStr: current.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        fullDateStr: current.toLocaleDateString(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        tasks: dayTasks,
        subtasks: daySubtasks,
        totalHours,
        riskLevel,
      });
    }
    return days;
  }, [tasks, subtasks, dailyCapacity]);

  const selectedDay = timelineDays[selectedDayIndex] || timelineDays[0];

  // Dynamic recommendation based on workload
  const getRecommendation = (hours: number, taskCount: number) => {
    if (taskCount === 0) {
      return {
        icon: <CheckCircle2 size={16} style={{ color: "var(--success)" }} />,
        text: "No deadlines today. Excellent opportunity for uninterrupted deep focus sessions, tackling tech debt, or recharging.",
        tone: "safe",
      };
    }
    if (hours <= dailyCapacity) {
      return {
        icon: <CheckCircle2 size={16} style={{ color: "var(--success)" }} />,
        text: `Workload is healthy. You have ${taskCount} deadline(s) totalling ${hours}h, leaving you with ${(dailyCapacity - hours).toFixed(1)}h of your daily deep work capacity.`,
        tone: "safe",
      };
    }
    if (hours <= dailyCapacity * 1.5) {
      return {
        icon: <Info size={16} style={{ color: "var(--warning)" }} />,
        text: `Moderate overload. Deadlines demand ${hours}h, which is ${(hours - dailyCapacity).toFixed(1)}h over your capacity. Consider locking your calendar or starting early.`,
        tone: "warning",
      };
    }
    return {
      icon: <AlertTriangle size={16} style={{ color: "var(--danger)" }} />,
      text: `Critical overload! Tasks require ${hours}h (${(hours - dailyCapacity).toFixed(1)}h over capacity). We strongly recommend deferring scope or moving some deadlines to lighter days.`,
      tone: "danger",
    };
  };

  const recommendation = getRecommendation(selectedDay.totalHours, selectedDay.tasks.length);

  // Background and border colors matching the site's general theme
  const getCellStyles = (risk: string, isSelected: boolean) => {
    let baseStyles = {
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      justifyContent: "center",
      padding: "10px",
      borderRadius: "10px",
      cursor: "pointer",
      transition: "all 0.22s ease",
      border: "1px solid var(--surface-line)",
      background: "var(--surface)",
      minHeight: "72px",
      position: "relative" as const,
    };

    if (risk === "empty") {
      baseStyles.background = "var(--surface-soft)";
      baseStyles.border = "1px solid var(--surface-line)";
    } else if (risk === "safe") {
      baseStyles.background = "rgba(22, 163, 74, 0.04)";
      baseStyles.border = "1px solid rgba(22, 163, 74, 0.15)";
    } else if (risk === "monitor") {
      baseStyles.background = "rgba(217, 119, 6, 0.05)";
      baseStyles.border = "1px solid rgba(217, 119, 6, 0.2)";
    } else if (risk === "danger") {
      baseStyles.background = "rgba(220, 38, 38, 0.05)";
      baseStyles.border = "1px solid rgba(220, 38, 38, 0.2)";
    }

    if (isSelected) {
      baseStyles.border = "2px solid var(--accent)";
      baseStyles.background = risk === "empty" ? "var(--surface-soft)" : baseStyles.background;
    }

    return baseStyles;
  };

  const getCellTextColor = (risk: string) => {
    if (risk === "safe") return "var(--success)";
    if (risk === "monitor") return "var(--warning)";
    if (risk === "danger") return "var(--danger)";
    return "var(--muted)";
  };

  return (
    <div className="card card-pad stack" style={{ gap: "24px" }}>
      {/* Heatmap Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <Calendar size={18} style={{ color: "var(--accent)" }} />
            Timeline Capacity Heatmap
          </h2>
          <p className="muted" style={{ margin: "2px 0 0" }}>
            Rolling 14-day overview of workload density vs daily deep work capacity ({dailyCapacity}h)
          </p>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px" }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "var(--surface-soft)", border: "1px solid var(--surface-line)" }} />
            <span className="muted">Rest/Free</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px" }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "rgba(22, 163, 74, 0.08)", border: "1px solid rgba(22, 163, 74, 0.25)" }} />
            <span style={{ color: "var(--success)", fontWeight: 500 }}>Safe</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px" }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "rgba(217, 119, 6, 0.08)", border: "1px solid rgba(217, 119, 6, 0.25)" }} />
            <span style={{ color: "var(--warning)", fontWeight: 500 }}>Warning</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px" }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "rgba(220, 38, 38, 0.08)", border: "1px solid rgba(220, 38, 38, 0.25)" }} />
            <span style={{ color: "var(--danger)", fontWeight: 500 }}>Critical</span>
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <div 
        style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(7, minmax(0, 1fr))", 
          gap: "10px",
          width: "100%"
        }}
      >
        {timelineDays.map((day) => {
          const isSelected = selectedDayIndex === day.index;
          return (
            <button
              key={day.index}
              onClick={() => setSelectedDayIndex(day.index)}
              style={getCellStyles(day.riskLevel, isSelected)}
              className="heatmap-cell"
              title={`${day.dateStr}: ${day.totalHours}h allocated`}
            >
              {/* Day abbreviation (e.g. Mon) */}
              <span className="muted" style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>
                {day.dayName}
              </span>
              
              {/* Day number (e.g. 29) */}
              <span style={{ fontSize: "16px", fontWeight: 700, margin: "2px 0 4px", color: isSelected ? "var(--text)" : "inherit" }}>
                {day.date.getDate()}
              </span>

              {/* Hours indicator */}
              {day.totalHours > 0 ? (
                <span 
                  style={{ 
                    fontSize: "10px", 
                    fontWeight: 700, 
                    padding: "1px 5px", 
                    borderRadius: "4px", 
                    background: day.riskLevel === "danger" ? "rgba(220,38,38,0.1)" : day.riskLevel === "monitor" ? "rgba(217,119,6,0.1)" : "rgba(22,163,74,0.1)",
                    color: getCellTextColor(day.riskLevel)
                  }}
                >
                  {day.totalHours.toFixed(1)}h
                </span>
              ) : (
                <span style={{ height: "14px", width: "4px", borderRadius: "99px", background: "var(--surface-line)" }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day Details Panel */}
      <div 
        style={{ 
          background: "var(--surface-soft)", 
          borderRadius: "10px", 
          border: "1px solid var(--surface-line)",
          display: "grid",
          gridTemplateColumns: "1.2fr 1.8fr",
          gap: "24px",
          padding: "20px"
        }}
      >
        {/* Left Side: Summary and Recommendations */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <span className="eyebrow" style={{ fontSize: "9px" }}>Selected Date</span>
            <h3 style={{ fontSize: "16px", margin: "2px 0 10px" }}>{selectedDay.fullDateStr}</h3>
            
            {/* Workload Progress Bar */}
            <div style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", marginBottom: "4px" }}>
                <span className="muted">Workload vs capacity:</span>
                <strong>{selectedDay.totalHours.toFixed(1)}h / {dailyCapacity}h</strong>
              </div>
              <div className="progress" style={{ height: "6px" }}>
                <span 
                  style={{ 
                    width: `${Math.min(100, (selectedDay.totalHours / dailyCapacity) * 100)}%`,
                    background: selectedDay.riskLevel === "danger" ? "var(--danger)" : selectedDay.riskLevel === "monitor" ? "var(--warning)" : "var(--success)"
                  }} 
                />
              </div>
            </div>
          </div>

          {/* AI Recommendation Message */}
          <div 
            style={{ 
              display: "flex", 
              gap: "10px", 
              alignItems: "flex-start", 
              fontSize: "12.5px", 
              lineHeight: "1.4",
              background: "var(--surface)", 
              padding: "12px", 
              borderRadius: "8px",
              border: `1px solid var(--surface-line)`
            }}
          >
            <div style={{ marginTop: "2px", flexShrink: 0 }}>
              {recommendation.icon}
            </div>
            <span>{recommendation.text}</span>
          </div>
        </div>

        {/* Right Side: Deadline list */}
        <div>
          <h4 className="muted" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" }}>
            {subtasks.length > 0 ? `Scheduled Subtasks (${selectedDay.subtasks.length})` : `Deadlines (${selectedDay.tasks.length})`}
          </h4>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "170px", overflowY: "auto", paddingRight: "4px" }}>
            {subtasks.length > 0 ? (
              selectedDay.subtasks.length > 0 ? (
                selectedDay.subtasks.map((st: any) => {
                  const parentTask = tasks.find(t => t.id === st.taskId || t.taskId === st.taskId);
                  return (
                    <Link 
                      key={st.id || st.subtaskId} 
                      href={`/tasks/${st.taskId}`}
                      className="list-row"
                      style={{ 
                        padding: "10px 14px", 
                        fontSize: "13px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: "var(--surface)",
                        textDecoration: "none"
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px", maxWidth: "75%" }}>
                        <strong style={{ color: "var(--text)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                          {parentTask ? `[${parentTask.title}] - ${st.title}` : st.title}
                        </strong>
                        <span className="muted" style={{ fontSize: "11.5px" }}>
                          {parentTask?.category || "Focus Block"}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span className="muted" style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "3px" }}>
                          <Clock size={12} /> {st.estimatedHours}h
                        </span>
                        <ArrowRight size={14} className="muted" />
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div 
                  style={{ 
                    display: "flex", 
                    flexDirection: "column", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    padding: "32px", 
                    color: "var(--muted)", 
                    border: "1px dashed var(--surface-line)", 
                    borderRadius: "8px",
                    background: "var(--surface)",
                    textAlign: "center"
                  }}
                >
                  <span style={{ fontSize: "20px", marginBottom: "4px" }}>🎉</span>
                  <span style={{ fontSize: "12.5px" }}>No subtasks scheduled</span>
                </div>
              )
            ) : (
              selectedDay.tasks.length > 0 ? (
                selectedDay.tasks.map((task) => (
                  <Link 
                    key={task.id} 
                    href={`/tasks/${task.id}`}
                    className="list-row"
                    style={{ 
                      padding: "10px 14px", 
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "var(--surface)",
                      textDecoration: "none"
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px", maxWidth: "75%" }}>
                      <strong style={{ color: "var(--text)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                        {task.title}
                      </strong>
                      <span className="muted" style={{ fontSize: "11.5px" }}>
                        {task.category}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span className="muted" style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "3px" }}>
                        <Clock size={12} /> {task.estimatedHours || task.hours || 2}h
                      </span>
                      <span className={`pill ${task.riskLevel}`} style={{ padding: "1px 6px", fontSize: "10px" }}>
                        {task.risk}%
                      </span>
                      <ArrowRight size={14} className="muted" />
                    </div>
                  </Link>
                ))
              ) : (
                <div 
                  style={{ 
                    display: "flex", 
                    flexDirection: "column", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    padding: "32px", 
                    color: "var(--muted)", 
                    border: "1px dashed var(--surface-line)", 
                    borderRadius: "8px",
                    background: "var(--surface)",
                    textAlign: "center"
                  }}
                >
                  <span style={{ fontSize: "20px", marginBottom: "4px" }}>🎉</span>
                  <span style={{ fontSize: "12.5px" }}>No deadlines due today</span>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
