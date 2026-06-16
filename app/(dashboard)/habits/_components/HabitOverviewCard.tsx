import { CalendarDays, Zap } from "lucide-react";
import type { HabitOverview } from "../types";
import HabitHeatmap from "./HabitHeatmap";

function StatPill({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface-muted px-4 py-3">
      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-text-muted">
        {label}
      </p>
      <p className="mt-1 text-2xl font-black tabular-nums tracking-tight text-text-primary">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-[10px] font-medium text-brand-forest/70">{hint}</p>
      ) : null}
    </div>
  );
}

export default function HabitOverviewCard({ habit }: { habit: HabitOverview }) {
  const end = new Date(habit.heatmapEnd + "T12:00:00");
  const isTopRank = habit.rank === 1;

  return (
    <article className="relative overflow-hidden rounded-[2.5rem] border border-border-subtle bg-surface-card shadow-2xl">
      <div
        className={`absolute right-0 top-0 z-10 flex min-w-[4.5rem] flex-col items-center justify-center rounded-bl-[1.75rem] border-b border-l px-4 py-3 ${
          isTopRank
            ? "border-brand-forest/40 bg-brand-forest text-brand-forest-fg"
            : "border-border-default bg-surface-muted text-text-primary"
        }`}
        aria-label={`Ranking ${habit.rank}`}
      >
        <span className="text-[9px] font-black uppercase tracking-[0.25em] opacity-80">
          Rank
        </span>
        <span className="text-2xl font-black tabular-nums leading-none">
          #{habit.rank}
        </span>
      </div>

      <div className="border-b border-border-subtle p-8 md:p-10">
        <div className="flex flex-col gap-6 pr-16 lg:flex-row lg:items-start lg:justify-between lg:pr-20">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-brand-forest/30 bg-accent-subtle px-3 py-1 text-[10px] font-black uppercase tracking-widest text-brand-forest">
                {habit.category}
              </span>
              <span className="rounded-full border border-border-subtle bg-surface-muted px-3 py-1 text-[10px] font-bold tabular-nums text-text-muted">
                {habit.totalCompletions} completado
                {habit.totalCompletions === 1 ? "" : "s"}
              </span>
            </div>
            <h2 className="mt-4 text-3xl font-black tracking-tighter text-text-primary">
              {habit.title}
            </h2>
            <p className="mt-2 flex items-center gap-2 text-xs font-medium text-text-muted">
              <CalendarDays className="h-4 w-4 text-brand-forest" strokeWidth={2} />
              Últimos 90 días · un cuadrado por día
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-brand-forest/25 bg-accent-subtle px-5 py-4">
            <Zap className="h-6 w-6 text-brand-forest" strokeWidth={2} />
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-forest/80">
                Racha actual
              </p>
              <p className="text-2xl font-black tabular-nums text-text-primary">
                {habit.currentStreakDays}{" "}
                <span className="text-sm font-bold text-text-muted">días</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatPill
            label="Total veces"
            value={String(habit.totalCompletions)}
          />
          <StatPill
            label="Este mes"
            value={String(habit.completionsThisMonth)}
          />
          <StatPill
            label="Últimos 3 meses"
            value={String(habit.completionsLastThreeMonths)}
          />
          <StatPill
            label="Tiempo dedicado"
            value={`${habit.totalMinutesDedicated}m`}
          />
        </div>
      </div>

      <div className="bg-surface-muted p-6 md:p-10 md:pt-8">
        <HabitHeatmap endDate={end} values={habit.heatmapDays} />
      </div>
    </article>
  );
}
