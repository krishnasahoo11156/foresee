# 🚀 Project Execution Roadmap — ForeSee
### *AI-Powered Deadline Rescue & Productivity Platform*
### Vibe2Ship Hackathon | Problem Statement 1 — The Last-Minute Life Saver

---

> **Guiding Principle:** Every phase ends with a demoable, integrated deliverable. Nothing is siloed — every component talks to every other. We are building a production-grade, agentic, multi-model, fully interconnected system — not an MVP prototype.

---

## Phase 0 — Foundation & Planning

### Purpose:
Establish the project's foundational infrastructure, tooling, and decisions before a single line of product code is written. Define the project name, branding, environment structure, team conventions, API access, and service accounts. Eliminate all environment-related blockers upfront so every subsequent phase can move at full speed.

### Key Deliverables:
- Project name finalized: **ForeSee** (working name confirmed or changed)
- GitHub repository initialized with proper branch structure (`main`, `dev`, `staging`)
- Monorepo structure planned: `/frontend`, `/backend`, `/agents`, `/shared`, `/docs`, `/tests`
- Google Cloud Project created with billing enabled
- Firebase project initialized (Auth, Firestore, Hosting)
- All required Google Cloud APIs enabled:
  - Gemini API (Gemini 2.5 Pro / Flash)
  - Google Calendar API
  - Gmail API
  - Cloud Pub/Sub
  - Cloud Run
  - Vertex AI
  - Firebase Admin SDK
  - Cloud Secret Manager
  - Cloud Build
  - Cloud Logging & Monitoring
- Service accounts created with scoped IAM roles
- All secrets stored in Cloud Secret Manager (API keys, OAuth credentials)
- `.env` structure defined for local dev
- `README.md` with project overview, setup guide, and architecture summary
- Google OAuth2 app configured with Calendar + Gmail scopes
- Development conventions documented (naming, folder structure, commit format)
- Wireframe of final product scope confirmed
- Judging criteria matrix cross-mapped to features

### Expected Outcome:
Any developer can clone the repo, follow the README, and have a working local dev environment in under 10 minutes. No API access, credential, or environment issues will block future phases.

### Manual Actions Required:
- Create Google Cloud project manually from GCP Console
- Enable billing on GCP project
- Set up Firebase project manually from Firebase Console
- Register OAuth2 app and obtain `client_id`, `client_secret`
- Request Gemini API access / verify quota limits
- Link GitHub repo to Cloud Build for CI/CD triggers

---

## Phase 1 — Core Architecture Design

### Purpose:
Translate all knowledge documents into a precise, executable technical architecture. Define the exact component boundaries, data flow contracts, inter-agent communication protocols, API contracts, and database schemas. This is the blueprint phase — every implementation decision made here prevents refactoring later.

### Key Deliverables:
- **System Architecture Document** (full component diagram with all services, agents, data flows)
- **Agent Registry** — full list of all 15+ agents with:
  - Name, purpose, trigger conditions
  - Input/output JSON schemas
  - LLM model selection per agent
  - SLA targets and fallback strategy
- **API Contract Specification** — all backend REST endpoints defined:
  - URL, HTTP method, request body schema, response schema
  - Error codes and edge cases
  - Auth requirements per endpoint
- **Event Bus Design** — Pub/Sub topic list with publisher/subscriber mapping per agent:
  - `task.created`, `task.updated`, `task.completed`, `task.missed`
  - `risk.updated`, `risk.critical`
  - `simulation.result`, `rescue.plan`
  - `calendar.changed`, `schedule.created`
  - `progress.updated`, `profile.updated`
  - `learning.updated`, `day_end`
  - `microactions.generated`, `blockers.found`
  - `verification.result`, `user.prompt`
- **Firestore Collection Schema** — all collections, document shapes, indexes:
  - `users`, `tasks`, `subtasks`, `task_history`, `schedules`
  - `risk_scores`, `simulations`, `rescue_plans`
  - `profiles`, `accountability_logs`, `calendar_mappings`
  - `agent_logs`, `system_config`, `notifications`
- **Frontend Architecture** — page/component tree, routing plan, state management approach
- **Technology Stack Lock** (confirmed):
  - Frontend: Next.js 14 (App Router) + Tailwind CSS
  - Backend: Node.js (Express) on Cloud Run
  - Agent Orchestration: Google ADK or custom LangGraph-inspired pipeline
  - Database: Firebase Firestore
  - Auth: Firebase Auth (Google OAuth2)
  - AI: Gemini 2.5 Pro + Gemini Flash (via Gemini API)
  - Calendar: Google Calendar API v3
  - Notifications: Firebase Cloud Messaging + Email
  - CI/CD: Cloud Build + GitHub Actions
  - Observability: Cloud Logging + Cloud Monitoring

### Expected Outcome:
A complete architectural blueprint that every agent, page, and API can be built against without ambiguity. Developers can open the spec and know exactly what to build.

### Manual Actions Required:
- Architect review of agent interaction graph for circular dependency risks
- Confirm Gemini model tier (Flash vs Pro) per agent based on latency/cost tradeoffs
- Finalize Pub/Sub topic naming convention
- Decide on monorepo tooling (Turborepo / Nx / plain workspaces)

---

## Phase 2 — Data Models & Knowledge Layer

### Purpose:
Build the complete data foundation for the entire application. Define, implement, and validate all Firestore collections, document schemas, indexes, and security rules. Implement the knowledge embedding layer using Vertex AI / Gemini embeddings for semantic memory. This phase ensures every agent and API has a reliable, consistent, and performant data layer to work with.

### Key Deliverables:
- **Firestore Schema Implementation:**
  - `users` — profile, preferences, work hours, OAuth tokens, calendar ID
  - `tasks` — title, description, deadline, estimated effort, actual effort, priority, category, risk_score, risk_level, status, rescue_count, plan_stability_index, dependencies, subtask_ids
  - `subtasks` — parent task, title, duration, order, status, completed_at, calendar_event_id
  - `task_history` — old plan, new plan, reason, trigger, timestamp, agent_id
  - `profiles` — peak focus windows, daily productivity curve, procrastination score, reliability score, avg completion ratio
  - `risk_scores` — task_id, score, level, factors, timestamp, trend
  - `simulations` — task_id, scenario list with probabilities and plans
  - `rescue_plans` — task_id, strategies, chosen strategy, expected improvement
  - `calendar_mappings` — task_id, subtask_id, google_event_id, calendar_id
  - `schedules` — user_id, week_start, daily allocations, balance adjustments
  - `accountability_logs` — task_id, check_in time, user response, escalation_level
  - `agent_logs` — agent_id, run_at, input_hash, output_hash, latency, status, error
  - `notifications` — user_id, type, message, read, created_at, action_url
  - `system_config` — risk thresholds, agent toggles, feature flags
- **Firestore Security Rules** — per-user data isolation, admin-only collections, read/write rules per collection
- **Firestore Indexes** — composite indexes for all expected query patterns
- **Vertex AI Embedding Setup** — semantic vectors for:
  - Past task similarity lookup
  - Behavior pattern clustering
  - Context retrieval for simulation
- **Firestore → Embedding Pipeline** — triggers that generate embeddings on task creation/update
- **Data Seed Scripts** — populate Firestore with realistic test data for all phases
- **Type Definitions** — TypeScript interfaces for all Firestore document shapes (shared across frontend and backend)
- **Data Validation Layer** — Zod/Joi schemas matching all document shapes

