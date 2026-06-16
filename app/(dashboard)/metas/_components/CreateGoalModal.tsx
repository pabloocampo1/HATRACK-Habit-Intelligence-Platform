"use client";

import { createGoalAction } from "@/app/actions/goals/goalActions";
import type { GoalCategory, GoalPriority } from "@/lib/types";
import { X, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState, useTransition } from "react";

const CATEGORIES: { value: GoalCategory; label: string }[] = [
  { value: "personal",      label: "Personal" },
  { value: "health",        label: "Salud" },
  { value: "fitness",       label: "Fitness" },
  { value: "learning",      label: "Aprendizaje" },
  { value: "career",        label: "Carrera" },
  { value: "finances",      label: "Finanzas" },
  { value: "relationships", label: "Relaciones" },
  { value: "other",         label: "Otro" },
];

const PRIORITIES: { value: GoalPriority; label: string; cls: string }[] = [
  { value: "high",   label: "Alta",  cls: "border-red-500/30 data-[selected=true]:bg-red-500/15 data-[selected=true]:text-red-400 data-[selected=true]:border-red-500/40" },
  { value: "medium", label: "Media", cls: "border-yellow-500/30 data-[selected=true]:bg-yellow-500/15 data-[selected=true]:text-yellow-400 data-[selected=true]:border-yellow-500/40" },
  { value: "low",    label: "Baja",  cls: "border-brand-forest/20 data-[selected=true]:bg-brand-forest/15 data-[selected=true]:text-brand-forest data-[selected=true]:border-brand-forest/40" },
];

export default function CreateGoalModal({
  open,
  onClose,
  userId,
}: {
  open: boolean;
  onClose: () => void;
  userId: string;
}) {
  const router = useRouter();
  const titleId = useId();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle]       = useState("");
  const [description, setDesc]  = useState("");
  const [why, setWhy]           = useState("");
  const [category, setCategory] = useState<GoalCategory>("personal");
  const [priority, setPriority] = useState<GoalPriority>("medium");
  const [targetDate, setDate]   = useState("");

  function reset() {
    setTitle(""); setDesc(""); setWhy("");
    setCategory("personal"); setPriority("medium"); setDate("");
    setError(null);
  }

  useEffect(() => { if (open) reset(); }, [open]);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [open]);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) { setError("El título es obligatorio."); return; }

    startTransition(async () => {
      const res = await createGoalAction(userId, {
        title, description, why, category, priority,
        target_date: targetDate || undefined,
      });

      if (!res.success) {
        setError((res as any).error ?? "Error al crear la meta.");
        return;
      }
      reset();
      onClose();
      router.refresh();
    });
  }

  const inputCls = "w-full rounded-xl border border-border-default bg-surface-muted px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none transition focus:border-brand-forest/50 focus:ring-2 focus:ring-brand-forest/15 disabled:opacity-50";
  const labelCls = "text-[10px] font-bold uppercase tracking-widest text-text-muted";

  return (
    <div
      className="dark fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-brand-scrim backdrop-blur-sm"
        aria-label="Cerrar"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex w-full max-w-xl flex-col rounded-[1.75rem] border border-border-subtle bg-surface-card shadow-2xl"
        style={{ maxHeight: "92dvh" }}
      >
        {/* header */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border-subtle px-6 py-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-forest/80">
              Nueva meta
            </p>
            <h2 id={titleId} className="mt-1.5 text-xl font-black tracking-tight text-text-primary">
              Define tu próximo objetivo
            </h2>
            <p className="mt-0.5 text-xs text-text-muted">
              Cuanto más claro lo defines, más fácil es lograrlo.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center rounded-xl border border-border-default p-2.5 text-text-muted transition hover:bg-surface-muted"
          >
            <X className="size-5" strokeWidth={2} />
          </button>
        </div>

        {/* form */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <form id="create-goal-form" onSubmit={handleSubmit} className="space-y-5">
            {/* title */}
            <div className="space-y-1.5">
              <label className={labelCls}>Título de la meta *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Ahorrar para mi primer viaje al exterior"
                className={inputCls}
                disabled={isPending}
                required
              />
            </div>

            {/* why */}
            <div className="space-y-1.5">
              <label className={labelCls}>¿Por qué quieres lograrlo?</label>
              <input
                value={why}
                onChange={(e) => setWhy(e.target.value)}
                placeholder="Tu motivación de fondo..."
                className={inputCls}
                disabled={isPending}
              />
              <p className="text-[10px] text-text-muted">
                Esta razón te va a recordar para qué lo haces en los momentos difíciles.
              </p>
            </div>

            {/* description */}
            <div className="space-y-1.5">
              <label className={labelCls}>Descripción (opcional)</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Detalles adicionales sobre esta meta..."
                className={`${inputCls} resize-none`}
                disabled={isPending}
              />
            </div>

            {/* category */}
            <div className="space-y-1.5">
              <label className={labelCls}>Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as GoalCategory)}
                className={inputCls}
                disabled={isPending}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value} className="bg-surface-card">
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* priority */}
            <div className="space-y-1.5">
              <label className={labelCls}>Prioridad</label>
              <div className="flex gap-2">
                {PRIORITIES.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    data-selected={priority === p.value}
                    onClick={() => setPriority(p.value)}
                    disabled={isPending}
                    className={`flex-1 rounded-xl border px-3 py-2.5 text-xs font-bold text-text-muted transition hover:border-border-strong hover:text-text-primary ${p.cls}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* target date */}
            <div className="space-y-1.5">
              <label className={labelCls}>Fecha límite (opcional)</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setDate(e.target.value)}
                className={inputCls}
                disabled={isPending}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            {error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3">
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-400" strokeWidth={2} />
                <p className="text-xs text-red-300">{error}</p>
              </div>
            )}
          </form>
        </div>

        {/* footer */}
        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-border-subtle px-6 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-xl border border-border-default px-5 py-3 text-[11px] font-black uppercase tracking-widest text-text-secondary transition hover:bg-surface-muted"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="create-goal-form"
            disabled={isPending}
            className="rounded-xl border border-brand-forest/40 bg-brand-forest px-5 py-3 text-[11px] font-black uppercase tracking-widest text-brand-forest-fg transition hover:brightness-110 disabled:opacity-50"
          >
            {isPending ? "Guardando…" : "Crear meta"}
          </button>
        </div>
      </div>
    </div>
  );
}
