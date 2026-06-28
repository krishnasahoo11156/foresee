"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MetricCard } from "@/components/ui/MetricCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { TaskCard } from "@/components/ui/TaskCard";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/components/AuthProvider";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { metrics as mockMetrics, notifications, schedule } from "@/lib/data";
import { calculateRiskAndClassification } from "@/lib/riskEngine";

export default function DashboardPage() {
  const { theme } = useTheme();
  const { user, profile } = useAuth();
  const [tasksList, setTasksList] = useState<any[]>([]);
  const [subtasksList, setSubtasksList] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "tasks"));
    const unsub = onSnapshot(q, (snapshot) => {
      const items: any[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setTasksList(items);
    }, (err) => {
      console.warn("Failed to subscribe to dashboard tasks:", err);
    });
    return unsub;
  }, [user]);

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
      console.warn("Failed to subscribe to dashboard subtasks:", err);
    });
    return unsub;
  }, [user]);

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours >= 5 && hours < 12) {
      return "Good morning";
    } else if (hours >= 12 && hours < 17) {
      return "Good afternoon";
    } else {
      return "Good evening";
    }
  };

  const dailyCapacity = Number(profile?.preferences?.deepWorkHours || 4);

  const getSortedTasksWithRisk = (tasks: any[], capacity: number) => {
    const sorted = [...tasks].sort((a, b) => {
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });

    return sorted.map((task) => {
      const analysis = calculateRiskAndClassification(task, tasks, profile);
      const deadline = new Date(task.deadline);
      const formattedDeadline = deadline.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
      });

      return {
        ...task,
        hours: task.estimatedHours || task.hours || 2,
        deadline: formattedDeadline,
        risk: analysis.riskScore,
        riskLevel: analysis.riskLevel,
        progress: task.progress || 0,
        effort: `${task.estimatedHours || task.hours || 0}h needed`,
        category: task.category ? task.category.toUpperCase() : "CODING"
      };
    });
  };

  const computedTasks = getSortedTasksWithRisk(tasksList, dailyCapacity);
  const atRiskTasks = computedTasks.filter(t => t.riskLevel === "critical" || t.riskLevel === "danger" || t.riskLevel === "monitor").slice(0, 2);
  const displayTasks = atRiskTasks.length > 0 ? atRiskTasks : computedTasks.slice(0, 2);

  // Dynamic metrics
  const totalTasks = computedTasks.length;
  const criticalTasksCount = computedTasks.filter(t => t.riskLevel === "critical" || t.riskLevel === "danger").length;
  const riskRatioPercent = totalTasks > 0 ? Math.round((criticalTasksCount / totalTasks) * 100) : 0;

  const displayMetrics = [
    { label: "Deadline risk", value: `${riskRatioPercent}%`, detail: `${criticalTasksCount} task(s) critical`, tone: riskRatioPercent > 30 ? "danger" : "safe" },
    { label: "Total Tasks", value: String(totalTasks), detail: "Active scope in cockpit", tone: "safe" },
    { label: "Focus capacity", value: `${dailyCapacity}h/day`, detail: profile?.preferences?.profession ? `Focus: ${profile.preferences.profession}` : "Standard schedule", tone: "monitor" },
    { label: "Dashboard state", value: "Live", detail: "Real-time sync on", tone: "safe" }
  ];

  const displayName = profile?.name || user?.displayName || "User";

  // Dynamic scheduled blocks from Firestore subtasks
  const scheduledSubtasks = subtasksList.filter(s => s.startTime);
  const displaySchedule = scheduledSubtasks.length > 0
    ? scheduledSubtasks.map(s => {
        const parentTask = tasksList.find(t => t.id === s.taskId || t.taskId === s.taskId);
        const categoryLabel = parentTask?.category 
          ? parentTask.category.charAt(0).toUpperCase() + parentTask.category.slice(1)
          : "Focus block";
        
        const start = new Date(s.startTime);
        const formattedTime = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        
        return [
          formattedTime,
          categoryLabel,
          parentTask ? `[${parentTask.title}] - ${s.title}` : s.title,
          s.taskId
        ];
      }).sort((a, b) => String(a[0]).localeCompare(String(b[0]))).slice(0, 4)
    : schedule.slice(0, 4).map(s => [s[0], s[1], s[2], "mock"]);

  return (
    <section className="page page-wide">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "24px", marginBottom: "32px" }}>
        <div style={{ flex: "1 1 500px" }}>
          <PageHeader
            eyebrow="Dashboard"
            title={`${getGreeting()}, ${displayName}.`}
            description="Your deadlines are being watched, simulated, and reorganized into the next best move."
          />
        </div>
        <div>
          <Link className="button button-primary" href="/rescue">
            Review rescue plan <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <div className="grid grid-4" style={{ marginBottom: "32px" }}>
        {displayMetrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
      </div>

      <div className="grid grid-3" style={{ gap: "32px", alignItems: "stretch" }}>
        {/* ROW 1: At-Risk Work & Productivity Visualizer */}
        <div className="card card-pad stack" style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ margin: 0 }}>At-risk work</h2>
            <Link href="/tasks" className="muted" style={{ fontSize: "12px", textDecoration: "underline" }}>View all tasks</Link>
          </div>
          <div className="grid grid-2" style={{ gap: "20px", marginTop: "16px" }}>
            {displayTasks.length > 0 ? (
              displayTasks.map((task) => <TaskCard task={task} key={task.id} />)
            ) : (
              <div style={{ gridColumn: "span 2", padding: "32px", textAlign: "center", color: "var(--muted)", border: "1px dashed var(--surface-line)", borderRadius: "8px" }}>
                No tasks added yet. Start planning by adding your first task!
              </div>
            )}
          </div>
        </div>
        <div style={{ display: "flex", height: "100%", justifyContent: "center", alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={theme === "light" ? "/dashboardlight.png" : "/dashboarddark.png"} 
            alt="Productivity Analysis Graph" 
            style={{ 
              maxWidth: "100%", 
              maxHeight: "100%", 
              height: "auto", 
              borderRadius: "12px", 
              objectFit: "contain",
              transition: "opacity 0.25s ease" 
            }} 
          />
        </div>

        {/* ROW 2: Focus Blocks & Recent Signals */}
        <div className="card card-pad stack" style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", height: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 style={{ margin: 0 }}>Today{"'"}s focus blocks</h2>
            <Link href="/planner" className="muted" style={{ fontSize: "12px", textDecoration: "underline" }}>Open planner</Link>
          </div>
          <div className="timeline" style={{ padding: "8px 0", flex: 1 }}>
            {displaySchedule.map(([time, type, title, taskId]) => (
              <div className="timeline-item" key={time}>
                <span className="time">{time}</span>
                <div style={{ padding: "2px 0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <strong style={{ fontSize: "13.5px" }}>{type}</strong>
                    {taskId !== "mock" && (
                      <span className="pill monitor" style={{ fontSize: "9px", padding: "1px 5px", textTransform: "none", letterSpacing: "normal" }}>
                        ID: {taskId}
                      </span>
                    )}
                  </div>
                  <p className="muted" style={{ margin: "2px 0 0", fontSize: "12px" }}>{title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card card-pad stack" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <h2 style={{ margin: "0 0 16px" }}>Recent signals</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1, justifyContent: "space-between" }}>
            {notifications.slice(0, 3).map((note) => (
              <div className="list-row" key={note} style={{ padding: "12px 14px", fontSize: "12.5px", lineHeight: "1.4" }}>
                <span>{note}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
