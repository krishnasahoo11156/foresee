import { Send } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";

export default function CopilotPage() {
  return (
    <section className="page">
      <PageHeader eyebrow="AI Copilot" title="Ask what to do next." description="The copilot will eventually call Gemini with task, calendar, profile, and risk context." />
      <div className="card card-pad stack">
        <div className="list-row"><strong>You</strong><span>What should I work on first today?</span></div>
        <div className="list-row"><strong>ForeSee</strong><span>Start with the launch brief. It is critical, has two dependencies, and benefits from your morning focus window.</span></div>
        <label className="label">Message<textarea className="textarea" placeholder="Ask ForeSee to plan, explain, rescue, or summarize..." /></label>
        <button className="button button-primary"><Send size={17} /> Send</button>
      </div>
    </section>
  );
}
