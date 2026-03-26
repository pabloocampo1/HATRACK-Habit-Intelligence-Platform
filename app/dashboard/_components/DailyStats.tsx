import { Habit, HabitLog, Stats } from "@/lib/types";
import { useState } from "react";

export default function DailyStats({
  todayStats,
  habits,
  todayLogs,
}: {
  todayStats: Stats | null;
  habits: Habit[];
  todayLogs: HabitLog[];
}) {
  const today = new Date().toISOString().split("T")[0];
  const completedToday = todayLogs.filter((log) => log.completed).length;
  const totalTimeToday = todayLogs.reduce(
    (sum, log) => sum + (log.minutes_completed || 0),
    0,
  );
  const avgQualityToday =
    todayLogs.length > 0
      ? Math.round(
          todayLogs.reduce((sum, log) => sum + log.quality_score, 0) /
            todayLogs.length,
        )
      : 0;

  return (
    <div className="my-8">
      <section className="rounded-[2rem] p-10 bg-[#fafafa] border border-black/30">
        <header className="mb-10">
          <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-black/40 mb-2">
            Métricas de Rendimiento
          </h2>
          <p className="text-3xl font-black tracking-tighter text-black capitalize">
            {new Date().toLocaleDateString("es-ES", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Cards: Usamos border-black/5 y un shadow muy sutil para calidez */}
          {[
            {
              label: "Completadas",
              subLabel: "Hábitos activos",
              value: `${completedToday}/${habits.length}`,
              sub: "Hábitos activos",
            },
            {
              label: "Tiempo Total",
              subLabel: "Dedicación hoy",
              value: `${totalTimeToday}m`,
              sub: "Dedicación hoy",
            },
            {
              label: "Calidad",
              subLabel: "Nivel de enfoque",
              value: `${avgQualityToday}/5`,
              sub: "Nivel de enfoque",
            },
            {
              label: "Disciplina",
              subLabel: "Progreso diario",
              value: `${todayStats?.disciplina || 0}%`,
              sub: "Progreso diario",
            },
          ].map((kpi, i) => (
            <article
              key={i}
              className="group relative rounded-3xl border border-black/5 bg-white p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all hover:shadow-md"
            >
              <div className="absolute top-8 right-8 w-1.5 h-1.5 rounded-full bg-emerald-900 opacity-20 group-hover:opacity-100 transition-opacity" />

              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/80">
                {kpi.label}
              </p>

              <div className="mt-4 flex items-baseline gap-1">
                <p className="text-4xl font-black tracking-tight text-emerald-950">
                  {kpi.value}
                </p>
              </div>

              <div className="absolute bottom-0 left-8 right-8 h-1 bg-emerald-900/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-900/20 transition-all duration-1000"
                  style={{ width: `${todayStats?.disciplina || 0}%` }}
                />
              </div>

              <p className="text-[12px] font-bold mt-2  tracking-[0.1em] text-black/40">
                {kpi.subLabel}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