### Expected Outcome:
A battle-tested data layer that agents, APIs, and the frontend can rely on. No data integrity issues, no schema mismatches, no race conditions. Full data coverage for every agent's input/output.

### Manual Actions Required:
- Enable Firestore in production mode from Firebase Console
- Set up Vertex AI Vector Search index (if used for embeddings)
- Review security rules for any overprivileged access paths
- Manually seed test user accounts and sample task data for Phase 3 testing

---

## Phase 3 — Agent Framework Implementation

### Purpose:
Build the multi-agent orchestration engine — the brain of ForeSee. This phase creates the base agent infrastructure (orchestrator, event bus, agent runner, retry/fallback system, agent logging) and implements all 15+ specialized agents in a modular, testable way. Each agent is implemented as a standalone callable module with defined inputs, outputs, LLM prompts, and tool integrations.

### Key Deliverables:
- **Orchestrator Agent (Root):**
  - Event-driven routing engine
  - Sequential and parallel agent pipeline management
  - Global state management (Firestore session state)
  - Agent retry logic with exponential backoff
  - Fallback routing on agent failure
  - Monitoring hooks for every agent call
- **Task Understanding Agent:**
  - Natural language → structured JSON task extraction
  - Gemini 2.5 Pro with system prompt + few-shot examples
  - Date/time NLP parsing (absolute and relative)
  - Dependency detection
  - Category classification
  - Confidence scoring with clarification fallback
- **Context Aggregation Agent:**
  - Google Calendar API fetch (free slots, busy slots, upcoming events)
  - Active task list aggregation from Firestore
  - User preference hydration
  - Pub/Sub push notification listener for calendar changes
- **Behavior Profiler Agent:**
  - Completion time analysis (estimated vs actual)
  - Peak focus window detection from historical data
  - Procrastination score computation
  - Reliability score tracking
  - Incremental updates on task completion/miss events
- **Deadline Risk Analyzer Agent:**
  - Weighted risk formula implementation:
    `risk = 0.30*(TimePressure) + 0.25*(WorkloadGap) + 0.20*(ProgressGap) + 0.15*(Reliability) + 0.10*(PriorityImpact)`
  - Risk level classification: Safe / Monitor / Danger / Critical
  - Risk trend tracking (increasing, stable, decreasing)
  - LLM-assisted explainability for risk reasoning
- **Future Simulation Engine Agent:**
  - Monte Carlo-style scenario generation (3–5 scenarios per task)
  - Scenario types: Current Plan, Extra Effort, Scope Reduction, Weekend Sprint, Deadline Extension
  - Success probability per scenario
  - Narrative plan generation per scenario
  - Vertex embedding-assisted similar task lookup
- **Priority Negotiation Agent:**
  - Multi-factor task ranking:
    `score = α*(1/time_to_deadline) + β*(dependency_weight) + γ*(risk_score) + δ*(user_priority)`
  - Dependency graph traversal (DAG-aware ordering)
  - Justification output for top 5 tasks
- **Workload Balancer Agent:**
  - Daily capacity computation from user profile
  - Overload detection per day
  - Task redistribution across available slots
  - Calendar load awareness
- **Autonomous Planner Agent:**
  - LLM-driven task decomposition (subtask DAG)
  - Dependency chain detection
  - Time estimation per subtask
  - Template library for common task types (academic, project, creative)
- **Smart Scheduling Agent:**
  - Free slot identification from calendar
  - Focus-time-aware subtask placement
  - Multi-day session splitting for large subtasks
  - Conflict detection and resolution
  - Google Calendar event creation via API
- **Micro Action Generator Agent:**
  - 5-minute action chunk generation
  - Context-aware from subtask content
  - RAG-enhanced from past similar task micro-plans
  - Procrastination trigger detection
- **Deadline Rescue Agent:**
  - Emergency strategy generation (Critical risk threshold > 75%)
  - Scope compression recommendations
  - Task rescheduling to free critical work time
  - Overnight sprint planning
  - Escalation strategy with accountability intensification
- **Blocker Detection Agent:**
  - Stall detection (no progress updates for threshold period)
  - LLM-driven blocker diagnosis
  - Dependency check (unmet upstream tasks)
  - Concrete unblocking action suggestions
- **Accountability Agent:**
  - Multi-level escalation system: Gentle → Firm → Emergency
  - Check-in question generation (contextual, personalized)
  - Response collection and progress logging
  - Do Not Disturb window respect
  - Notification dispatch via Firebase Cloud Messaging
- **Completion Verification Agent:**
  - Task completion signal processing
  - Evidence check (Google Drive file, submission confirmation)
  - Re-open logic for incomplete verifications
  - Completion record for Self-Learning Agent
- **Self-Learning Agent:**
  - Prediction vs. reality error computation (MAE on durations, risk scores)
  - Systematic bias detection and weight adjustment
  - Prompt template refinement
  - Profile update triggers

### Expected Outcome:
All 15+ agents functional, individually testable, and wired to the Orchestrator via the Pub/Sub event bus. Each agent has its own unit test suite. The full pipeline (task creation → risk → simulation → planning → scheduling → accountability) runs end-to-end in a test environment.

### Manual Actions Required:
- Obtain and configure Gemini API key with sufficient quota
- Set up Pub/Sub topics manually or via Terraform
- Test Calendar API OAuth flow with a real Google account
- Review LLM prompts for each agent (hallucination, safety, accuracy)

---

## Phase 4 — Core Productivity Engine

### Purpose:
Build the full task management system — the user-facing productivity layer that sits above the agent framework. This includes task CRUD, subtask management, progress tracking, calendar sync, the plan stability index, rescue count tracking, and the full lifecycle management of every task from creation to completion verification.

### Key Deliverables:
- **Task Lifecycle Manager:**
  - Task creation → Task Understanding Agent trigger
  - Task update → Risk re-evaluation trigger
  - Task deletion with calendar cleanup
  - Task archival with history preservation
  - Bulk operations (mark complete, reschedule, reprioritize)
- **Subtask Management System:**
  - Subtask CRUD with parent task linkage
  - Drag-and-drop reordering (frontend)
  - Completion checkbox with progress percentage recalculation
  - Dependency visualization (basic DAG view)
- **Progress Tracking Engine:**
  - Real-time progress % calculation from completed subtasks
  - Manual progress override with audit trail
  - Progress velocity tracking (daily delta)
  - Stall detection trigger for Blocker Detection Agent
- **Calendar Sync Engine:**
  - Bidirectional sync: Firestore ↔ Google Calendar
  - Event creation on subtask scheduling
  - Event update on plan change
  - Event deletion on task cancellation/completion
  - CalendarMapping table maintenance
  - Push notification setup for incoming calendar changes (webhook)
- **Plan Stability Index (PSI) System:**
  - PSI formula: `PSI = 100 * (1 - rescues / total_plan_cycles)`
  - Per-task and global PSI tracking
  - PSI trend visualization (improving/degrading)
- **Rescue Count Tracker:**
  - Increment on every accepted rescue plan
  - Alert when rescue count > threshold (configurable)
  - Pattern analysis: "This task has been rescued 4 times"
- **Task Dependency Graph:**
  - DAG construction from subtask dependencies
  - Critical path identification
  - Downstream impact analysis (if Task A is late, Tasks B, C, D are affected)
