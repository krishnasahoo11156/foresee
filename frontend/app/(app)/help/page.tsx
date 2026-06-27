import { PageHeader } from "@/components/ui/PageHeader";

export default function HelpPage() {
  return (
    <section className="page">
      <PageHeader eyebrow="Help" title="How ForeSee thinks." description="A concise product guide for demo viewers, teammates, and future users." />
      <div className="stack">
        {[
          ["What is deadline rescue?", "ForeSee detects rising risk, simulates outcomes, and recommends a recovery plan before the deadline is missed."],
          ["What gets integrated next?", "Firebase Auth, Firestore, Google Calendar, Gemini, Pub/Sub, Cloud Run, and notification channels."],
          ["Can the UI work without backend data?", "Yes. Every page is mock-data driven now so interactions and layout can be reviewed before integration."]
        ].map(([q, a]) => <div className="card card-pad" key={q}><h3>{q}</h3><p className="muted">{a}</p></div>)}
      </div>
    </section>
  );
}
