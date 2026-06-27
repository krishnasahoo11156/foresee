import {
  Task,
  UserProfile,
  RiskLevel,
  UrgencyLevel,
  ImportanceLevel,
  DifficultyLevel,
  PlanningState,
  BehaviorState,
  CalendarState,
  DependencyState,
  ProgressState,
  RescueStrategy
} from "./types";

/**
 * Calculates the multi-factor risk score and classification states for a given task.
 * Implements the ForeSee Unified Risk Formula.
 */
export function calculateRiskAndClassification(
  task: Task,
  allTasks: Task[],
  profile: UserProfile | null
) {
  const now = new Date();
  const deadline = new Date(task.deadline);
  
  // 1. Time calculations
  const t_rem = Math.max(0, (deadline.getTime() - now.getTime()) / (1000 * 60 * 60)); // remaining hours
  const progress = task.progress || 0;
  const E_rem = task.estimatedHours * (1 - progress / 100); // remaining effort needed

  // If completed
  if (progress >= 100) {
    return {
      riskScore: 0,
      riskLevel: "safe" as RiskLevel,
      completionProbability: 100,
      urgency: "future" as UrgencyLevel,
      importance: "low" as ImportanceLevel,
      difficulty: getDifficulty(task.estimatedHours),
      planningState: "fully_planned" as PlanningState,
      behaviorState: "on_track" as BehaviorState,
      calendarState: "scheduled" as CalendarState,
      dependencyState: "ready" as DependencyState,
      progressState: "done" as ProgressState,
      factors: { timePressure: 0, workloadGap: 0, behavior: 0, dependency: 0, health: 0 }
    };
  }

  // If deadline passed and not completed
  if (t_rem <= 0) {
    return {
      riskScore: 100,
      riskLevel: "critical" as RiskLevel,
      completionProbability: 0,
      urgency: "critical" as UrgencyLevel,
      importance: task.isImportant ? "mission_critical" as ImportanceLevel : "high" as ImportanceLevel,
      difficulty: getDifficulty(task.estimatedHours),
      planningState: "partial" as PlanningState,
      behaviorState: "stalled" as BehaviorState,
      calendarState: "unscheduled" as CalendarState,
      dependencyState: "blocked" as DependencyState,
      progressState: "started" as ProgressState,
      factors: { timePressure: 100, workloadGap: 100, behavior: 100, dependency: 0, health: 100 }
    };
  }

  // --- 2. Calculate Base Risk Factors ---

  // Time Pressure (X_T)
  const X_T = Math.min(100, Math.round((E_rem / Math.max(0.1, t_rem)) * 100));

  // Workload Capacity Deficit (X_C)
  const deepWorkHoursPerDay = profile?.preferences?.deepWorkHours 
    ? Number(profile.preferences.deepWorkHours) 
    : 4.0;
  const daysRemaining = Math.max(0.1, t_rem / 24);
  const A_avail = daysRemaining * deepWorkHoursPerDay; // available hours
  
  let X_C = 0;
  if (A_avail < E_rem) {
    X_C = Math.min(100, Math.round(((E_rem - A_avail) / Math.max(1, E_rem)) * 100));
  }

  // User Behavior Modifier (X_B)
  const reliability = profile?.metrics?.reliabilityScore !== undefined 
    ? profile.metrics.reliabilityScore 
    : 80; // 0 - 100
  const procrastination = profile?.preferences?.procrastinationLevel !== undefined 
    ? Number(profile.preferences.procrastinationLevel) 
    : 2; // 1 - 5
  const X_B = Math.min(100, Math.round((1 - reliability / 100) * 40 + procrastination * 12));

  // Dependency Risk (X_D)
  let X_D = 0;
  let hasBlockedDependency = false;
  let hasActiveDependency = false;
  if (task.dependencies && task.dependencies.length > 0) {
    task.dependencies.forEach((depId) => {
      const depTask = allTasks.find((t) => t.id === depId || t.taskId === depId);
      if (depTask && depTask.progress < 100) {
        hasActiveDependency = true;
        const depDeadline = new Date(depTask.deadline);
        if (depDeadline.getTime() < now.getTime()) {
          hasBlockedDependency = true;
        }
        X_D = Math.max(X_D, depTask.riskScore || 20);
      }
    });
  }

  // Burnout/Health Modifier (X_H)
  const sleepHours = profile?.preferences?.averageSleep !== undefined 
    ? Number(profile.preferences.averageSleep) 
    : 7.5;
  const sleepQuality = Math.min(1, sleepHours / 8.0);
  const burnoutScore = profile?.metrics?.burnoutScore !== undefined 
    ? profile.metrics.burnoutScore 
    : 20;
  const X_H = Math.min(100, Math.round((1 - sleepQuality) * 40 + burnoutScore * 0.6));

  // --- 3. Adaptive Weight Assignment ---
  // Default weights
  let W_T = 0.35; // Time Pressure
  let W_C = 0.30; // Workload Capacity
  let W_B = 0.20; // Behavior
  let W_D = 0.10; // Dependencies
  let W_H = 0.05; // Health

  // Redirection if no dependencies
  if (!task.dependencies || task.dependencies.length === 0) {
    W_T = 0.40;
    W_C = 0.35;
    W_B = 0.20;
    W_H = 0.05;
    W_D = 0;
  }

  // User-specific weight adaptations:
  // 1. If procrastination is high (4 or 5), amplify behavior weight
  if (procrastination >= 4) {
    const delta = 0.10;
    W_B += delta;
    W_T -= delta / 2;
    W_C -= delta / 2;
  }
  // 2. If calendar strictness is low, increase workload weight
  const strictness = profile?.preferences?.calendarStrictness !== undefined
    ? Number(profile.preferences.calendarStrictness)
    : 75; // 0 - 100
  if (strictness < 50) {
    const delta = 0.08;
    W_C += delta;
    W_T -= delta;
  }

  // --- 4. Final Risk Calculation ---
  const riskScore = Math.min(
    99,
    Math.max(
      5,
      Math.round(
        W_T * X_T +
        W_C * X_C +
        W_B * X_B +
        W_D * X_D +
        W_H * X_H
      )
    )
  );

  // Risk Level Classification
  let riskLevel: RiskLevel = "safe";
  if (riskScore >= 85) riskLevel = "critical";
  else if (riskScore >= 60) riskLevel = "danger";
  else if (riskScore >= 30) riskLevel = "monitor";

  // Completion Probability (Dynamic mapping)
  const completionProbability = Math.max(2, Math.min(98, 100 - riskScore));

  // --- 5. Dimension Classifications ---

  // Urgency
  let urgency: UrgencyLevel = "future";
  if (t_rem <= 1.2 * E_rem) urgency = "critical";
  else if (t_rem <= 3.0 * E_rem) urgency = "urgent";
  else if (t_rem <= 7.0 * 24) urgency = "soon";

  // Importance
  let importance: ImportanceLevel = "low";
  if (task.isImportant) {
    importance = riskScore >= 60 ? "mission_critical" : "high";
  } else if (task.category === "Finance" || task.category === "Bills" || task.category === "Exam") {
    importance = "high";
  } else {
    importance = "medium";
  }

  // Difficulty
  const difficulty = getDifficulty(task.estimatedHours);

  // Planning State
  let planningState: PlanningState = "unplanned";
  if (task.taskType === "calendar_event") {
    planningState = "fully_planned";
  } else if (progress > 0) {
    planningState = "partial";
  } else {
    planningState = "unplanned";
  }

  // Dependency State
  let dependencyState: DependencyState = "ready";
  if (task.dependencies && task.dependencies.length > 0) {
    if (hasBlockedDependency) {
      dependencyState = "blocked";
    } else if (hasActiveDependency) {
      dependencyState = "waiting";
    }
  }

  // Behavior State
  let behaviorState: BehaviorState = "on_track";
  if (dependencyState === "blocked") {
    behaviorState = "blocked";
  } else if (task.rescueCount && task.rescueCount > 0 && riskLevel === "safe") {
    behaviorState = "recovering";
  } else if (riskLevel === "critical" && progress === 0) {
    behaviorState = "stalled";
  } else if (riskLevel === "danger" || riskLevel === "critical") {
    behaviorState = "slipping";
  }

  // Calendar State
  let calendarState: CalendarState = "unscheduled";
  if (task.taskType === "calendar_event") {
    calendarState = "scheduled";
  } else if (planningState === "partial") {
    calendarState = "scheduled";
  } else if (riskLevel === "critical") {
    calendarState = "overbooked";
  }

  // Progress State
  let progressState: ProgressState = "not_started";
  if (progress >= 100) progressState = "done";
  else if (progress >= 75) progressState = "almost_done";
  else if (progress >= 25) progressState = "half_done";
  else if (progress > 0) progressState = "started";

  return {
    riskScore,
    riskLevel,
    completionProbability,
    urgency,
    importance,
    difficulty,
    planningState,
    behaviorState,
    calendarState,
    dependencyState,
    progressState,
    factors: {
      timePressure: X_T,
      workloadGap: X_C,
      behavior: X_B,
      dependency: X_D,
      health: X_H
    }
  };
}

