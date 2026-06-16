export default function CuentasKpiCard({
  label,
  value,
  hint,
  description,
  accent,
  warn,
}: {
  label: string;
  value: string;
  hint: string;
  description?: string;
  accent?: boolean;
  warn?: boolean;
}) {
  return (
    <article
      className={`flex h-full min-h-0 flex-col rounded-xl border border-brand-forest/10 bg-surface-card p-6 shadow-sm transition hover:shadow-md ${
        accent ? "ring-2 ring-brand-forest/15" : ""
      } ${warn ? "border-amber-200/90 bg-amber-50/50 ring-1 ring-amber-200/60" : ""}`}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-brand-forest">
        {label}
      </p>
      <p
        className={`mt-3 break-words text-xl font-bold tabular-nums leading-tight tracking-tight text-brand-slate md:text-2xl ${
          warn ? "text-amber-900" : ""
        }`}
      >
        {value}
      </p>
      <p className="mt-2 text-base leading-snug text-text-secondary">{hint}</p>
      {description ? (
        <p className="mt-4 border-t border-brand-forest/10 pt-4 text-sm leading-relaxed text-text-secondary">
          {description}
        </p>
      ) : null}
    </article>
  );
}
