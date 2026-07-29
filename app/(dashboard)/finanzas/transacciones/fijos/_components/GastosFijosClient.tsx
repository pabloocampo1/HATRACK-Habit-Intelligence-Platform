"use client";

import {
  createQuickExpenseTemplateAction,
  deleteQuickExpenseTemplateAction,
  registerQuickExpenseAction,
  updateQuickExpenseTemplateAction,
} from "@/app/actions/finance/financeActions";
import FinanceFormField from "../../../_components/FinanceFormField";
import FinanceConfirmModal from "../../../_components/FinanceConfirmModal";
import FinanceModal, { financeInputClass } from "../../../_components/FinanceModal";
import { Account, FinanceCategory, QuickExpenseTemplate, QuickExpenseType } from "@/lib/types";
import {
  ArrowLeft,
  ArrowDownLeft,
  ArrowUpRight,
  Pencil,
  Plus,
  Trash2,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  QUICK_EXPENSE_ICON_OPTIONS,
  QuickExpenseIcon,
} from "../utils/quickExpenseIcons";

type FormState = {
  label: string;
  icon: string;
  default_amount: string;
  account_id: string;
  category_id: string;
  type: QuickExpenseType;
};

const emptyForm = (accounts: Account[]): FormState => ({
  label: "",
  icon: "wallet",
  default_amount: "",
  account_id: accounts[0]?.account_id ?? "",
  category_id: "",
  type: "expense",
});

function todayBogota() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function isoFromBogotaDate(date: string) {
  return new Date(`${date}T12:00:00-05:00`).toISOString();
}

function formatAmount(value: number, currency: string) {
  return new Intl.NumberFormat(currency === "COP" ? "es-CO" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "COP" ? 0 : 2,
  }).format(value);
}

