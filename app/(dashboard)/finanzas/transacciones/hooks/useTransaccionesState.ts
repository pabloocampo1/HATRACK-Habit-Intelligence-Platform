"use client";

import { useMemo, useState } from "react";
import {
  MOCK_CATEGORIES,
  MOCK_TRANSACTIONS,
} from "../transactions.constants";
import type {
  PeriodFilter,
  TransactionRow,
  TransactionType,
} from "../transacciones.types";

function startOfPeriod(period: PeriodFilter): Date | null {
  const now = new Date();
  if (period === "all") return null;
  if (period === "7d") {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  const d = new Date(now.getFullYear(), now.getMonth(), 1);
  return d;
}

function matchesPeriod(at: string, period: PeriodFilter) {
  const start = startOfPeriod(period);
  if (!start) return true;
  return new Date(at) >= start;
}

export function useTransaccionesState() {
  const [transactions, setTransactions] = useState<TransactionRow[]>(() =>
    [...MOCK_TRANSACTIONS].sort(
      (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
    ),
  );
  const [period, setPeriod] = useState<PeriodFilter>("month");
  const [typeFilter, setTypeFilter] = useState<TransactionType | "all">("all");
  const [categoryId, setCategoryId] = useState<string | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return transactions.filter((t) => {
      if (!matchesPeriod(t.at, period)) return false;
      if (typeFilter !== "all" && t.type !== typeFilter) return false;
      if (categoryId !== "all" && t.categoryId !== categoryId) return false;
      if (q) {
        const cat = MOCK_CATEGORIES.find((c) => c.id === t.categoryId)?.name ?? "";
        const blob = `${t.description} ${t.accountName} ${t.toAccountName ?? ""} ${cat}`.toLowerCase();
        if (!blob.includes(q)) return false;
      }
      return true;
    });
  }, [transactions, period, typeFilter, categoryId, search]);

  /** Solo COP en KPIs para no mezclar monedas sin tipo de cambio */
  const totals = useMemo(() => {
    let incomeCop = 0;
    let expenseCop = 0;
    for (const t of filtered) {
      if (t.currency !== "COP") continue;
      if (t.type === "INCOME") incomeCop += t.amount;
      else if (t.type === "EXPENSE") expenseCop += t.amount;
      else if (t.type === "TRANSFER") expenseCop += t.amount;
    }
    return {
      incomeCop,
      expenseCop,
      netCop: incomeCop + expenseCop,
      count: filtered.length,
    };
  }, [filtered]);

  const addTransaction = (row: Omit<TransactionRow, "id">) => {
    const id = `tx-${Date.now()}`;
    setTransactions((prev) =>
      [{ ...row, id }, ...prev].sort(
        (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
      ),
    );
  };

  return {
    transactions: filtered,
    allCount: transactions.length,
    period,
    setPeriod,
    typeFilter,
    setTypeFilter,
    categoryId,
    setCategoryId,
    search,
    setSearch,
    totals,
    addTransaction,
    categories: MOCK_CATEGORIES,
  };
}
