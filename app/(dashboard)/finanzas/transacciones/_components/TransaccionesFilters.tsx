import { Search } from "lucide-react";
import type { CategoryRow, PeriodFilter, TransactionType } from "../transacciones.types";
import { inputSurface, surfaceSoft } from "../../cuentas/cuentas-ui";
import TransaccionesSectionIntro from "./TransaccionesSectionIntro";

const PERIODS: { key: PeriodFilter; label: string }[] = [
  { key: "month", label: "Mes actual" },
  { key: "7d", label: "Últimos 7 días" },
  { key: "all", label: "Todo" },
];

const TYPES: { key: TransactionType | "all"; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "INCOME", label: "Ingresos" },
  { key: "EXPENSE", label: "Gastos" },
  { key: "TRANSFER", label: "Transferencias" },
];

export default function TransaccionesFilters({
  period,
  onPeriod,
  typeFilter,
  onType,
  categoryId,
  onCategory,
  search,
  onSearch,
  categories,
}: {
  period: PeriodFilter;
  onPeriod: (p: PeriodFilter) => void;
  typeFilter: TransactionType | "all";
  onType: (t: TransactionType | "all") => void;
  categoryId: string | "all";
  onCategory: (id: string | "all") => void;
  search: string;
  onSearch: (s: string) => void;
  categories: CategoryRow[];
}) {
  return (
    <section className="space-y-6 md:space-y-8">
      <TransaccionesSectionIntro
        eyebrow="Explorar"
        title="Filtra y encuentra cualquier movimiento"
        description="Período, tipo, categoría y búsqueda por texto actúan en conjunto. Ideal para revisar el mes, auditar una categoría o localizar un comercio."
      />

      <div className={`${surfaceSoft} space-y-6 p-5 md:p-6`}>
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-brand-forest">
            Período
          </p>
          <div className="flex flex-wrap gap-2">
            {PERIODS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => onPeriod(key)}
                className={`min-h-11 rounded-xl px-4 text-sm font-semibold transition ${
                  period === key
                    ? "border border-brand-forest bg-brand-forest text-white shadow-md"
                    : "border border-transparent text-brand-slate hover:bg-white/90"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-brand-forest">
            Tipo
          </p>
          <div className="flex flex-wrap gap-2">
            {TYPES.map(({ key, label }) => (
              <button
                key={String(key)}
                type="button"
                onClick={() => onType(key)}
                className={`min-h-11 rounded-xl px-4 text-sm font-semibold transition ${
                  typeFilter === key
                    ? "border border-brand-forest bg-brand-forest text-white shadow-md"
                    : "border border-transparent text-brand-slate hover:bg-white/90"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-forest">
              Categoría
            </span>
            <select
              value={categoryId}
              onChange={(e) =>
                onCategory(
                  e.target.value === "all" ? "all" : e.target.value,
                )
              }
              className={inputSurface}
            >
              <option value="all">Todas las categorías</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <div className="space-y-2">
            <span className="block text-xs font-semibold uppercase tracking-wider text-brand-forest">
              Buscar
            </span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-neutral-400" />
              <input
                value={search}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="Descripción, cuenta, categoría…"
                className={`${inputSurface} pl-12`}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
