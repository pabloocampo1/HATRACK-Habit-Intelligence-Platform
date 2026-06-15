import type { CuentasFilterKey } from "../cuentas.types";
import { surfaceSoft } from "../cuentas-ui";


const OPTIONS: { key: CuentasFilterKey; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "active", label: "Activas" },
  { key: "inactive", label: "Inactivas" },
  { key: "savings", label: "Ahorros" },
];

export default function CuentasFilterBar({
  filter,
  onChange,
}: {
  filter: CuentasFilterKey;
  onChange: (f: CuentasFilterKey) => void;
}) {
  return (
    <section className="space-y-6 md:space-y-8">
     
      <div
        className={`${surfaceSoft} p-2`}
        role="tablist"
        aria-label="Filtrar cuentas"
      >
        <div className="flex flex-wrap gap-2">
          {OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={filter === key}
              onClick={() => onChange(key)}
              className={`min-h-12 flex-1 rounded-xl px-4 text-base font-semibold transition sm:flex-none ${
                filter === key
                  ? "border border-brand-forest bg-brand-forest text-brand-forest-fg shadow-md"
                  : "border border-transparent text-brand-slate hover:bg-surface-card/90 active:bg-surface-card"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
