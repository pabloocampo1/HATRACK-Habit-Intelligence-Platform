"use client";

import { saveHabitLog } from "@/app/actions/habitLogsActions";
import { Habit, HabitLog } from "@/lib/types";
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Zap,
  Clock,
  Star,
  Brain,
  StickyNote,
  BarChart2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

// ── helpers ─────────────────────────────────────────────────

const MENTAL_STATES = [
  { value: "focused", label: "Enfocado" },
  { value: "motivated", label: "Motivado" },
  { value: "distracted", label: "Distraído" },
  { value: "tired", label: "Cansado" },
  { value: "stressed", label: "Estresado" },
];

const CATEGORY_COLORS: Record<string, string> = {
  fitness: "text-orange-400",
  programming: "text-blue-400",
  reading: "text-purple-400",
  learning: "text-yellow-400",
  languages: "text-pink-400",
  health: "text-emerald-400",
  productivity: "text-cyan-400",
  meditation: "text-indigo-400",
  finance: "text-lime-400",
  social: "text-rose-400",
  other: "text-text-muted",
};

function ScoreButtons({
  value,
  onChange,
  max = 5,
}: {
  value: number;
  onChange: (v: number) => void;
  max?: number;
}) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`flex-1 rounded-lg py-2 text-sm font-black transition ${
            value === n
              ? "bg-brand-forest text-brand-forest-fg"
              : "border border-border-default bg-surface-muted text-text-muted hover:border-brand-forest/40 hover:text-text-primary"
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

// ── Log form (inline panel) ──────────────────────────────────

function LogForm({
  habit,
  userId,
  onDone,
  onCancel,
}: {
  habit: Habit;
  userId: string;
  onDone: () => void;
  onCancel: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [minutes, setMinutes] = useState(habit.target_minutes ?? 0);
  const [quality, setQuality] = useState(4);
  const [energy, setEnergy] = useState(3);
  const [mental, setMental] = useState("focused");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await saveHabitLog(
        habit.id ?? "",
        {
          minutes_completed: minutes,
          quality_score: quality,
          completed: minutes > 0,
          notes: notes.trim() || undefined,
          daily_focus: undefined,
          energy_level: energy,
          mental_state: mental,
        },
        userId,
      );
      if (!res.success) {
        setError(res.error ?? "Error al registrar.");
        return;
      }
      router.refresh();
      onDone();
    });
  }

  const labelCls =
    "text-[10px] font-bold uppercase tracking-widest text-text-muted";

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 space-y-4 rounded-2xl border border-brand-forest/20 bg-accent-subtle/30 p-5"
    >
      {/* Minutes */}
      <div className="space-y-1.5">
        <label className={labelCls}>
          <Clock className="inline size-3 mr-1" strokeWidth={2.5} />
          Minutos dedicados
        </label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={0}
            max={600}
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
            className="w-24 rounded-xl border border-border-default bg-surface-card px-3 py-2 text-center text-lg font-black text-text-primary outline-none focus:border-brand-forest/50"
          />
          <span className="text-sm text-text-muted">
            meta: {habit.target_minutes} min
          </span>
          {habit.target_minutes > 0 && (
            <span className="ml-auto rounded-full border border-brand-forest/20 bg-brand-forest/10 px-2 py-0.5 text-[10px] font-black text-brand-forest">
              {Math.round((minutes / habit.target_minutes) * 100)}%
            </span>
          )}
        </div>
      </div>

      {/* Quality */}
      <div className="space-y-1.5">
        <label className={labelCls}>
          <Star className="inline size-3 mr-1" strokeWidth={2.5} />
          Calidad (1–5)
        </label>
        <ScoreButtons value={quality} onChange={setQuality} />
      </div>

      {/* Energy */}
      <div className="space-y-1.5">
        <label className={labelCls}>
          <Zap className="inline size-3 mr-1" strokeWidth={2.5} />
          Energía (1–5)
        </label>
        <ScoreButtons value={energy} onChange={setEnergy} />
      </div>

      {/* Mental state */}
      <div className="space-y-1.5">
        <label className={labelCls}>
          <Brain className="inline size-3 mr-1" strokeWidth={2.5} />
          Estado mental
        </label>
        <div className="flex flex-wrap gap-1.5">
          {MENTAL_STATES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setMental(s.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                mental === s.value
                  ? "bg-brand-forest text-brand-forest-fg"
                  : "border border-border-default bg-surface-muted text-text-secondary hover:border-brand-forest/30"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <label className={labelCls}>
          <StickyNote className="inline size-3 mr-1" strokeWidth={2.5} />
          Notas (opcional)
        </label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="¿Algo relevante de esta sesión?"
          className="w-full resize-none rounded-xl border border-border-default bg-surface-card px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand-forest/40"
        />
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 min-h-11 rounded-xl bg-brand-forest text-sm font-bold text-brand-forest-fg hover:brightness-110 transition disabled:opacity-50"
        >
          {isPending ? "Guardando…" : "Registrar sesión"}
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={onCancel}
          className="min-h-11 rounded-xl border border-border-default px-4 text-sm font-bold text-text-secondary hover:bg-surface-muted transition"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

// ── Habit card ───────────────────────────────────────────────

function HabitCard({
  habit,
  logs,
  userId,
}: {
  habit: Habit;
  logs: HabitLog[];
  userId: string;
}) {
  const [open, setOpen] = useState(false);

  const todayLogs = logs.filter((l) => l.habit_id === habit.id);
  const completedCount = todayLogs.filter((l) => l.completed).length;
  const totalMinutes = todayLogs.reduce(
    (s, l) => s + (l.minutes_completed ?? 0),
    0,
  );
  const isDone = completedCount > 0;
  const catColor = CATEGORY_COLORS[habit.category] ?? "text-text-muted";

  return (
    <article
      className={`rounded-2xl border transition-all ${
        isDone
          ? "border-brand-forest/30 bg-accent-subtle/40"
          : "border-border-subtle bg-surface-card"
      }`}
    >
      {/* Main row */}
      <div className="flex items-start gap-4 p-4">
        {/* Done indicator */}
        <div
          className={`mt-0.5 shrink-0 ${isDone ? "text-brand-forest" : "text-text-muted"}`}
        >
          {isDone ? (
            <CheckCircle2 className="size-5" strokeWidth={2.5} />
          ) : (
            <Circle className="size-5" strokeWidth={1.75} />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[9px] font-bold uppercase tracking-widest ${catColor}`}>
              {habit.category}
            </span>
            {isDone && (
              <span className="rounded-full border border-brand-forest/20 bg-brand-forest/10 px-2 py-0.5 text-[9px] font-black text-brand-forest">
                {totalMinutes} min · ×{completedCount}
              </span>
            )}
          </div>
          <p
            className={`mt-0.5 font-bold tracking-tight ${isDone ? "text-brand-forest" : "text-text-primary"}`}
          >
            {habit.title}
          </p>
          <p className="mt-0.5 text-xs text-text-muted">
            Meta: {habit.target_minutes} min · {habit.frequency}×/sem
          </p>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={`flex min-h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-bold transition ${
              open
                ? "border-brand-forest/40 bg-brand-forest text-brand-forest-fg"
                : "border-border-default text-text-secondary hover:border-brand-forest/30 hover:text-brand-forest"
            }`}
          >
            {open ? (
              <>
                <ChevronUp className="size-3.5" strokeWidth={2.5} /> Cerrar
              </>
            ) : (
              <>
                <ChevronDown className="size-3.5" strokeWidth={2.5} />
                {isDone ? "Otra sesión" : "Registrar"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Inline log form */}
      {open && (
        <div className="px-4 pb-4">
          <LogForm
            habit={habit}
            userId={userId}
            onDone={() => setOpen(false)}
            onCancel={() => setOpen(false)}
          />
        </div>
      )}
    </article>
  );
}

