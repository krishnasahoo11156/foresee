import {
  Activity,
  BarChart3,
  Bell,
  Bot,
  CalendarDays,
  CircleHelp,
  Gauge,
  Home,
  Inbox,
  LifeBuoy,
  MessageSquare,
  Puzzle,
  Settings,
  Sparkles,
  User,
  Workflow
} from "lucide-react";

export const navSections = [
  {
    label: "Core",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: Home },
      { href: "/tasks", label: "Tasks", icon: Inbox },
      { href: "/planner", label: "Planner", icon: CalendarDays },
      { href: "/rescue", label: "Rescue Center", icon: LifeBuoy },
      { href: "/copilot", label: "AI Copilot", icon: MessageSquare }
    ]
  },
  {
    label: "Intelligence",
    items: [
      { href: "/simulations", label: "Simulations", icon: Sparkles },
      { href: "/agents", label: "Agents", icon: Bot },
      { href: "/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/notifications", label: "Notifications", icon: Bell }
    ]
  },
  {
    label: "Workspace",
    items: [
      { href: "/integrations", label: "Integrations", icon: Puzzle },
      { href: "/settings", label: "Settings", icon: Settings },
      { href: "/profile", label: "Profile", icon: User },
      { href: "/help", label: "Help", icon: CircleHelp }
    ]
  }
];

export const tasks = [
  {
    id: "launch-brief",
    title: "Finalize hackathon launch brief",
    category: "Submission",
    deadline: "Today, 8:00 PM",
    progress: 68,
    risk: 82,
    riskLevel: "critical",
    effort: "3h 20m left",
    owner: "Krish",
    nextAction: "Compress architecture section into demo script",
    dependencies: ["Architecture diagram", "Demo data"]
  },
  {
    id: "calendar-sync",
    title: "Test Google Calendar rescue sync",
    category: "Integration",
    deadline: "Tomorrow, 11:00 AM",
    progress: 42,
    risk: 64,
    riskLevel: "danger",
    effort: "5h 10m left",
    owner: "Krish",
    nextAction: "Verify OAuth refresh path",
    dependencies: ["Firebase auth", "Cloud Run webhook"]
  },
  {
    id: "agent-prompts",
    title: "Review agent prompt library",
    category: "Agents",
    deadline: "Mon, 5:00 PM",
    progress: 74,
    risk: 38,
    riskLevel: "monitor",
    effort: "2h left",
    owner: "Krish",
    nextAction: "Check hallucination fallback rules",
    dependencies: ["Risk schema"]
  },
  {
    id: "deck",
    title: "Record 4-minute product walkthrough",
    category: "Demo",
    deadline: "Wed, 7:30 PM",
    progress: 18,
    risk: 29,
    riskLevel: "safe",
    effort: "6h left",
    owner: "Krish",
    nextAction: "Stage critical-risk task",
    dependencies: ["Frontend polish", "Seed account"]
  }
];

export const metrics = [
  { label: "Deadline risk", value: "31%", detail: "down 12% this week", tone: "safe" },
  { label: "Plan stability", value: "86", detail: "3 rescues avoided", tone: "safe" },
  { label: "Focus capacity", value: "5.5h", detail: "best window 9-11 AM", tone: "monitor" },
  { label: "Agent latency", value: "2.4s", detail: "target under 3s", tone: "safe" }
];

export const agents = [
  ["Task Understanding", "Extracts structured tasks, dates, dependencies, and confidence from natural language.", "Active"],
  ["Deadline Risk Analyzer", "Scores time pressure, workload gap, progress gap, reliability, and priority impact.", "Active"],
  ["Future Simulation", "Generates likely deadline outcomes and rescue scenarios before failure happens.", "Active"],
  ["Smart Scheduling", "Places subtasks into focus-aware calendar slots and resolves conflicts.", "Ready"],
  ["Accountability", "Runs contextual check-ins with gentle, firm, and emergency escalation levels.", "Ready"],
  ["Self-Learning", "Compares predictions with reality and updates user productivity patterns.", "Learning"]
];

export const scenarios = [
  { name: "Current Plan", probability: 41, change: "Keep original scope and evening work blocks." },
  { name: "Focused Sprint", probability: 76, change: "Move low-priority tasks, add two 70-minute deep-work sessions." },
  { name: "Scope Compression", probability: 84, change: "Cut optional appendix, preserve judging-critical demo flow." },
  { name: "Emergency Rescue", probability: 91, change: "Lock calendar, notify accountability buddy, ship highest impact path." }
];

export const schedule = [
  ["09:00", "Deep work", "Launch brief architecture narrative"],
  ["11:00", "Review", "Risk model and simulation copy"],
  ["14:00", "Build", "Rescue modal visual QA"],
  ["16:30", "Admin", "Calendar OAuth checklist"],
  ["19:00", "Demo", "Record walkthrough dry run"]
];

export const notifications = [
  "Launch brief crossed critical risk threshold.",
  "Calendar sync task has a new blocker: OAuth consent screen missing test user.",
  "Agent pipeline completed first risk score in 2.4 seconds.",
  "Plan stability improved after accepting focused sprint rescue."
];

export const integrations = [
  ["Firebase Auth", "Google sign-in and protected user sessions", "Planned"],
  ["Firestore", "Tasks, plans, risk scores, schedules, and agent logs", "Planned"],
  ["Google Calendar", "Bidirectional task and subtask scheduling", "Planned"],
  ["Gmail", "Deadline evidence and accountability summaries", "Later"],
  ["Gemini", "Task extraction, simulation, rescue, and copilot reasoning", "Planned"],
  ["Cloud Pub/Sub", "Event routing between backend services and agents", "Planned"]
];

export const health = [
  { label: "Risk engine", value: "Ready for mock wiring", icon: Gauge },
  { label: "Agent graph", value: "15 agents mapped", icon: Workflow },
  { label: "User activity", value: "Seed profile active", icon: Activity }
];
