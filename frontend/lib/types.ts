export type TaskCategory =
  | "Assignment"
  | "Meeting"
  | "Coding"
  | "Research"
  | "Exam"
  | "Interview"
  | "Presentation"
  | "Documentation"
  | "Personal"
  | "Finance"
  | "Health"
  | "Bills"
  | "Travel"
  | "Learning"
  | "Workout"
  | "Family"
  | "Other";

export type TaskType =
  | "fixed_deadline"
  | "flexible"
  | "recurring"
  | "milestone"
  | "dependent"
  | "goal"
  | "habit"
  | "calendar_event";

export type ExecutionStyle = "single_session" | "multi_session" | "parallel" | "sequential";

export type EnergyRequirement = "very_low" | "low" | "medium" | "high" | "peak";

export type InterruptionTolerance = "interruptible" | "semi" | "deep_work_only";

export type MotivationLevel = "excited" | "neutral" | "avoiding" | "burned_out" | "forced";

export type RiskLevel = "safe" | "monitor" | "danger" | "critical";

export type UrgencyLevel = "critical" | "urgent" | "soon" | "future";

export type ImportanceLevel = "mission_critical" | "high" | "medium" | "low";

export type DifficultyLevel = "easy" | "medium" | "hard" | "very_hard";

export type PlanningState = "unplanned" | "partial" | "fully_planned";

export type BehaviorState = "on_track" | "slipping" | "stalled" | "blocked" | "recovering";

export type CalendarState = "scheduled" | "conflicting" | "unscheduled" | "overbooked";

export type DependencyState = "waiting" | "ready" | "blocked";

export type ProgressState = "not_started" | "started" | "half_done" | "almost_done" | "done";

export interface UserProfilePreferences {
  profession: "developer" | "designer" | "manager" | "student" | "writer" | "other";
  workStart: string; // "HH:MM"
  workEnd: string; // "HH:MM"
  deepWorkHours: number;
  workingStyle: "morning" | "night" | "balanced";
  peakFocusWindow: string[]; // e.g. ["09:00-12:00"]
  preferredSessionLength: number; // minutes
  maxDailyDeepWork: number; // hours
  maxTotalWork: number; // hours
  weekendAvailability: boolean;
  lunchStart: string; // "HH:MM"
  lunchEnd: string; // "HH:MM"
  meetingHeavy: boolean;
  notificationPreference: "high" | "medium" | "low";
  calendarStrictness: number; // 0-100
  procrastinationLevel: number; // 1-5
  averageSleep: number; // hours
  stressLevel: "low" | "medium" | "high";
  riskTolerance: "low" | "medium" | "high";
  taskSwitchingAbility: "low" | "medium" | "high";
  contextSwitchingCost: number; // minutes
  breakFrequency: number; // minutes
  focusRecoveryTime: number; // minutes
}

export interface UserProfileMetrics {
  averageCompletionRate: number; // 0.0 - 1.0
  averageDelayHours: number;
  deepWorkCapacity: number; // hours
  burnoutScore: number; // 0-100
  reliabilityScore: number; // 0-100
  focusScore: number; // 0-100
  planningAccuracy: number; // 0.0 - 1.0
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  username: string;
  preferences?: UserProfilePreferences;
  metrics?: UserProfileMetrics;
  createdAt?: any;
  updatedAt?: any;
}

export interface Task {
  id?: string; // Firestore doc ID
  taskId: string;
  userId: string;
  title: string;
  description?: string;
  category: TaskCategory;
  taskType: TaskType;
  executionStyle: ExecutionStyle;
  energyRequirement: EnergyRequirement;
  interruptionTolerance: InterruptionTolerance;
  estimatedConfidence: number; // 20, 40, 60, 80, 100
  motivationLevel: MotivationLevel;
  requiresInternet: boolean;
  requirements: string[]; // laptop, office, travel, team, etc.
  deadline: string; // ISO String
  estimatedHours: number;
  actualHours?: number;
  isImportant: boolean;
  progress: number; // 0 - 100
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  riskTrend: "up" | "down" | "stable";
  completionProbability: number; // 0 - 100
  dependencies: string[]; // taskId array
  createdAt: string;
  updatedAt: string;
  lastActivity: string;
  rescueCount: number;
  planStabilityIndex: number; // 0 - 100
  behaviorScore: number; // 0 - 100
}

export interface Subtask {
  id?: string;
  subtaskId: string;
  taskId: string;
  title: string;
  estimatedHours: number;
  isCompleted: boolean;
  order: number;
  completedAt?: string;
}

export interface RescueStrategy {
  name: "Focused Sprint" | "Scope Compression" | "Emergency Rescue" | "Split Sessions";
  description: string;
  predictedSuccessProbability: number;
  dailyWorkSchedule: Array<{ date: string; hours: number }>;
  requiredEffortIncreasePercent: number;
  tradeOffs: string[];
  confidenceScore: number;
  estimatedStressImpact: "low" | "medium" | "high";
  expectedCompletionDate: string;
  finalRecommendation: boolean;
}

export interface RescuePlan {
  id?: string;
  planId: string;
  taskId: string;
  timestamp: string;
  status: "pending" | "accepted" | "declined" | "completed";
  strategies: RescueStrategy[];
}
