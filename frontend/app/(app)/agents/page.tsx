import { PageHeader } from "@/components/ui/PageHeader";
import { agents } from "@/lib/data";

export default function AgentsPage() {
  return (
    <section className="page page-wide">
      <PageHeader eyebrow="Agent Graph" title="The system behind the calm." description="A clean registry for the 15-agent architecture, starting with the core agents needed for the frontend demo." />
      <div className="grid grid-3">
        {agents.map(([name, description, status]) => <div className="card card-pad stack" key={name}><div className="metric"><h3>{name}</h3><span className="pill safe">{status}</span></div><p className="muted">{description}</p></div>)}
      </div>
    </section>
  );
}
