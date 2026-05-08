import { Flame, Timer, Trophy, TrendingUp } from "lucide-react";
import type { HabitsGlobalInsights as Insights } from "../types";

export default function HabitsGlobalInsightsPanel({
  insights,
}: {
  insights: Insights;
}) {
  const { rankings } = insights;

  return (
    <section className="grid gap-6 lg:grid-cols-12">
      <div className="lg:col-span-5 rounded-[2rem] border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-brand-forest" strokeWidth={2} />
          <h2 className="text-lg font-black tracking-tight text-neutral-950">
            Hábitos más completados
          </h2>
        </div>
        <p className="mb-6 text-xs font-medium text-neutral-500">
          Ordenados del más al menos frecuente (completaciones registradas).
        </p>
        <ul className="space-y-5">
          {rankings.map((row, index) => (
            <li key={row.habitId} className="space-y-2">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-xs font-bold text-neutral-800">
                  <span className="mr-2 font-mono text-[10px] text-neutral-400">
                    #{index + 1}
                  </span>
                  {row.title}
                </span>
                <span className="shrink-0 text-xs font-black tabular-nums text-brand-forest">
                  {row.completionCount}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-forest to-emerald-500 shadow-[0_0_12px_rgba(6,78,59,0.25)] transition-all duration-700"
                  style={{ width: `${row.barPercent}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
        <article className="rounded-[2rem] border border-neutral-200 bg-neutral-950 p-7 text-white shadow-sm">
          <div className="flex items-center gap-2 text-emerald-400/90">
            <Timer className="h-5 w-5" strokeWidth={2} />
            <p className="text-[10px] font-black uppercase tracking-[0.25em]">
              Tiempo total dedicado
            </p>
          </div>
          <p className="mt-4 text-4xl font-black tabular-nums tracking-tight">
            {Math.round(insights.totalMinutesDedicated / 60)}h{" "}
            <span className="text-lg font-bold text-white/40">
              {insights.totalMinutesDedicated % 60}m
            </span>
          </p>
          <p className="mt-2 text-[11px] font-medium text-white/35">
            Suma de minutos registrados en todos los hábitos (mock).
          </p>
        </article>

        <article className="rounded-[2rem] border border-neutral-200 bg-white p-7 shadow-sm">
          <div className="flex items-center gap-2 text-brand-forest">
            <Flame className="h-5 w-5" strokeWidth={2} />
            <p className="text-[10px] font-black uppercase tracking-[0.25em]">
              Racha actual máxima
            </p>
          </div>
          <p className="mt-4 text-4xl font-black tabular-nums tracking-tight text-neutral-950">
            {insights.currentLongestStreakDays}{" "}
            <span className="text-lg font-bold text-neutral-400">días</span>
          </p>
          <p className="mt-2 text-[11px] font-medium text-neutral-500">
            {insights.habitWithLongestStreakTitle}
          </p>
        </article>

        <article className="sm:col-span-2 rounded-[2rem] border border-neutral-200 bg-white p-7 shadow-sm">
          <div className="flex items-center gap-2 text-brand-forest">
            <Trophy className="h-5 w-5" strokeWidth={2} />
            <p className="text-[10px] font-black uppercase tracking-[0.25em]">
              Día con más rachas
            </p>
          </div>
          <p className="mt-3 text-xl font-black text-neutral-950">
            {insights.bestStreakDayLabel}
          </p>
          <p className="mt-2 text-sm font-medium text-neutral-500">
            {insights.bestStreakDayDetail}
          </p>
        </article>
      </div>
    </section>
  );
}
