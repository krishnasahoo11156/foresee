<div align="center">
  
  <!-- SVG Animated Header Banner -->
  <svg viewBox="0 0 800 280" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; max-width: 800px; margin: 0 auto; display: block; border-radius: 12px; background: #0b0b0f; box-shadow: 0 12px 40px rgba(0,0,0,0.5); border: 1px solid #1a1a24;">
    <style>
      @keyframes pulse {
        0%, 100% { opacity: 0.3; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.1); }
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      @keyframes dash {
        to { stroke-dashoffset: -40; }
      }
      .node { animation: pulse 3s infinite ease-in-out; transform-origin: center; }
      .node-fast { animation: pulse 1.5s infinite ease-in-out; transform-origin: center; }
      .spinner { animation: spin 10s linear infinite; transform-origin: 650px 140px; }
      .spinner-reverse { animation: spin 15s linear infinite reverse; transform-origin: 650px 140px; }
      .flow-line { stroke-dasharray: 8 4; animation: dash 2s linear infinite; }
    </style>
    
    <!-- Definitions for gradients -->
    <defs>
      <linearGradient id="brand-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#3b82f6" />
        <stop offset="100%" stop-color="#06b6d4" />
      </linearGradient>
      <linearGradient id="glow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ef4444" stop-opacity="0.8" />
        <stop offset="100%" stop-color="#f59e0b" stop-opacity="0.2" />
      </linearGradient>
      <linearGradient id="node-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1e1b4b" />
        <stop offset="100%" stop-color="#0f172a" />
      </linearGradient>
    </defs>

    <!-- Background grid pattern -->
    <rect width="100%" height="100%" fill="#0a0a0c" />
    <g opacity="0.15">
      <path d="M0 40H800M0 80H800M0 120H800M0 160H800M0 200H800M0 240H800" stroke="#71717a" stroke-width="1"/>
      <path d="M80 0V280M160 0V280M240 0V280M320 0V280M400 0V280M480 0V280M560 0V280M640 0V280M720 0V280" stroke="#71717a" stroke-width="1"/>
    </g>

    <!-- Left: Logo and Brand Name -->
    <g transform="translate(60, 95)">
      <!-- Outer hexagonal logo ring -->
      <path d="M 0,-40 L 35,-20 L 35,20 L 0,40 L -35,20 L -35,-20 Z" fill="url(#node-grad)" stroke="url(#brand-grad)" stroke-width="3" />
      <!-- Glowing core node inside logo -->
      <circle cx="0" cy="0" r="10" fill="url(#brand-grad)" class="node-fast" />
      
      <!-- Title Text -->
      <text x="60" y="-8" fill="#ffffff" font-family="'DM Sans', system-ui, sans-serif" font-weight="900" font-size="34" letter-spacing="-0.03em">ForeSee</text>
      <text x="60" y="16" fill="#71717a" font-family="'DM Sans', system-ui, sans-serif" font-weight="500" font-size="14" letter-spacing="0.05em">COGNITIVE TASK RESCUE</text>
      <text x="60" y="34" fill="url(#brand-grad)" font-family="'DM Sans', system-ui, sans-serif" font-weight="700" font-size="11" letter-spacing="0.1em">MULTI-AGENT AUTOPILOT</text>
    </g>

    <!-- Right: Orchestration Pipeline Visualizer -->
    <!-- Connection lines -->
    <path d="M450 140 H650" stroke="#3b82f6" stroke-opacity="0.3" stroke-width="2" />
    <path d="M520 80 V200" stroke="#3b82f6" stroke-opacity="0.3" stroke-width="2" />
    <path d="M520 80 L650 140" stroke="#06b6d4" stroke-opacity="0.2" stroke-width="1.5" />
    <path d="M520 200 L650 140" stroke="#ef4444" stroke-opacity="0.2" stroke-width="1.5" />
    
    <!-- Flow animations (dashed moving overlays) -->
    <path d="M450 140 H650" stroke="url(#brand-grad)" stroke-width="2.5" fill="none" class="flow-line" />
    
    <!-- Central Hub - Scheduling Optimizer (Rotating Gauge) -->
    <circle cx="650" cy="140" r="50" fill="#111115" stroke="#1d1d24" stroke-width="3" />
    <circle cx="650" cy="140" r="42" fill="none" stroke="url(#brand-grad)" stroke-width="1.5" stroke-dasharray="180 90" class="spinner" />
    <circle cx="650" cy="140" r="35" fill="none" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="40 40" class="spinner-reverse" />
    <circle cx="650" cy="140" r="14" fill="#000" stroke="#2563eb" stroke-width="2" />
    <circle cx="650" cy="140" r="6" fill="#06b6d4" class="node-fast" />

    <!-- Node 1: Tasks Input (Top Left) -->
    <g transform="translate(450, 80)">
      <circle cx="0" cy="0" r="22" fill="#111115" stroke="#3b82f6" stroke-width="2" />
      <path d="M-8 -4 H8 M-8 2 H8 M-8 8 H4" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" />
      <circle cx="0" cy="0" r="3" fill="#3b82f6" class="node" />
      <text x="0" y="36" fill="#71717a" font-family="system-ui" font-size="10" text-anchor="middle" font-weight="600">Tasks Queue</text>
    </g>

    <!-- Node 2: Gemini API (Bottom Left) -->
    <g transform="translate(450, 200)">
      <circle cx="0" cy="0" r="22" fill="#111115" stroke="#a855f7" stroke-width="2" />
      <path d="M0 -10 L2 -3 L9 0 L2 3 L0 10 L-2 3 L-9 0 L-2 -3 Z" fill="#a855f7" />
      <text x="0" y="36" fill="#71717a" font-family="system-ui" font-size="10" text-anchor="middle" font-weight="600">Gemini LLM</text>
    </g>

    <!-- Node 3: Firebase (Top Middle) -->
    <g transform="translate(520, 80)">
      <circle cx="0" cy="0" r="18" fill="#111115" stroke="#f59e0b" stroke-width="1.5" />
      <path d="M-5 -5 L5 5 M5 -5 L-5 5" stroke="#f59e0b" stroke-width="2" />
      <text x="0" y="-26" fill="#71717a" font-family="system-ui" font-size="10" text-anchor="middle" font-weight="600">Firestore DB</text>
    </g>

    <!-- Node 4: Calendar Sync (Bottom Middle) -->
    <g transform="translate(520, 200)">
      <circle cx="0" cy="0" r="18" fill="#111115" stroke="#10b981" stroke-width="1.5" />
      <rect x="-6" y="-6" width="12" height="12" rx="2" fill="none" stroke="#10b981" stroke-width="1.5" />
      <line x1="-3" y1="-6" x2="-3" y2="-3" stroke="#10b981" stroke-width="1.5" />
      <line x1="3" y1="-6" x2="3" y2="-3" stroke="#10b981" stroke-width="1.5" />
      <text x="0" y="30" fill="#71717a" font-family="system-ui" font-size="10" text-anchor="middle" font-weight="600">GCal API</text>
    </g>
  </svg>

  <br />

  <h1>🚀 ForeSee</h1>
  <h3><i>Cognitive-Aware Agentic Task Scheduler & Timeline Rescue Engine</i></h3>

  <p>
    <b>Predict deadline failure probabilities, group task cognitive loads, and autonomously rescue schedules before they slip.</b>
  </p>

  <!-- Badges -->
  <p>
    <a href="https://github.com/krishnasahoo11156/foresee"><img src="https://img.shields.io/github/stars/krishnasahoo11156/foresee?style=for-the-badge&color=2563eb" alt="GitHub Stars" /></a>
    <a href="https://github.com/krishnasahoo11156/foresee"><img src="https://img.shields.io/github/forks/krishnasahoo11156/foresee?style=for-the-badge&color=0891b2" alt="GitHub Forks" /></a>
    <a href="https://github.com/krishnasahoo11156/foresee/blob/main/LICENSE"><img src="https://img.shields.io/github/license/krishnasahoo11156/foresee?style=for-the-badge&color=16a34a" alt="License" /></a>
  </p>

  <p>
    <a href="#-problem-statement">Problem Statement</a> •
    <a href="#-solution-overview">Solution Overview</a> •
    <a href="#-key-features">Key Features</a> •
    <a href="#-google-technologies-utilized">Google Tech</a> •
    <a href="#-quick-start">Quick Start</a>
  </p>
