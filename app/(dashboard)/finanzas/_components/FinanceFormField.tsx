export default function FinanceFormField({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-xs font-semibold text-text-primary">
        {label}
        {required ? <span className="text-red-400"> *</span> : null}
      </span>
      {children}
      {hint ? (
        <span className="block text-[12px] leading-relaxed text-text-muted">{hint}</span>
      ) : null}
    </label>
  );
}
