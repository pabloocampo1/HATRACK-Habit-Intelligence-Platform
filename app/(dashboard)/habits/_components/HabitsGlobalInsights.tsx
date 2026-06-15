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
      <div className="rounded-[2rem] border border-border-subtle bg-surface-card p-8 shadow-sm lg:col-span-5">
        <div className="mb-6 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-brand-forest" strokeWidth={2} />
          <h2 className="text-lg font-black tracking-tight text-text-primary">
            Hábitos más completados
          </h2>
        </div>
        <p className="mb-6 text-xs font-medium text-text-muted">
          Ordenados del más al menos frecuente (completaciones registradas).
        </p>
        <ul className="space-y-5">
          {rankings.map((row, index) => (
            <li key={row.habitId} className="space-y-2">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-xs font-bold text-text-primary">
                  <span className="mr-2 font-mono text-[10px] text-text-muted">
                    #{index + 1}
                  </span>
                  {row.title}
                </span>
                <span className="shrink-0 text-xs font-black tabular-nums text-brand-forest">
                  {row.completionCount}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-subtle">
                <div
                  className="h-full rounded-full bg-brand-forest shadow-[0_0_12px_rgba(16,185,129,0.35)] transition-all duration-700"
                  style={{ width: `${row.barPercent}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
        <article className="rounded-[2rem] border border-border-subtle bg-surface-muted p-7 shadow-sm">
          <div className="flex items-center gap-2 text-brand-forest">
            <Timer className="h-5 w-5" strokeWidth={2} />
            <p className="text-[10px] font-black uppercase tracking-[0.25em]">
              Tiempo total dedicado
            </p>
          </div>
          <p className="mt-4 text-4xl font-black tabular-nums tracking-tight text-text-primary">
            {Math.round(insights.totalMinutesDedicated / 60)}h{" "}
            <span className="text-lg font-bold text-text-muted">
              {insights.totalMinutesDedicated % 60}m
            </span>
          </p>
          <p className="mt-2 text-[11px] font-medium text-text-muted">
            Suma de minutos registrados en todos los hábitos (mock).
          </p>
        </article>

        <article className="rounded-[2rem] border border-border-subtle bg-surface-card p-7 shadow-sm">
          <div className="flex items-center gap-2 text-brand-forest">
            <Flame className="h-5 w-5" strokeWidth={2} />
            <p className="text-[10px] font-black uppercase tracking-[0.25em]">
              Racha actual máxima
            </p>
          </div>
          <p className="mt-4 text-4xl font-black tabular-nums tracking-tight text-text-primary">
            {insights.currentLongestStreakDays}{" "}
            <span className="text-lg font-bold text-text-muted">días</span>
          </p>
          <p className="mt-2 text-[11px] font-medium text-text-muted">
            {insights.habitWithLongestStreakTitle}
          </p>
        </article>

        <article className="rounded-[2rem] border border-border-subtle bg-surface-card p-7 shadow-sm sm:col-span-2">
          <div className="flex items-center gap-2 text-brand-forest">
            <Trophy className="h-5 w-5" strokeWidth={2} />
            <p className="text-[10px] font-black uppercase tracking-[0.25em]">
              Día con más rachas
            </p>
          </div>
          <p className="mt-3 text-xl font-black text-text-primary">
            {insights.bestStreakDayLabel}
          </p>
          <p className="mt-2 text-sm font-medium text-text-muted">
            {insights.bestStreakDayDetail}
          </p>
        </article>
      </div>
    </section>
  );
}
