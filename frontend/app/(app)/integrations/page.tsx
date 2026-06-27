import { PageHeader } from "@/components/ui/PageHeader";
import { integrations } from "@/lib/data";

export default function IntegrationsPage() {
  return (
    <section className="page">
      <PageHeader eyebrow="Integrations" title="Google Cloud wiring map." description="These cards represent the services to connect after the frontend is approved and working." />
      <div className="grid grid-2">{integrations.map(([name, detail, status]) => <div className="card card-pad metric" key={name}><div><h3>{name}</h3><p className="muted">{detail}</p></div><span className="pill monitor">{status}</span></div>)}</div>
    </section>
  );
}
