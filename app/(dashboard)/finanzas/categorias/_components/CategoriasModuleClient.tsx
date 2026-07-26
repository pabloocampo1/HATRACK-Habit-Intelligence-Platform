"use client";

import {
  createCategoryAction,
  deleteCategoryAction,
} from "@/app/actions/finance/financeActions";
import FinanceFormField from "../../_components/FinanceFormField";
import FinanceModal, { financeInputClass } from "../../_components/FinanceModal";
import { FinanceCategory } from "@/lib/types";
import { Plus, Tags } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

const KIND_LABELS: Record<FinanceCategory["kind"], string> = {
  income: "Solo ingresos",
  expense: "Solo gastos",
  both: "Ingresos y gastos",
};

type Props = {
  userId: string;
  categories: FinanceCategory[];
};

export default function CategoriasModuleClient({ userId, categories }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    color: "#10b981",
    kind: "both" as FinanceCategory["kind"],
  });

  const handleCreate = () => {
    setError(null);
    startTransition(async () => {
      try {
        await createCategoryAction(userId, form);
        setForm({ name: "", description: "", color: "#10b981", kind: "both" });
        setModalOpen(false);
        router.refresh();
      } catch (actionError) {
        setError(
          actionError instanceof Error ? actionError.message : "No se pudo crear la categoría.",
        );
      }
    });
  };

  const handleDelete = (categoryId: number) => {
    startTransition(async () => {
      await deleteCategoryAction(userId, categoryId);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-border-subtle bg-surface-card p-5">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Categorías</h1>
          <p className="mt-1 max-w-xl text-sm text-text-secondary">
            Etiquetas para clasificar cada movimiento: comida, transporte, salario, etc.
            Así sabrás en qué se va tu dinero.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black"
        >
          <Plus className="size-4" />
          Nueva categoría
        </button>
      </div>

      <div className="rounded-2xl border border-border-subtle bg-surface-card p-5">
        <h2 className="text-base font-semibold text-text-primary">
          Tus categorías ({categories.length})
        </h2>
        <div className="mt-4 space-y-2">
          {categories.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border-default p-8 text-center">
              <Tags className="mx-auto size-8 text-text-muted" />
              <p className="mt-2 text-sm text-text-muted">
                Aún no tienes categorías. Crea la primera con el botón de arriba.
              </p>
            </div>
          ) : null}
          {categories.map((category) => (
            <div
              key={category.id_category}
              className="flex items-center justify-between rounded-xl border border-border-default bg-surface-muted p-3"
            >
              <div className="flex items-center gap-3">
                <span
                  className="inline-block h-4 w-4 rounded-full ring-2 ring-white/10"
                  style={{ backgroundColor: category.color || "#10b981" }}
                />
                <div>
                  <p className="text-sm font-semibold text-text-primary">{category.name}</p>
                  <p className="text-xs text-text-muted">
                    {KIND_LABELS[category.kind]}
                    {category.description ? ` · ${category.description}` : ""}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(category.id_category)}
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
          title="Nueva categoría"
          subtitle="Define cómo quieres agrupar tus ingresos o gastos."
          onClose={() => setModalOpen(false)}
        >
          <div className="space-y-4">
            <FinanceFormField
              label="Nombre"
              required
              hint='Ej: "Mercado", "Transporte", "Salario", "Entretenimiento".'
            >
              <input
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Nombre de la categoría"
                className={financeInputClass}
              />
            </FinanceFormField>
            <FinanceFormField
              label="Descripción (opcional)"
              hint="Una frase corta para recordar cuándo usar esta categoría."
            >
              <input
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, description: event.target.value }))
                }
                placeholder="Ej: Compras del supermercado semanal"
                className={financeInputClass}
              />
            </FinanceFormField>
            <FinanceFormField
              label="Color"
              hint="Solo visual: te ayuda a identificar la categoría en listas y reportes."
            >
              <input
                type="color"
                value={form.color}
                onChange={(event) => setForm((prev) => ({ ...prev, color: event.target.value }))}
                className="h-10 w-full cursor-pointer rounded-xl border border-border-default bg-surface-muted"
              />
            </FinanceFormField>
            <FinanceFormField
              label="Tipo de movimiento"
              hint="Indica si esta categoría aplica a ingresos, gastos o ambos."
            >
              <select
                value={form.kind}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    kind: event.target.value as FinanceCategory["kind"],
                  }))
                }
                className={financeInputClass}
              >
                <option value="both">Ingresos y gastos</option>
                <option value="income">Solo ingresos</option>
                <option value="expense">Solo gastos</option>
              </select>
            </FinanceFormField>
            {error ? <p className="text-sm text-red-400">{error}</p> : null}
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
                disabled={isPending || !form.name.trim()}
                className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
              >
                {isPending ? "Guardando…" : "Crear categoría"}
              </button>
            </div>
          </div>
        </FinanceModal>
      ) : null}
    </div>
  );
}
