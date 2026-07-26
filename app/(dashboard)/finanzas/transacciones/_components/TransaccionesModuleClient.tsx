"use client";

import {
  createTransactionAction,
  deleteTransactionAction,
} from "@/app/actions/finance/financeActions";
import FinanceFormField from "../../_components/FinanceFormField";
import FinanceModal, { financeInputClass } from "../../_components/FinanceModal";
import { Account, FinanceCategory, FinanceTransaction } from "@/lib/types";
import { ArrowLeftRight, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

const TYPE_LABELS: Record<FinanceTransaction["type"], string> = {
  income: "Ingreso",
  expense: "Gasto",
  transfer: "Transferencia",
};

type Props = {
  userId: string;
  accounts: Account[];
  categories: FinanceCategory[];
  transactions: FinanceTransaction[];
};

export default function TransaccionesModuleClient({
  userId,
  accounts,
  categories,
  transactions,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    type: "expense" as FinanceTransaction["type"],
    amount: "",
    account_id: accounts[0]?.account_id ? String(accounts[0].account_id) : "",
    category_id: "",
    to_account_id: "",
    description: "",
  });

  const categoryById = useMemo(
    () => new Map(categories.map((category) => [Number(category.id_category), category])),
    [categories],
  );

  const accountById = useMemo(
    () => new Map(accounts.map((account) => [String(account.account_id), account])),
    [accounts],
  );

  const metrics = useMemo(() => {
    const income = transactions
      .filter((tx) => tx.type === "income")
      .reduce((sum, tx) => sum + Number(tx.amount ?? 0), 0);
    const expense = transactions
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + Number(tx.amount ?? 0), 0);
    return { income, expense, cashflow: income - expense };
  }, [transactions]);

  const resetForm = () => {
    setForm({
      title: "",
      type: "expense",
      amount: "",
      account_id: accounts[0]?.account_id ? String(accounts[0].account_id) : "",
      category_id: "",
      to_account_id: "",
      description: "",
    });
  };

  const handleCreate = () => {
    setError(null);
    startTransition(async () => {
      try {
        await createTransactionAction(userId, {
          account_id: Number(form.account_id),
          category_id: form.category_id ? Number(form.category_id) : null,
          amount: Number(form.amount),
          title: form.title.trim(),
          type: form.type,
          description: form.description.trim() || undefined,
          to_account_id:
            form.type === "transfer" && form.to_account_id
              ? Number(form.to_account_id)
              : null,
        });
        resetForm();
        setModalOpen(false);
        router.refresh();
      } catch (actionError) {
        setError(
          actionError instanceof Error
            ? actionError.message
            : "No se pudo registrar la transacción.",
        );
      }
    });
  };

  const handleDelete = (idTransaction: number) => {
    startTransition(async () => {
      await deleteTransactionAction(userId, idTransaction);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Transacciones</h1>
          <p className="mt-1 max-w-xl text-sm text-text-secondary">
            Registra cada movimiento de dinero: lo que entra, lo que sale o lo que
            mueves entre tus cuentas.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          disabled={accounts.length === 0}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black disabled:opacity-50"
        >
          <Plus className="size-4" />
          Nueva transacción
        </button>
      </div>

      {accounts.length === 0 ? (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Primero crea al menos una cuenta en el módulo de Cuentas.
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border-subtle bg-surface-card p-4">
          <p className="text-xs text-text-muted">Ingresos totales</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-400">
            ${metrics.income.toLocaleString("es-CO")}
          </p>
        </div>
        <div className="rounded-2xl border border-border-subtle bg-surface-card p-4">
          <p className="text-xs text-text-muted">Gastos totales</p>
          <p className="mt-1 text-2xl font-semibold text-rose-300">
            ${metrics.expense.toLocaleString("es-CO")}
          </p>
        </div>
        <div className="rounded-2xl border border-border-subtle bg-surface-card p-4">
          <p className="text-xs text-text-muted">Flujo neto</p>
          <p className="mt-1 text-2xl font-semibold text-text-primary">
            ${metrics.cashflow.toLocaleString("es-CO")}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border-subtle bg-surface-card p-5">
        <h2 className="text-base font-semibold text-text-primary">Historial de movimientos</h2>
        <div className="mt-3 space-y-2">
          {transactions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border-default p-8 text-center">
              <ArrowLeftRight className="mx-auto size-8 text-text-muted" />
              <p className="mt-2 text-sm text-text-muted">
                Sin movimientos aún. Registra tu primer ingreso o gasto.
              </p>
            </div>
          ) : null}
          {transactions.map((tx) => (
            <div
              key={tx.id_transaction}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border-default bg-surface-muted p-3"
            >
              <div>
                <p className="text-sm font-semibold text-text-primary">{tx.title}</p>
                <p className="text-xs text-text-muted">
                  {TYPE_LABELS[tx.type]} ·{" "}
                  {categoryById.get(Number(tx.category_id ?? 0))?.name || "Sin categoría"} ·{" "}
                  {accountById.get(String(tx.account_id))?.account_name || "Cuenta"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-sm font-semibold ${
                    tx.type === "income" ? "text-emerald-400" : "text-text-primary"
                  }`}
                >
                  {tx.type === "income" ? "+" : tx.type === "expense" ? "-" : "↔"} $
                  {Number(tx.amount).toLocaleString("es-CO")}
                </span>
                <button
                  type="button"
                  onClick={() => handleDelete(tx.id_transaction)}
                  className="rounded-lg border border-red-500/40 px-2 py-1 text-xs text-red-300"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modalOpen ? (
        <FinanceModal
          title="Nueva transacción"
          subtitle="Registra un ingreso, un gasto o una transferencia entre cuentas."
          onClose={() => setModalOpen(false)}
        >
          <div className="space-y-4">
            <FinanceFormField
              label="Concepto"
              required
              hint='Nombre corto del movimiento. Ej: "Mercado", "Salario marzo", "Pago Netflix".'
            >
              <input
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="¿De qué se trata este movimiento?"
                className={financeInputClass}
              />
            </FinanceFormField>
            <FinanceFormField
              label="Tipo de movimiento"
              required
              hint="Ingreso = dinero que entra. Gasto = dinero que sale. Transferencia = mueves entre cuentas propias."
            >
              <select
                value={form.type}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    type: event.target.value as FinanceTransaction["type"],
                  }))
                }
                className={financeInputClass}
              >
                <option value="expense">Gasto — sale dinero</option>
                <option value="income">Ingreso — entra dinero</option>
                <option value="transfer">Transferencia — entre mis cuentas</option>
              </select>
            </FinanceFormField>
            <FinanceFormField label="Monto" required hint="Valor en pesos. Solo números.">
              <input
                type="number"
                value={form.amount}
                onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
                placeholder="Ej: 45000"
                className={financeInputClass}
              />
            </FinanceFormField>
            <FinanceFormField
              label={form.type === "transfer" ? "Cuenta origen" : "Cuenta"}
              required
              hint={
                form.type === "transfer"
                  ? "De qué cuenta sale el dinero."
                  : "Cuenta donde se registra el movimiento."
              }
            >
              <select
                value={form.account_id}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, account_id: event.target.value }))
                }
                className={financeInputClass}
              >
                {accounts.map((account) => (
                  <option key={account.account_id} value={account.account_id}>
                    {account.account_name} ({account.currency})
                  </option>
                ))}
              </select>
            </FinanceFormField>
            {form.type === "transfer" ? (
              <FinanceFormField
                label="Cuenta destino"
                required
                hint="A qué cuenta llega el dinero. Debe ser distinta a la origen."
              >
                <select
                  value={form.to_account_id}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, to_account_id: event.target.value }))
                  }
                  className={financeInputClass}
                >
                  <option value="">Selecciona cuenta destino</option>
                  {accounts
                    .filter((account) => String(account.account_id) !== form.account_id)
                    .map((account) => (
                      <option key={account.account_id} value={account.account_id}>
                        {account.account_name} ({account.currency})
                      </option>
                    ))}
                </select>
              </FinanceFormField>
            ) : (
              <FinanceFormField
                label="Categoría (opcional)"
                hint="Clasifica el movimiento para reportes. Ej: Mercado, Transporte, Salario."
              >
                <select
                  value={form.category_id}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, category_id: event.target.value }))
                  }
                  className={financeInputClass}
                >
                  <option value="">Sin categoría</option>
                  {categories.map((category) => (
                    <option key={category.id_category} value={category.id_category}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </FinanceFormField>
            )}
            <FinanceFormField label="Notas (opcional)" hint="Detalle extra que quieras recordar.">
              <input
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, description: event.target.value }))
                }
                placeholder="Ej: Pago en efectivo"
                className={financeInputClass}
              />
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
                disabled={
                  isPending ||
                  !form.title.trim() ||
                  Number(form.amount) <= 0 ||
                  !form.account_id ||
                  (form.type === "transfer" && !form.to_account_id)
                }
                className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
              >
                {isPending ? "Guardando…" : "Registrar movimiento"}
              </button>
            </div>
          </div>
        </FinanceModal>
      ) : null}
    </div>
  );
}
