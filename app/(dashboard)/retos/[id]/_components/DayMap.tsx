"use client";

import { useMemo } from "react";

interface Props {
  startDate: string;
  endDate: string;
  perfectDays: string[];
  today: string;
}

function isoDatesBetween(start: string, end: string): string[] {
  const dates: string[] = [];
  const cur = new Date(start + "T00:00:00");
  const fin = new Date(end + "T00:00:00");
  while (cur <= fin) {
    dates.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

const DAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];

export default function DayMap({ startDate, endDate, perfectDays, today }: Props) {
  const perfectSet = useMemo(() => new Set(perfectDays), [perfectDays]);

  const allDays = useMemo(
    () => isoDatesBetween(startDate, endDate),
    [startDate, endDate],
  );

  // Start on Monday (pad start)
  const firstDay = new Date(startDate + "T00:00:00").getDay(); // 0=Sun
  const paddingBefore = firstDay === 0 ? 6 : firstDay - 1;
  const paddedDays: (string | null)[] = [
    ...Array(paddingBefore).fill(null),
    ...allDays,
  ];

  // Split into weeks
  const weeks: (string | null)[][] = [];
  for (let i = 0; i < paddedDays.length; i += 7) {
    weeks.push(paddedDays.slice(i, i + 7));
  }

  function cellStyle(date: string | null) {
    if (!date) return "invisible";
    if (date > today) return "rounded-md bg-surface-subtle border border-border-subtle opacity-40";
    if (perfectSet.has(date)) return "rounded-md bg-brand-forest";
    return "rounded-md bg-red-500/40 border border-red-500/20";
  }

  function tooltip(date: string | null) {
    if (!date) return "";
    const d = new Date(date + "T12:00:00").toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });
    if (date > today) return d + " (futuro)";
    if (perfectSet.has(date)) return d + " · Todo completado ✓";
    return d + " · Incompleto";
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[280px]">
        {/* Day labels */}
        <div className="mb-1 grid grid-cols-7 gap-1">
          {DAY_LABELS.map((l) => (
            <div key={l} className="text-center text-[9px] font-bold uppercase text-text-muted">{l}</div>
          ))}
        </div>
        {/* Weeks */}
        <div className="flex flex-col gap-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-1">
              {week.map((date, di) => (
                <div
                  key={date ?? `pad-${wi}-${di}`}
                  title={tooltip(date)}
                  className={`aspect-square w-full transition-all duration-200 ${cellStyle(date)}`}
                />
              ))}
            </div>
          ))}
        </div>
        {/* Legend */}
        <div className="mt-3 flex flex-wrap gap-4 text-[10px] font-medium text-text-muted">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded bg-brand-forest" /> Completado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded bg-red-500/40 border border-red-500/20" /> Incompleto
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded bg-surface-subtle border border-border-subtle opacity-40" /> Futuro
          </span>
        </div>
      </div>
    </div>
  );
}
