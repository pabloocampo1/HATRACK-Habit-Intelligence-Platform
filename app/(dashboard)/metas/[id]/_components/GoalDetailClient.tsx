"use client";

import type { GoalDetail, Habit, Challenge, GoalMilestone, GoalStatus } from "@/lib/types";
import type { GoalPlanInfo } from "@/app/actions/goals/goalActions";
import {
  addMilestoneAction,
  toggleMilestoneAction,
  deleteMilestoneAction,
  updateGoalAction,
  deleteGoalAction,
  linkHabitAction,
  unlinkHabitAction,
  linkChallengeAction,
  unlinkChallengeAction,
} from "@/app/actions/goals/goalActions";
import {
  ArrowLeft, CheckCircle2, Circle, Plus, Trash2, Pencil, Lock,
  CalendarDays, Target, AlertTriangle, X, Flame, PauseCircle,
  Swords, BarChart2, Save,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CATEGORY_LABELS } from "../../_components/GoalCard";

// ── Progress ring ─────────────────────────────────────────────

function ProgressRing({ pct }: { pct: number }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);

  return (
    <svg width={120} height={120} viewBox="0 0 120 120" className="-rotate-90">
      <circle cx={60} cy={60} r={r} fill="none" stroke="currentColor" strokeWidth={8} className="text-surface-subtle" />
      <circle
        cx={60} cy={60} r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={8}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        className={`transition-all duration-700 ${pct === 100 ? "text-brand-forest" : "text-brand-forest/70"}`}
      />
    </svg>
  );
}

// ── Milestone item ────────────────────────────────────────────

