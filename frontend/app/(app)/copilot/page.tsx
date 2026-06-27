import { Bot, Send, User } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";

export default function CopilotPage() {
  return (
    <section className="page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ flex: "1 1 500px" }}>
          <PageHeader 
            eyebrow="AI Copilot" 
            title="Ask what to do next." 
            description="The copilot will eventually call Gemini with task, calendar, profile, and risk context to formulate optimization plans." 
          />
        </div>
        <div 
          className="sketch-note" 
          style={{ 
            fontSize: "0.85rem", 
            maxWidth: "300px", 
            transform: "rotate(-2deg)",
            marginBottom: "24px"
          }}
        >
          🤖 <strong>Gemini integration:</strong> {"\"Mock mode. AI parses calendar conflicts to suggest morning focus slots.\""}
        </div>
      </div>

      <div className="card card-pad stack" style={{ padding: "32px", gap: "24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          
          {/* User message */}
          <div style={{ display: "flex", gap: "14px", alignItems: "flex-start", alignSelf: "flex-end", maxWidth: "80%" }}>
            <div 
              style={{ 
                background: "var(--accent-soft)", 
                color: "var(--text)", 
                padding: "12px 18px", 
                borderRadius: "14px 14px 2px 14px",
                fontSize: "14px",
                lineHeight: "1.4"
              }}
            >
              <strong>You:</strong> What should I work on first today?
            </div>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--surface-soft)", display: "grid", placeItems: "center", color: "var(--muted-strong)" }}>
              <User size={15} />
            </div>
          </div>

          {/* AI Message */}
          <div style={{ display: "flex", gap: "14px", alignItems: "flex-start", alignSelf: "flex-start", maxWidth: "85%" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, var(--accent), var(--accent-2))", display: "grid", placeItems: "center", color: "white" }}>
              <Bot size={15} />
            </div>
            <div 
              style={{ 
                background: "var(--surface-soft)", 
                color: "var(--text)", 
                padding: "14px 20px", 
                borderRadius: "2px 14px 14px 14px",
                fontSize: "14px",
                lineHeight: "1.5",
                border: "1px solid var(--surface-line)"
              }}
            >
              <span style={{ fontWeight: 650, color: "var(--accent)" }}>ForeSee Assistant:</span>
              <p style={{ margin: "6px 0 0", color: "var(--text)" }}>
                Start with the <strong>launch brief</strong>. It is currently at critical risk, has two open dependencies, and directly benefits from your morning focus window which has just started.
              </p>
            </div>
          </div>
          
        </div>

        <div style={{ borderTop: "1px solid var(--surface-line)", paddingTop: "20px" }}>
          <label className="label" style={{ marginBottom: "12px" }}>
            <span>Message ForeSee Copilot</span>
            <div style={{ position: "relative" }}>
              <textarea 
                className="textarea" 
                placeholder="Ask ForeSee to plan, explain, rescue, or summarize..." 
                style={{ paddingRight: "50px", minHeight: "80px", resize: "none" }}
              />
              <button 
                className="button button-primary" 
                style={{ 
                  position: "absolute", 
                  bottom: "12px", 
                  right: "12px", 
                  width: "36px", 
                  height: "36px", 
                  borderRadius: "8px", 
                  padding: 0,
                  display: "grid",
                  placeItems: "center",
                  minHeight: "auto"
                }}
                aria-label="Send message"
              >
                <Send size={15} />
              </button>
            </div>
          </label>
        </div>
      </div>
    </section>
  );
}
