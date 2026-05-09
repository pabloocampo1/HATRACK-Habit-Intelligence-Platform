"use client";

import {
  dateLocalYMD,
  threeMonthRangeLabelEs,
  threeMonthWindow,
} from "@/lib/heatmapMonth";
import HeatmapLegendScale from "@/components/HeatmapLegendScale";
import { Target } from "lucide-react";
import CalendarHeatMap from "react-calendar-heatmap";
import { useMemo } from "react";

/** Demo: una entrada por cada día entre start y end (inclusive), hora local. */
function generateThreeMonthDemo(start: Date, end: Date) {
  const pattern = [0, 0, 1, 1, 2, 3, 4, 2, 1, 0];
  const data: { date: string; count: number }[] = [];
  const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  let i = 0;
  while (cur <= last) {
    data.push({
      date: dateLocalYMD(cur),
      count: pattern[i % pattern.length],
    });
    cur.setDate(cur.getDate() + 1);
    i += 1;
  }
  return data;
}

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
  return `${label}: ${n} ${n === 1 ? "registro" : "registros"}`;
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

export default function CalendarHead() {
  const anchor = useMemo(() => new Date(), []);
  const { start, end } = useMemo(() => threeMonthWindow(anchor), [anchor]);
  const rangeBadge = useMemo(
    () => threeMonthRangeLabelEs(start, end),
    [start, end],
  );
  const heatmapValues = useMemo(
    () => generateThreeMonthDemo(start, end),
    [start, end],
  );

  return (
    <div>
      <article className="rounded-[2rem] border border-white/10 bg-[#0a0a0a] p-8 shadow-2xl shadow-black/30">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/25 bg-emerald-950/40">
              <Target className="h-5 w-5 text-emerald-400" strokeWidth={2} />
            </div>
            <div>
              <h2 className="flex flex-wrap items-center gap-2 text-xl font-bold tracking-tight text-white">
                Matriz de
                <span className="text-emerald-400">consistencia</span>
              </h2>
              <p className="mt-1 text-xs font-medium text-white/40">
                <strong className="text-white/55">Últimos 90 días</strong> (~3 meses): un
                cuadrado por día, con todos los días del rango. Columnas = semanas.
              </p>
            </div>
          </div>
          <span className="shrink-0 self-start rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-white/45 sm:self-auto">
            {rangeBadge}
          </span>
        </div>

        <div className="calendar-head-dark heatmap-github-wrap pl-1">
          <CalendarHeatMap
            startDate={start}
            endDate={end}
            values={heatmapValues}
            showWeekdayLabels
            showMonthLabels
            gutterSize={3}
            weekdayLabels={["D", "L", "M", "M", "J", "V", "S"]}
            monthLabels={MONTH_LABELS}
            classForValue={classForValue}
            titleForValue={titleForValue}
          />
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-end gap-1.5 border-t border-white/5 pt-4 text-[7px] font-bold uppercase tracking-tighter text-white/30">
          <span>Menos</span>
          <HeatmapLegendScale />
          <span>Más</span>
        </div>
      </article>
    </div>
  );
}
