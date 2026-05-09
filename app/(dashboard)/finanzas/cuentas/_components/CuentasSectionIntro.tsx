export default function CuentasSectionIntro({
  eyebrow,
  title,
  description,
  className = "",
}: {
  eyebrow: string;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <header
      className={`rounded-2xl border border-brand-forest/10 bg-white p-6 shadow-md md:p-8 ${className}`.trim()}
    >
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-forest">
          {eyebrow}
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-brand-slate md:text-3xl">
          {title}
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-neutral-600">
          {description}
        </p>
      </div>
    </header>
  );
}
