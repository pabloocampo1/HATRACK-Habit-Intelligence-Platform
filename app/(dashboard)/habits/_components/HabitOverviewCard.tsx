import { Activity, CalendarDays, Zap } from "lucide-react";
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
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
        {label}
      </p>
      <p className="mt-1 text-2xl font-black tabular-nums tracking-tight text-white">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-[10px] font-medium text-emerald-300/60">{hint}</p>
      ) : null}
    </div>
  );
}

export default function HabitOverviewCard({ habit }: { habit: HabitOverview }) {
  const end = new Date(habit.heatmapEnd + "T12:00:00");

  return (
    <article className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0a0a0a] shadow-2xl">
      <div className="border-b border-white/5 p-8 md:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-emerald-500/30 bg-emerald-900/25 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                {habit.category}
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-white/25">
                <Activity className="h-3.5 w-3.5" strokeWidth={2} />
                {habit.id}
              </span>
            </div>
            <h2 className="mt-4 text-3xl font-black tracking-tighter text-white">
              {habit.title}
            </h2>
            <p className="mt-2 flex items-center gap-2 text-xs font-medium text-white/35">
              <CalendarDays className="h-4 w-4 text-emerald-500/80" strokeWidth={2} />
              Últimos 90 días · un cuadrado por día
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/25 bg-emerald-900/20 px-5 py-4">
            <Zap className="h-6 w-6 text-emerald-400" strokeWidth={2} />
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400/80">
                Racha actual
              </p>
              <p className="text-2xl font-black tabular-nums text-white">
                {habit.currentStreakDays}{" "}
                <span className="text-sm font-bold text-white/40">días</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatPill
            label="Total veces"
            value={String(habit.totalCompletions)}
            hint="Histórico en mock"
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

      <div className="bg-black/40 p-6 md:p-10 md:pt-8">
        <HabitHeatmap endDate={end} values={habit.heatmapDays} />
      </div>
    </article>
  );
}
