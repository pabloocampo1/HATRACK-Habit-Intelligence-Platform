"use client";

import {
  createBudgetAction,
  deleteBudgetAction,
} from "@/app/actions/finance/financeActions";
import FinanceFormField from "../../_components/FinanceFormField";
import FinanceModal, { financeInputClass } from "../../_components/FinanceModal";
import { Budget, FinanceCategory } from "@/lib/types";
import { Gauge, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

type Props = {
  userId: string;
  budgets: Budget[];
  categories: FinanceCategory[];
};

export default function PresupuestosModuleClient({ userId, budgets, categories }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    category_id: categories[0]?.id_category ? String(categories[0].id_category) : "",
    month_value: "",
    limit_amount: "",
  });

  const categoriesById = useMemo(
    () => new Map(categories.map((category) => [Number(category.id_category), category])),
    [categories],
  );

  const handleCreate = () => {
    const [year, month] = form.month_value.split("-");
    startTransition(async () => {
      await createBudgetAction(userId, {
        category_id: Number(form.category_id),
        month_date: `${year}-${month}-01`,
        limit_amount: Number(form.limit_amount),
      });
      setForm((prev) => ({ ...prev, limit_amount: "" }));
      setModalOpen(false);
      router.refresh();
    });
  };

  const handleDelete = (budgetId: number) => {
    startTransition(async () => {
      await deleteBudgetAction(userId, budgetId);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-border-subtle bg-surface-card p-5">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Presupuestos</h1>
          <p className="mt-1 max-w-xl text-sm text-text-secondary">
            Pon un tope de gasto por categoría y mes. Ej: máximo $500.000 en
            restaurantes este mes.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          disabled={categories.length === 0}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black disabled:opacity-50"
        >
          <Plus className="size-4" />
          Nuevo presupuesto
        </button>
      </div>

      {categories.length === 0 ? (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Primero crea categorías en el módulo de Categorías para poder definir presupuestos.
        </p>
      ) : null}

      <div className="rounded-2xl border border-border-subtle bg-surface-card p-5">
        <h2 className="text-base font-semibold text-text-primary">Presupuestos activos</h2>
        <div className="mt-3 space-y-2">
          {budgets.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border-default p-8 text-center">
              <Gauge className="mx-auto size-8 text-text-muted" />
              <p className="mt-2 text-sm text-text-muted">
                Sin presupuestos configurados. Define tu primer límite mensual.
              </p>
            </div>
          ) : null}
          {budgets.map((budget) => (
            <div
              key={budget.id_budget}
              className="flex items-center justify-between rounded-xl border border-border-default bg-surface-muted p-3"
            >
              <div>
                <p className="text-sm font-semibold text-text-primary">
                  {categoriesById.get(Number(budget.category_id))?.name || "Categoría"}
                </p>
                <p className="text-xs text-text-muted">
                  Mes {budget.month_date.slice(0, 7)} · límite $
                  {Number(budget.limit_amount).toLocaleString("es-CO")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(budget.id_budget)}
                className="rounded-lg border border-red-500/40 px-2 py-1 text-xs text-red-300"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      </div>

      {modalOpen ? (
        <FinanceModal
          title="Nuevo presupuesto"
          subtitle="Establece cuánto puedes gastar como máximo en una categoría durante un mes."
          onClose={() => setModalOpen(false)}
        >
          <div className="space-y-4">
            <FinanceFormField
              label="Categoría"
              required
              hint="En qué tipo de gasto quieres poner límite."
            >
              <select
                value={form.category_id}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, category_id: event.target.value }))
                }
                className={financeInputClass}
              >
                {categories.map((category) => (
                  <option key={category.id_category} value={category.id_category}>
                    {category.name}
                  </option>
                ))}
              </select>
            </FinanceFormField>
            <FinanceFormField
              label="Mes"
              required
              hint="El mes al que aplica este límite de gasto."
            >
              <input
                type="month"
                value={form.month_value}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, month_value: event.target.value }))
                }
                className={financeInputClass}
              />
            </FinanceFormField>
            <FinanceFormField
              label="Límite máximo"
              required
              hint="Cantidad máxima que puedes gastar en esa categoría ese mes."
            >
              <input
                type="number"
                value={form.limit_amount}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, limit_amount: event.target.value }))
                }
                placeholder="Ej: 500000"
                className={financeInputClass}
              />
            </FinanceFormField>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-xl border border-border-default px-4 py-2 text-sm text-text-secondary"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={
                  isPending ||
                  !form.month_value ||
                  Number(form.limit_amount) <= 0 ||
                  !form.category_id
                }
                className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
              >
                {isPending ? "Guardando…" : "Crear presupuesto"}
              </button>
            </div>
          </div>
        </FinanceModal>
      ) : null}
    </div>
  );
}
