"use client";

import { useState, useEffect } from "react";
import { Plus, TableProperties, X } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { TaskCard } from "@/components/ui/TaskCard";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { TimelineHeatmap } from "@/components/ui/TimelineHeatmap";
import { useAuth } from "@/components/AuthProvider";
import { collection, query, onSnapshot, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { calculateRiskAndClassification } from "@/lib/riskEngine";

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

  // Advanced Optional parameters
  const [category, setCategory] = useState<string>("Coding");
  const [taskType, setTaskType] = useState<string>("fixed_deadline");
  const [executionStyle, setExecutionStyle] = useState<string>("single_session");
  const [energyRequirement, setEnergyRequirement] = useState<string>("medium");
  const [interruptionTolerance, setInterruptionTolerance] = useState<string>("semi");
  const [estimatedConfidence, setEstimatedConfidence] = useState<number>(80);
  const [motivationLevel, setMotivationLevel] = useState<string>("neutral");
  const [requiresInternet, setRequiresInternet] = useState<boolean>(true);
  const [requirementsInput, setRequirementsInput] = useState<string>("laptop");
  const [dependenciesInput, setDependenciesInput] = useState<string>("");

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
      
      const requirements = requirementsInput.split(",").map(r => r.trim()).filter(Boolean);
      const dependencies = dependenciesInput.split(",").map(d => d.trim()).filter(Boolean);

      const tempTask: any = {
        taskId: `task_${Date.now()}`,
        userId: user.uid,
        title,
        estimatedHours: Number(hours),
        difficulty,
        deadline: deadlineString,
        isImportant,
        progress: 0,
        category: category as any,
        taskType: taskType as any,
        executionStyle: executionStyle as any,
        energyRequirement: energyRequirement as any,
        interruptionTolerance: interruptionTolerance as any,
        estimatedConfidence: Number(estimatedConfidence),
        motivationLevel: motivationLevel as any,
        requiresInternet,
        requirements,
        dependencies,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        rescueCount: 0,
        planStabilityIndex: 100,
        behaviorScore: 100,
        riskScore: 15,
        riskLevel: "safe",
        riskTrend: "stable"
      };

      const analysis = calculateRiskAndClassification(tempTask, tasksList, profile);

      const taskDoc = {
        ...tempTask,
        riskScore: analysis.riskScore,
        riskLevel: analysis.riskLevel,
        completionProbability: analysis.completionProbability,
        urgency: analysis.urgency,
        importance: analysis.importance,
        difficulty: analysis.difficulty,
        planningState: analysis.planningState,
        behaviorState: analysis.behaviorState,
        calendarState: analysis.calendarState,
        dependencyState: analysis.dependencyState,
        progressState: analysis.progressState,
        factors: analysis.factors
      };

      await addDoc(collection(db, "users", user.uid, "tasks"), taskDoc);

      // Reset form fields
      setTitle("");
      setHours(2);
      setDifficulty("medium");
      setIsImportant(false);
      setCategory("Coding");
      setTaskType("fixed_deadline");
      setExecutionStyle("single_session");
      setEnergyRequirement("medium");
      setInterruptionTolerance("semi");
      setEstimatedConfidence(80);
      setMotivationLevel("neutral");
      setRequiresInternet(true);
      setRequirementsInput("laptop");
      setDependenciesInput("");
      
      closeModal();
    } catch (err) {
      console.error("Failed to add task:", err);
    }
  };

  const dailyCapacity = Number(profile?.preferences?.deepWorkHours || 4);

  // Dynamic capacity risk calculations utilizing the core math engine
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
        <TimelineHeatmap tasks={computedTasks} dailyCapacity={dailyCapacity} />
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
                        <span className="pill monitor" style={{ marginLeft: "8px", padding: "1px 6px", fontSize: "9px", textTransform: "none", letterSpacing: "normal" }}>
                          ID: {task.taskId || task.id}
                        </span>
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
            maxWidth: "520px",
            width: "100%",
            padding: "28px",
            background: "var(--bg)",
            border: "1px solid var(--surface-line)",
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
            maxHeight: "85vh",
            overflowY: "auto"
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

              {/* Advanced Parameters Section */}
              <div style={{ padding: "12px", border: "1px solid var(--surface-line)", borderRadius: "8px", background: "var(--surface-soft)", display: "flex", flexDirection: "column", gap: "12px" }}>
                <strong style={{ fontSize: "12px", color: "var(--accent)" }}>Productivity Engine Mapping</strong>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <label className="label">
                    <span>Task Category</span>
                    <select className="select" value={category} onChange={e => setCategory(e.target.value)}>
                      <option value="Coding">Coding</option>
                      <option value="Research">Research</option>
                      <option value="Assignment">Assignment</option>
                      <option value="Exam">Exam</option>
                      <option value="Meeting">Meeting</option>
                      <option value="Bills">Bills</option>
                      <option value="Health">Health</option>
                      <option value="Personal">Personal</option>
                    </select>
                  </label>
                  <label className="label">
                    <span>Task Type</span>
                    <select className="select" value={taskType} onChange={e => setTaskType(e.target.value)}>
                      <option value="fixed_deadline">Fixed Deadline</option>
                      <option value="flexible">Flexible</option>
                      <option value="recurring">Recurring</option>
                      <option value="milestone">Milestone</option>
                    </select>
                  </label>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <label className="label">
                    <span>Energy level</span>
                    <select className="select" value={energyRequirement} onChange={e => setEnergyRequirement(e.target.value)}>
                      <option value="very_low">Very Low</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="peak">Peak Focus</option>
                    </select>
                  </label>
                  <label className="label">
                    <span>Interruption tolerance</span>
                    <select className="select" value={interruptionTolerance} onChange={e => setInterruptionTolerance(e.target.value)}>
                      <option value="interruptible">Interruptible</option>
                      <option value="semi">Semi-Interruptible</option>
                      <option value="deep_work_only">Deep Work Only</option>
                    </select>
                  </label>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <label className="label">
                    <span>Estimated Confidence</span>
                    <select className="select" value={estimatedConfidence} onChange={e => setEstimatedConfidence(Number(e.target.value))}>
                      <option value="20">20% (Unsure)</option>
                      <option value="50">50% (Moderate)</option>
                      <option value="80">80% (Highly Confident)</option>
                      <option value="100">100% (Certain)</option>
                    </select>
                  </label>
                  <label className="label">
                    <span>Motivation Level</span>
                    <select className="select" value={motivationLevel} onChange={e => setMotivationLevel(e.target.value)}>
                      <option value="excited">Very Excited</option>
                      <option value="neutral">Neutral</option>
                      <option value="avoiding">Avoiding / Procrastinating</option>
                      <option value="burned_out">Burned Out</option>
                      <option value="forced">Forced</option>
                    </select>
                  </label>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <label className="label">
                    <span>Requirements</span>
                    <input type="text" className="input" placeholder="e.g. laptop, internet" value={requirementsInput} onChange={e => setRequirementsInput(e.target.value)} />
                  </label>
                  <label className="label">
                    <span>Dependencies (Task IDs)</span>
                    <input type="text" className="input" placeholder="e.g. task_123, task_456" value={dependenciesInput} onChange={e => setDependenciesInput(e.target.value)} />
                  </label>
                </div>

                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginTop: "4px" }}>
                  <input 
                    type="checkbox" 
                    checked={requiresInternet}
                    onChange={e => setRequiresInternet(e.target.checked)}
                    style={{ width: "16px", height: "16px" }}
                  />
                  <span style={{ fontSize: "13px" }}>Requires active internet connection</span>
                </label>
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", margin: "4px 0" }}>
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
