import type { AccountCurrency } from "../accounts.constants";

export function formatMoney(value: number, currency: AccountCurrency) {
  return new Intl.NumberFormat(currency === "COP" ? "es-CO" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "COP" ? 0 : 2,
  }).format(value);
}

/** Parseo simple para formularios mock; el backend puede normalizar formato local. */
export function parseMoneyInput(raw: string, currency: AccountCurrency): number {
  const t = raw.trim();
  if (currency === "USD") {
    const n = Number(t.replace(/[^\d.-]/g, ""));
    return Number.isFinite(n) ? n : 0;
  }
  const n = Math.round(Number(t.replace(/\D/g, "")) || 0);
  return Number.isFinite(n) ? n : 0;
}
