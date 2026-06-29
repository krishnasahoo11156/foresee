"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Layout, Cpu, Globe, Sparkles, Database, 
  Calendar, Lock, Activity, Shield, MessageSquare, 
  AlertTriangle, Play, Pause
} from "lucide-react";

type LayerId = "frontend" | "engine" | "backend";

interface Feature {
  name: string;
  description: string;
  icon: React.ReactNode;
}

interface LayerData {
  id: LayerId;
  name: string;
  subtitle: string;
  badge: string;
  badgeClass: string;
  icon: React.ReactNode;
  description: string;
  features: Feature[];
}

export function ArchitectureDiagram() {
  const [activeLayer, setActiveLayer] = useState<LayerId>("engine");
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const layers: LayerData[] = [
    {
      id: "frontend",
      name: "Client UI & Local State",
      subtitle: "Next.js Responsive Front-end",
      badge: "Local Demo",
      badgeClass: "badge-frontend",
      icon: <Layout size={18} />,
      description: "A fast, responsive UI built with Next.js App Router. During the preview, it operates entirely on client-side state, allowing instant theme switching and fast navigation without external database delays.",
      features: [
        {
          name: "Interactive Dashboard & Planner",
          description: "Tracks focus blocks, tasks, and rescue simulation UI in real time.",
          icon: <Layout size={12} />
        },
        {
          name: "AI Copilot Workspace",
          description: "A conversational interface designed to parse natural task syntax.",
          icon: <MessageSquare size={12} />
        },
        {
          name: "Reactive State Sync",
          description: "Lightweight in-memory state engine simulating full backend writes.",
          icon: <Database size={12} />
        }
      ]
    },
    {
      id: "engine",
      name: "Simulation & Risk Engine",
      subtitle: "The Analytics & Planning Core",
      badge: "Active",
      badgeClass: "badge-engine",
      icon: <Cpu size={18} />,
      description: "The core algorithmic layer of ForeSee. It analyzes task hierarchies, focus slots, and historical velocity to identify scheduling risks and automatically compile Rescue Plans.",
      features: [
        {
          name: "Focus Window Tracker",
          description: "Maps daily capacities and identifies deep work interruptions.",
          icon: <Activity size={12} />
        },
        {
          name: "Risk Assessment Model",
          description: "Runs simulations across dependency trees to detect potential deadline slips.",
          icon: <AlertTriangle size={12} />
        },
        {
          name: "Rescue Plan Compiler",
          description: "Formulates single-click solutions (dropping tasks, rescheduling slots) to recover lost time.",
          icon: <Shield size={12} />
        }
      ]
    },
    {
      id: "backend",
      name: "Cloud Services & APIs",
      subtitle: "Live Infrastructure (Planned)",
      badge: "Planned",
      badgeClass: "badge-backend",
      icon: <Globe size={18} />,
      description: "Our planned backend services designed to scale ForeSee to multi-device sync, secure authentication, and cloud-backed intelligence.",
      features: [
        {
          name: "Firebase Auth & Firestore",
          description: "Google OAuth logins with live, synchronized Firestore database nodes.",
          icon: <Lock size={12} />
        },
        {
          name: "Google Calendar Sync",
          description: "Bi-directional integration to read focus blocks and schedule rescue tasks.",
          icon: <Calendar size={12} />
        },
        {
          name: "Gemini AI Core",
          description: "Converts natural language commands to structured tasks and compiles risk warnings.",
          icon: <Sparkles size={12} />
        }
      ]
    }
  ];

  const cycleOrder: LayerId[] = ["frontend", "engine", "backend"];

  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    const duration = 6000; // 6 seconds per layer
    const intervalTime = 100; // update progress every 100ms
    const totalSteps = duration / intervalTime;
    let stepCount = (progress / 100) * totalSteps;

    progressIntervalRef.current = setInterval(() => {
      stepCount++;
      const percent = (stepCount / totalSteps) * 100;
      setProgress(percent);

      if (stepCount >= totalSteps) {
        stepCount = 0;
        setProgress(0);
        setActiveLayer((prev) => {
          const currentIndex = cycleOrder.indexOf(prev);
          const nextIndex = (currentIndex + 1) % cycleOrder.length;
          return cycleOrder[nextIndex];
        });
      }
    }, intervalTime);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isPlaying, activeLayer]);

  const selectLayer = (id: LayerId) => {
    setIsPlaying(false);
    setProgress(0);
    setActiveLayer(id);
  };

  const togglePlay = () => {
    if (!isPlaying) {
      setProgress(0);
    }
    setIsPlaying(!isPlaying);
  };

  const activeData = layers.find(l => l.id === activeLayer) || layers[1];

  return (
    <div className="arch-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700, color: "var(--muted)" }}>
          System Architecture
        </span>
        <button 
          onClick={togglePlay}
          style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "4px", 
            fontSize: "11px", 
            fontWeight: 600,
            padding: "2px 8px", 
            borderRadius: "4px",
            background: "var(--surface-soft)",
            border: "1px solid var(--surface-line)",
            color: "var(--text)"
          }}
          title={isPlaying ? "Pause Auto-Rotation" : "Play Auto-Rotation"}
        >
          {isPlaying ? <Pause size={10} /> : <Play size={10} />}
          <span>{isPlaying ? "Auto-cycling" : "Paused"}</span>
        </button>
      </div>

      {/* SVG gradients for connecting flows */}
      <svg style={{ position: "absolute", width: 0, height: 0 }}>
        <defs>
          <linearGradient id="blue-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <linearGradient id="purple-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="var(--accent-2)" />
          </linearGradient>
        </defs>
      </svg>

      {/* Layer 1: Client UI */}
      <div 
        className={`arch-layer-card ${activeLayer === "frontend" ? "active-frontend" : ""}`}
        onClick={() => selectLayer("frontend")}
      >
        <div className="arch-layer-header">
          <div className="arch-layer-title-wrapper">
            <div className="arch-layer-icon">
              <Layout size={16} />
            </div>
            <div>
              <h4 className="arch-layer-title">Client UI & Local State</h4>
              <p className="arch-layer-subtitle">Next.js App Router UI</p>
            </div>
          </div>
          <span className={`arch-badge ${activeLayer === "frontend" ? "badge-frontend" : ""}`}>
            Local Demo
          </span>
        </div>
        {activeLayer === "frontend" && (
          <div className="arch-progress-track">
            <div className="arch-progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        )}
      </div>

      {/* Connector 1 */}
      <div className="arch-connector-wrapper">
        <svg className="arch-flow-svg">
          <path 
            d="M 50 0 L 50 28" 
            className={`arch-flow-line ${activeLayer === "frontend" || activeLayer === "engine" ? "arch-flow-line-active flow-frontend-to-engine" : ""}`}
          />
        </svg>
      </div>

      {/* Layer 2: Simulation Engine */}
      <div 
        className={`arch-layer-card ${activeLayer === "engine" ? "active-engine" : ""}`}
        onClick={() => selectLayer("engine")}
      >
        <div className="arch-layer-header">
          <div className="arch-layer-title-wrapper">
            <div className="arch-layer-icon">
              <Cpu size={16} />
            </div>
            <div>
              <h4 className="arch-layer-title">Simulation & Risk Engine</h4>
              <p className="arch-layer-subtitle">Workload & Planning Intelligence</p>
            </div>
          </div>
          <span className={`arch-badge ${activeLayer === "engine" ? "badge-engine" : ""}`}>
            Active Core
          </span>
        </div>
        {activeLayer === "engine" && (
          <div className="arch-progress-track">
            <div className="arch-progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        )}
      </div>

      {/* Connector 2 */}
      <div className="arch-connector-wrapper">
        <svg className="arch-flow-svg">
          <path 
            d="M 50 0 L 50 28" 
            className={`arch-flow-line ${activeLayer === "engine" || activeLayer === "backend" ? "arch-flow-line-active flow-engine-to-backend" : ""}`}
          />
        </svg>
      </div>

      {/* Layer 3: Backend Services */}
      <div 
        className={`arch-layer-card ${activeLayer === "backend" ? "active-backend" : ""}`}
        onClick={() => selectLayer("backend")}
      >
        <div className="arch-layer-header">
          <div className="arch-layer-title-wrapper">
            <div className="arch-layer-icon">
              <Globe size={16} />
            </div>
            <div>
              <h4 className="arch-layer-title">Cloud Services & APIs</h4>
              <p className="arch-layer-subtitle">Live Infrastructure integrations</p>
            </div>
          </div>
          <span className={`arch-badge ${activeLayer === "backend" ? "badge-backend" : ""}`}>
            Planned
          </span>
        </div>
        {activeLayer === "backend" && (
          <div className="arch-progress-track">
            <div className="arch-progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        )}
      </div>

      {/* Details Card */}
      <div className="arch-details-card">
        <div className={`arch-details-accent-bar accent-bar-${activeLayer}`}></div>
        <div className="arch-details-body">
          <div className="arch-details-header">
            <h5 className="arch-details-title">
              {activeData.icon}
              {activeData.name}
            </h5>
            <p className="arch-details-desc">
              {activeData.description}
            </p>
          </div>
          <div className="arch-details-features">
            {activeData.features.map((feat, index) => (
              <div className="arch-feature-row" key={index}>
                <div className="arch-feature-dot">
                  {feat.icon}
                </div>
                <div className="arch-feature-text">
                  <span className="arch-feature-name">{feat.name}</span>
                  <span className="arch-feature-desc">{feat.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
