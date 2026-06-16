"use client";

import {
  densifyHeatmapValues,
  threeMonthRangeLabelEs,
  threeMonthWindow,
} from "@/lib/heatmapMonth";
import HeatmapLegendScale from "@/components/HeatmapLegendScale";
import CalendarHeatMap from "react-calendar-heatmap";
import { Target } from "lucide-react";
import { useMemo } from "react";
import type { HabitHeatmapDay } from "../types";

type CalendarCell = { date: string; count?: number } | undefined;

function classForValue(value: CalendarCell) {
  const n = value?.count ?? 0;
  if (!value || !n) return "color-empty";
  if (n === 1) return "color-scale-1";
  if (n === 2) return "color-scale-2";
  if (n === 3) return "color-scale-3";
  return "color-scale-4";
}

function titleForValue(value: CalendarCell) {
  if (!value?.date) return "Sin actividad";
  const [yy, mm, dd] = value.date.slice(0, 10).split("-").map(Number);
  const d = new Date(yy, mm - 1, dd);
  const label = d.toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const n = value.count ?? 0;
  return `${label}: ${n} ${n === 1 ? "vez" : "veces"}`;
}

const MONTH_LABELS: [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
] = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

export default function HabitHeatmap({
  endDate,
  values,
}: {
  endDate: Date;
  values: HabitHeatmapDay[];
}) {
  const { start, end } = useMemo(() => threeMonthWindow(endDate), [endDate]);
  const rangeBadge = useMemo(
    () => threeMonthRangeLabelEs(start, end),
    [start, end],
  );

  const valuesInWindow = useMemo(
    () => densifyHeatmapValues(values, start, end),
    [values, start, end],
  );

  return (
    <div className="habit-heatmap-panel w-full overflow-x-auto rounded-2xl border border-border-subtle bg-surface-subtle p-6 md:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-forest/25 bg-accent-subtle">
            <Target className="h-5 w-5 text-brand-forest" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-base font-bold tracking-tight text-text-primary md:text-lg">
              Matriz de{" "}
              <span className="text-brand-forest">consistencia</span>
            </h3>
            <p className="mt-1 text-xs font-medium text-text-muted">
              <strong className="text-text-secondary">Últimos 90 días</strong> (~3 meses): un
              cuadrado por día, todos los días del rango. Pasá el cursor para ver la fecha.
            </p>
          </div>
        </div>
        <span className="shrink-0 self-start rounded-full border border-border-default bg-surface-muted px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-text-muted sm:self-auto">
          {rangeBadge}
        </span>
      </div>

      <div className="calendar-head-dark heatmap-github-wrap pl-1">
        <CalendarHeatMap
          startDate={start}
          endDate={end}
          values={valuesInWindow}
          showWeekdayLabels
          showMonthLabels
          gutterSize={3}
          weekdayLabels={["D", "L", "M", "M", "J", "V", "S"]}
          monthLabels={MONTH_LABELS}
          classForValue={classForValue}
          titleForValue={titleForValue}
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-end gap-1.5 border-t border-border-subtle pt-4 text-[7px] font-bold uppercase tracking-tighter text-text-muted">
        <span>Menos</span>
        <HeatmapLegendScale />
        <span>Más</span>
      </div>
    </div>
  );
}
