"use client";

import {
  OBLIGATION_META_PREFIX,
  OBLIGATION_PAYMENT_META_PREFIX,
} from "@/lib/finance/obligationMeta";
import { Account, FinanceCategory, FinanceTransaction } from "@/lib/types";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ACCOUNT_TYPE_LABELS } from "../../../accounts.constants";
import { formatMoney } from "../../../utils/formatMoney";

const SAVINGS_META_PREFIX = "[[HATRACK_SAVINGS_META]]";
const TX_META_PREFIX = "[[HATRACK_TX_META]]";

const TYPE_LABELS: Record<FinanceTransaction["type"], string> = {
  income: "Ingreso",
  expense: "Gasto",
  transfer: "Transferencia",
};

type TypeFilter = "all" | FinanceTransaction["type"];

function stripInternalMeta(raw: string): string {
  let text = raw;
  for (const prefix of [
    TX_META_PREFIX,
    SAVINGS_META_PREFIX,
    OBLIGATION_META_PREFIX,
    OBLIGATION_PAYMENT_META_PREFIX,
  ]) {
    const idx = text.indexOf(prefix);
    if (idx !== -1) text = text.slice(0, idx);
  }
  return text.trim();
}

function formatDateBogota(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", {
    dateStyle: "medium",
    timeZone: "America/Bogota",
  });
}

function formatTimeBogota(iso: string) {
  return new Date(iso).toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Bogota",
  });
}

export default function AccountTransactionsClient({
  account,
  accounts,
  categories,
  transactions,
}: {
  account: Account;
  accounts: Account[];
  categories: FinanceCategory[];
  transactions: FinanceTransaction[];
}) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const accountMap = useMemo(
    () => new Map(accounts.map((item) => [String(item.account_id), item])),
    [accounts],
  );
  const categoryMap = useMemo(
    () => new Map(categories.map((item) => [String(item.id_category), item])),
    [categories],
  );

  const metrics = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const tx of transactions) {
      if (tx.type === "income") income += Number(tx.amount);
      if (tx.type === "expense") expense += Number(tx.amount);
      if (tx.type === "transfer") {
        if (String(tx.account_id) === String(account.account_id)) {
          expense += Number(tx.amount);
        } else if (String(tx.to_account_id) === String(account.account_id)) {
          income += Number(tx.amount);
        }
      }
    }
    return { income, expense, count: transactions.length, net: income - expense };
  }, [account.account_id, transactions]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transactions.filter((tx) => {
      if (typeFilter !== "all" && tx.type !== typeFilter) return false;
      if (!q) return true;
      const category = categoryMap.get(String(tx.category_id ?? ""));
      const from = accountMap.get(String(tx.account_id));
      const to = accountMap.get(String(tx.to_account_id ?? ""));
      const notes = stripInternalMeta(tx.description ?? "");
      const blob = [
        tx.title,
        notes,
        TYPE_LABELS[tx.type],
        category?.name,
        from?.account_name,
        to?.account_name,
        tx.amount,
      ]
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
  }, [accountMap, categoryMap, query, transactions, typeFilter]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border-subtle bg-surface-card p-5">
        <Link
          href="/finanzas/cuentas"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted transition hover:text-emerald-400"
        >
          <ArrowLeft className="size-3.5" />
          Volver a cuentas
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Movimientos de la cuenta
            </p>
            <h1 className="mt-1 text-xl font-semibold text-text-primary">
              {account.account_name}
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              {ACCOUNT_TYPE_LABELS[account.type]}
              {account.institution ? ` · ${account.institution}` : ""} · {account.currency}
              {!account.is_active ? " · Inactiva" : ""}
            </p>
          </div>
          <div className="rounded-xl border border-border-default bg-surface-muted px-4 py-3 text-right">
            <p className="text-xs text-text-muted">Saldo actual</p>
            <p className="mt-1 text-2xl font-semibold text-text-primary">
              {formatMoney(account.balance, account.currency)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Movimientos", String(metrics.count), "text-text-primary"],
          ["Entradas", formatMoney(metrics.income, account.currency), "text-emerald-300"],
          ["Salidas", formatMoney(metrics.expense, account.currency), "text-rose-300"],
          ["Neto", formatMoney(metrics.net, account.currency), "text-sky-300"],
        ].map(([label, value, tone]) => (
          <div key={label} className="rounded-2xl border border-border-subtle bg-surface-card p-4">
            <p className="text-xs text-text-muted">{label}</p>
            <p className={`mt-1 text-xl font-semibold ${tone}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border-subtle bg-surface-card p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-text-primary">Historial</h2>
            <p className="mt-1 text-xs text-text-muted">
              Incluye ingresos, gastos y transferencias de esta cuenta.
            </p>
          </div>
          <Link
            href="/finanzas/transacciones"
            className="text-xs font-medium text-emerald-300 hover:underline"
          >
            Ir a todas las transacciones →
          </Link>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por concepto, categoría, monto…"
              className="w-full rounded-xl border border-border-default bg-surface-muted py-2.5 pl-10 pr-3 text-sm text-text-primary outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(["all", "income", "expense", "transfer"] as TypeFilter[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setTypeFilter(key)}
                className={`rounded-xl border px-3 py-2 text-xs font-semibold ${
                  typeFilter === key
                    ? "border-emerald-500 bg-emerald-500 text-black"
                    : "border-border-default text-text-secondary"
                }`}
              >
                {key === "all" ? "Todas" : TYPE_LABELS[key]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border-default p-8 text-center">
              <ArrowLeftRight className="mx-auto size-8 text-text-muted" />
              <p className="mt-2 text-sm text-text-muted">
                {transactions.length === 0
                  ? "Esta cuenta aún no tiene movimientos."
                  : "No hay movimientos que coincidan con el filtro."}
              </p>
            </div>
          ) : null}

          {filtered.map((tx) => {
            const category = categoryMap.get(String(tx.category_id ?? ""));
            const from = accountMap.get(String(tx.account_id));
            const to = accountMap.get(String(tx.to_account_id ?? ""));
            const notes = stripInternalMeta(tx.description ?? "");
            const isOutgoing =
              tx.type === "expense" ||
              (tx.type === "transfer" && String(tx.account_id) === String(account.account_id));
            const isIncoming =
              tx.type === "income" ||
              (tx.type === "transfer" && String(tx.to_account_id) === String(account.account_id));
            const typeColor = isIncoming
              ? "text-emerald-400"
              : isOutgoing
                ? "text-rose-300"
                : "text-sky-300";
            const typeIcon =
              tx.type === "income" ? (
                <ArrowDownLeft className="size-4" />
              ) : tx.type === "expense" ? (
                <ArrowUpRight className="size-4" />
              ) : (
                <ArrowLeftRight className="size-4" />
              );

            return (
              <div
                key={tx.id_transaction}
                className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-border-default bg-surface-muted p-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-text-primary">{tx.title}</p>
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${typeColor}`}>
                      {typeIcon}
                      {TYPE_LABELS[tx.type]}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-text-muted">
                    {category?.name || "Sin categoría"} · {from?.account_name || "Cuenta"}
                    {to ? ` → ${to.account_name}` : ""} · {formatDateBogota(tx.transaction_date)} ·{" "}
                    {formatTimeBogota(tx.transaction_date)}
                  </p>
                  {notes ? <p className="mt-1 text-xs text-text-secondary">{notes}</p> : null}
                </div>
                <span className={`text-sm font-semibold ${typeColor}`}>
                  {isIncoming ? "+" : isOutgoing ? "-" : "↔"}{" "}
                  {formatMoney(Number(tx.amount), account.currency)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