</div>

---

## 🎯 Problem Statement
Knowledge workers plan tasks daily, yet **70% of software projects miss their deadlines**. The root cause is not lack of effort; it is that existing productivity tools are **completely static**:
- **Context-switching is invisible**: Moving from deep coding to a status meeting incurs a verified 23-minute cognitive re-focus cost. Traditional calendars ignore this completely.
- **Deadline risk is binary**: Tools only notify you *after* a deadline has passed, rather than predicting risk beforehand.
- **No autonomous correction**: When a timeline slips, the user has to manually reschedule, resolve calendar overlaps, and adjust plans.

---

## 💡 Solution Overview
**ForeSee** is a cognitive-aware, agentic task scheduler and timeline rescue engine. It acts as an always-on AI co-pilot that monitors task queues, calendar workloads, and user-onboarded cognitive parameters in real time. 

Powered by **Gemini 1.5 Flash**, ForeSee:
1. Decomposes large tasks into structured focus blocks.
2. Groups cognitively adjacent work to minimize attention switching costs.
3. Continuously evaluates deadline risk scores using a multi-variable engine.
4. Generates and autonomously executes rescue strategies (Focused Sprint, Scope Compression, Emergency Reschedule) to keep critical tasks on track, syncing changes back to **Google Calendar** in real time.

---

## ✨ Key Features