function MilestoneItem({
  milestone,
  onToggle,
  onDelete,
  isPending,
}: {
  milestone: GoalMilestone;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  isPending: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition ${
      milestone.completed
        ? "border-brand-forest/20 bg-accent-subtle/30"
        : "border-border-subtle bg-surface-card"
    }`}>
      <button
        type="button"
        disabled={isPending}
        onClick={() => onToggle(milestone.id!, !milestone.completed)}
        className="shrink-0 text-text-muted transition hover:text-brand-forest disabled:opacity-50"
        aria-label={milestone.completed ? "Desmarcar" : "Completar"}
      >
        {milestone.completed
          ? <CheckCircle2 className="size-5 text-brand-forest" strokeWidth={2.5} />
          : <Circle className="size-5" strokeWidth={1.75} />}
      </button>
      <span className={`flex-1 text-sm font-medium ${milestone.completed ? "line-through text-text-muted" : "text-text-primary"}`}>
        {milestone.title}
      </span>
      {milestone.due_date && !milestone.completed && (
        <span className="text-[10px] text-text-muted tabular-nums">
          <CalendarDays className="inline size-3 mr-0.5" strokeWidth={2} />
          {new Date(milestone.due_date).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
        </span>
      )}
      <button
        type="button"
        disabled={isPending}
        onClick={() => onDelete(milestone.id!)}
        className="shrink-0 text-text-muted transition hover:text-red-400 disabled:opacity-50"
        aria-label="Eliminar hito"
      >
        <Trash2 className="size-3.5" strokeWidth={2} />
      </button>
    </div>
  );
}

// ── Add milestone form ────────────────────────────────────────

function AddMilestoneForm({
  goalId,
  userId,
  limitMessage,
  atLimit,
  onAdded,
}: {
  goalId: string;
  userId: string;
  limitMessage?: string;
  atLimit: boolean;
  onAdded: () => void;
}) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await addMilestoneAction(goalId, userId, title, dueDate || undefined);
      if (!res.success) { setError((res as any).error ?? "Error"); return; }
      setTitle(""); setDueDate(""); setOpen(false);
      router.refresh();
      onAdded();
    });
  }

  if (atLimit) {
    return (
      <div className="rounded-xl border border-border-subtle bg-surface-muted px-4 py-3 text-xs text-text-muted">
        <Lock className="inline size-3.5 mr-1.5" strokeWidth={2} />
        {limitMessage ?? "Límite de hitos alcanzado."}
      </div>
    );
  }

  return open ? (
    <form onSubmit={handleSubmit} className="space-y-2 rounded-xl border border-brand-forest/20 bg-accent-subtle/20 p-4">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título del hito"
        className="w-full rounded-xl border border-border-default bg-surface-card px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand-forest/40"
        disabled={isPending}
      />
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        className="w-full rounded-xl border border-border-default bg-surface-card px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-forest/40"
        disabled={isPending}
        min={new Date().toISOString().split("T")[0]}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={isPending || !title.trim()} className="flex-1 min-h-9 rounded-xl bg-brand-forest text-xs font-bold text-brand-forest-fg transition hover:brightness-110 disabled:opacity-50">
          {isPending ? "Guardando…" : "Agregar"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="min-h-9 rounded-xl border border-border-default px-3 text-xs text-text-secondary">
          Cancelar
        </button>
      </div>
    </form>
  ) : (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="flex w-full items-center gap-2 rounded-xl border border-dashed border-border-default px-4 py-3 text-xs font-bold text-text-muted transition hover:border-brand-forest/30 hover:text-brand-forest"
    >
      <Plus className="size-4" strokeWidth={2.5} /> Agregar hito
    </button>
  );
}

// ── Status badge ──────────────────────────────────────────────

const STATUS_CONFIG: Record<GoalStatus, { label: string; cls: string }> = {
  active:    { label: "Activa",     cls: "border-brand-forest/30 bg-accent-subtle text-brand-forest" },
  completed: { label: "Completada", cls: "border-brand-forest/20 bg-brand-forest/10 text-brand-forest" },
  paused:    { label: "Pausada",    cls: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400" },
  abandoned: { label: "Abandonada", cls: "border-border-default bg-surface-muted text-text-muted" },
};

// ── Main ──────────────────────────────────────────────────────

export default function GoalDetailClient({
  goal,
  planInfo,
  habits,
  challenges,
  userId,
}: {
  goal: GoalDetail;
  planInfo: GoalPlanInfo;
  habits: Habit[];
  challenges: Challenge[];
  userId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState(goal.title);
  const [editWhy, setEditWhy] = useState(goal.why ?? "");
  const [editDesc, setEditDesc] = useState(goal.description ?? "");
  const [editProgress, setEditProgress] = useState(goal.progress_manual ?? 0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { goalLinking, limits } = planInfo;

  const hasMilestones = goal.milestones.length > 0;
  const progressPct = hasMilestones
    ? Math.round((goal.milestones.filter((m) => m.completed).length / goal.milestones.length) * 100)
    : (goal.progress_manual ?? 0);

  const daysRemaining = goal.target_date
    ? Math.ceil((new Date(goal.target_date).getTime() - Date.now()) / 86_400_000)
    : null;
  const isOverdue = daysRemaining !== null && daysRemaining < 0 && goal.status === "active";
  const status = STATUS_CONFIG[goal.status] ?? STATUS_CONFIG.active;

  function mutate<T>(fn: () => Promise<{ success: boolean; error?: string } | T>) {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await fn() as any;
      if (res && !res.success) { setErrorMsg(res.error ?? "Error"); return; }
      router.refresh();
    });
  }

  function handleSaveEdit() {
    if (!editTitle.trim()) { setErrorMsg("El título es obligatorio."); return; }
    mutate(() => updateGoalAction(goal.id!, userId, {
      title: editTitle,
      description: editDesc,
      why: editWhy,
      ...(hasMilestones ? {} : { progress_manual: editProgress }),
    }));
    setEditMode(false);
  }

  function handleStatusChange(status: GoalStatus) {
    mutate(() => updateGoalAction(goal.id!, userId, { status }));
  }

  function handleDelete() {
    mutate(async () => {
      const res = await deleteGoalAction(goal.id!, userId);
      if (res.success) router.push("/metas");
      return res;
    });
  }

  const inputCls = "w-full rounded-xl border border-border-default bg-surface-muted px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none transition focus:border-brand-forest/40";

  return (
    <div className="space-y-8">
      {/* back + actions bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/metas" className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted transition hover:text-text-primary">
          <ArrowLeft className="size-4" strokeWidth={2} /> Mis metas
        </Link>
        <div className="flex items-center gap-2">
          {!editMode ? (
            <button type="button" onClick={() => setEditMode(true)} className="flex items-center gap-1.5 rounded-xl border border-border-default px-3 py-2 text-xs font-bold text-text-secondary transition hover:bg-surface-muted">
              <Pencil className="size-3.5" strokeWidth={2} /> Editar
            </button>
          ) : (
            <>
              <button type="button" onClick={handleSaveEdit} disabled={isPending} className="flex items-center gap-1.5 rounded-xl border border-brand-forest/30 bg-accent-subtle px-3 py-2 text-xs font-bold text-brand-forest transition hover:bg-brand-forest/15 disabled:opacity-50">
                <Save className="size-3.5" strokeWidth={2.5} /> Guardar
              </button>
              <button type="button" onClick={() => { setEditMode(false); setErrorMsg(null); }} className="flex items-center gap-1.5 rounded-xl border border-border-default px-3 py-2 text-xs font-bold text-text-secondary transition hover:bg-surface-muted">
                <X className="size-3.5" strokeWidth={2} /> Cancelar
              </button>
            </>
          )}
          {!confirmDelete ? (
            <button type="button" onClick={() => setConfirmDelete(true)} className="flex items-center gap-1.5 rounded-xl border border-border-default px-3 py-2 text-xs font-bold text-text-muted transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400">
              <Trash2 className="size-3.5" strokeWidth={2} /> Eliminar
            </button>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/8 px-3 py-2">
              <AlertTriangle className="size-3.5 text-red-400" strokeWidth={2} />
              <span className="text-xs text-red-300">¿Eliminar?</span>
              <button type="button" onClick={handleDelete} disabled={isPending} className="text-xs font-bold text-red-400 hover:underline">Sí</button>
              <button type="button" onClick={() => setConfirmDelete(false)} className="text-xs text-text-muted hover:underline">No</button>
            </div>
          )}
        </div>
      </div>

      {/* error */}
      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-xs text-red-300">
          <AlertTriangle className="size-4 shrink-0" strokeWidth={2} /> {errorMsg}
        </div>
      )}

      {/* main card */}
      <div className="rounded-2xl border border-border-subtle bg-surface-card p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
          {/* progress ring */}
          <div className="relative flex shrink-0 flex-col items-center gap-1">
            <ProgressRing pct={progressPct} />
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black tabular-nums text-text-primary">{progressPct}%</span>
              <span className="text-[10px] font-bold text-text-muted">progreso</span>
            </div>
          </div>

          {/* info */}
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-border-subtle bg-surface-muted px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-text-muted">
                {CATEGORY_LABELS[goal.category] ?? goal.category}
              </span>
              <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${status.cls}`}>
                {status.label}
              </span>
            </div>

            {editMode ? (
              <div className="space-y-3">
                <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Título" className={inputCls} />
                <input value={editWhy} onChange={(e) => setEditWhy(e.target.value)} placeholder="¿Por qué?" className={inputCls} />
                <textarea rows={2} value={editDesc} onChange={(e) => setEditDesc(e.target.value)} placeholder="Descripción" className={`${inputCls} resize-none`} />
                {!hasMilestones && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Progreso manual: {editProgress}%</label>
                    <input type="range" min={0} max={100} value={editProgress} onChange={(e) => setEditProgress(Number(e.target.value))} className="w-full accent-brand-forest" />
                  </div>
                )}
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-black tracking-tight text-text-primary">{goal.title}</h1>
                {goal.why && <p className="text-sm italic text-text-muted">"{goal.why}"</p>}
                {goal.description && <p className="text-sm text-text-secondary">{goal.description}</p>}
              </>
            )}

            {/* quick stats */}
            <div className="flex flex-wrap gap-4 text-xs text-text-muted">
              {daysRemaining !== null && (
                <span className={`flex items-center gap-1 font-medium ${isOverdue ? "text-red-400" : daysRemaining <= 7 ? "text-yellow-400" : ""}`}>
                  {isOverdue ? <AlertTriangle className="size-3.5" strokeWidth={2.5} /> : daysRemaining <= 7 ? <Flame className="size-3.5" strokeWidth={2} /> : <CalendarDays className="size-3.5" strokeWidth={2} />}
                  {isOverdue
                    ? `Vencida hace ${Math.abs(daysRemaining)} día${Math.abs(daysRemaining) !== 1 ? "s" : ""}`
                    : daysRemaining === 0 ? "Vence hoy"
                    : `${daysRemaining} día${daysRemaining !== 1 ? "s" : ""} restante${daysRemaining !== 1 ? "s" : ""}`}
                </span>
              )}
              {hasMilestones && (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="size-3.5" strokeWidth={2} />
                  {goal.milestones.filter((m) => m.completed).length}/{goal.milestones.length} hitos
                </span>
              )}
            </div>
          </div>
        </div>

        {/* status actions */}
        {goal.status === "active" && (
          <div className="mt-6 flex flex-wrap gap-2 border-t border-border-subtle pt-5">
            <button type="button" onClick={() => handleStatusChange("completed")} disabled={isPending} className="flex items-center gap-1.5 rounded-xl border border-brand-forest/30 bg-brand-forest/10 px-3 py-2 text-xs font-bold text-brand-forest transition hover:bg-brand-forest/20 disabled:opacity-50">
              <CheckCircle2 className="size-3.5" strokeWidth={2.5} /> Marcar como completada
            </button>
            <button type="button" onClick={() => handleStatusChange("paused")} disabled={isPending} className="flex items-center gap-1.5 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-xs font-bold text-yellow-400 transition hover:bg-yellow-500/20 disabled:opacity-50">
              <PauseCircle className="size-3.5" strokeWidth={2} /> Pausar
            </button>
            <button type="button" onClick={() => handleStatusChange("abandoned")} disabled={isPending} className="flex items-center gap-1.5 rounded-xl border border-border-default px-3 py-2 text-xs font-bold text-text-muted transition hover:bg-surface-muted disabled:opacity-50">
              <X className="size-3.5" strokeWidth={2} /> Abandonar
            </button>
          </div>
        )}
        {(goal.status === "paused" || goal.status === "abandoned") && (
          <div className="mt-5 border-t border-border-subtle pt-5">
            <button type="button" onClick={() => handleStatusChange("active")} disabled={isPending} className="flex items-center gap-1.5 rounded-xl border border-brand-forest/30 bg-accent-subtle px-3 py-2 text-xs font-bold text-brand-forest transition hover:bg-brand-forest/15 disabled:opacity-50">
              <Target className="size-3.5" strokeWidth={2} /> Reactivar meta
            </button>
          </div>
        )}
      </div>

      {/* milestones */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-text-primary">
            Hitos <span className="text-sm font-normal text-text-muted ml-1">({goal.milestones.length}/{limits.goalMilestones === Infinity ? "∞" : limits.goalMilestones})</span>
          </h2>
        </div>

        {goal.milestones.length > 0 && (
          <div className="space-y-2">
            {goal.milestones.map((m) => (
              <MilestoneItem
                key={m.id}
                milestone={m}
                isPending={isPending}
                onToggle={(id, completed) => mutate(() => toggleMilestoneAction(id, completed))}
                onDelete={(id) => mutate(() => deleteMilestoneAction(id))}
              />
            ))}
          </div>
        )}

        {goal.status === "active" && (
          <AddMilestoneForm
            goalId={goal.id!}
            userId={userId}
            atLimit={goal.milestones.length >= (limits.goalMilestones === Infinity ? Infinity : limits.goalMilestones)}
            limitMessage={`Máximo ${limits.goalMilestones} hitos en tu plan actual.`}
            onAdded={() => router.refresh()}
          />
        )}
      </section>

      {/* linked habits */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <BarChart2 className="size-5 text-brand-forest" strokeWidth={2} />
          <h2 className="text-lg font-black text-text-primary">Hábitos vinculados</h2>
          {!goalLinking && <Lock className="size-4 text-text-muted" strokeWidth={2} />}
        </div>

        {!goalLinking ? (
          <div className="rounded-xl border border-border-subtle bg-surface-muted px-4 py-3 text-xs text-text-muted">
            Vincular hábitos a tus metas es una función exclusiva del plan Pro.
          </div>
        ) : (
          <>
            {goal.linkedHabits.length > 0 && (
              <div className="space-y-2">
                {goal.linkedHabits.map((gh) => (
                  <div key={gh.id} className="flex items-center gap-3 rounded-xl border border-border-subtle bg-surface-card px-4 py-3">
                    <BarChart2 className="size-4 text-brand-forest" strokeWidth={2} />
                    <span className="flex-1 text-sm font-medium text-text-primary">{gh.habit?.title ?? "Hábito"}</span>
                    <button type="button" disabled={isPending} onClick={() => mutate(() => unlinkHabitAction(gh.id!))} className="text-text-muted transition hover:text-red-400 disabled:opacity-50">
                      <X className="size-4" strokeWidth={2} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {goal.status === "active" && habits.filter((h) => !goal.linkedHabits.some((gh) => gh.habit_id === h.id)).length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Agregar hábito</p>
                <div className="flex flex-wrap gap-2">
                  {habits.filter((h) => !goal.linkedHabits.some((gh) => gh.habit_id === h.id)).map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      disabled={isPending}
                      onClick={() => mutate(() => linkHabitAction(goal.id!, h.id!, userId))}
                      className="flex items-center gap-1.5 rounded-xl border border-dashed border-border-default px-3 py-2 text-xs font-medium text-text-secondary transition hover:border-brand-forest/30 hover:text-brand-forest disabled:opacity-50"
                    >
                      <Plus className="size-3.5" strokeWidth={2.5} /> {h.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* linked challenges */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Swords className="size-5 text-brand-forest" strokeWidth={2} />
          <h2 className="text-lg font-black text-text-primary">Retos vinculados</h2>
          {!goalLinking && <Lock className="size-4 text-text-muted" strokeWidth={2} />}
        </div>

        {!goalLinking ? (
          <div className="rounded-xl border border-border-subtle bg-surface-muted px-4 py-3 text-xs text-text-muted">
            Vincular retos a tus metas es una función exclusiva del plan Pro.
          </div>
        ) : (
          <>
            {goal.linkedChallenges.length > 0 && (
              <div className="space-y-2">
                {goal.linkedChallenges.map((gc) => {
                  const ch = challenges.find((c) => c.id === gc.challenge_id);
                  return (
                    <div key={gc.id} className="flex items-center gap-3 rounded-xl border border-border-subtle bg-surface-card px-4 py-3">
                      <Swords className="size-4 text-brand-forest" strokeWidth={2} />
                      <span className="flex-1 text-sm font-medium text-text-primary">{ch?.title ?? "Reto"}</span>
                      <button type="button" disabled={isPending} onClick={() => mutate(() => unlinkChallengeAction(gc.id!))} className="text-text-muted transition hover:text-red-400">
                        <X className="size-4" strokeWidth={2} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            {goal.status === "active" && challenges.filter((c) => !goal.linkedChallenges.some((gc) => gc.challenge_id === c.id)).length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Agregar reto</p>
                <div className="flex flex-wrap gap-2">
                  {challenges.filter((c) => !goal.linkedChallenges.some((gc) => gc.challenge_id === c.id)).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      disabled={isPending}
                      onClick={() => mutate(() => linkChallengeAction(goal.id!, c.id!, userId))}
                      className="flex items-center gap-1.5 rounded-xl border border-dashed border-border-default px-3 py-2 text-xs font-medium text-text-secondary transition hover:border-brand-forest/30 hover:text-brand-forest disabled:opacity-50"
                    >
                      <Plus className="size-3.5" strokeWidth={2.5} /> {c.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
