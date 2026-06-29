"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Sparkles, Play, AlertTriangle } from "lucide-react";

interface MonteCarloChartProps {
  uncertainty: number;
  setUncertainty: (val: number) => void;
  buffer: number;
  setBuffer: (val: number) => void;
}

interface Particle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  color: string;
  size: number;
  progress: number; // 0 to 1
}

export function MonteCarloChart({ uncertainty, setUncertainty, buffer, setBuffer }: MonteCarloChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Animation states
  const [isSimulating, setIsSimulating] = useState(false);
  const [trialCount, setTrialCount] = useState(1000);
  const [currentTrial, setCurrentTrial] = useState(1000);
  const [scanProgress, setScanProgress] = useState(1); // 0 to 1
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  // Reset and clear canvas on parameter adjustments
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setScanProgress(1);
  }, [uncertainty, buffer]);

  // Time bins: 15 columns representing completion days relative to deadline (Day 0)
  const relativeDays = ["-4", "-3", "-2", "-1", "0", "+1", "+2", "+3", "+4", "+5", "+6", "+7", "+8", "+9", "+10"];
  const xCoords = useMemo(() => relativeDays.map((_, i) => 60 + i * 46), []); // Map X from 60 to 704 (width = 760)

  // Compute normal distribution probability densities and cumulative probabilities
  const stats = useMemo(() => {
    // Mean: shifts left (earlier completion) as buffer increases
    const mean = 2.5 - (buffer * 1.5); 
    // Standard deviation: widens curve as uncertainty increases
    const stdDev = 1.2 + (uncertainty / 100) * 2.2;

    // 1. Calculate raw probability density function (PDF) values
    const pdfRaw = relativeDays.map((_, idx) => {
      // Map index 0..14 to days -4..10
      const x = idx - 4;
      const exponent = -0.5 * Math.pow((x - mean) / stdDev, 2);
      const density = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
      return density;
    });

    // 2. Normalize PDF so it fits the chart nicely (max peak ~ 25%)
    const maxPdf = Math.max(...pdfRaw);
    const pdfScaled = pdfRaw.map(v => (v / maxPdf) * 26);

    // 3. Compute cumulative distribution function (CDF) for S-Curve
    const cdfRaw: number[] = [];
    let sum = 0;
    pdfRaw.forEach((v) => {
      sum += v;
      cdfRaw.push(sum);
    });

    // Normalize CDF to 100%
    const maxCdf = cdfRaw[cdfRaw.length - 1];
    const cdfScaled = cdfRaw.map(v => (v / maxCdf) * 100);

    return { pdf: pdfScaled, cdf: cdfScaled };
  }, [uncertainty, buffer]);

  // Compute Bezier path for S-Curve (values 0..100 map to Y = 200..30)
  const scurvePath = useMemo(() => {
    const coords = stats.cdf.map((val, idx) => {
      const x = xCoords[idx];
      const y = 200 - (val / 100) * 170; // Map Y from 30 to 200
      return { x, y };
    });

    if (coords.length === 0) return "";
    let d = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const curr = coords[i];
      const next = coords[i + 1];
      const cpX1 = curr.x + 16;
      const cpY1 = curr.y;
      const cpX2 = next.x - 16;
      const cpY2 = next.y;
      d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${next.x} ${next.y}`;
    }
    return d;
  }, [stats.cdf, xCoords]);

  // Run Monte Carlo trial animation loop
  const triggerSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setCurrentTrial(0);
    setScanProgress(0);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions matching bounding rect
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const scaleX = canvas.width / 800;
    const scaleY = canvas.height / 220;
    const startX = 60 * scaleX;
    const endWidthX = 644 * scaleX;

    const maxTrials = 1000;
    const duration = 1600; // 1.6s scan duration
    const start = performance.now();

    const animate = (now: number) => {
      const elapsed = now - start;
      const progressRatio = Math.min(1, elapsed / duration);
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Increment current trial count
      const activeTrials = Math.floor(progressRatio * maxTrials);
      setCurrentTrial(activeTrials);

      // Update scan progress
      setScanProgress(progressRatio);

      // Draw single vertical scanning line
      const scannerX = startX + progressRatio * endWidthX;
      
      ctx.beginPath();
      ctx.moveTo(scannerX, 15 * scaleY);
      ctx.lineTo(scannerX, 205 * scaleY);
      ctx.strokeStyle = "rgba(59, 130, 246, 0.85)";
      ctx.lineWidth = 2 * scaleX;
      
      // Subtle horizontal gradient glow on the line
      ctx.shadowColor = "rgba(59, 130, 246, 0.6)";
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0; // Reset shadow

      if (progressRatio < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsSimulating(false);
        setCurrentTrial(1000);
        setScanProgress(1);
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear laser scanner when finished
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const svgX = (mouseX / rect.width) * 800;
    const clampedX = Math.max(60, Math.min(704, svgX));
    // Find nearest day index
    const nearestIndex = Math.round((clampedX - 60) / 46);

    setHoveredIndex(nearestIndex);
    setTooltipPos({ x: mouseX, y: mouseY });
  };

  const hoverPdf = hoveredIndex !== null ? Math.round(stats.pdf[hoveredIndex] * 3.5) : 0;
  const hoverCdf = hoveredIndex !== null ? Math.round(stats.cdf[hoveredIndex]) : 0;
  const hoverDay = hoveredIndex !== null ? parseInt(relativeDays[hoveredIndex]) : 0;

  // Determine risk badge for tooltip
  const getRiskBadge = (cdfVal: number) => {
    if (cdfVal >= 85) return { text: "Low Risk (Safe)", class: "badge-safe" };
    if (cdfVal >= 60) return { text: "Medium Risk (Monitor)", class: "badge-monitor" };
    return { text: "Critical Risk (Action Required)", class: "badge-danger" };
  };

  const riskInfo = getRiskBadge(hoverCdf);

  return (
    <div className="mc-card">
      <div className="mc-header">
        <div className="mc-title-group">
          <h3>Monte Carlo Simulator & Probability Matrix</h3>
          <p>Tweak Uncertainty and Buffer margin parameters to watch simulated project deadlines scale.</p>
        </div>
        <div className="mc-controls">
          {/* Slider: Uncertainty */}
          <div className="mc-slider-group">
            <span className="mc-slider-label">Schedule Uncertainty</span>
            <input 
              type="range" 
              min="15" 
              max="85" 
              className="mc-slider"
              value={uncertainty}
              onChange={(e) => setUncertainty(Number(e.target.value))}
              disabled={isSimulating}
            />
            <span className="mc-slider-val">{uncertainty}%</span>
          </div>

          {/* Slider: Buffer */}
          <div className="mc-slider-group">
            <span className="mc-slider-label">Buffer margin</span>
            <input 
              type="range" 
              min="0" 
              max="3" 
              step="0.5"
              className="mc-slider"
              value={buffer}
              onChange={(e) => setBuffer(Number(e.target.value))}
              disabled={isSimulating}
            />
            <span className="mc-slider-val">{buffer}h</span>
          </div>

          <button 
            className="mc-run-btn"
            onClick={triggerSimulation}
            disabled={isSimulating}
          >
            <Sparkles size={13} />
            <span>{isSimulating ? `Simulating...` : "Run Simulation"}</span>
          </button>
        </div>
      </div>

      {/* Chart wrapper */}
      <div className="mc-chart-container">
        {/* Particle Canvas */}
        <canvas ref={canvasRef} className="mc-particle-canvas" />

        {/* Counter Overlay */}
        <div style={{ position: "absolute", top: "12px", right: "12px", background: "var(--surface-soft)", padding: "4px 10px", borderRadius: "4px", fontSize: "11px", fontWeight: 700, zIndex: 10, border: "1px solid var(--surface-line)" }}>
          Trials: {currentTrial}/1000
        </div>

        {/* Tooltip */}
        {hoveredIndex !== null && (
          <div 
            className="mc-tooltip"
            style={{
              position: "absolute",
              left: `${tooltipPos.x + 20}px`,
              top: `${Math.max(10, Math.min(60, tooltipPos.y - 70))}px`,
            }}
          >
            <div className="mc-tooltip-day">
              {hoverDay === 0 ? "Deadline Day" : hoverDay > 0 ? `Day +${hoverDay} (Post-deadline)` : `Day ${hoverDay} (Pre-deadline)`}
            </div>
            <div className="mc-tooltip-row">
              <span className="mc-tooltip-label">Frequency Likelihood:</span>
              <span className="mc-tooltip-val">{hoverPdf}%</span>
            </div>
            <div className="mc-tooltip-row">
              <span className="mc-tooltip-label">Cumulative Probability:</span>
              <span className="mc-tooltip-val">{hoverCdf}%</span>
            </div>
            <div className={`mc-tooltip-badge ${riskInfo.class}`} style={{ marginTop: "4px" }}>
              {riskInfo.text}
            </div>
          </div>
        )}

        {/* Chart SVG */}
        <svg 
          viewBox="0 0 800 220" 
          className="mc-svg"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {/* Defs */}
          <defs>
            <linearGradient id="scurve-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((gridVal) => {
            const y = 200 - (gridVal / 100) * 170;
            return (
              <g key={gridVal}>
                <line x1="50" y1={y} x2="744" y2={y} className="mc-grid-line" />
                <text x="32" y={y + 3} className="mc-axis-text" textAnchor="middle">{gridVal}%</text>
              </g>
            );
          })}

          {/* Histogram columns */}
          {stats.pdf.map((val, idx) => {
            const x = xCoords[idx];
            // Normalize height mapping
            const colProgress = Math.min(1, Math.max(0, (scanProgress - (idx / 14)) * 5));
            const barHeight = (val / 100) * 450 * colProgress;
            const y = 200 - barHeight;
            const isDeadlineDay = idx === 4; // Day 0 is deadline

            return (
              <rect 
                key={idx}
                x={x - 14}
                y={y}
                width="28"
                height={barHeight}
                className="mc-bar"
                style={{ 
                  stroke: isDeadlineDay ? "var(--accent)" : "var(--muted)",
                  fill: isDeadlineDay ? "var(--accent-soft)" : "",
                  strokeWidth: isDeadlineDay ? "2px" : "1px"
                }}
              />
            );
          })}

          {/* S-Curve Path overlay */}
          <path d={scurvePath} className="mc-scurve-line" />

          {/* Timeline Scrubber */}
          {hoveredIndex !== null && (
            <g>
              <line 
                x1={xCoords[hoveredIndex]} 
                y1="30" 
                x2={xCoords[hoveredIndex]} 
                y2="200" 
                className="mc-scrubber-line" 
              />
              <circle 
                cx={xCoords[hoveredIndex]} 
                cy={200 - (stats.cdf[hoveredIndex] / 100) * 170} 
                r={6} 
                className="mc-scrubber-dot" 
              />
            </g>
          )}

          {/* Day markers along the bottom */}
          {relativeDays.map((day, idx) => {
            const x = xCoords[idx];
            const isDeadline = day === "0";
            return (
              <g key={day}>
                <line x1={x} y1="200" x2={x} y2="205" className="mc-grid-line" style={{ strokeWidth: "1.5px" }} />
                <text 
                  x={x} 
                  y="218" 
                  className="mc-axis-text" 
                  textAnchor="middle"
                  style={{ 
                    fontWeight: isDeadline ? 800 : 500,
                    fill: isDeadline ? "var(--accent)" : "var(--muted)"
                  }}
                >
                  {isDeadline ? "Deadline" : day}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend description */}
      <div className="mc-stats-legend">
        <div className="legend-item">
          <span className="legend-color color-bar"></span>
          <span>Outcome Probability Frequency</span>
        </div>
        <div className="legend-item">
          <span className="legend-color color-scurve"></span>
          <span>Cumulative Completion Probability (S-Curve)</span>
        </div>
      </div>
    </div>
  );
}
