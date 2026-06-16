"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { X, Plus, Trash2, Link2, Dumbbell, Lock } from "lucide-react";
import { createChallengeAction } from "@/app/actions/challenges/challengeActions";
import { CHALLENGE_DURATIONS, type ChallengeDuration, type Habit } from "@/lib/types";

const CATEGORIES = [
  { value: "health", label: "Salud" },
  { value: "focus", label: "Enfoque" },
  { value: "productivity", label: "Productividad" },
  { value: "fitness", label: "Fitness" },
  { value: "learning", label: "Aprendizaje" },
  { value: "other", label: "Otro" },
];

interface HabitRow {
  key: string;
  habit_id?: string;
  title: string;
  category: string;
  target_minutes: number;
  is_linked_habit: boolean;
}

export default function CreateChallengeModal({
  open,
  onClose,
  userId,
  existingHabits,
  challengeHabitLimit = Infinity,
}: {
  open: boolean;
  onClose: () => void;
  userId: string;
  existingHabits: Habit[];
  /** Max exclusive habits allowed per challenge for this user's plan */
  challengeHabitLimit?: number;
}) {
  const router = useRouter();
  const titleId = useId();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");
  const [duration, setDuration] = useState<ChallengeDuration>(30);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [habitRows, setHabitRows] = useState<HabitRow[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextKey = useRef(0);
  const newKey = () => String(nextKey.current++);

  const reset = useCallback(() => {
    setTitle(""); setDescription(""); setGoal(""); setDuration(30);
    setHabitRows([]); setError(null);
  }, []);

  useEffect(() => { if (open) reset(); }, [open, reset]);
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);
  useEffect(() => {
    if (open) { document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = ""; }; }
  }, [open]);

  if (!open) return null;

  function addLinkedHabit(habit: Habit) {
    if (!habit.id) return;
    if (habitRows.some((r) => r.habit_id === habit.id)) return;
    setHabitRows((prev) => [
      ...prev,
      {
        key: newKey(),
        habit_id: habit.id,
        title: habit.title,
        category: habit.category,
        target_minutes: habit.target_minutes,
        is_linked_habit: true,
      },
    ]);
  }

  function addNewHabit() {
    setHabitRows((prev) => [
      ...prev,
      { key: newKey(), title: "", category: "other", target_minutes: 25, is_linked_habit: false },
    ]);
  }

  function updateRow(key: string, patch: Partial<HabitRow>) {
    setHabitRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function removeRow(key: string) {
    setHabitRows((prev) => prev.filter((r) => r.key !== key));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) { setError("El título es obligatorio."); return; }
    if (!habitRows.length) { setError("Agrega al menos un hábito al reto."); return; }
    const emptyRow = habitRows.find((r) => !r.title.trim());
    if (emptyRow) { setError("Todos los hábitos deben tener un nombre."); return; }

    setSubmitting(true);
    try {
      const result = await createChallengeAction(userId, {
        title: title.trim(),
        description: description.trim() || undefined,
        goal: goal.trim() || undefined,
        duration_days: duration,
        start_date: startDate,
        habits: habitRows.map((r) => ({
          habit_id: r.habit_id,
          title: r.title,
          category: r.category,
          target_minutes: r.target_minutes,
          is_linked_habit: r.is_linked_habit,
        })),
      });
      if (!result.success) { setError(result.error); return; }
      reset();
      onClose();
      router.refresh();
    } catch { setError("Error de red. Intenta de nuevo."); }
    finally { setSubmitting(false); }
  }

  const labelCls = "block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1.5";
  const inputCls = "w-full rounded-xl border border-border-default bg-surface-muted px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none transition focus:border-brand-forest/50 focus:ring-2 focus:ring-brand-forest/15";

  return (
    <div className="dark fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center" role="presentation" aria-labelledby={titleId}>
      <button type="button" className="absolute inset-0 bg-brand-scrim backdrop-blur-sm" aria-label="Cerrar" onClick={onClose} />

      <div role="dialog" aria-modal="true" aria-labelledby={titleId}
        className="relative w-full max-w-2xl max-h-[92dvh] overflow-y-auto rounded-[1.75rem] border border-border-subtle bg-surface-card shadow-2xl">

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border-subtle bg-surface-card/95 backdrop-blur px-6 py-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-forest/80">Nuevo reto</p>
            <h2 id={titleId} className="mt-1 text-xl font-black tracking-tight text-text-primary">Crear reto personal</h2>
          </div>
          <button type="button" onClick={onClose}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-border-default text-text-muted hover:bg-surface-muted hover:text-text-primary transition">
            <X className="size-5" strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
          {/* Título */}
          <div>
            <label className={labelCls}>Título del reto</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej. Reto de 30 días sin azúcar" className={inputCls} disabled={submitting} />
          </div>

          {/* Descripción + meta */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Descripción (opcional)</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="¿De qué trata este reto?" className={`${inputCls} resize-none`} disabled={submitting} />
            </div>
            <div>
              <label className={labelCls}>Meta / objetivo</label>
              <textarea value={goal} onChange={(e) => setGoal(e.target.value)} rows={3} placeholder="¿Qué quieres lograr al terminar?" className={`${inputCls} resize-none`} disabled={submitting} />
            </div>
          </div>

          {/* Duración + fecha inicio */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Duración</label>
              <div className="flex flex-wrap gap-2">
                {CHALLENGE_DURATIONS.map((d) => (
                  <button key={d} type="button" onClick={() => setDuration(d)}
                    className={`rounded-xl border px-4 py-2 text-sm font-bold transition ${
                      duration === d
                        ? "border-brand-forest bg-brand-forest text-brand-forest-fg"
                        : "border-border-default bg-surface-muted text-text-secondary hover:border-brand-forest/40"
                    }`}>
                    {d} días
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelCls}>Fecha de inicio</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                className={`${inputCls} [color-scheme:dark]`} disabled={submitting} />
            </div>
          </div>

          {/* Hábitos del reto */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className={labelCls + " mb-0"}>Hábitos del reto</label>
              <span className="text-[11px] text-text-muted">{habitRows.length} hábito{habitRows.length !== 1 ? "s" : ""}</span>
            </div>

            {/* Vincular hábito existente */}
            {existingHabits.length > 0 && (
              <div className="rounded-xl border border-border-subtle bg-surface-muted p-3">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-text-muted flex items-center gap-1.5">
                  <Link2 className="size-3" /> Agregar de mis hábitos
                </p>
                <div className="flex flex-wrap gap-2">
                  {existingHabits.map((h) => {
                    const already = habitRows.some((r) => r.habit_id === h.id);
                    return (
                      <button key={h.id} type="button" onClick={() => addLinkedHabit(h)} disabled={already || submitting}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                          already ? "border-brand-forest/30 bg-accent-subtle text-brand-forest opacity-60" : "border-border-default bg-surface-card text-text-secondary hover:border-brand-forest/40 hover:text-text-primary"
                        }`}>
                        {h.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Filas de hábitos */}
            {habitRows.map((row) => (
              <div key={row.key} className={`rounded-xl border p-4 space-y-3 ${row.is_linked_habit ? "border-brand-forest/25 bg-accent-subtle/40" : "border-border-subtle bg-surface-muted"}`}>
                <div className="flex items-center gap-2">
                  {row.is_linked_habit ? (
                    <Link2 className="size-4 text-brand-forest shrink-0" />
                  ) : (
                    <Dumbbell className="size-4 text-text-muted shrink-0" />
                  )}
                  <input value={row.title} onChange={(e) => updateRow(row.key, { title: e.target.value })}
                    placeholder="Nombre del hábito" disabled={row.is_linked_habit || submitting}
                    className={`flex-1 rounded-lg border border-border-default bg-surface-card px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none transition focus:border-brand-forest/40 ${row.is_linked_habit ? "opacity-70" : ""}`} />
                  <button type="button" onClick={() => removeRow(row.key)}
                    className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition">
                    <Trash2 className="size-4" />
                  </button>
                </div>
                {!row.is_linked_habit && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`${labelCls} text-[9px]`}>Categoría</label>
                      <select value={row.category} onChange={(e) => updateRow(row.key, { category: e.target.value })}
                        className="w-full rounded-lg border border-border-default bg-surface-card px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-forest/40">
                        {CATEGORIES.map((c) => <option key={c.value} value={c.value} className="bg-surface-card">{c.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={`${labelCls} text-[9px]`}>Min objetivo / día</label>
                      <input type="number" min={0} max={600} value={row.target_minutes}
                        onChange={(e) => updateRow(row.key, { target_minutes: Number(e.target.value) })}
                        className="w-full rounded-lg border border-border-default bg-surface-card px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-forest/40" />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {(() => {
              const exclusiveCount = habitRows.filter((r) => !r.is_linked_habit).length;
              const exclusiveAtLimit = exclusiveCount >= challengeHabitLimit;
              return (
                <button type="button" onClick={addNewHabit} disabled={submitting || exclusiveAtLimit}
                  title={exclusiveAtLimit ? `Límite de ${challengeHabitLimit} hábitos exclusivos por reto en tu plan` : undefined}
                  className={`w-full flex min-h-11 items-center justify-center gap-2 rounded-xl border border-dashed text-sm font-medium transition ${
                    exclusiveAtLimit
                      ? "cursor-not-allowed border-border-subtle text-text-muted opacity-50"
                      : "border-border-default text-text-muted hover:border-brand-forest/40 hover:text-brand-forest hover:bg-accent-subtle/40"
                  }`}>
                  {exclusiveAtLimit ? <Lock className="size-4" /> : <Plus className="size-4" />}
                  {exclusiveAtLimit ? `Límite de ${challengeHabitLimit} hábitos exclusivos alcanzado` : "Nuevo hábito solo para este reto"}
                </button>
              );
            })()}
          </div>

          {/* Error */}
          {error && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-medium text-red-400">{error}</p>
          )}

          {/* Acciones */}
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} disabled={submitting}
              className="min-h-11 rounded-xl border border-border-default px-5 text-sm font-bold text-text-secondary hover:bg-surface-muted transition">
              Cancelar
            </button>
            <button type="submit" disabled={submitting}
              className="min-h-11 rounded-xl border border-brand-forest/40 bg-brand-forest px-6 text-sm font-bold text-brand-forest-fg hover:brightness-110 transition disabled:opacity-50">
              {submitting ? "Creando…" : "Crear reto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
