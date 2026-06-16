import type { TransactionCurrency } from "../transacciones.types";

export function formatMoney(value: number, currency: TransactionCurrency) {
  return new Intl.NumberFormat(currency === "COP" ? "es-CO" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "COP" ? 0 : 2,
  }).format(value);
}
