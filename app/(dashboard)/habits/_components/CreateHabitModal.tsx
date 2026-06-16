"use client";

import { save } from "@/app/actions/habitActions";
import type { CreateHabitPayload } from "@/lib/types";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useState } from "react";

const CATEGORIES: { value: string; label: string }[] = [
  { value: "health", label: "Salud" },
  { value: "focus", label: "Enfoque" },
  { value: "productivity", label: "Productividad" },
  { value: "fitness", label: "Fitness" },
  { value: "learning", label: "Aprendizaje" },
  { value: "other", label: "Otro" },
];

type Props = {
  open: boolean;
  onClose: () => void;
  userId: string;
};

export default function CreateHabitModal({ open, onClose, userId }: Props) {
  const router = useRouter();
  const titleId = useId();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("other");
  const [frequency, setFrequency] = useState("5");
  const [targetMinutes, setTargetMinutes] = useState("25");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setTitle("");
    setDescription("");
    setCategory("other");
    setFrequency("5");
    setTargetMinutes("25");
    setError(null);
  }, []);

  useEffect(() => {
    if (!open) return;
    reset();
  }, [open, reset]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const freq = Number.parseInt(frequency, 10);
    const mins = Number.parseInt(targetMinutes, 10);

    if (!title.trim()) {
      setError("El título es obligatorio.");
      return;
    }
    if (!Number.isFinite(freq) || freq < 1) {
      setError("La frecuencia debe ser un entero mayor o igual a 1.");
      return;
    }
    if (!Number.isFinite(mins) || mins < 1) {
      setError("Los minutos objetivo deben ser al menos 1.");
      return;
    }

    const payload: CreateHabitPayload = {
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      frequency: freq,
      target_minutes: mins,
    };

    setSubmitting(true);
    try {
      const result = await save(payload, userId);
      if (!result || typeof result !== "object" || !("success" in result)) {
        setError("Respuesta inesperada del servidor.");
        return;
      }
      if (!result.success) {
        setError(
          "error" in result && typeof result.error === "string"
            ? result.error
            : "No se pudo crear el hábito.",
        );
        return;
      }
      reset();
      onClose();
      router.refresh();
    } catch {
      setError("Error de red. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="dark fixed inset-0 z-[100] flex items-center justify-center p-4"
      aria-labelledby={titleId}
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
        className="relative w-full max-w-lg rounded-[1.75rem] border border-border-subtle bg-surface-card shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border-subtle px-6 py-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-forest/80">
              Nuevo hábito
            </p>
            <h2 id={titleId} className="mt-2 text-xl font-black tracking-tight text-text-primary">
              Crear en tu cuenta
            </h2>
            <p className="mt-1 text-xs font-medium text-text-muted">
              Coincide con tu tabla: título, descripción, categoría, frecuencia y minutos.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border-default p-2 text-text-muted transition hover:border-border-strong hover:bg-surface-muted hover:text-text-primary"
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
          <div>
            <label htmlFor="habit-title" className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
              Título
            </label>
            <input
              id="habit-title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border-default bg-surface-muted px-4 py-3 text-sm font-medium text-text-primary placeholder:text-text-muted outline-none transition focus:border-brand-forest/50 focus:ring-2 focus:ring-brand-forest/20"
              placeholder="Ej. Lectura matutina"
              autoComplete="off"
              disabled={submitting}
            />
          </div>

          <div>
            <label
              htmlFor="habit-description"
              className="text-[10px] font-bold uppercase tracking-widest text-text-muted"
            >
              Descripción (opcional)
            </label>
            <textarea
              id="habit-description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1.5 w-full resize-none rounded-xl border border-border-default bg-surface-muted px-4 py-3 text-sm font-medium text-text-primary placeholder:text-text-muted outline-none transition focus:border-brand-forest/50 focus:ring-2 focus:ring-brand-forest/20"
              placeholder="Notas o contexto del hábito"
              disabled={submitting}
            />
          </div>

          <div>
            <label htmlFor="habit-category" className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
              Categoría
            </label>
            <select
              id="habit-category"
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border-default bg-surface-muted px-4 py-3 text-sm font-medium text-text-primary outline-none transition focus:border-brand-forest/50 focus:ring-2 focus:ring-brand-forest/20"
              disabled={submitting}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value} className="bg-surface-card">
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="habit-frequency"
                className="text-[10px] font-bold uppercase tracking-widest text-text-muted"
              >
                Frecuencia (por semana)
              </label>
              <input
                id="habit-frequency"
                name="frequency"
                type="number"
                min={1}
                max={21}
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-border-default bg-surface-muted px-4 py-3 text-sm font-medium text-text-primary outline-none transition focus:border-brand-forest/50 focus:ring-2 focus:ring-brand-forest/20"
                disabled={submitting}
              />
            </div>
            <div>
              <label
                htmlFor="habit-minutes"
                className="text-[10px] font-bold uppercase tracking-widest text-text-muted"
              >
                Minutos objetivo
              </label>
              <input
                id="habit-minutes"
                name="target_minutes"
                type="number"
                min={1}
                max={600}
                value={targetMinutes}
                onChange={(e) => setTargetMinutes(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-border-default bg-surface-muted px-4 py-3 text-sm font-medium text-text-primary outline-none transition focus:border-brand-forest/50 focus:ring-2 focus:ring-brand-forest/20"
                disabled={submitting}
              />
            </div>
          </div>

          {error ? (
            <p className="rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-xs font-medium text-red-200">
              {error}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border-default px-5 py-3 text-[11px] font-black uppercase tracking-widest text-text-secondary transition hover:bg-surface-muted hover:text-text-primary"
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-xl border border-brand-forest/40 bg-brand-forest px-5 py-3 text-[11px] font-black uppercase tracking-widest text-brand-forest-fg transition hover:brightness-110 disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? "Guardando…" : "Crear hábito"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
