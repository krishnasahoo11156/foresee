"use client";

import { useState, useEffect } from "react";
import { Plus, TableProperties, X } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { TaskCard } from "@/components/ui/TaskCard";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { useAuth } from "@/components/AuthProvider";
import { collection, query, onSnapshot, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function TasksPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Tasks Firestore state
  const [tasksList, setTasksList] = useState<any[]>([]);

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [hours, setHours] = useState<number>(2);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [deadlineTime, setDeadlineTime] = useState("18:00");
  const [isImportant, setIsImportant] = useState(false);

  // Sync modal state with query param
  useEffect(() => {
    if (searchParams.get("new") === "true") {
      setIsModalOpen(true);
    }
  }, [searchParams]);

  // Set default deadline date to tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const dd = String(tomorrow.getDate()).padStart(2, "0");
    setDeadlineDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  // Real-time Firestore query
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
      console.warn("Failed to subscribe to tasks list:", err);
    });
    return unsub;
  }, [user]);

  const closeModal = () => {
    setIsModalOpen(false);
    router.push("/tasks");
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const deadlineString = `${deadlineDate}T${deadlineTime}`;
      await addDoc(collection(db, "users", user.uid, "tasks"), {
        title,
        hours: Number(hours),
        difficulty,
        deadline: deadlineString,
        isImportant,
        progress: 0,
        createdAt: new Date().toISOString()
      });

      // Reset form fields
      setTitle("");
      setHours(2);
      setDifficulty("medium");
      setIsImportant(false);
      closeModal();
    } catch (err) {
      console.error("Failed to add task:", err);
    }
  };

  const dailyCapacity = Number(profile?.preferences?.deepWorkHours || 4);

  // Dynamic capacity risk calculations
  const getSortedTasksWithRisk = (tasks: any[], capacity: number) => {
    const sorted = [...tasks].sort((a, b) => {
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });

    const now = new Date();

    return sorted.map((task, idx) => {
      const deadline = new Date(task.deadline);
      const diffMs = deadline.getTime() - now.getTime();
      const daysRemaining = Math.max(0.1, diffMs / (1000 * 60 * 60 * 24));
      const totalCapacity = daysRemaining * capacity;

      let allocatedHours = 0;
      for (let i = 0; i <= idx; i++) {
        allocatedHours += Number(sorted[i].hours || 0);
      }

      const buffer = totalCapacity - allocatedHours;

      let riskLevel: "critical" | "danger" | "monitor" | "safe" = "safe";
      let riskPercentage = 15;

      if (buffer < 0) {
        riskLevel = "critical";
        const ratio = totalCapacity > 0 ? allocatedHours / totalCapacity : 2;
        riskPercentage = Math.min(99, Math.round(80 + (ratio - 1) * 20));
      } else if (buffer <= 1.5) {
        riskLevel = "monitor";
        riskPercentage = Math.round(55 + (1.5 - buffer) * 15);
      } else {
        riskLevel = "safe";
        riskPercentage = Math.max(5, Math.round(35 - (buffer - 1.5) * 5));
      }

      const formattedDeadline = deadline.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
      });

      return {
        ...task,
        deadline: formattedDeadline,
        risk: riskPercentage,
        riskLevel,
        progress: task.progress || 0,
        effort: `${task.hours || 0}h needed`,
        category: task.difficulty ? task.difficulty.toUpperCase() : "MEDIUM"
      };
    });
  };

  const computedTasks = getSortedTasksWithRisk(tasksList, dailyCapacity);

  return (
    <section className="page page-wide">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "24px", marginBottom: "32px" }}>
        <div style={{ flex: "1 1 500px" }}>
          <PageHeader
            eyebrow="Tasks"
            title="Every deadline, risk-scored."
            description="Create tasks in natural language, track subtasks, and let ForeSee keep the rescue options close."
          />
        </div>
        <div>
          <button className="button button-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Add task
          </button>
        </div>
      </div>

      <div style={{ marginBottom: "32px" }}>
        <ImagePlaceholder label="Timeline risk heat-map visualizer" height="200px" />
      </div>

      <div className="grid grid-3" style={{ marginBottom: "32px", gap: "24px" }}>
        {computedTasks.length > 0 ? (
          computedTasks.map((task) => <TaskCard task={task} key={task.id} />)
        ) : (
          <div style={{ gridColumn: "span 3", padding: "48px", textAlign: "center", color: "var(--muted)", border: "1px dashed var(--surface-line)", borderRadius: "12px" }}>
            No active tasks found in database. Create your first task using the button above.
          </div>
        )}
      </div>

      {computedTasks.length > 0 && (
        <div className="card card-pad" style={{ padding: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <div style={{ color: "var(--accent)", display: "flex" }}>
              <TableProperties size={18} />
            </div>
            <h2 style={{ margin: 0, fontSize: "18px" }}>Detailed deadline matrix</h2>
          </div>
          
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: "40%" }}>Task details</th>
                  <th>Deadline</th>
                  <th>Progress</th>
                  <th>Risk score</th>
                  <th>Difficulty</th>
                </tr>
              </thead>
              <tbody>
                {computedTasks.map((task) => (
                  <tr key={task.id} style={{ cursor: "pointer" }}>
                    <td>
                      <Link href={`/tasks/${task.id}`} style={{ display: "block" }}>
                        <strong style={{ fontSize: "14px", color: "var(--text)" }}>{task.title}</strong>
                        {task.isImportant && (
                          <span className="pill danger" style={{ marginLeft: "8px", padding: "1px 6px", fontSize: "9px" }}>
                            IMPORTANT
                          </span>
                        )}
                      </Link>
                    </td>
                    <td style={{ fontSize: "13.5px" }}>{task.deadline}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "120px" }}>
                        <div className="progress" style={{ flex: 1, height: "4px" }}>
                          <span style={{ width: `${task.progress}%` }} />
                        </div>
                        <span style={{ fontSize: "12px", fontWeight: "600" }}>{task.progress}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`pill ${task.riskLevel}`} style={{ padding: "2px 8px", fontSize: "11px", fontWeight: 700 }}>
                        {task.risk}%
                      </span>
                    </td>
                    <td style={{ fontSize: "13px", color: "var(--muted-strong)" }}>{task.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Creation Modal dialog */}
      {isModalOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "16px"
        }}>
          <div className="card" style={{
            maxWidth: "480px",
            width: "100%",
            padding: "28px",
            background: "var(--bg)",
            border: "1px solid var(--surface-line)",
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.25)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ margin: 0, fontSize: "20px" }}>Add new task</h2>
              <button 
                onClick={closeModal} 
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex" }}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddTask} className="stack" style={{ gap: "16px" }}>
              <label className="label">
                <span>Task title</span>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Finish hackathon draft" 
                  className="input" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </label>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <label className="label">
                  <span>Expected hours</span>
                  <input 
                    type="number" 
                    required 
                    min="0.5" 
                    step="0.5" 
                    className="input" 
                    value={hours}
                    onChange={e => setHours(Number(e.target.value))}
                  />
                </label>
                <label className="label">
                  <span>Difficulty</span>
                  <select 
                    className="select"
                    value={difficulty}
                    onChange={e => setDifficulty(e.target.value as any)}
                  >
                    <option value="easy">Easy (low focus)</option>
                    <option value="medium">Medium (standard)</option>
                    <option value="hard">Hard (high focus)</option>
                  </select>
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <label className="label">
                  <span>Deadline Date</span>
                  <input 
                    type="date" 
                    required 
                    className="input" 
                    value={deadlineDate}
                    onChange={e => setDeadlineDate(e.target.value)}
                  />
                </label>
                <label className="label">
                  <span>Time (24h)</span>
                  <input 
                    type="time" 
                    required 
                    className="input" 
                    value={deadlineTime}
                    onChange={e => setDeadlineTime(e.target.value)}
                  />
                </label>
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", margin: "8px 0" }}>
                <input 
                  type="checkbox" 
                  checked={isImportant}
                  onChange={e => setIsImportant(e.target.checked)}
                  style={{ width: "16px", height: "16px" }}
                />
                <span style={{ fontSize: "14px" }}>Mark as highly important</span>
              </label>

              <button type="submit" className="button button-primary" style={{ width: "100%", justifyContent: "center", height: "44px", marginTop: "8px" }}>
                Save task
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
