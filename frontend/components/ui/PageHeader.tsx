export function PageHeader({
  eyebrow,
  title,
  description,
  action
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-header">
      <div>
        {eyebrow ? <p className="eyebrow"><span className="sketch-highlight">{eyebrow}</span></p> : null}
        <h1>{title}</h1>
        {description ? <p className="lead">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
