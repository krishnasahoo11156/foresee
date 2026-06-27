import { PageHeader } from "@/components/ui/PageHeader";

export default function SettingsPage() {
  return (
    <section className="page">
      <PageHeader eyebrow="Settings" title="Keep the system calm and personal." description="Theme, notification, privacy, and rescue consent settings live here before Firebase persistence is added." />
      <div className="card card-pad stack">
        <label className="label">Theme<select className="select" defaultValue="light"><option value="light">Light</option><option>Dark</option><option>Ocean</option></select></label>
        <label className="label">Quiet hours<input className="input" defaultValue="10:30 PM to 7:30 AM" /></label>
        <label className="label">Autonomous rescue consent<select className="select" defaultValue="preview"><option value="preview">Preview only</option><option>Apply after approval</option></select></label>
        <div className="btn-row"><button className="button button-primary">Save changes</button><button className="button button-secondary">Cancel</button></div>
      </div>
    </section>
  );
}
