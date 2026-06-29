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

// Dynamic Guest Prepopulated Seeding Helpers
const getPredefinedTasks = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(18, 0, 0, 0);

  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  dayAfter.setHours(18, 0, 0, 0);

  const inFiveDays = new Date();
  inFiveDays.setDate(inFiveDays.getDate() + 5);
  inFiveDays.setHours(18, 0, 0, 0);

  return [
    {
      id: "task_1",
      title: "Implement core risk model engine",
      estimatedHours: 4,
      deadline: tomorrow.toISOString(),
      progress: 25,
      risk: 85,
      riskLevel: "critical",
      category: "Coding",
      isImportant: true,
      behaviorState: "slipping",
      originalTime: "10:00"
    },
    {
      id: "task_2",
      title: "Setup Google Calendar OAuth redirect flow",
      estimatedHours: 3,
      deadline: dayAfter.toISOString(),
      progress: 60,
      risk: 42,
      riskLevel: "monitor",
      category: "Security",
      isImportant: false,
      behaviorState: "stable",
      originalTime: "09:00"
    },
    {
      id: "task_3",
      title: "Beta testing with pilot users",
      estimatedHours: 5,
      deadline: inFiveDays.toISOString(),
      progress: 0,
      risk: 10,
      riskLevel: "safe",
      category: "Product",
      isImportant: false,
      behaviorState: "stable"
    }
  ];
};

const getPredefinedSubtasks = () => {
  const today10am = new Date();
  today10am.setHours(10, 0, 0, 0);

  const today2pm = new Date();
  today2pm.setHours(14, 0, 0, 0);

  const tomorrow9am = new Date();
  tomorrow9am.setDate(tomorrow9am.getDate() + 1);
  tomorrow9am.setHours(9, 0, 0, 0);

  const tomorrow1pm = new Date();
  tomorrow1pm.setDate(tomorrow1pm.getDate() + 1);
  tomorrow1pm.setHours(13, 0, 0, 0);

  return [
    {
      id: "subtask_1",
      taskId: "task_1",
      title: "Draft risk engine simulation",
      estimatedHours: 2,
      isCompleted: false,
      startTime: today10am.toISOString(),
      endTime: new Date(today10am.getTime() + 2 * 3600 * 1000).toISOString(),
      originalTime: "10:00"
    },
    {
      id: "subtask_2",
      taskId: "task_1",
      title: "Write Monte Carlo path generator",
      estimatedHours: 2,
      isCompleted: false,
      startTime: today2pm.toISOString(),
      endTime: new Date(today2pm.getTime() + 2 * 3600 * 1000).toISOString(),
      originalTime: "14:00"
    },
    {
      id: "subtask_3",
      taskId: "task_2",
      title: "OAuth credentials integration",
      estimatedHours: 1.5,
      isCompleted: false,
      startTime: tomorrow9am.toISOString(),
      endTime: new Date(tomorrow9am.getTime() + 1.5 * 3600 * 1000).toISOString(),
      originalTime: "09:00"
    },
    {
      id: "subtask_4",
      taskId: "task_3",
      title: "Inspect mobile layout responsiveness",
      estimatedHours: 2,
      isCompleted: false,
      startTime: tomorrow1pm.toISOString(),
      endTime: new Date(tomorrow1pm.getTime() + 2 * 3600 * 1000).toISOString(),
      originalTime: "13:00"
    }
  ];
};

export default function DashboardPage() {
  const { theme } = useTheme();
  const { user, profile } = useAuth();
  const [tasksList, setTasksList] = useState<any[]>([]);
  const [subtasksList, setSubtasksList] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    if (user.uid === "guest-user-id") {
      const getLocalTasks = () => {
        let stored = localStorage.getItem("foresee-guest-tasks");
        if (!stored) {
          const defaults = getPredefinedTasks();
          localStorage.setItem("foresee-guest-tasks", JSON.stringify(defaults));
          return defaults;
        }
        return JSON.parse(stored);
      };
      setTasksList(getLocalTasks());

      const handleStorage = () => {
        setTasksList(JSON.parse(localStorage.getItem("foresee-guest-tasks") || "[]"));
      };
      window.addEventListener("storage", handleStorage);
      return () => window.removeEventListener("storage", handleStorage);
    }

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
    if (user.uid === "guest-user-id") {
      const getLocalSubtasks = () => {
        let stored = localStorage.getItem("foresee-guest-subtasks");
        if (!stored) {
          const defaults = getPredefinedSubtasks();
          localStorage.setItem("foresee-guest-subtasks", JSON.stringify(defaults));
          return defaults;
        }
        return JSON.parse(stored);
      };
      setSubtasksList(getLocalSubtasks());

      const handleStorage = () => {
        setSubtasksList(JSON.parse(localStorage.getItem("foresee-guest-subtasks") || "[]"));
      };
      window.addEventListener("storage", handleStorage);
      return () => window.removeEventListener("storage", handleStorage);
    }

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