- **Notification Dispatch System:**
  - Firebase Cloud Messaging for push notifications
  - Email notifications for critical risk alerts
  - In-app notification center
  - Notification preferences per user (quiet hours, channel preferences)

### Expected Outcome:
A fully functional task management system where users can create, manage, and track tasks with real-time progress, calendar sync, and automated agent responses. The system manages the entire lifecycle of every task without manual intervention.

### Manual Actions Required:
- Test Google Calendar OAuth consent flow across multiple Google accounts
- Verify calendar event creation/deletion/update in a real calendar
- Configure Firebase Cloud Messaging for web push notifications
- Set up Calendar push notification webhook endpoint (publicly accessible URL required)

---

## Phase 5 — Deadline Rescue System

### Purpose:
Implement the flagship feature of ForeSee — the Adaptive Predictive Deadline Rescue Engine (PDRE). This phase builds the complete rescue pipeline from risk detection to strategy generation to user acceptance to automatic plan restructuring. This is the core differentiator from all existing productivity apps.

### Key Deliverables:
- **Risk Monitoring Loop:**
  - Continuous background risk recalculation (event-driven + periodic)
  - Risk score persisted to Firestore with timestamp and factors
  - Risk trend computation (3-point moving average)
  - Real-time risk broadcast to frontend via Firestore listeners
- **Risk Threshold System:**
  - Alert Mode: Risk > 60% → warning indicator shown
  - Rescue Mode: Risk > 70% → rescue modal triggered
  - Emergency Mode: Risk > 90% → emergency plan auto-suggested, notifications escalated
  - Configurable thresholds (system defaults + user-adjustable)
- **Rescue Trigger Pipeline:**
  - Risk Agent → publishes `risk.critical` event
  - Orchestrator routes to Simulation Agent
  - Simulation Agent generates 3-5 scenarios with success probabilities
  - Rescue Agent selects optimal strategy
  - Rescue plan saved to Firestore `rescue_plans` collection
  - Frontend notified via Firestore real-time listener
- **Rescue Modal UI Flow:**
  - Auto-triggered when risk crosses threshold
  - Displays: current risk score, risk factors, 3-5 scenario cards
  - Per scenario: description, success probability, key plan changes, estimated effort
  - Top scenario highlighted (highest success probability)
  - User options: Accept, Dismiss, Modify, Ask AI to Explain
- **Rescue Plan Application (Workflow Agent):**
  - On user "Accept":
    - Archive old subtask list to `task_history`
    - Create new subtask list from rescue plan
    - Delete old Google Calendar events
    - Create new Google Calendar events
    - Update task in Firestore (new plan, new schedule, rescue_count++)
    - Trigger Accountability Agent intensification
  - All changes are atomic (Firestore batch write)
  - Rollback supported (user can undo rescue within 5 minutes)
- **Rescue History & Audit Trail:**
  - Every rescue stored in `task_history` with: old plan, new plan, reason, chosen scenario, success probability, agent_id, timestamp
  - Rescue count visible on task cards
  - Rescue history timeline view in task detail
- **Escalation Matrix:**
  - Level 1 (Risk > 60%): Visual warning, suggestion hint
  - Level 2 (Risk > 70%): Rescue modal with scenario comparison
  - Level 3 (Risk > 80%): Accountability check-in frequency doubled
  - Level 4 (Risk > 90%): Emergency plan forced, email notification, buddy alert option
  - Level 5 (Deadline past, task incomplete): Post-mortem trigger, Self-Learning Agent update

### Expected Outcome:
The complete rescue pipeline works end-to-end. A task with a high risk score automatically triggers the simulation engine, generates rescue options, presents them to the user, and upon acceptance fully restructures the task plan and calendar. This is the WoW moment of the entire application.

### Manual Actions Required:
- Test rescue pipeline with simulated high-risk tasks in dev environment
- Verify Google Calendar cleanup (old events deleted, new events created correctly)
- Review Gemini rescue plan outputs for quality and realism
- Confirm Firestore batch write atomicity under concurrent agent writes

---

## Phase 6 — Future Simulation Engine

### Purpose:
Build the deepest AI intelligence layer of ForeSee — the Future Simulation Engine. This engine generates multiple alternative futures for every at-risk task, computes success probabilities using heuristic models and LLM reasoning, and presents side-by-side scenario comparisons to the user. This is the "time machine" capability that makes ForeSee unique.

### Key Deliverables:
- **Scenario Generation Framework:**
  - Scenario 1: Continue Current Plan (baseline probability)
  - Scenario 2: Extra Effort (+1h/day, recalculated availability)
  - Scenario 3: Scope Reduction (drop lowest-priority subtasks, recompute feasibility)
  - Scenario 4: Weekend Sprint (shift work to free weekend hours)
  - Scenario 5: Deadline Extension (user-negotiated, what if +2 days?)
  - Dynamic scenario generation: LLM generates custom strategies based on task context
- **Probability Computation Engine:**
  - Heuristic model:
    - `success_prob = 1 - weighted_risk_score_under_scenario`
    - Re-runs risk formula with adjusted inputs per scenario
  - Monte Carlo layer: Randomize user productivity factor over 100 simulations
  - Vertex embedding similarity: Lookup past tasks with similar profiles and their outcomes
  - LLM probability refinement: Gemini adjusts raw heuristic output based on narrative reasoning
- **Scenario Narrative Generator:**
  - Plain-language explanation of each scenario
  - What changes vs current plan
  - Concrete daily action requirements ("Work 2 extra hours on Tuesday and Thursday")
  - Trade-offs highlighted ("Scope reduction means dropping Feature X")
- **Simulation Result Schema:**
  ```
  {
    task_id, generated_at, scenarios: [
      { id, name, description, success_probability, daily_plan, trade_offs, effort_delta }
    ],
    recommended_scenario_id, reasoning
  }
  ```
- **Simulation Cache System:**
  - Cache simulation results for 30 minutes (prevent redundant LLM calls)
  - Invalidate on task update or calendar change
- **Simulation History:**
  - Every simulation run stored in Firestore
  - Historical comparison: "Last time this task was simulated, probability was X"
- **Simulation Visualization (Frontend):**
  - Side-by-side scenario cards with probability meters
  - Color-coded: Green (> 70%), Yellow (40-70%), Red (< 40%)
  - Animated probability bar fill on modal open
  - "Best Choice" badge on recommended scenario
  - Detailed view: expandable plan timeline per scenario
- **Simulation Triggers:**
  - Auto-trigger: Risk > 50%
  - Manual trigger: User clicks "Simulate" on any task
  - Scheduled: Daily simulation run for all at-risk tasks (Risk > 30%)

### Expected Outcome:
The simulation engine generates meaningful, accurate, and diverse scenarios for every at-risk task. Users can see exactly what different effort strategies would produce, making the decision to rescue a task data-driven rather than emotional.

### Manual Actions Required:
- Calibrate risk formula weights against realistic test cases (compare intuitive vs computed risk)
- Tune Monte Carlo simulation parameters (iterations, productivity variance range)
- Review LLM scenario narratives for accuracy and usefulness
- Validate Vertex embedding similarity search is returning relevant historical comparisons

---

## Phase 7 — User Experience & Interface

### Purpose:
Build the complete, polished, production-quality frontend application. This phase covers every screen, every component, every interaction state, every micro-animation, and every user flow. The UI must feel premium, fast, and intelligent — worthy of a top hackathon submission. No screen is "good enough" — every page must be a 10/10 in design quality.

