"use client";

import { useState } from "react";
import { Plus, Trophy, Swords, Lock } from "lucide-react";
import type { Challenge, Habit } from "@/lib/types";
import type { PlanInfo } from "@/app/actions/plans/subscriptionActions";
import { formatLimit } from "@/lib/plans/limits";
import ChallengeCard from "./ChallengeCard";
import CreateChallengeModal from "./CreateChallengeModal";
import PlanLimitBanner from "@/components/plans/PlanLimitBanner";

type Filter = "all" | "active" | "completed" | "abandoned";

export default function RetosList({
  challenges,
  habits,
  userId,
  planInfo,
}: {
  challenges: Challenge[];
  habits: Habit[];
  userId: string;
  planInfo: PlanInfo;
}) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");

  const { challengeCapability, limits, planLabel, isFree } = planInfo;
  const atLimit = !challengeCapability.allowed;

  const filtered = filter === "all" ? challenges : challenges.filter((c) => c.status === filter);

  const activeCount = challenges.filter((c) => c.status === "active").length;
  const completedCount = challenges.filter((c) => c.status === "completed").length;

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: "Todos" },
    { key: "active", label: "Activos" },
    { key: "completed", label: "Completados" },
    { key: "abandoned", label: "Abandonados" },
  ];

  return (
    <>
      {/* Header */}
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="h-[2px] w-8 bg-brand-forest" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-forest/80">
              Desarrollo personal
            </p>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-text-primary">
            Retos
          </h1>
          <p className="mt-3 max-w-xl text-sm font-medium leading-relaxed text-text-muted">
            Crea retos de 7, 15, 30, 60 o 90 días con hábitos específicos y
            visualiza tu progreso día a día.
          </p>
        </div>
        <button
          type="button"
          disabled={atLimit}
          title={atLimit ? challengeCapability.reason : undefined}
          onClick={() => !atLimit && setOpen(true)}
          className={`inline-flex min-h-11 items-center gap-2 rounded-2xl border px-5 py-3 text-sm font-black transition whitespace-nowrap ${
            atLimit
              ? "cursor-not-allowed border-border-default bg-surface-muted text-text-muted opacity-60"
              : "border-brand-forest/30 bg-accent-subtle text-brand-forest hover:border-brand-forest/50 hover:bg-brand-forest/15"
          }`}
        >
          {atLimit ? <Lock className="size-4" strokeWidth={2.5} /> : <Plus className="size-4" strokeWidth={2.5} />}
          Nuevo reto
        </button>
      </header>

      {/* Plan usage banner (FREE users only) */}
      {isFree && (
        <div className="max-w-sm">
          <PlanLimitBanner
            message={
              atLimit
                ? challengeCapability.reason!
                : `${challengeCapability.current} de ${formatLimit(limits.challenges)} retos activos en el plan ${planLabel}.`
            }
            current={challengeCapability.current}
            limit={limits.challenges}
            showUpgrade={atLimit}
          />
        </div>
      )}

      {/* KPIs */}
      {challenges.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total retos", value: challenges.length },
            { label: "Activos", value: activeCount },
            { label: "Completados", value: completedCount },
            {
              label: "Tasa de éxito",
              value: challenges.length > 0
                ? `${Math.round((completedCount / challenges.length) * 100)}%`
                : "—",
            },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-2xl border border-border-subtle bg-surface-card p-4">
              <p className="text-[9px] font-bold uppercase tracking-widest text-text-muted">{kpi.label}</p>
              <p className="mt-1 text-2xl font-black tabular-nums text-text-primary">{kpi.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filtros */}
      {challenges.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`shrink-0 rounded-lg px-4 py-2 text-sm font-bold transition ${
                filter === key
                  ? "bg-brand-forest text-brand-forest-fg"
                  : "border border-border-default text-text-secondary hover:bg-surface-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Lista de retos */}
      {challenges.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-border-subtle bg-surface-card py-20 text-center">
          <Swords className="mb-4 size-12 text-text-muted" strokeWidth={1.25} />
          <h2 className="text-lg font-black text-text-primary">Sin retos aún</h2>
          <p className="mt-2 max-w-xs text-sm text-text-muted">
            Crea tu primer reto personal y empieza a trackear tu progreso día a día.
          </p>
          <button
            type="button"
            disabled={atLimit}
            onClick={() => !atLimit && setOpen(true)}
            className={`mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold transition ${
              atLimit
                ? "cursor-not-allowed border-border-default bg-surface-muted text-text-muted opacity-60"
                : "border-brand-forest/40 bg-brand-forest text-brand-forest-fg hover:brightness-110"
            }`}
          >
            {atLimit ? <Lock className="size-4" strokeWidth={2.5} /> : <Plus className="size-4" strokeWidth={2.5} />}
            {atLimit ? "Límite alcanzado" : "Crear primer reto"}
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border-subtle bg-surface-card p-10 text-center">
          <Trophy className="mx-auto mb-3 size-8 text-text-muted" strokeWidth={1.25} />
          <p className="text-sm text-text-muted">No hay retos con este filtro.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <ChallengeCard key={c.id} challenge={c} />
          ))}
        </div>
      )}

      <CreateChallengeModal
        open={open}
        onClose={() => setOpen(false)}
        userId={userId}
        existingHabits={habits}
        challengeHabitLimit={limits.challengeHabits}
      />
    </>
  );
}
