import { PageHeader } from "@/components/ui/PageHeader";
import { agents } from "@/lib/data";
import { Bot, Cpu } from "lucide-react";

export default function AgentsPage() {
  return (
    <section className="page page-wide">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ flex: "1 1 500px" }}>
          <PageHeader 
            eyebrow="Agent Graph" 
            title="The system behind the calm." 
            description="A clean registry for the 15-agent architecture, starting with the core agents needed for the frontend demo." 
          />
        </div>
        <div 
          className="sketch-note" 
          style={{ 
            fontSize: "0.85rem", 
            maxWidth: "340px", 
            transform: "rotate(-1deg)",
            marginBottom: "24px"
          }}
        >
          🤖 <strong>Duality Design:</strong> {"\"Agents run asynchronously to monitor due dates, focus capacities, and rescue plans.\""}
        </div>
      </div>

      <div className="grid grid-3" style={{ gap: "20px" }}>
        {agents.map(([name, description, status]) => {
          const isActive = status === "Active";
          const isReady = status === "Ready";
          const statusClass = isActive ? "safe" : isReady ? "monitor" : "default";
          return (
            <div 
              className="card card-pad stack" 
              key={name}
              style={{ 
                padding: "24px", 
                display: "flex", 
                flexDirection: "column", 
                justifyContent: "space-between",
                minHeight: "180px"
              }}
            >
              <div>
                <div className="metric" style={{ marginBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ color: "var(--accent)", display: "flex" }}>
                      <Bot size={18} />
                    </div>
                    <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700 }}>{name}</h3>
                  </div>
                  <span 
                    className={`pill ${statusClass}`} 
                    style={{ 
                      fontSize: "9px", 
                      padding: "2px 8px",
                      position: "relative" 
                    }}
                  >
                    {isActive && (
                      <span 
                        style={{ 
                          display: "inline-block", 
                          width: "6px", 
                          height: "6px", 
                          background: "var(--success)", 
                          borderRadius: "50%", 
                          marginRight: "4px",
                          animation: "pulse 2s infinite" 
                        }} 
                      />
                    )}
                    {status}
                  </span>
                </div>
                <p className="muted" style={{ margin: 0, fontSize: "12.5px", lineHeight: "1.4" }}>
                  {description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* CSS Pulse Keyframe Animation Inject */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }
      `}</style>
    </section>
  );
}