### Key Deliverables:
- **Design System Implementation:**
  - Color tokens: Primary, Secondary, Accent, Neutral, Semantic (success/warning/danger/info)
  - Typography scale: Display, Heading 1-4, Body, Caption, Label
  - Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64px
  - Elevation system: 5 shadow levels
  - Border radius system: 4, 8, 12, 16, 24, 9999px
  - Animation tokens: easing curves, duration levels (fast/normal/slow)
  - Dark mode / Light mode / Ocean / Sunset theme support (CSS variables)
  - Component library: Button, Input, Select, Toggle, Card, Badge, Modal, Toast, Dropdown, Tooltip, Spinner, Skeleton, Avatar, ProgressBar, RiskMeter, ScenarioCard
- **Landing Page:**
  - Hero section with animated headline + subtext
  - Feature highlights (3-4 WoW capabilities)
  - Social proof / problem statement section
  - "Sign in with Google" CTA (prominent)
  - Animated background (subtle particle or gradient motion)
  - Fully responsive (mobile-first)
- **Onboarding Flow (3 steps):**
  - Step 1: Name + profile picture (from Google)
  - Step 2: Work style preferences (work hours, peak hours, max daily work)
  - Step 3: Google Calendar connection (OAuth consent)
  - Progress indicator, skip option, animated transitions between steps
- **Main Dashboard:**
  - Global header: logo, greeting ("Good morning, [Name]"), notifications bell, avatar menu
  - Risk Overview Summary: total tasks, tasks at risk (count + percentage), on-time rate
  - Active Tasks Grid: task cards with inline risk meters, deadline countdown, status badges
  - Today's Schedule Widget: timeline view of today's scheduled work blocks from calendar
  - Upcoming Deadlines Panel: sorted list of next 5 deadlines with risk color coding
  - Plan Stability Index card: overall PSI with trend arrow
  - Quick Add Task button: floating action button with animated expand
- **Task Detail Page:**
  - Full task metadata display + inline edit
  - Risk score display with animated gauge
  - Subtask checklist with drag-and-drop reorder
  - Progress bar (auto-computed from subtask completion)
  - Risk history sparkline chart
  - Rescue history timeline
  - Micro-actions panel (expandable)
  - AI Chat panel for task-specific queries ("What should I do next?")
  - Calendar events linked to this task
  - Dependency graph visualization (mini DAG)
- **Task Creation Modal / Page:**
  - Task title (natural language, AI-parsed)
  - Deadline picker (date + time, relative input supported: "next Friday")
  - Estimated effort picker (hours slider or freeform)
  - Priority selector (Low / Medium / High / Critical)
  - Category tag selector
  - Dependencies selection (other tasks)
  - Real-time AI validation feedback ("This seems like a lot for 3 days — consider reducing scope")
- **Rescue Modal:**
  - Auto-triggered animated entrance
  - Current risk score prominent display (gauge animation)
  - Risk factors listed with weights
  - 3-5 scenario cards in a horizontal scroll (or grid)
  - Per scenario: title, description, probability meter, daily plan preview, "Select" button
  - "Best for you" badge on top recommendation
  - "Accept Rescue Plan" primary button (accent color, prominent)
  - "Dismiss" secondary button (less prominent)
  - "Explain this to me" AI chat trigger
  - Post-acceptance: success animation, calendar update confirmation
- **Simulation View (Standalone Page):**
  - Full comparison table of all scenarios
  - Probability comparison bar chart
  - Timeline comparison (Gantt-style) per scenario
  - Historical simulations log
- **Analytics & Insights Page:**
  - On-Time Completion Rate (trend chart, weekly/monthly)
  - Plan Stability Index over time (line chart)
  - Rescue Count per task (bar chart)
  - Productivity heatmap (day-of-week × hour-of-day completion density)
  - Average time estimation accuracy (estimated vs actual duration)
  - Risk distribution pie chart (what % of tasks are at what risk level)
  - Agent Activity log (which agents ran, when, what outcome)
  - Personalized insights generated by Gemini: "You tend to underestimate Monday tasks by 40%"
- **Settings Page (Fully Functional, Not Placeholder):**
  - **Account Tab:** Name, email (read-only from Google), profile picture, connected Google account
  - **Preferences Tab:**
    - Work hours (start/end time picker)
    - Peak focus hours (multi-range selector)
    - Maximum daily work hours (slider: 1-16h)
    - Weekend work toggle
    - Task categories (custom + add/remove)
    - Default task priority
    - Default estimated effort per category
  - **Notifications Tab:**
    - Push notification toggle (browser)
    - Email notification toggle
    - Notification frequency (immediate / batched hourly / daily digest)
    - Quiet hours configuration (start/end time)
    - Per-event notification toggles: risk alerts, rescue triggers, check-in prompts, calendar updates, accountability messages
  - **Calendar Tab:**
    - Connected Google Calendar display (calendar name, email)
    - Calendar sync toggle (enable/disable)
    - Default calendar selection (if multiple calendars)
    - Reconnect / Disconnect calendar option
    - Sync history (last synced at, events created)
  - **AI Behavior Tab:**
    - Risk threshold customization (rescue trigger %, emergency trigger %)
    - Accountability check-in frequency
    - Micro-action generation toggle
    - Simulation auto-trigger toggle
    - Agent verbosity (minimal / standard / verbose explanations)
    - Learning opt-in (allow system to learn from your patterns)
  - **Appearance Tab:**
    - Theme selector (Light / Dark / Ocean / Sunset)
    - Font size (Normal / Large / Extra Large)
    - Reduce motion toggle
    - Compact view toggle (for task cards)
  - **Privacy & Data Tab:**
    - Data export (download all tasks as JSON)
    - Account deletion with confirmation
    - Data retention policy display
    - Agent data viewing (what the agents know about you)
  - **Danger Zone Tab:**
    - Reset all settings to default
    - Clear all task history
    - Disconnect all integrations
- **AI Copilot Chat Panel:**
  - Global floating chat button (always accessible)
  - Context-aware: knows what task/page you're on
  - Supported queries: "What should I work on today?", "Analyze my risk", "Reschedule my week", "What's blocking me?", "Generate a micro-plan for [task]"
  - Response streaming (token-by-token for perceived speed)
  - Chat history persisted per session
  - Multi-turn conversation with session context
- **Notification Center:**
  - Slide-in panel from top-right
  - Grouped by type: Risk Alerts, Rescue Plans, Accountability, System
  - Mark all as read, clear history
  - Click-through to relevant task/page
- **Empty States:**
  - Every page/section has a polished empty state (illustration + action CTA)
  - No list, chart, or panel should show blank/nothing with no context
- **Loading States:**
  - Skeleton loaders for all data-dependent components
  - Agent processing indicators ("Analyzing your risk…", "Generating rescue plan…")
  - Progress indicators for long-running operations
- **Error States:**
  - Every API error surface has a user-friendly message + retry action
  - Network offline detection banner
  - Agent failure graceful degradation (show fallback UI, not broken layout)
- **Responsive Design:**
  - Full mobile responsiveness (320px minimum)
  - Tablet layout optimizations
  - Desktop-first design, mobile as full experience

### Expected Outcome:
A stunning, production-quality web application that looks and feels like a funded product. Every page is polished, every interaction is smooth, every empty/error/loading state is handled. The UI alone would win on "Product Experience" judging criterion.