- **📊 Dynamic Risk Scoring Engine** — Computes a live 0–100 risk factor per task based on daily capacity, remaining workload, deadline proximity, and focus alignment.
- **🤖 Gemini-Powered Copilot Chat** — An interactive chat terminal that decomposes user prompts into tasks, drafts focus schedules, and suggests events that sync in one click.
- **⚡ Autonomous Rescue Planner** — Automatically activates when a task crosses into Danger or Critical state, offering three alternate paths and auto-updating schedules.
- **🎰 Monte Carlo Simulator** — Runs 500 probabilistic timeline runs to predict the distribution of likely completion dates.
- **👁️ Multi-Agent Orchestration Visualizer** — Live animated pipeline illustrating sequence flows between four background agents: *Security Validator*, *Scheduling Optimizer*, *Firebase Sync*, and *Notification Dispatcher*.
- **📈 Cognitive Load Simulator** — Visualizes focus intensity and simulated switcher fatigue using interactive spline-curve charts.
- **⚙️ Settings HUD** — Futuristic SVG arc-gauge dials for calibrating Focus Bandwidth, Autonomy levels, and Context Costs to customize risk profiles.
- **👤 Full Guest Mode Bypass** — Seeding of realistic task lists, schedules, and chat history for evaluators to test all actions instantly without logging in.

---

## 🛠️ Technologies Used

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript |
| **Styling** | Vanilla CSS, system theme tokens, CSS custom properties |
| **Database** | Firebase Firestore (Real-time `onSnapshot` subscriptions) |
| **Authentication** | Firebase Authentication (Google OAuth 2.0) |
| **AI Processing** | Google Gemini 1.5 Flash via `@google/generative-ai` SDK |
| **Calendar Sync** | Google Calendar API v3 |
| **Email Alerts** | Resend API via Next.js Serverless Route |
| **Deployment** | Google Cloud Run |
| **Dev Environment** | Google AI Studio |

---

## 🔗 Google Technologies Utilized

### Google AI Studio
Used as our core prototyping cockpit. AI Studio's "Build Mode" allowed us to iterate on prompt structures, test Gemini's JSON schema enforcement for task breakdowns, and validate the rescue planner logic prior to deploying to Cloud Run.

### Gemini 1.5 Flash (Google AI SDK)
The intelligent scheduler behind ForeSee. It decomposes task goals, optimizes calendar slots to reduce switching penalties, and recommends ranked timeline rescue alternatives based on remaining capacity.

### Google Calendar API
Bi-directional real-time sync. Pushes focus blocks directly to the user's primary calendar. Rescheduling a block via drag-and-drop or accepting an AI rescue strategy updates calendar events in real time.

### Firebase Firestore & Auth
Google OAuth 2.0 Sign-In isolates user profiles. Firestore manages real-time database updates, ensuring changes made on one device instantly propagate to all other open dashboard instances.

### Google Cloud Run
Hosts the containerized production Next.js build. Offers HTTPS, zero idle costs by scaling to zero when not in use, and fast responses for hackathon evaluations.

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/krishnasahoo11156/foresee.git
cd foresee/frontend
npm install
```

### 2. Set Up Environment variables
Create a `.env.local` inside the `/frontend` directory:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
GEMINI_API_KEY=your_gemini_api_key
RESEND_API_KEY=your_resend_api_key
```

### 3. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

<details>
<summary>🛠️ Detailed Historical Phase Roadmap (Phase 0 - 13)</summary>

### Phase 0 — Foundation & Planning
- Initialize GitHub repo with branching model.
- Configure Google Cloud Project and Firebase App environment.
- Plan Monorepo folders: `/frontend`, `/backend`, `/agents`.

### Phase 1 — Core Architecture Design
- Define Firestore collection schemas and API endpoints.
- Outline Event Bus and task lifecycle flows.
- Map out 15+ sub-agents in the orchestration diagram.

### Phase 2 — Data Models & Firebase Seeding
- Seed test mock profiles and tasks.
- Create security rules for users collections.

### Phase 3 — Agent Framework & Event Bus
- Implement event-driven triggers.
- Code agent routing logic and testing mock suites.

### Phase 4 — Core Productivity Engine
- Establish task CRUD and bi-directional Google Calendar sync.
- Create notification and inbox dispatch layers.

### Phase 5 — Deadline Rescue System
- Design risk scoring engine and math modules.
- Create strategy handlers (Sprint, Compress, Defer).

### Phase 6 — Simulation Engine
- Implement Monte Carlo simulation logic.
- Integrate scenario planner charts.

### Phase 7 — UX & UI Refinement
- Design dashboard, profile hub, timeline drag grid, and settings gauge dials.
- Enable full Light and Dark theme palettes.

### Phase 8 — Integrations Layer
- Finalize Google OAuth refresh token hooks and calendar webhooks.

### Phase 9 — Personalization & Learning
- Implement user profile calibration.
- Build Copilot conversational UI.

### Phase 10 — WoW Features
- Launch autonomous rescue simulator and visual agent graphs.

### Phase 11 — Testing & Validation
- Run tsc build compile checks, user simulations, and API fallbacks.

### Phase 12 — Cloud Run Deployment
- Build Next.js docker containers and deploy to Cloud Run.

### Phase 13 — Submission Assets
- Write Google Doc submission text and build final walkthrough videos.

</details>

---

*ForeSee — See your deadlines. Before they see you.*
