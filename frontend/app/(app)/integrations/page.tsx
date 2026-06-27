import { PageHeader } from "@/components/ui/PageHeader";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { integrations } from "@/lib/data";
import { Puzzle } from "lucide-react";

export default function IntegrationsPage() {
  return (
    <section className="page page-wide">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "24px", marginBottom: "32px" }}>
        <div style={{ flex: "1 1 500px" }}>
          <PageHeader 
            eyebrow="Integrations" 
            title="Google Cloud wiring map." 
            description="These cards represent the services to connect after the frontend is approved and working." 
          />
        </div>
      </div>

      <div style={{ marginBottom: "32px" }}>
        <ImagePlaceholder label="GCP and Firebase infrastructure sync flow diagram" height="200px" />
      </div>

      <div className="grid grid-3" style={{ gap: "20px" }}>
        {integrations.map(([name, detail, status]) => {
          const isPlanned = status === "Planned";
          const isLater = status === "Later";
          const tone = isPlanned ? "monitor" : isLater ? "default" : "safe";
          
          return (
            <div 
              className="card card-pad metric" 
              key={name}
              style={{ 
                padding: "24px",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "16px",
                height: "100%"
              }}
            >
              <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                <div 
                  style={{ 
                    width: "40px", 
                    height: "40px", 
                    borderRadius: "8px", 
                    background: "var(--surface-soft)", 
                    display: "grid", 
                    placeItems: "center", 
                    color: "var(--accent)",
                    flexShrink: 0
                  }}
                >
                  <Puzzle size={18} />
                </div>
                <div>
                  <h3 style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: 700 }}>{name}</h3>
                  <p className="muted" style={{ margin: 0, fontSize: "12.5px", lineHeight: "1.4" }}>
                    {detail}
                  </p>
                </div>
              </div>
              
              <span 
                className={`pill ${tone}`}
                style={{ 
                  fontSize: "9px", 
                  padding: "2px 8px",
                  fontWeight: 700,
                  flexShrink: 0 
                }}
              >
                {status}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
