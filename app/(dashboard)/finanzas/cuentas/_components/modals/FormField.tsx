export default function FormField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="block text-xs font-semibold uppercase tracking-wider text-brand-forest">
        {label}
      </span>
      {children}
      {hint ? (
        <span className="block text-sm leading-relaxed text-neutral-600">
          {hint}
        </span>
      ) : null}
    </label>
  );
}
