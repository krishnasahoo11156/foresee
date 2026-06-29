"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Play, Pause, RotateCcw, ChevronRight, ChevronLeft,
  Laptop, Cpu, Database, Sparkles, Calendar, Zap
} from "lucide-react";

interface Step {
  id: number;
  label: string;
  message: string;
  y: number;
  from: string;
  to: string;
  startX: number;
  endX: number;
  tone: string;
  description: string;
}

export function SequenceFlow() {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const steps: Step[] = [
    {
      id: 0,
      label: "1. Trigger Event",
      message: "Client requests schedule risk check...",
      y: 100,
      from: "client",
      to: "orchestrator",
      startX: 80,
      endX: 240,
      tone: "blue",
      description: "Client UI submits a scheduling risk query. The Orchestration Agent captures the context and initiates the diagnosis pipeline."
    },
    {
      id: 1,
      label: "2. Analyze Risk",
      message: "Orchestrator queries Risk Analyzer...",
      y: 130,
      from: "orchestrator",
      to: "risk",
      startX: 240,
      endX: 400,
      tone: "purple",
      description: "Orchestrator routes the user profile and task dependencies to the Risk Analyzer to calculate task failure probabilities."
    },
    {
      id: 2,
      label: "3. Risk Score Return",
      message: "Vulnerability Index: 82% critical",
      y: 160,
      from: "risk",
      to: "orchestrator",
      startX: 400,
      endX: 240,
      tone: "red",
      description: "Risk Analyzer computes standard deviation and logs, identifying critical paths and dependency leaks, returning results to Orchestrator."
    },
    {
      id: 3,
      label: "4. Permute Futures",
      message: "Future Simulation permutes alternatives...",
      y: 190,
      from: "orchestrator",
      to: "sim",
      startX: 240,
      endX: 560,
      tone: "pink",
      description: "Orchestrator calls Future Simulation to run Monte Carlo trials, calculating likelihood of recovery via scope compression or buffers."
    },
    {
      id: 4,
      label: "5. Resolve Conflicts",
      message: "Scheduler optimizes calendar layout...",
      y: 220,
      from: "sim",
      to: "scheduler",
      startX: 560,
      endX: 720,
      tone: "cyan",
      description: "Future Simulation coordinates with Smart Scheduler to reorganize deep-work slots and resolve scheduling block conflicts."
    },
    {
      id: 5,
      label: "6. Rescue Proposal",
      message: "Proposal: Shift 2 task blocks",
      y: 250,
      from: "scheduler",
      to: "orchestrator",
      startX: 720,
      endX: 240,
      tone: "purple",
      description: "Smart Scheduler outputs optimized calendar slot alternatives and returns a single-action 'Rescue Plan' back to Orchestrator."
    },
    {
      id: 6,
      label: "7. Render Rescue",
      message: "Present Rescue Plan option to Client",
      y: 280,
      from: "orchestrator",
      to: "client",
      startX: 240,
      endX: 80,
      tone: "blue",
      description: "Orchestrator syncs coordinates and pushes the proposed Rescue Plan to Client UI, triggering a dashboard alert for user approval."
    }
  ];

  // Playback timer cycle
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4500); // 4.5 seconds per step

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, steps.length]);

  const selectStep = (id: number) => {
    setIsPlaying(false);
    setActiveStep(id);
  };

  const handlePrev = () => {
    setIsPlaying(false);
    setActiveStep((prev) => (prev - 1 + steps.length) % steps.length);
  };

  const handleNext = () => {
    setIsPlaying(false);
    setActiveStep((prev) => (prev + 1) % steps.length);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const resetFlow = () => {
    setIsPlaying(false);
    setActiveStep(0);
  };

  const activeData = steps[activeStep];
  const activeActors = [activeData.from, activeData.to];

  return (
    <div className="seq-card">
      <div className="seq-header">
        <div>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>Agent Orchestration Sequence</h3>
          <p className="muted" style={{ margin: "2px 0 0 0", fontSize: "12px" }}>
            Watch how the 15-agent architecture triggers, scoring risks, running simulations, and resolving calendar blocks in sequence.
          </p>
        </div>
        <div className="seq-btn-row">
          <button className="seq-btn" onClick={handlePrev} title="Previous Step">
            <ChevronLeft size={14} />
          </button>
          <button className={`seq-btn ${isPlaying ? "btn-active" : ""}`} onClick={togglePlay} title={isPlaying ? "Pause" : "Auto Play"}>
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span>{isPlaying ? "Auto-cycling" : "Play Flow"}</span>
          </button>
          <button className="seq-btn" onClick={handleNext} title="Next Step">
            <ChevronRight size={14} />
          </button>
          <button className="seq-btn" onClick={resetFlow} title="Reset Sequence">
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* SVG Canvas Sequence Flow */}
      <div className="seq-canvas-wrapper">
        <svg viewBox="0 0 800 310" className="seq-canvas">
          {/* Arrow markers */}
          <defs>
            <marker id="arrow-blue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--accent)" />
            </marker>
            <marker id="arrow-purple" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#8b5cf6" />
            </marker>
            <marker id="arrow-red" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#ef4444" />
            </marker>
            <marker id="arrow-pink" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#ec4899" />
            </marker>
            <marker id="arrow-cyan" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--accent-2)" />
            </marker>
          </defs>

          {/* Actor 1: Client UI */}
          <g className={`seq-lifeline-group lifeline-client ${activeActors.includes("client") ? "lifeline-active node-client" : ""}`}>
            <line x1="80" y1="50" x2="80" y2="295" className="seq-lifeline-line" />
            <rect x="25" y="10" width="110" height="35" className="seq-lifeline-rect" />
            <foreignObject x="35" y="20" width="16" height="16">
              <Laptop size={14} style={{ color: activeActors.includes("client") ? "var(--accent)" : "var(--muted)" }} />
            </foreignObject>
            <text x="85" y="32" className="seq-lifeline-text" textAnchor="middle">Client App</text>
          </g>

          {/* Actor 2: Orchestrator */}
          <g className={`seq-lifeline-group lifeline-orchestrator ${activeActors.includes("orchestrator") ? "lifeline-active node-orchestrator" : ""}`}>
            <line x1="240" y1="50" x2="240" y2="295" className="seq-lifeline-line" />
            <rect x="185" y="10" width="110" height="35" className="seq-lifeline-rect" />
            <foreignObject x="195" y="20" width="16" height="16">
              <Zap size={14} style={{ color: activeActors.includes("orchestrator") ? "#8b5cf6" : "var(--muted)" }} />
            </foreignObject>
            <text x="245" y="32" className="seq-lifeline-text" textAnchor="middle">Orchestrator</text>
          </g>

          {/* Actor 3: Risk Analyzer */}
          <g className={`seq-lifeline-group lifeline-risk ${activeActors.includes("risk") ? "lifeline-active node-risk" : ""}`}>
            <line x1="400" y1="50" x2="400" y2="295" className="seq-lifeline-line" />
            <rect x="345" y="10" width="110" height="35" className="seq-lifeline-rect" />
            <foreignObject x="355" y="20" width="16" height="16">
              <Database size={14} style={{ color: activeActors.includes("risk") ? "#ef4444" : "var(--muted)" }} />
            </foreignObject>
            <text x="405" y="32" className="seq-lifeline-text" textAnchor="middle">Risk Engine</text>
          </g>

          {/* Actor 4: Future Sim */}
          <g className={`seq-lifeline-group lifeline-sim ${activeActors.includes("sim") ? "lifeline-active node-sim" : ""}`}>
            <line x1="560" y1="50" x2="560" y2="295" className="seq-lifeline-line" />
            <rect x="505" y="10" width="110" height="35" className="seq-lifeline-rect" />
            <foreignObject x="515" y="20" width="16" height="16">
              <Sparkles size={14} style={{ color: activeActors.includes("sim") ? "#ec4899" : "var(--muted)" }} />
            </foreignObject>
            <text x="565" y="32" className="seq-lifeline-text" textAnchor="middle">Future Sim</text>
          </g>

          {/* Actor 5: Smart Scheduler */}
          <g className={`seq-lifeline-group lifeline-scheduler ${activeActors.includes("scheduler") ? "lifeline-active node-scheduler" : ""}`}>
            <line x1="720" y1="50" x2="720" y2="295" className="seq-lifeline-line" />
            <rect x="665" y="10" width="110" height="35" className="seq-lifeline-rect" />
            <foreignObject x="675" y="20" width="16" height="16">
              <Calendar size={14} style={{ color: activeActors.includes("scheduler") ? "var(--accent-2)" : "var(--muted)" }} />
            </foreignObject>
            <text x="725" y="32" className="seq-lifeline-text" textAnchor="middle">Smart Scheduler</text>
          </g>

          {/* RENDER SEQUENCE ARROWS */}
          {steps.map((step) => {
            const isActive = step.id === activeStep;
            const arrowColor = step.tone === "blue" ? "flow-step-blue" :
                               step.tone === "purple" ? "flow-step-purple" :
                               step.tone === "red" ? "flow-step-red" :
                               step.tone === "pink" ? "flow-step-pink" : "flow-step-cyan";

            const labelX = (step.startX + step.endX) / 2;

            return (
              <g 
                key={step.id} 
                className={`seq-arrow-group ${isActive ? "active-step" : ""}`}
                onClick={() => selectStep(step.id)}
              >
                {/* Connecting arrow line */}
                <line 
                  x1={step.startX} 
                  y1={step.y} 
                  x2={step.endX} 
                  y2={step.y} 
                  className={`seq-arrow-line ${isActive ? `seq-arrow-line-active ${arrowColor}` : ""}`} 
                  markerEnd={isActive ? `url(#arrow-${step.tone})` : ""}
                />
                
                {/* Arrow Text Label */}
                <text 
                  x={labelX} 
                  y={step.y - 6} 
                  className="seq-arrow-label" 
                  textAnchor="middle"
                  style={{ fill: isActive ? "" : "var(--muted)" }}
                >
                  {step.label}
                </text>

                {/* Arrow Message Detail */}
                <text 
                  x={labelX} 
                  y={step.y + 12} 
                  className="seq-arrow-label" 
                  textAnchor="middle"
                  style={{ fill: "var(--muted)", fontWeight: 500, fontSize: "8px", opacity: isActive ? 1 : 0.4 }}
                >
                  {step.message}
                </text>

                {/* Animated traveling data packet */}
                {isActive && (
                  <circle r="4" className={`seq-particle particle-${step.tone}`}>
                    <animate 
                      attributeName="cx" 
                      from={step.startX} 
                      to={step.endX} 
                      dur="1.2s" 
                      repeatCount="indefinite" 
                      key={step.id}
                    />
                    <animate 
                      attributeName="cy" 
                      from={step.y} 
                      to={step.y} 
                      dur="1.2s" 
                      repeatCount="indefinite" 
                      key={step.id}
                    />
                  </circle>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* STEP DESCRIPTION DETAIL CARD */}
      <div className="seq-description-card">
        <div className={`seq-desc-accent-bar desc-accent-${activeData.tone}`}></div>
        <div className="seq-desc-body">
          <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Active Stage {activeStep + 1} of 7
          </span>
          <h4 className="seq-desc-title">{activeData.label}: {activeData.message}</h4>
          <p className="seq-desc-text">{activeData.description}</p>
        </div>
      </div>
    </div>
  );
}