// ── Daily summary ────────────────────────────────────────────

function DailySummary({
  habits,
  logs,
}: {
  habits: Habit[];
  logs: HabitLog[];
}) {
  if (logs.length === 0) return null;

  const completedHabits = habits.filter((h) =>
    logs.some((l) => l.habit_id === h.id && l.completed),
  );
  const totalMinutes = logs.reduce((s, l) => s + (l.minutes_completed ?? 0), 0);
  const avgQuality =
    logs.length > 0
      ? (logs.reduce((s, l) => s + (l.quality_score ?? 0), 0) / logs.length).toFixed(1)
      : "—";

  return (
    <div className="mt-4 rounded-2xl border border-border-subtle bg-surface-muted p-5">
      <p className="mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">
        Resumen del día
      </p>
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Completados", value: `${completedHabits.length}/${habits.length}` },
          { label: "Minutos totales", value: `${totalMinutes}m` },
          { label: "Calidad media", value: `${avgQuality}/5` },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border-subtle bg-surface-card p-3 text-center">
            <p className="text-[9px] font-bold uppercase tracking-widest text-text-muted">{s.label}</p>
            <p className="mt-1 text-xl font-black tabular-nums text-text-primary">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Log rows */}
      <div className="mt-3 space-y-1.5">
        {logs.map((log, i) => {
          const habit = habits.find((h) => h.id === log.habit_id);
          if (!habit) return null;
          return (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl border border-border-subtle bg-surface-card px-4 py-2.5"
            >
              <CheckCircle2
                className={`size-4 shrink-0 ${log.completed ? "text-brand-forest" : "text-text-muted"}`}
                strokeWidth={2.5}
              />
              <span className="flex-1 text-sm font-medium text-text-primary truncate">
                {habit.title}
              </span>
              <span className="text-xs font-bold tabular-nums text-text-muted">
                {log.minutes_completed}m
              </span>
              <span className="text-xs font-bold text-text-muted">
                ★ {log.quality_score}/5
              </span>
              {log.mental_state && (
                <span className="hidden sm:block rounded-full border border-border-subtle bg-surface-muted px-2 py-0.5 text-[9px] font-bold text-text-muted capitalize">
                  {log.mental_state}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────

export default function HabitRegister({
  habitsProp = [],
  todayLogsProps = [],
  userId,
}: {
  habitsProp: Habit[];
  todayLogsProps: HabitLog[];
  userId: string;
}) {
  const completedCount = habitsProp.filter((h) =>
    todayLogsProps.some((l) => l.habit_id === h.id && l.completed),
  ).length;

  const pct =
    habitsProp.length > 0
      ? Math.round((completedCount / habitsProp.length) * 100)
      : 0;

  return (
    <section className="my-8 rounded-[2rem] border border-border-subtle bg-surface-card p-6 sm:p-10">
      {/* Header */}
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <div className="h-[2px] w-6 bg-brand-forest" />
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-forest/80">
              Check-in diario
            </p>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-text-primary">
            Registra tus sesiones de hoy
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            {habitsProp.length === 0
              ? "Crea hábitos en la sección Mis hábitos para empezar."
              : `${completedCount} de ${habitsProp.length} completado${habitsProp.length !== 1 ? "s" : ""} hoy`}
          </p>
        </div>

        {/* Progress ring / bar */}
        {habitsProp.length > 0 && (
          <div className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-surface-muted px-5 py-3">
            <BarChart2
              className={`size-5 ${pct === 100 ? "text-brand-forest" : "text-text-muted"}`}
              strokeWidth={2}
            />
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-text-muted">
                Progreso hoy
              </p>
              <p className="text-2xl font-black tabular-nums text-text-primary">
                {pct}%
              </p>
            </div>
            <div className="ml-2 h-10 w-1.5 overflow-hidden rounded-full bg-surface-subtle">
              <div
                className="w-full rounded-full bg-brand-forest transition-all duration-700"
                style={{ height: `${pct}%`, marginTop: `${100 - pct}%` }}
              />
            </div>
          </div>
        )}
      </header>

      {/* Perfect day banner */}
      {pct === 100 && habitsProp.length > 0 && (
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-brand-forest/30 bg-accent-subtle px-5 py-3">
          <CheckCircle2 className="size-5 text-brand-forest" strokeWidth={2.5} />
          <p className="text-sm font-bold text-brand-forest">
            ¡Día perfecto! Completaste todos tus hábitos de hoy 🎯
          </p>
        </div>
      )}

      {/* Habits list */}
      {habitsProp.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border-subtle py-12 text-center">
          <Circle className="mb-3 size-8 text-text-muted" strokeWidth={1.25} />
          <p className="text-sm font-semibold text-text-primary">Sin hábitos todavía</p>
          <p className="mt-1 text-xs text-text-muted">
            Ve a{" "}
            <a href="/habits" className="font-bold text-brand-forest underline underline-offset-2">
              Mis hábitos
            </a>{" "}
            y crea tu primera rutina.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {habitsProp.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              logs={todayLogsProps}
              userId={userId}
            />
          ))}
        </div>
      )}

      {/* Daily summary */}
      <DailySummary habits={habitsProp} logs={todayLogsProps} />

    </section>
  );
}
