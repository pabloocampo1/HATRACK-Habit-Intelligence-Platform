import type { TransactionCurrency } from "../transacciones.types";

export function parseMoneyInput(raw: string, currency: TransactionCurrency): number {
  const t = raw.trim();
  if (currency === "USD") {
    const n = Number(t.replace(/[^\d.-]/g, ""));
    return Number.isFinite(n) ? n : 0;
  }
  const n = Math.round(Number(t.replace(/\D/g, "")) || 0);
  return Number.isFinite(n) ? n : 0;
}
