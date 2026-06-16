import type { AccountCurrency } from "@/lib/types";

export function formatMoney(value: number, currency: AccountCurrency | string) {
  const cur = currency === "USD" ? "USD" : "COP";
  return new Intl.NumberFormat(cur === "COP" ? "es-CO" : "en-US", {
    style: "currency",
    currency: cur,
    maximumFractionDigits: cur === "COP" ? 0 : 2,
  }).format(value);
}

/** Parseo simple para formularios; el backend normaliza formato local. */
export function parseMoneyInput(
  raw: string,
  currency: AccountCurrency | string,
): number {
  const t = raw.trim();
  if (currency === "USD") {
    const n = Number(t.replace(/[^\d.-]/g, ""));
    return Number.isFinite(n) ? n : 0;
  }
  const n = Math.round(Number(t.replace(/\D/g, "")) || 0);
  return Number.isFinite(n) ? n : 0;
}