### Manual Actions Required:
- Google Fonts load verification (Inter / Outfit)
- Cross-browser testing (Chrome, Firefox, Safari, Edge)
- Mobile browser testing (iOS Safari, Android Chrome)
- Accessibility audit (WCAG AA compliance check)
- Animation performance audit (no janky 60fps violations)
- UX review of rescue modal flow (primary user journey)

---

## Phase 8 — Integrations Layer

### Purpose:
Wire up all external service integrations that make ForeSee feel like a true platform rather than a standalone app. This includes Google Calendar (bidirectional), Gmail (context extraction), Push Notifications, and any additional data connectors that enrich agent context.

### Key Deliverables:
- **Google Calendar Integration (Full Bidirectional):**
  - OAuth2 authentication flow (user consent + token storage in Firestore)
  - Token refresh automation (background service account)
  - `calendar.events.list` — fetch all events in date range
  - `calendar.events.insert` — create new events for scheduled subtasks
  - `calendar.events.patch` — update event on plan change
  - `calendar.events.delete` — clean up events on task cancellation
  - `calendar.events.watch` — push notification webhook for incoming calendar changes
  - CalendarMapping table maintenance (taskId ↔ eventId ↔ calendarId)
  - Free/busy slot calculation for scheduling agent
  - Conflict detection before event insertion
  - Event color-coding by task risk level (green/yellow/red events in Google Calendar)
  - Event description auto-generation (task title, risk score, quick link back to ForeSee)
- **Gmail Integration (Context Extraction):**
  - OAuth2 scope for Gmail read access
  - Email parsing for task-relevant context (deadlines mentioned in emails)
  - "Add to ForeSee" from Gmail (if implemented as Chrome extension — stretch goal)
  - Weekly digest email sending (SendGrid/SMTP): task summary, at-risk items, upcoming deadlines
  - Rescue alert emails (triggered on Emergency mode)
  - Accountability check-in emails (fallback if push notification fails)
- **Firebase Cloud Messaging (Push Notifications):**
  - FCM setup for web push (service worker registration)
  - Notification permission request flow (post-onboarding)
  - Notification payload: title, body, icon, badge, action buttons, click_action URL
  - Notification categories:
    - Risk Alert: "Task X is now Critical Risk (87%)"
    - Rescue Ready: "New rescue plan available for Task X"
    - Accountability Check: "Time to update progress on Task Y"
    - Calendar Synced: "3 events added to your calendar"
    - Daily Digest: "You have 2 tasks due this week"
  - Background notification handling (service worker)
  - Notification click routing (open app at relevant page)
- **Google Workspace APIs (Extended Context):**
  - Google Drive file detection for completion verification
  - Google Tasks read (import existing Google Tasks as ForeSee tasks — optional)
- **Webhook Infrastructure:**
  - Public webhook endpoint on Cloud Run for Google Calendar push notifications
  - Webhook authentication (Google-signed requests, channel token validation)
  - Webhook event processing queue (prevent thundering herd)
  - Webhook retry handling for missed events

### Expected Outcome:
ForeSee feels deeply integrated with Google's ecosystem. Calendar events appear automatically. Push notifications keep users informed proactively. Email serves as a reliable fallback communication channel. The app functions as a true Google Workspace enhancement.