function getDifficulty(hours: number): DifficultyLevel {
  if (hours <= 1.0) return "easy";
  if (hours <= 4.0) return "medium";
  if (hours <= 10.0) return "hard";
  return "very_hard";
}

/**
 * Generates recovery strategies for a task based on its risk context and user preferences.
 */
export function generateRescueStrategies(
  task: Task,
  profile: UserProfile | null
): RescueStrategy[] {
  const now = new Date();
  const deadline = new Date(task.deadline);
  const remainingHours = Math.max(1, (deadline.getTime() - now.getTime()) / (1000 * 60 * 60));
  const E_rem = task.estimatedHours * (1 - (task.progress || 0) / 100);

  const weekendAllowed = profile?.preferences?.weekendAvailability ?? false;
  const stressImpact = profile?.preferences?.stressLevel ?? "medium";

  // Strategy 1: Focused Sprint
  const schedule1 = [];
  const days = Math.ceil(remainingHours / 24);
  const hoursPerDay = E_rem / Math.max(1, days);
  for (let i = 0; i < Math.min(days, 5); i++) {
    const d = new Date();
    d.setDate(now.getDate() + i);
    schedule1.push({ date: d.toISOString().split("T")[0], hours: Number(hoursPerDay.toFixed(1)) });
  }

  const focusedSprint: RescueStrategy = {
    name: "Focused Sprint",
    description: "Postpone lower-priority events and assign protected deep-work blocks daily.",
    predictedSuccessProbability: Math.min(95, Math.round(65 + (weekendAllowed ? 15 : 5))),
    dailyWorkSchedule: schedule1,
    requiredEffortIncreasePercent: Math.round((E_rem / Math.max(1, days * 2)) * 100),
    tradeOffs: ["Postpones routine tasks", "Requires calendar lockouts"],
    confidenceScore: 85,
    estimatedStressImpact: stressImpact === "high" ? "high" : "medium",
    expectedCompletionDate: new Date(deadline.getTime() - 4 * 3600 * 1000).toISOString(), // 4h before deadline
    finalRecommendation: true
  };

  // Strategy 2: Scope Compression
  const schedule2 = schedule1.map((s) => ({ ...s, hours: Number((s.hours * 0.7).toFixed(1)) }));
  const scopeCompression: RescueStrategy = {
    name: "Scope Compression",
    description: "Remove non-essential components and defer secondary subtasks to future milestones.",
    predictedSuccessProbability: Math.min(92, Math.round(75 + (task.progress || 0) * 0.15)),
    dailyWorkSchedule: schedule2,
    requiredEffortIncreasePercent: 0,
    tradeOffs: ["Deliverables reduced to MVP core", "Optional sections deferred"],
    confidenceScore: 78,
    estimatedStressImpact: "low",
    expectedCompletionDate: new Date(deadline.getTime() - 8 * 3600 * 1000).toISOString(),
    finalRecommendation: false
  };

  // Strategy 3: Emergency Rescue
  const schedule3 = [{ date: now.toISOString().split("T")[0], hours: E_rem }];
  const emergencyRescue: RescueStrategy = {
    name: "Emergency Rescue",
    description: "Initiate Emergency Mode: lock absolute focus, disable other calendar entries, and notify accountability buddy.",
    predictedSuccessProbability: Math.min(98, Math.round(80 + (task.progress || 0) * 0.1)),
    dailyWorkSchedule: schedule3,
    requiredEffortIncreasePercent: Math.round((E_rem / 1) * 100),
    tradeOffs: ["High stress activity", "Suspends all other scheduling"],
    confidenceScore: 90,
    estimatedStressImpact: "high",
    expectedCompletionDate: deadline.toISOString(),
    finalRecommendation: false
  };

  return [focusedSprint, scopeCompression, emergencyRescue];
}
