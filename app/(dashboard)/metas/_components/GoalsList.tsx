"use client";

import type { Goal, Habit, Challenge } from "@/lib/types";
import type { GoalPlanInfo } from "@/app/actions/goals/goalActions";
import { useState } from "react";
import { Plus, Lock, Target, CheckCircle2, Flame, PauseCircle } from "lucide-react";
import GoalCard from "./GoalCard";
import CreateGoalModal from "./CreateGoalModal";
import PlanLimitBanner from "@/components/plans/PlanLimitBanner";
import { formatLimit } from "@/lib/plans/limits";

type FilterStatus = "all" | "active" | "completed" | "paused" | "abandoned";

function calcProgressPct(goal: Goal): number {
  // Without milestones, use progress_manual or 0
  return goal.progress_manual ?? 0;
}

export default function GoalsList({
  goals,
  planInfo,
  habits,
  challenges,
  userId,
}: {
  goals: Goal[];
  planInfo: GoalPlanInfo;
  habits: Habit[];
  challenges: Challenge[];
  userId: string;
}) {
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [createOpen, setCreateOpen] = useState(false);

  const { goalCapability, isFree, limits, planLabel } = planInfo;
  const atLimit = !goalCapability.allowed;

  const filtered = goals.filter((g) =>
    filter === "all" ? true : g.status === filter,
  );

  const activeCount     = goals.filter((g) => g.status === "active").length;
  const completedCount  = goals.filter((g) => g.status === "completed").length;
  const overdueCount    = goals.filter((g) => {
    if (g.status !== "active" || !g.target_date) return false;
    return new Date(g.target_date).getTime() < Date.now();
  }).length;

  const kpis = [
    { label: "Activas",    value: activeCount,    icon: Target,      cls: "text-brand-forest" },
    { label: "Completadas",value: completedCount,  icon: CheckCircle2,cls: "text-brand-forest" },
    { label: "Vencidas",   value: overdueCount,    icon: Flame,       cls: "text-red-400" },
    { label: "Pausadas",   value: goals.filter((g) => g.status === "paused").length, icon: PauseCircle, cls: "text-yellow-400" },
  ];

  const filters: { value: FilterStatus; label: string }[] = [
    { value: "all",       label: "Todas" },
    { value: "active",    label: "Activas" },
    { value: "completed", label: "Completadas" },
    { value: "paused",    label: "Pausadas" },
    { value: "abandoned", label: "Abandonadas" },
  ];

  return (
    <>
      {/* header */}
      <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <div className="h-[2px] w-6 bg-brand-forest" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-forest/80">
              Vida personal
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-4xl font-black tracking-tighter text-text-primary">
              Mis metas
            </h1>
            <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${
              isFree
                ? "border-border-default bg-surface-muted text-text-muted"
                : "border-brand-forest/30 bg-accent-subtle text-brand-forest"
            }`}>
              {planLabel}
            </span>
          </div>
          <p className="mt-2 max-w-lg text-sm text-text-muted">
            Define lo que quieres lograr, divide el camino en hitos y conecta tus hábitos y retos.
          </p>
        </div>

        <button
          type="button"
          disabled={atLimit}
          onClick={() => !atLimit && setCreateOpen(true)}
          title={atLimit ? "Límite de metas alcanzado" : undefined}
          className={`inline-flex items-center gap-2 rounded-2xl border px-5 py-3 text-[11px] font-black uppercase tracking-[0.2em] transition ${
            atLimit
              ? "cursor-not-allowed border-border-default bg-surface-muted text-text-muted opacity-60"
              : "border-brand-forest/30 bg-accent-subtle text-brand-forest hover:bg-brand-forest/15"
          }`}
        >
          {atLimit ? <Lock className="size-4" strokeWidth={2.5} /> : <Plus className="size-4" strokeWidth={2.5} />}
          Nueva meta
        </button>
      </header>

      {/* plan banner */}
      {isFree && (
        <div className="max-w-sm">
          <PlanLimitBanner
            message={
              atLimit
                ? goalCapability.reason!
                : `${goalCapability.current} de ${formatLimit(limits.goals)} metas activas en el plan ${planLabel}.`
            }
            current={goalCapability.current}
            limit={limits.goals}
            showUpgrade={atLimit}
          />
        </div>
      )}

      {/* KPIs */}
      {goals.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {kpis.map((k) => {
            const Icon = k.icon;
            return (
              <div key={k.label} className="rounded-2xl border border-border-subtle bg-surface-card p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`size-4 ${k.cls}`} strokeWidth={2} />
                  <p className="text-[9px] font-bold uppercase tracking-widest text-text-muted">{k.label}</p>
                </div>
                <p className="text-3xl font-black tabular-nums text-text-primary">{k.value}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* filters */}
      {goals.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={`rounded-xl border px-4 py-2 text-xs font-bold transition ${
                filter === f.value
                  ? "border-brand-forest/30 bg-accent-subtle text-brand-forest"
                  : "border-border-default text-text-muted hover:border-border-strong hover:text-text-primary"
              }`}
            >
              {f.label}
              {f.value !== "all" && (
                <span className="ml-1.5 tabular-nums opacity-60">
                  ({goals.filter((g) => g.status === f.value).length})
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border-subtle py-16 text-center">
          <Target className="mb-3 size-10 text-text-muted" strokeWidth={1.25} />
          <p className="text-sm font-semibold text-text-primary">
            {goals.length === 0 ? "Sin metas todavía" : "Sin metas en esta categoría"}
          </p>
          <p className="mt-1 max-w-xs text-xs text-text-muted">
            {goals.length === 0
              ? "Crea tu primera meta y comienza a trabajar hacia ella hoy."
              : "Prueba cambiando el filtro o crea una nueva meta."}
          </p>
          {!atLimit && goals.length === 0 && (
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-brand-forest/30 bg-accent-subtle px-4 py-2.5 text-xs font-bold text-brand-forest transition hover:bg-brand-forest/15"
            >
              <Plus className="size-4" strokeWidth={2.5} />
              Crear primera meta
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              progressPct={calcProgressPct(goal)}
              milestonesTotal={0}
              milestonesCompleted={0}
            />
          ))}
        </div>
      )}

      <CreateGoalModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        userId={userId}
      />
    </>
  );
}
