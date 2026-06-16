export default function FinanceModulePlaceholder({
  title,
  description,
  examples,
}: {
  title: string;
  description: string;
  examples?: string;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-text-primary">{title}</h1>
        <p className="mt-1 text-sm text-text-secondary leading-relaxed">{description}</p>
        {examples ? (
          <p className="mt-2 text-sm text-text-muted">{examples}</p>
        ) : null}
      </div>
      <div className="rounded-2xl border border-dashed border-border-default bg-surface-card p-12 text-center text-sm text-text-muted">
        Módulo en construcción.
      </div>
    </div>
  );
}
