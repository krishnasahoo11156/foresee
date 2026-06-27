import { PageHeader } from "@/components/ui/PageHeader";
import { HelpCircle } from "lucide-react";

export default function HelpPage() {
  return (
    <section className="page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ flex: "1 1 500px" }}>
          <PageHeader 
            eyebrow="Help" 
            title="How ForeSee thinks." 
            description="A concise FAQ and architectural reference guide for demo viewers, teammates, and stakeholders." 
          />
        </div>
        <div 
          className="sketch-note" 
          style={{ 
            fontSize: "0.85rem", 
            maxWidth: "340px", 
            transform: "rotate(1deg)",
            marginBottom: "24px"
          }}
        >
          💡 <strong>FAQ Guide:</strong> {"\"Check out the details below to see how we maintain data resilience.\""}
        </div>
      </div>

      <div className="stack" style={{ gap: "16px" }}>
        {[
          [
            "What is deadline rescue?", 
            "ForeSee continuously tracks focus windows, task completion velocity, and dependency trees. If a deadline starts to slip, the simulation engine calculates optimal alternatives (such as dropping optional tasks or moving focus blocks) and compiles them into a single-action 'Rescue Plan' for your approval."
          ],
          [
            "What backend integrations are planned next?", 
            "We plan to introduce Firebase Authentication (Google OAuth), Firestore (live task/event database), Google Calendar API (to read focus slots and publish task events), and Gemini APIs (to extract tasks and dependencies from conversational chat commands)."
          ],
          [
            "Can the UI work entirely with mock data?", 
            "Yes, this client demo runs entirely on structured local state. This allows reviewers to navigate pages, test responsive designs on small devices, and switch themes instantly without needing live backend instances."
          ]
        ].map(([q, a]) => (
          <div 
            className="card card-pad" 
            key={q}
            style={{ 
              padding: "24px 28px",
              display: "flex",
              flexDirection: "column",
              gap: "10px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--accent)" }}>
              <HelpCircle size={16} />
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "var(--text)" }}>{q}</h3>
            </div>
            <p className="muted" style={{ margin: 0, fontSize: "13.5px", lineHeight: "1.5", color: "var(--muted-strong)", paddingLeft: "26px" }}>
              {a}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