export default function GastosFijosClient({
  userId,
  accounts,
  categories,
  templates: initialTemplates,
}: {
  userId: string;
  accounts: Account[];
  categories: FinanceCategory[];
  templates: QuickExpenseTemplate[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [templates, setTemplates] = useState(initialTemplates);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(() => emptyForm(accounts));

  const [registerTarget, setRegisterTarget] = useState<QuickExpenseTemplate | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<QuickExpenseTemplate | null>(null);
  const [registerAmount, setRegisterAmount] = useState("");
  const [registerDate, setRegisterDate] = useState(todayBogota);

  const accountMap = useMemo(
    () => new Map(accounts.map((account) => [String(account.account_id), account])),
    [accounts],
  );

  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [String(category.id_category), category])),
    [categories],
  );

  const sortedTemplates = useMemo(
    () =>
      [...templates].sort((a, b) => {
        if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
        return b.usage_count - a.usage_count;
      }),
    [templates],
  );

  const filteredCategories = useMemo(
    () =>
      categories.filter(
        (category) => category.kind === "both" || category.kind === form.type,
      ),
    [categories, form.type],
  );

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3500);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm(accounts));
    setError(null);
    setFormOpen(true);
  };

  const openEdit = (template: QuickExpenseTemplate) => {
    setEditingId(template.id);
    setForm({
      label: template.label,
      icon: template.icon,
      default_amount: String(template.default_amount),
      account_id: template.account_id,
      category_id: template.category_id ? String(template.category_id) : "",
      type: template.type,
    });
    setError(null);
    setFormOpen(true);
  };

  const openRegister = (template: QuickExpenseTemplate) => {
    setRegisterTarget(template);
    setRegisterAmount(String(template.default_amount));
    setRegisterDate(todayBogota());
    setError(null);
  };

  const handleSaveTemplate = () => {
    const amount = Number(form.default_amount.replace(/[^\d.]/g, ""));
    if (!form.label.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }
    if (!form.account_id) {
      setError("Selecciona una cuenta.");
      return;
    }
    if (!amount || amount <= 0) {
      setError("El monto debe ser mayor a cero.");
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        const payload = {
          label: form.label.trim(),
          icon: form.icon,
          default_amount: amount,
          account_id: form.account_id,
          category_id: form.category_id ? Number(form.category_id) : null,
          type: form.type,
        };

        if (editingId) {
          const updated = await updateQuickExpenseTemplateAction(userId, editingId, payload);
          setTemplates((prev) => prev.map((item) => (item.id === editingId ? updated : item)));
          showToast("Gasto fijo actualizado.");
        } else {
          const created = await createQuickExpenseTemplateAction(userId, payload);
          setTemplates((prev) => [...prev, created]);
          showToast("Gasto fijo creado.");
        }

        setFormOpen(false);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo guardar.");
      }
    });
  };

  const handleDelete = (template: QuickExpenseTemplate) => {
    setError(null);
    setDeleteTarget(template);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteQuickExpenseTemplateAction(userId, deleteTarget.id);
        setTemplates((prev) => prev.filter((item) => item.id !== deleteTarget.id));
        setDeleteTarget(null);
        showToast("Gasto fijo eliminado.");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo eliminar.");
      }
    });
  };

  const handleRegister = () => {
    if (!registerTarget) return;
    const amount = Number(registerAmount.replace(/[^\d.]/g, ""));
    if (!amount || amount <= 0) {
      setError("El monto debe ser mayor a cero.");
      return;
    }
    if (!registerDate || Number.isNaN(new Date(`${registerDate}T00:00:00`).getTime())) {
      setError("Selecciona una fecha válida para el gasto.");
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        await registerQuickExpenseAction(
          userId,
          registerTarget.id,
          amount,
          isoFromBogotaDate(registerDate),
        );
        setTemplates((prev) =>
          prev.map((item) =>
            item.id === registerTarget.id
              ? {
                  ...item,
                  usage_count: item.usage_count + 1,
                  last_used_at: new Date().toISOString(),
                }
              : item,
          ),
        );
        setRegisterTarget(null);
        showToast(`${registerTarget.label} registrado.`);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo registrar.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Link
            href="/finanzas/transacciones"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted transition hover:text-emerald-400"
          >
            <ArrowLeft className="size-3.5" />
            Volver a transacciones
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-text-primary">Gastos fijos</h1>
            <p className="mt-1 max-w-xl text-sm text-text-secondary">
              Guarda tus gastos recurrentes (arriendo, internet, transporte, gym) y regístralos
              en un toque cuando los pagues. Ajusta el monto si hace falta y listo.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={openCreate}
          disabled={accounts.length === 0 || pending}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black disabled:opacity-50"
        >
          <Plus className="size-4" />
          Nuevo gasto fijo
        </button>
      </div>

      {accounts.length === 0 ? (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Primero crea al menos una cuenta en el módulo de Cuentas.
        </p>
      ) : null}

      {error && !formOpen && !registerTarget ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      {sortedTemplates.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border-subtle bg-surface-card px-6 py-12 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
            <Zap className="size-6" />
          </div>
          <p className="mt-4 text-sm font-medium text-text-primary">Aún no tienes gastos fijos</p>
          <p className="mt-1 text-sm text-text-secondary">
            Crea plantillas para arriendo, internet, transporte u otros pagos que se repiten.
          </p>
          {accounts.length > 0 ? (
            <button
              type="button"
              onClick={openCreate}
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200"
            >
              <Plus className="size-4" />
              Crear el primero
            </button>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedTemplates.map((template) => {
            const account = accountMap.get(String(template.account_id));
            const category = template.category_id
              ? categoryMap.get(String(template.category_id))
              : null;
            const isExpense = template.type === "expense";

            return (
              <div
                key={template.id}
                className="group relative rounded-2xl border border-border-subtle bg-surface-card p-4 transition hover:border-emerald-500/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => openRegister(template)}
                    disabled={pending}
                    className="flex min-w-0 flex-1 items-start gap-3 text-left disabled:opacity-60"
                  >
                    <div
                      className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
                        isExpense ? "bg-rose-500/15 text-rose-300" : "bg-emerald-500/15 text-emerald-300"
                      }`}
                    >
                      <QuickExpenseIcon icon={template.icon} className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-text-primary">{template.label}</p>
                      <p
                        className={`mt-0.5 text-lg font-semibold ${
                          isExpense ? "text-rose-300" : "text-emerald-300"
                        }`}
                      >
                        {formatAmount(Number(template.default_amount), template.currency)}
                      </p>
                      <p className="mt-1 truncate text-xs text-text-muted">
                        {account?.account_name ?? "Cuenta"}
                        {category ? ` · ${category.name}` : ""}
                      </p>
                      {template.usage_count > 0 ? (
                        <p className="mt-1 text-[11px] text-text-muted">
                          Usado {template.usage_count} {template.usage_count === 1 ? "vez" : "veces"}
                        </p>
                      ) : null}
                    </div>
                  </button>

                  <div className="flex shrink-0 gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => openEdit(template)}
                      disabled={pending}
                      className="flex size-8 items-center justify-center rounded-lg border border-border-default text-text-secondary transition hover:bg-surface-muted"
                      aria-label="Editar"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(template)}
                      disabled={pending}
                      className="flex size-8 items-center justify-center rounded-lg border border-border-default text-text-secondary transition hover:border-red-500/40 hover:text-red-300"
                      aria-label="Eliminar"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openRegister(template)}
                  disabled={pending}
                  className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition disabled:opacity-50 ${
                    isExpense
                      ? "bg-rose-500/10 text-rose-200 hover:bg-rose-500/20"
                      : "bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20"
                  }`}
                >
                  {isExpense ? (
                    <ArrowUpRight className="size-3.5" />
                  ) : (
                    <ArrowDownLeft className="size-3.5" />
                  )}
                  Registrar ahora
                </button>
              </div>
            );
          })}
        </div>
      )}

      {formOpen ? (
        <FinanceModal
          title={editingId ? "Editar gasto fijo" : "Nuevo gasto fijo"}
          subtitle="Define un gasto fijo recurrente: nombre, monto, cuenta y categoría."
          onClose={() => setFormOpen(false)}
        >
          <div className="space-y-4">
            {error ? (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {error}
              </p>
            ) : null}

            <FinanceFormField label="Nombre" required>
              <input
                className={financeInputClass}
                value={form.label}
                onChange={(event) => setForm((prev) => ({ ...prev, label: event.target.value }))}
                placeholder="Ej. Café, Uber, Mercado"
              />
            </FinanceFormField>

            <FinanceFormField label="Tipo" required>
              <select
                className={financeInputClass}
                value={form.type}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    type: event.target.value as QuickExpenseType,
                    category_id: "",
                  }))
                }
              >
                <option value="expense">Gasto</option>
                <option value="income">Ingreso</option>
              </select>
            </FinanceFormField>

            <FinanceFormField label="Monto predeterminado" required>
              <input
                className={financeInputClass}
                inputMode="decimal"
                value={form.default_amount}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, default_amount: event.target.value }))
                }
                placeholder="15000"
              />
            </FinanceFormField>

            <FinanceFormField label="Cuenta" required>
              <select
                className={financeInputClass}
                value={form.account_id}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, account_id: event.target.value }))
                }
              >
                {accounts.map((account) => (
                  <option key={account.account_id} value={account.account_id}>
                    {account.account_name}
                  </option>
                ))}
              </select>
            </FinanceFormField>

            <FinanceFormField label="Categoría">
              <select
                className={financeInputClass}
                value={form.category_id}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, category_id: event.target.value }))
                }
              >
                <option value="">Sin categoría</option>
                {filteredCategories.map((category) => (
                  <option key={category.id_category} value={category.id_category}>
                    {category.name}
                  </option>
                ))}
              </select>
            </FinanceFormField>

            <FinanceFormField label="Icono">
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                {QUICK_EXPENSE_ICON_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, icon: option.id }))}
                    className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2 text-[10px] transition ${
                      form.icon === option.id
                        ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-200"
                        : "border-border-default text-text-muted hover:bg-surface-muted"
                    }`}
                    title={option.label}
                  >
                    <QuickExpenseIcon icon={option.id} className="size-4" />
                    <span className="truncate">{option.label}</span>
                  </button>
                ))}
              </div>
            </FinanceFormField>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="flex-1 rounded-xl border border-border-default px-4 py-2.5 text-sm font-semibold text-text-secondary"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveTemplate}
                disabled={pending}
                className="flex-1 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black disabled:opacity-50"
              >
                {pending ? "Guardando..." : editingId ? "Guardar cambios" : "Crear"}
              </button>
            </div>
          </div>
        </FinanceModal>
      ) : null}

      {registerTarget ? (
        <FinanceModal
          title={`Registrar: ${registerTarget.label}`}
          subtitle="Confirma el monto y la fecha antes de crear la transacción."
          onClose={() => setRegisterTarget(null)}
        >
          <div className="space-y-4">
            {error ? (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {error}
              </p>
            ) : null}

            <div className="rounded-xl border border-border-subtle bg-surface-muted px-4 py-3">
              <p className="text-xs text-text-muted">Cuenta</p>
              <p className="mt-0.5 text-sm font-medium text-text-primary">
                {accountMap.get(String(registerTarget.account_id))?.account_name ?? "—"}
              </p>
            </div>

            <FinanceFormField label="Monto" required>
              <input
                className={financeInputClass}
                inputMode="decimal"
                autoFocus
                value={registerAmount}
                onChange={(event) => setRegisterAmount(event.target.value)}
              />
            </FinanceFormField>

            <FinanceFormField label="Fecha del gasto" required>
              <input
                type="date"
                className={`${financeInputClass} [color-scheme:dark]`}
                value={registerDate}
                onChange={(event) => setRegisterDate(event.target.value)}
              />
            </FinanceFormField>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRegisterTarget(null)}
                className="flex-1 rounded-xl border border-border-default px-4 py-2.5 text-sm font-semibold text-text-secondary"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleRegister}
                disabled={pending}
                className="flex-1 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black disabled:opacity-50"
              >
                {pending ? "Registrando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </FinanceModal>
      ) : null}

      {deleteTarget ? (
        <FinanceConfirmModal
          title={`Eliminar "${deleteTarget.label}"`}
          subtitle="Esta acción no se puede deshacer."
          description="Se borrará la plantilla de gasto fijo. Las transacciones que ya registraste con ella no se eliminan."
          confirmLabel="Sí, eliminar gasto fijo"
          cancelLabel="Conservar"
          isPending={pending}
          onClose={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      ) : null}

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-[300] -translate-x-1/2 rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-4 py-2.5 text-sm font-medium text-emerald-100 shadow-lg">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
