import type { TransactionRow } from "../transacciones.types";

export type DayGroup = { label: string; sortKey: number; items: TransactionRow[] };

function dayLabel(d: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const y = new Date(d);
  y.setHours(0, 0, 0, 0);
  const diff = (today.getTime() - y.getTime()) / 86400000;
  if (diff === 0) return "Hoy";
  if (diff === 1) return "Ayer";
  return d.toLocaleDateString("es-CO", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/** Agrupa transacciones ya ordenadas (más reciente primero) por día calendario */
export function groupTransactionsByDay(
  sortedDesc: TransactionRow[],
): DayGroup[] {
  const map = new Map<string, TransactionRow[]>();
  const order: string[] = [];

  for (const t of sortedDesc) {
    const d = new Date(t.at);
    d.setHours(0, 0, 0, 0);
    const key = d.getTime().toString();
    if (!map.has(key)) {
      map.set(key, []);
      order.push(key);
    }
    map.get(key)!.push(t);
  }

  return order.map((key) => {
    const d = new Date(Number(key));
    return {
      label: dayLabel(d),
      sortKey: d.getTime(),
      items: map.get(key)!,
    };
  });
}
