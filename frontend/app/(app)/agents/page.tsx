import { PageHeader } from "@/components/ui/PageHeader";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { agents } from "@/lib/data";
import { Bot } from "lucide-react";

export default function AgentsPage() {
  return (
    <section className="page page-wide">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "24px", marginBottom: "32px" }}>
        <div style={{ flex: "1 1 500px" }}>
          <PageHeader 
            eyebrow="Agent Graph" 
            title="The system behind the calm." 
            description="A clean registry for the 15-agent architecture, starting with the core agents needed for the frontend demo." 
          />
        </div>
      </div>

      <div style={{ marginBottom: "32px" }}>
        <ImagePlaceholder label="Orchestration agent sequence flow diagram" height="200px" />
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
                      padding: "2px 8px" 
                    }}
                  >
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
    </section>
  );
}
