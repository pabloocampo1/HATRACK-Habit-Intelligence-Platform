import { formatMoney } from "../utils/formatMoney";
import { surfaceSoft } from "../../cuentas/cuentas-ui";
import TransaccionesSectionIntro from "./TransaccionesSectionIntro";

function KpiCard({
  label,
  value,
  hint,
  variant,
}: {
  label: string;
  value: string;
  hint: string;
  variant: "income" | "expense" | "net" | "count";
}) {
  const bar =
    variant === "income"
      ? "from-emerald-500/80 to-emerald-600/40"
      : variant === "expense"
        ? "from-rose-500/80 to-rose-600/40"
        : variant === "net"
          ? "from-brand-forest to-brand-forest/50"
          : "from-neutral-400 to-neutral-500/50";

  return (
    <article className="relative overflow-hidden rounded-xl border border-brand-forest/10 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div
        className={`pointer-events-none absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${bar}`}
        aria-hidden
      />
      <p className="text-xs font-semibold uppercase tracking-wider text-brand-forest">
        {label}
      </p>
      <p className="mt-3 text-xl font-bold tabular-nums tracking-tight text-brand-slate md:text-2xl">
        {value}
      </p>
      <p className="mt-2 text-sm text-neutral-600">{hint}</p>
    </article>
  );
}

export default function TransaccionesKpiSection({
  incomeCop,
  expenseCop,
  netCop,
  count,
}: {
  incomeCop: number;
  expenseCop: number;
  netCop: number;
  count: number;
}) {
  return (
    <section className="space-y-6 md:space-y-8">
      <TransaccionesSectionIntro
        eyebrow="Resumen del filtro"
        title="Cómo va tu flujo de caja"
        description="Los importes en COP suman solo movimientos en pesos del conjunto filtrado. USD no se mezcla en el neto para evitar confusiones hasta que conectes tipo de cambio."
      />
      <div className={`${surfaceSoft} p-5 md:p-6 lg:p-8`}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4">
          <KpiCard
            variant="income"
            label="Ingresos (COP)"
            value={formatMoney(incomeCop, "COP")}
            hint="Suma de movimientos tipo ingreso en pesos."
          />
          <KpiCard
            variant="expense"
            label="Gastos (COP)"
            value={formatMoney(expenseCop, "COP")}
            hint="Gastos y salidas por transferencia en COP."
          />
          <KpiCard
            variant="net"
            label="Neto (COP)"
            value={formatMoney(netCop, "COP")}
            hint="Ingresos + gastos/transferencias en la vista."
          />
          <KpiCard
            variant="count"
            label="Movimientos"
            value={String(count)}
            hint="Filas listadas con los filtros actuales."
          />
        </div>
      </div>
    </section>
  );
}
