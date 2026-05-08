/** Utilidades locales (sin UTC) para rangos de mes en heatmaps. */

export function dateLocalYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

export function monthTitleEs(d: Date): string {
  const s = d.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Días inclusivos en la ventana (~3 meses). */
export const HEATMAP_LAST_DAYS = 90;

/**
 * Últimos 90 días hasta `reference` (inclusive): un día = una celda, ~3 meses corridos.
 */
export function threeMonthWindow(reference: Date): { start: Date; end: Date } {
  const end = new Date(
    reference.getFullYear(),
    reference.getMonth(),
    reference.getDate(),
  );
  const start = new Date(end);
  start.setDate(start.getDate() - (HEATMAP_LAST_DAYS - 1));
  return { start, end };
}

/** Un punto por cada día del rango; días sin datos → count 0 (heatmap completo). */
export function densifyHeatmapValues(
  values: Array<{ date: string; count: number }>,
  start: Date,
  end: Date,
): Array<{ date: string; count: number }> {
  const map = new Map(
    values.map((v) => [v.date.slice(0, 10), v.count] as const),
  );
  const out: Array<{ date: string; count: number }> = [];
  const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  while (cur <= last) {
    const key = dateLocalYMD(cur);
    out.push({ date: key, count: map.get(key) ?? 0 });
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

export function threeMonthRangeLabelEs(start: Date, end: Date): string {
  const a = start.toLocaleDateString("es-ES", { month: "short" });
  const b = end.toLocaleDateString("es-ES", { month: "short", year: "numeric" });
  return `${a} – ${b}`;
}
