"use client";

import type { Goal } from "@/lib/types";
import {
  Target,
  CalendarDays,
  AlertTriangle,
  CheckCircle2,
  PauseCircle,
  XCircle,
  ChevronRight,
  Flame,
} from "lucide-react";
import Link from "next/link";

// ── config ───────────────────────────────────────────────────

export const CATEGORY_LABELS: Record<string, string> = {
  finances: "Finanzas",
  fitness: "Fitness",
  learning: "Aprendizaje",
  career: "Carrera",
  personal: "Personal",
  relationships: "Relaciones",
  health: "Salud",
  other: "Otro",
};

const PRIORITY_CONFIG = {
  high:   { label: "Alta",  cls: "border-red-500/30 bg-red-500/10 text-red-400" },
  medium: { label: "Media", cls: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400" },
  low:    { label: "Baja",  cls: "border-brand-forest/20 bg-brand-forest/8 text-brand-forest" },
};

const STATUS_CONFIG = {
  active:    { label: "Activa",     icon: Target,       cls: "text-brand-forest" },
  completed: { label: "Completada", icon: CheckCircle2, cls: "text-brand-forest" },
  paused:    { label: "Pausada",    icon: PauseCircle,  cls: "text-yellow-400" },
  abandoned: { label: "Abandonada", icon: XCircle,      cls: "text-text-muted" },
};

// ── helpers ──────────────────────────────────────────────────

function daysRemaining(targetDate: string | null | undefined): number | null {
  if (!targetDate) return null;
  return Math.ceil((new Date(targetDate).getTime() - Date.now()) / 86_400_000);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ── component ────────────────────────────────────────────────

export default function GoalCard({
  goal,
  progressPct,
  milestonesTotal,
  milestonesCompleted,
}: {
  goal: Goal;
  progressPct: number;
  milestonesTotal: number;
  milestonesCompleted: number;
}) {
  const days = daysRemaining(goal.target_date);
  const isOverdue = days !== null && days < 0 && goal.status === "active";
  const priority = PRIORITY_CONFIG[goal.priority] ?? PRIORITY_CONFIG.medium;
  const status   = STATUS_CONFIG[goal.status]   ?? STATUS_CONFIG.active;
  const StatusIcon = status.icon;

  return (
    <Link href={`/metas/${goal.id}`} className="group block">
      <article
        className={`rounded-2xl border p-5 transition-all hover:shadow-md ${
          goal.status === "completed"
            ? "border-brand-forest/20 bg-accent-subtle/20"
            : goal.status === "abandoned" || goal.status === "paused"
              ? "border-border-subtle bg-surface-muted/40 opacity-70"
              : isOverdue
                ? "border-red-500/20 bg-red-500/5"
                : "border-border-subtle bg-surface-card hover:border-brand-forest/20"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          {/* left */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* badges row */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="rounded-full border border-border-subtle bg-surface-muted px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-text-muted">
                {CATEGORY_LABELS[goal.category] ?? goal.category}
              </span>
              <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${priority.cls}`}>
                {priority.label}
              </span>
              <span className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest ${status.cls}`}>
                <StatusIcon className="size-3" strokeWidth={2.5} />
                {status.label}
              </span>
            </div>

            {/* title */}
            <h3 className="font-bold leading-snug text-text-primary group-hover:text-brand-forest transition-colors line-clamp-2">
              {goal.title}
            </h3>

            {/* why */}
            {goal.why && (
              <p className="text-xs italic text-text-muted line-clamp-1">
                "{goal.why}"
              </p>
            )}
          </div>

          {/* chevron */}
          <ChevronRight
            className="mt-1 size-4 shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-brand-forest"
            strokeWidth={2}
          />
        </div>

        {/* progress bar */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
              Progreso
            </span>
            <span className="text-sm font-black tabular-nums text-text-primary">
              {progressPct}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-subtle">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                progressPct === 100
                  ? "bg-brand-forest"
                  : isOverdue
                    ? "bg-red-500"
                    : "bg-brand-forest/60"
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* footer row */}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-text-muted">
          {milestonesTotal > 0 && (
            <span className="flex items-center gap-1">
              <CheckCircle2 className="size-3.5" strokeWidth={2} />
              {milestonesCompleted}/{milestonesTotal} hitos
            </span>
          )}
          {goal.target_date && (
            <span
              className={`flex items-center gap-1 ${
                isOverdue
                  ? "text-red-400 font-bold"
                  : days !== null && days <= 7
                    ? "text-yellow-400"
                    : ""
              }`}
            >
              {isOverdue ? (
                <AlertTriangle className="size-3.5" strokeWidth={2.5} />
              ) : days !== null && days <= 7 ? (
                <Flame className="size-3.5" strokeWidth={2} />
              ) : (
                <CalendarDays className="size-3.5" strokeWidth={2} />
              )}
              {isOverdue
                ? `Vencida hace ${Math.abs(days!)} día${Math.abs(days!) !== 1 ? "s" : ""}`
                : days === 0
                  ? "Vence hoy"
                  : days !== null && days > 0
                    ? `${days} día${days !== 1 ? "s" : ""} restante${days !== 1 ? "s" : ""}`
                    : formatDate(goal.target_date)}
            </span>
          )}
        </div>
      </article>
    </Link>
  );
}
