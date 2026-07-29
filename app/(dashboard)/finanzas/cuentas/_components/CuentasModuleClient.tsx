"use client";

import { createAccountAction, deactivateFinanceAccountAction } from "@/app/actions/finance/financeActions";
import { Account } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Props = {
  userId: string;
  initialAccounts: Account[];
};

const accountTypes: Account["type"][] = ["BANK", "CASH", "DIGITAL_WALLET", "SAVINGS"];

export default function CuentasModuleClient({ userId, initialAccounts }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    account_name: "",
    type: "BANK" as Account["type"],
    institution: "",
    balance: "0",
    currency: "COP" as Account["currency"],
  });

  const totalBalance = initialAccounts.reduce((sum, item) => sum + Number(item.balance ?? 0), 0);

  const handleCreate = () => {
    setError(null);
    startTransition(async () => {
      try {
        await createAccountAction(userId, {
          account_name: form.account_name.trim(),
          type: form.type,
          institution: form.institution.trim() || undefined,
          balance: Number(form.balance || 0),
          currency: form.currency,
        });
        setForm({
          account_name: "",
          type: "BANK",
          institution: "",
          balance: "0",
          currency: "COP",
        });
        router.refresh();
      } catch (actionError) {
        setError(actionError instanceof Error ? actionError.message : "No se pudo crear la cuenta.");
      }
    });
  };

  const handleDeactivate = (accountId: string) => {
    startTransition(async () => {
      await deactivateFinanceAccountAction(userId, accountId);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border-subtle bg-surface-card p-5">
        <h1 className="text-xl font-semibold text-text-primary">Cuentas</h1>
        <p className="mt-1 max-w-xl text-sm text-text-secondary">
          Cada cuenta representa un lugar donde guardas dinero. Los saldos se actualizan
          automáticamente cuando registras transacciones, transferencias o aportes a metas.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border-subtle bg-surface-card p-4">
          <p className="text-xs text-text-muted">Cuentas activas</p>
          <p className="mt-1 text-2xl font-semibold text-text-primary">{initialAccounts.length}</p>
        </div>
        <div className="rounded-2xl border border-border-subtle bg-surface-card p-4">
          <p className="text-xs text-text-muted">Saldo total</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-400">
            ${totalBalance.toLocaleString("es-CO")}
          </p>
        </div>
        <div className="rounded-2xl border border-border-subtle bg-surface-card p-4">
          <p className="text-xs text-text-muted">Distribución</p>
          <p className="mt-1 text-sm text-text-secondary">Banco, efectivo, wallet y ahorros</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border-subtle bg-surface-card p-5">
        <h2 className="text-base font-semibold text-text-primary">Nueva cuenta</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-5">
          <input
            value={form.account_name}
            onChange={(event) => setForm((prev) => ({ ...prev, account_name: event.target.value }))}
            placeholder="Nombre"
            className="rounded-xl border border-border-default bg-surface-muted px-3 py-2 text-sm text-text-primary outline-none focus:border-emerald-500"
          />
          <select
            value={form.type}
            onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value as Account["type"] }))}
            className="rounded-xl border border-border-default bg-surface-muted px-3 py-2 text-sm text-text-primary outline-none focus:border-emerald-500"
          >
            {accountTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <input
            value={form.institution}
            onChange={(event) => setForm((prev) => ({ ...prev, institution: event.target.value }))}
            placeholder="Institución"
            className="rounded-xl border border-border-default bg-surface-muted px-3 py-2 text-sm text-text-primary outline-none focus:border-emerald-500"
          />
          <input
            value={form.balance}
            onChange={(event) => setForm((prev) => ({ ...prev, balance: event.target.value }))}
            type="number"
            placeholder="Saldo inicial"
            className="rounded-xl border border-border-default bg-surface-muted px-3 py-2 text-sm text-text-primary outline-none focus:border-emerald-500"
          />
          <button
            onClick={handleCreate}
            disabled={isPending || !form.account_name.trim()}
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
          >
            Crear cuenta
          </button>
        </div>
        {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
      </div>

      <div className="rounded-2xl border border-border-subtle bg-surface-card p-5">
        <h2 className="text-base font-semibold text-text-primary">Tus cuentas</h2>
        <div className="mt-4 space-y-3">
          {initialAccounts.length === 0 ? (
            <p className="text-sm text-text-muted">Aún no tienes cuentas. Crea la primera arriba.</p>
          ) : null}
          {initialAccounts.map((account) => (
            <div
              key={account.account_id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border-default bg-surface-muted p-4"
            >
              <div>
                <p className="text-sm font-semibold text-text-primary">{account.account_name}</p>
                <p className="text-xs text-text-muted">
                  {account.type} · {account.institution || "Sin institución"} · {account.currency}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold text-emerald-400">
                  ${Number(account.balance ?? 0).toLocaleString("es-CO")}
                </p>
                <button
                  onClick={() => handleDeactivate(account.account_id)}
                  className="rounded-lg border border-red-500/40 px-3 py-1.5 text-xs text-red-300"
                >
                  Desactivar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
