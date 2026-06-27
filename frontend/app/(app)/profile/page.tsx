import { PageHeader } from "@/components/ui/PageHeader";

export default function ProfilePage() {
  return (
    <section className="page">
      <PageHeader eyebrow="Profile" title="Krish's productivity fingerprint." description="The profile summarizes focus windows, reliability, preferred nudges, and learned planning bias." />
      <div className="grid grid-2">
        <div className="card card-pad stack"><h2>Work pattern</h2><p className="muted">Peak focus: 9 AM to 11 AM</p><p className="muted">Estimated daily capacity: 5.5 hours</p><p className="muted">Planning bias: underestimates writing work by 18%</p></div>
        <div className="card card-pad stack"><h2>Preferences</h2><p className="muted">Nudge style: direct but calm</p><p className="muted">Rescue mode: approval required</p><p className="muted">Default task split: 45 to 70 minute blocks</p></div>
      </div>
    </section>
  );
}