### Manual Actions Required:
- Register OAuth2 app for Calendar + Gmail scopes in GCP Console
- Set up public-facing webhook URL (Cloud Run deployment required before Calendar watch can be set)
- Configure SendGrid API key for email sending
- Verify FCM service worker works on HTTPS (localhost won't work for push)
- Test Calendar push notification receipt from Google

---

## Phase 9 — Intelligence Enhancement Layer

### Purpose:
Elevate ForeSee from reactive to truly intelligent. This phase builds the personalization engine, behavioral learning system, recommendation engine, and the AI copilot conversational interface that makes ForeSee feel like a true AI partner rather than a tool.

### Key Deliverables:
- **Personalization Engine:**
  - User-specific risk weight tuning (Self-Learning Agent outputs applied to Risk formula)
  - Per-user task category templates (learned from past tasks)
  - Personalized scheduling preferences (auto-learned peak hours, preferred session lengths)
  - Personalized notification tone (formal/casual/urgent) based on user interaction style
  - A/B tested: personalized defaults vs generic defaults (measure task completion rate improvement)
- **Behavioral Learning System (Self-Learning Agent Integration):**
  - Nightly batch job: analyze day's task completions vs predictions
  - MAE tracking: estimated duration vs actual duration per category
  - Systematic bias detection per user: "You consistently underestimate coding tasks by 35%"
  - Automatic adjustment: estimation suggestions corrected based on personal history
  - Risk weight personalization: higher weight for low-reliability users, lower for high-reliability
  - Learning audit log: what changed, when, why
- **AI Recommendation Engine:**
  - "Today's Focus" recommendation (top 3 tasks to work on today, with reasoning)
  - "Best time to work on X" recommendation (based on profile + calendar gaps)
  - "Scope this task differently" recommendation (when task is consistently over-estimated)
  - "Consider breaking this task" recommendation (when single task is > 6h)
  - Weekly planning suggestions (start of week AI-generated plan)
  - Post-rescue recommendations: "Here's how to avoid this next time"
- **AI Copilot Conversational Interface:**
  - Gemini-powered multi-turn chat (Gemini 2.5 Flash for speed)
  - System context injection: current task, risk scores, calendar events, user profile
  - Supported intents:
    - Task management: "Add a task", "Delete task X", "Mark X as done"
    - Planning: "What should I work on today?", "Plan my week"
    - Risk analysis: "Analyze my risk", "Why is Task X critical?"
    - Rescue: "Rescue Task X", "Show me scenarios for Task Y"
    - Scheduling: "Find time for Task X this week"
    - Motivation: "I'm feeling overwhelmed, help me prioritize"
    - Blockers: "I'm stuck on Task X, what should I do?"
    - Insights: "How has my productivity been this week?"
  - Response streaming with typing indicator
  - Action confirmation dialog for destructive actions
  - Copilot history (last 50 messages) persisted in Firestore
- **Habit & Goal Tracking Layer:**
  - Weekly goal setting (user defines: "Complete 3 tasks this week")
  - Daily habit tracking (work hour compliance, check-in completion rate)
  - Streak system (consecutive days with no missed deadlines)
  - Milestone celebration (task completion animations, streak achievements)
  - Monthly productivity review auto-generated by Gemini
- **Smart Insights Engine:**
  - Weekly AI-written productivity summary (what went well, what to improve)
  - Pattern identification: "You work best on Tuesday mornings"
  - Anomaly detection: "This week was unusually unproductive — what happened?"
  - Predictive insight: "At your current pace, you'll miss X and Y by end of month"

### Expected Outcome:
ForeSee learns from every interaction, gets more accurate over time, and feels like it knows the user. The AI Copilot serves as a genuine productivity partner. Recommendations are specific, personalized, and actionable — not generic advice.

### Manual Actions Required:
- Review initial behavioral learning output for accuracy (compare suggestions to real user data)
- Tune recommendation thresholds (when to suggest scope reduction vs extra effort)
- Test Copilot with diverse natural language inputs (ambiguous, multi-intent, edge cases)
- Verify LLM prompt injection safety (user cannot break out of copilot context)

---

## Phase 10 — WoW Features

### Purpose:
Implement the "jaw-drop" capabilities that will win the hackathon on Innovation, Agentic Depth, and Product Experience criteria. These features go beyond productivity tools into territory that feels like the future of AI-powered work. Each WoW feature has a clear demo moment.

### Key Deliverables:
- **Autonomous Rescue Mode (Fully Hands-Off):**
  - User configures: "If risk > 90%, rescue automatically without asking"
  - System executes full rescue pipeline (simulation → rescue plan → calendar update) without user input
  - Post-fact notification: "I rescued Task X while you were sleeping. Here's what changed."
  - Auto-rescue history log with undo option
  - Confidence gating: only auto-rescue if top scenario has > 80% success probability
- **Future Failure Prediction Dashboard:**
  - Looks ahead 7 days and predicts which tasks are on trajectory to fail
  - Shows predicted risk trajectory per task (current + projected if no action taken)
  - "Prevention before rescue" — identifies tasks before they reach rescue threshold
  - Weekly failure prediction report generated by Gemini
  - Confidence intervals on predictions
- **Deadline DNA Fingerprinting:**
  - Every task gets a "Deadline DNA" profile: behavioral fingerprint of how this class of task tends to go for this user
  - Similar task lookup: "The last 3 times you started a task like this, you missed 2 of them"
  - Risk adjustment based on DNA similarity
  - DNA visualization: radar chart of task characteristics
- **Intervention Workflow System:**
  - Pre-configured intervention playbooks per risk level:
    - 60% risk: Send self-reflection prompt ("Rate your confidence on this task 1-10")
    - 70% risk: Generate micro-action list for today
    - 80% risk: Activate accountability partner (email to a buddy — user-configured)
    - 90% risk: Emergency mode + autonomous calendar block creation
  - Custom intervention triggers (user can define: "If I haven't updated a task in 2 days, send me a stern reminder")
- **Motivation & Emotional Intelligence Layer:**
  - Stress-adaptive messaging: detects patterns of task abandonment and adjusts tone
  - Achievement celebration: animated confetti on task completion, streak milestones
  - Motivational message variants: encouraging, challenging, neutral (user preference)
  - Burnout detection: flags when user has worked > 10h/day for 5 consecutive days
  - "Digital Wellbeing" weekly report with work-life balance score
- **Multi-Task Interdependency Rescue:**
  - When rescuing Task A, automatically propagate impact to dependent Tasks B, C, D
  - Cascade rescue: if Task A is delayed, automatically re-evaluate and suggest rescues for all dependents
  - Dependency rescue simulation: "If Task A slips 2 days, here's the ripple effect on your entire project"
- **Voice Input for Task Creation:**
  - Browser Web Speech API for voice task capture
  - Natural language → task parsing (Gemini): "Add a task to finish the report by next Thursday, should take about 4 hours"
  - Confirmation step before saving
- **ForeSee Command Line (Power User Mode):**
  - `/rescue` — trigger rescue for current task
  - `/simulate` — open simulation engine
  - `/plan today` — generate today's work plan
  - `/status` — show all task risk levels
  - Keyboard shortcut palette (⌘K / Ctrl+K) with fuzzy search
- **Real-Time Collaboration Signal (Stretch Goal):**
  - If a shared Google Calendar event changes (teammate cancels meeting), automatically free that time slot and reassign it to highest-risk task
  - Notification: "Meeting canceled — I've scheduled 2h for Task X instead"

### Expected Outcome:
These features create undeniable demo moments. Reviewers will see an AI system that is genuinely proactive, emotionally aware, and capable of autonomous decision-making. The combination of prediction, autonomy, intervention, and motivation creates a product narrative around "AI that works for you while you sleep."

### Manual Actions Required:
- Configure autonomous rescue opt-in setting (critical: must be explicit user consent)
- Test failure prediction accuracy against historical data
- Review buddy alert email flow for privacy compliance
- Validate voice input across browsers (Web Speech API support varies)

---

## Phase 11 — Testing & Evaluation

### Purpose:
Validate every component, every agent, every user flow, and every edge case before deployment. This phase is not optional or abbreviated. Thorough testing is what separates a hackathon project from a production-grade system. Every agent, workflow, and UI state must be verified.

### Key Deliverables:
- **Unit Testing (Backend & Agents):**
  - Every agent function unit-tested with mocked LLM responses
  - Risk formula tested against 20+ test cases (edge cases: zero time, zero effort, max risk)
  - Simulation engine tested with diverse task profiles
  - Firestore CRUD operations tested with Firebase emulator
  - API endpoint validation (request/response schema matching, error codes)
  - Calendar sync functions tested with mock Calendar API responses
  - Auth middleware tested (valid token, expired token, missing token)
  - Target: 85% code coverage on backend services
- **Integration Testing:**
  - Full agent pipeline tested end-to-end (task creation → orchestrator → all agents → Firestore write)
  - Calendar integration E2E: create task → verify Google Calendar event appears
  - Rescue pipeline integration: high-risk task → rescue modal → accept → calendar updated
  - Notification delivery: risk crosses threshold → FCM notification received
  - Auth flow: Google OAuth → user created in Firestore → dashboard accessible
- **Agent Quality Testing:**
  - Task Understanding Agent: 50 diverse task descriptions → validate extraction accuracy
  - Risk Analyzer: 30 test cases → validate risk score correctness
  - Simulation Engine: 20 scenarios → validate probability plausibility
  - Rescue Agent: 15 critical-risk tasks → validate strategy quality (human review)
  - Autonomous Planner: 25 tasks → validate subtask decomposition completeness
  - Behavior Profiler: Synthetic user history → validate profile accuracy
  - Self-Learning Agent: Inject artificial bias → verify detection and correction
- **User Flow Testing:**
  - Onboarding: First-time user completes onboarding → profile created, calendar connected
  - Task Creation: Add task via form, via copilot → task appears in dashboard with risk score
  - Rescue Flow: Task risk reaches critical → rescue modal appears → accept → plan updated → calendar updated
  - Settings: Every setting saves correctly, persists after page refresh
  - Notifications: Every notification type received in correct context
  - Empty states: All empty states display correctly on fresh account
  - Error states: API failures handled gracefully (retry available, no crash)
- **Performance Testing:**
  - Agent pipeline latency benchmark: time from task creation to first risk score < 3s
  - Simulation engine latency: time from risk.critical to rescue_plans in Firestore < 10s
  - Dashboard load time: initial load < 2s (LCP)
  - Firestore query performance under 1000-document test collections
  - Concurrent agent execution (5 simultaneous user events) — no conflicts or race conditions
  - Memory profiling: no memory leaks in long-running agent processes
- **Security Testing:**
  - Firestore security rules: user A cannot access user B's tasks (tested programmatically)
  - API authentication: all endpoints return 401 without valid auth token
  - Rate limiting: abuse scenario (100 requests/minute from single user) handled gracefully
  - OAuth token storage: tokens not stored in plaintext, not logged
  - LLM prompt injection: malicious user input cannot break agent context
  - HTTPS enforcement: all endpoints, all external calls
- **Accessibility Testing:**
  - WCAG AA compliance audit (axe-core automated scan)
  - Keyboard navigation: full dashboard accessible without mouse
  - Screen reader testing (NVDA / VoiceOver) on primary flows
  - Color contrast verification across all 4 themes
- **Cross-Browser & Device Testing:**
  - Chrome (desktop + Android)
  - Firefox (desktop)
  - Safari (desktop + iOS)
  - Edge (desktop)
  - Mobile breakpoint testing (320px, 375px, 768px)

### Expected Outcome:
A fully verified, zero-critical-bug application. All agents produce accurate outputs. All user flows work without error. Performance benchmarks met. Security validated. The system is ready for production deployment.

### Manual Actions Required:
- Run Firebase emulator suite for Firestore + Auth tests
- Execute manual exploratory testing of rescue modal flow (10+ test scenarios)
- Human review of Gemini agent outputs for quality (not just schema validation)
- Load test Cloud Run with Artillery or k6
- Accessibility audit review and remediation

---

## Phase 12 — Deployment & Productionization

### Purpose:
Deploy ForeSee to a production-grade environment on Google Cloud infrastructure. This phase establishes the CI/CD pipeline, production monitoring, error alerting, and ensures the app is reliably accessible to judges and users. Every production concern — scaling, uptime, observability, secret management — is addressed.

### Key Deliverables:
- **Cloud Run Deployment (Backend):**
  - Containerized Node.js backend (Dockerfile + .dockerignore)
  - Cloud Run service configured: min 1 instance (prevent cold starts), max 10 instances
  - Environment variables injected from Cloud Secret Manager
  - Cloud Run domain with HTTPS (auto-provisioned)
  - Health check endpoint: `GET /healthz` → 200 OK
  - Graceful shutdown handling
- **Vercel Deployment (Frontend):**
  - Next.js production build deployed to Vercel
  - Environment variables configured in Vercel dashboard
  - Custom domain configuration (if available)
  - Edge network CDN for global performance
  - Automatic preview deployments on PR
- **CI/CD Pipeline (Cloud Build + GitHub Actions):**
  - On push to `main`: lint → test → build → deploy to production
  - On push to `dev`: lint → test → deploy to staging
  - PR validation: lint + test (block merge on failure)
  - Docker image build and push to Google Container Registry
  - Cloud Build trigger configuration
  - Zero-downtime deployment (rolling update on Cloud Run)
- **Firebase Hosting (Static Assets / Fallback):**
  - Firebase Hosting as CDN for static files
  - `firebase.json` routing configured
  - Firebase Hosting → Cloud Run proxy for API routes
- **Secret Management:**
  - All API keys in Cloud Secret Manager (Gemini API, Calendar API, SendGrid, FCM)
  - Service account key rotation strategy
  - Secrets accessed via Cloud Run's built-in secret injection
  - No secrets in environment files committed to git
- **Pub/Sub Production Setup:**
  - All topics created in production GCP project
  - Dead letter queues configured per topic
  - Subscription acknowledgment timeouts tuned per agent processing time
  - Push subscriptions pointing to Cloud Run endpoints
- **Production Firestore Configuration:**
  - Production Firestore instance (not emulator)
  - Security rules deployed and tested
  - Indexes deployed (`firestore.indexes.json`)
  - Backup configuration (daily automated backups)
- **Observability Stack:**
  - Cloud Logging: structured JSON logs from all services
  - Cloud Monitoring: custom dashboards for:
    - Backend request latency (p50, p95, p99)
    - Error rate per endpoint
    - Agent execution count and latency
    - Firestore read/write counts
    - Active user sessions
    - Risk alerts triggered per hour
    - Rescue plans generated and accepted
  - Alerting policies:
    - Error rate > 5% → PagerDuty / email alert
    - Backend latency p95 > 3s → alert
    - Cloud Run instance count approaching max → alert
    - Firestore quota > 80% → alert
  - Log-based metrics for agent performance
- **Rate Limiting & Abuse Prevention:**
  - Cloud Armor WAF rules on Cloud Run ingress
  - API rate limiting middleware (100 req/min per user)
  - Gemini API call budget guard (maximum daily spend limit)
- **Performance Optimization:**
  - Frontend: Next.js static optimization, image optimization, code splitting
  - Backend: Connection pooling, request caching (Redis/Firestore cache)
  - Gemini API: Response caching for identical prompts (30-min TTL)
  - Firestore: Compound index optimization, batch reads where possible
- **Environment Parity:**
  - `development` (local): Firebase emulator + local Gemini API
  - `staging` (Cloud Run staging service): real APIs, test data
  - `production` (Cloud Run production service): real APIs, real users
  - Feature flags via Firestore `system_config` document (enables/disables features per environment)

### Expected Outcome:
ForeSee is live, stable, fast, and monitored on Google Cloud. The production URL is shareable with judges. The system can handle 50+ concurrent users without performance degradation. Every failure is logged, alerted, and traceable.

### Manual Actions Required:
- Set up GCP billing alert (prevent runaway costs during judging period)
- Configure Cloud Run service with correct IAM service account
- Deploy Firebase security rules to production
- Test production OAuth flow end-to-end (real Google account)
- Verify Pub/Sub → Cloud Run webhook connectivity in production
- Set up monitoring dashboard and test alert policies

---

## Phase 13 — Hackathon Submission Assets

### Purpose:
Prepare every submission artifact required for the Vibe2Ship Hackathon. This phase ensures the project is presented at its best — with compelling documentation, a polished demo video, a well-prepared GitHub repository, and a submission document that clearly maps ForeSee's features to every judging criterion.

### Key Deliverables:
- **GitHub Repository Preparation:**
  - Clean, organized repository structure
  - `README.md` with:
    - Project name, tagline, and hero screenshot/GIF
    - Problem statement addressed
    - Solution overview (3-sentence pitch)
    - Architecture diagram (embedded)
    - Agent list with brief descriptions
    - Google technologies used (explicit list)
    - Setup and run instructions (step-by-step)
    - Environment variables template (`.env.example`)
    - Live demo URL
    - Demo video link
    - Team information
  - Code quality: no dead code, no commented-out debug logs, no hardcoded secrets
  - `CONTRIBUTING.md` and `LICENSE` (MIT)
  - GitHub releases: tagged v1.0.0 for submission
  - Issues closed, no open critical bugs
- **Documentation Package:**
  - Architecture decision record (why we chose each technology)
  - Agent specification document (all 15+ agents, their prompts, inputs, outputs)
  - API documentation (Swagger/OpenAPI spec exported)
  - Data model documentation (Firestore schema with field descriptions)
  - Security and privacy documentation
  - Known limitations and future roadmap
- **Demo Video (3-5 minutes):**
  - Script and storyboard prepared in advance
  - Narrated walkthrough covering:
    - Problem statement (30 seconds)
    - ForeSee solution overview (30 seconds)
    - Live demo: Create task → risk computed → rescue triggered → plan applied → calendar updated (2 minutes)
    - WoW features demo: Autonomous rescue, future prediction, AI copilot (1 minute)
    - Google technologies highlighted explicitly (30 seconds)
    - Closing pitch (30 seconds)
  - Screen recording with clean, seed demo data (not live production data)
  - Professional voiceover or on-camera presentation
  - Captions/subtitles
  - Uploaded to YouTube (unlisted) + linked in README
- **Submission Document:**
  - Problem statement addressed
  - Innovation narrative (what makes ForeSee different from every other productivity tool)
  - Judging criterion self-evaluation:
    - Problem Solving & Impact: quantified benefit to users
    - Agentic Depth: list all 15+ agents, their roles, interaction graph
    - Innovation & Creativity: PDRE, Future Simulation, Autonomous Rescue, DNA Fingerprinting
    - Google Technology Usage: explicit mapping of every Google service used + why
    - Product Experience: UI quality, UX polish, WoW moments
    - Technical Implementation: architecture quality, code quality, production deployment
    - Completeness: all features working, end-to-end demo possible
  - Team member contributions
  - Live demo URL
- **Demo Environment Setup:**
  - Seed data loaded in production Firestore (sample tasks in various risk states)
  - Demo user account created with realistic history
  - Calendar events pre-created for demo flow
  - Rescue scenario pre-staged (one task already at critical risk)
  - All WoW features confirmed working in demo environment
  - Fallback demo recording available (in case live demo fails)
- **Pitch Assets (If Required):**
  - Slide deck: problem, solution, architecture, features, impact, Google tech, team
  - One-pager PDF summary
  - Product screenshots package (20+ high-quality screenshots of every major screen)

### Expected Outcome:
A submission package that immediately impresses. Any judge who views the README, watches the demo video, or opens the live URL should understand ForeSee's value, agentic depth, and technical quality within 2 minutes.

### Manual Actions Required:
- Conduct a dry run of the demo video script (full walkthrough without mistakes)
- Review GitHub repository for any accidental secret commits (`git secret scan`)
- Test demo user account login from a fresh browser session
- Verify demo video displays correctly on YouTube
- Proofread submission document for clarity and impact

---

## Recommended Build Order

```
Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7 → Phase 8 → Phase 9 → Phase 10 → Phase 11 → Phase 12 → Phase 13
```

**Sequential by design.** Each phase has firm dependencies on the previous:
- You cannot build agents (Phase 3) without a data layer (Phase 2)
- You cannot build the rescue system (Phase 5) without agents (Phase 3) and the core engine (Phase 4)
- You cannot build WoW features (Phase 10) without the intelligence layer (Phase 9)
- You cannot deploy (Phase 12) without a working product tested through (Phase 11)

**Parallel opportunities** (within phases):
- Phase 3: Agents can be implemented in parallel by different developers
- Phase 7: Frontend component library can be built in parallel with Phase 3 backend work
- Phase 7 UI & Phase 8 integrations can overlap after Phase 3 core agent framework is stable

---

## Dependency Map

| Phase | Depends On | Blocks |
|-------|-----------|--------|
| **Phase 0** | Nothing | All other phases |
| **Phase 1** | Phase 0 | Phases 2, 3, 7 |
| **Phase 2** | Phase 1 | Phases 3, 4 |
| **Phase 3** | Phases 1, 2 | Phases 4, 5, 6, 9, 10 |
| **Phase 4** | Phases 2, 3 | Phases 5, 8, 11 |
| **Phase 5** | Phases 3, 4 | Phases 6, 10, 11 |
| **Phase 6** | Phase 3, 5 | Phases 9, 10, 11 |
| **Phase 7** | Phase 1 (design system), Phase 4 (API) | Phases 9, 10, 11 |
| **Phase 8** | Phase 4 | Phases 10, 11 |
| **Phase 9** | Phases 3, 6, 7 | Phase 10, 11 |
| **Phase 10** | Phases 5, 6, 8, 9 | Phase 11 |
| **Phase 11** | Phases 3, 4, 5, 6, 7, 8, 9, 10 | Phase 12 |
| **Phase 12** | Phase 11 | Phase 13 |
| **Phase 13** | Phase 12 | Submission |

### Critical Path:
```
Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 5 → Phase 6 → Phase 11 → Phase 12 → Phase 13
```
These phases have no slack and determine the minimum delivery timeline.

---

## Risk Assessment

| Phase | Description | Complexity | Risk Level | Estimated Build Effort |
|-------|-------------|-----------|-----------|----------------------|
| **Phase 0** | Foundation & Planning | Low | Low | Small |
| **Phase 1** | Core Architecture Design | Medium | Low | Small |
| **Phase 2** | Data Models & Knowledge Layer | Medium | Low | Medium |
| **Phase 3** | Agent Framework Implementation | **High** | **High** | **Large** |
| **Phase 4** | Core Productivity Engine | Medium | Medium | **Large** |
| **Phase 5** | Deadline Rescue System | **High** | **High** | Large |
| **Phase 6** | Future Simulation Engine | **High** | **High** | Large |
| **Phase 7** | User Experience & Interface | **High** | Medium | **Large** |
| **Phase 8** | Integrations Layer | Medium | **High** | Medium |
| **Phase 9** | Intelligence Enhancement Layer | **High** | Medium | Large |
| **Phase 10** | WoW Features | **High** | Medium | Large |
| **Phase 11** | Testing & Evaluation | Medium | Medium | Large |
| **Phase 12** | Deployment & Productionization | Medium | Medium | Medium |
| **Phase 13** | Hackathon Submission Assets | Low | Low | Medium |

### Risk Explanations:

**Phase 3 (Agent Framework) — High Risk:**
- LLM outputs are non-deterministic. Agent pipelines may produce unexpected results.
- Orchestrator routing logic is complex. Circular triggers can cause infinite loops.
- Mitigation: Unit test every agent with mocked LLM responses. Add circuit breakers.

**Phase 5 (Deadline Rescue) — High Risk:**
- Calendar write operations are irreversible. Incorrect rescue could corrupt a user's calendar.
- Mitigation: Preview mode before apply, undo within 5 minutes, atomic batch writes.

**Phase 6 (Simulation Engine) — High Risk:**
- Probability computations need calibration against real user behavior to be meaningful.
- LLM scenario narratives can be inaccurate or unhelpful if prompts are poorly designed.
- Mitigation: Heuristic fallback when LLM confidence is low. Human-reviewed prompt library.

**Phase 8 (Integrations) — High Risk:**
- Google Calendar OAuth2 flow is complex. Token refresh is error-prone.
- Pub/Sub webhook reliability depends on public URL availability (deploy order matters).
- Mitigation: Implement token refresh retry logic. Test with real Google accounts early.

---

## Phase-wise Markdown File Plan

Each phase will be expanded into its own implementation file:

| File | Phase | Focus |
|------|-------|-------|
| `PHASE_0.md` | Foundation & Planning | GCP setup, repo, API keys |
| `PHASE_1.md` | Architecture Design | Diagrams, contracts, schemas |
| `PHASE_2.md` | Data Models | Firestore, embeddings, seed data |
| `PHASE_3.md` | Agent Framework | All 15+ agents, orchestrator, event bus |
| `PHASE_4.md` | Core Productivity Engine | Task CRUD, calendar sync, notifications |
| `PHASE_5.md` | Deadline Rescue System | Rescue pipeline, escalation matrix |
| `PHASE_6.md` | Future Simulation Engine | Scenarios, probabilities, visualization |
| `PHASE_7.md` | UX & Interface | All pages, components, interactions |
| `PHASE_8.md` | Integrations Layer | Calendar, Gmail, FCM, webhooks |
| `PHASE_9.md` | Intelligence Enhancement | Personalization, learning, copilot |
| `PHASE_10.md` | WoW Features | Autonomous rescue, prediction, DNA |
| `PHASE_11.md` | Testing & Evaluation | Unit, integration, agent, perf tests |
| `PHASE_12.md` | Deployment | Cloud Run, CI/CD, monitoring, secrets |
| `PHASE_13.md` | Submission Assets | GitHub, demo video, docs, pitch |

---

*ForeSee — See your deadlines. Before they see you.*
