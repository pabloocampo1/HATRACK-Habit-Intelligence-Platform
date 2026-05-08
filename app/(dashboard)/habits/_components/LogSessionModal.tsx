"use client";

import { saveHabitLog } from "@/app/actions/habitLogsActions";
import type { Habit, HabitLog } from "@/lib/types";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useState } from "react";

function todayLocalISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const MENTAL_OPTIONS = [
  { value: "", label: "Sin especificar" },
  { value: "enfocado", label: "Enfocado" },
  { value: "disperso", label: "Disperso" },
  { value: "cansado", label: "Cansado" },
  { value: "motivado", label: "Motivado" },
  { value: "neutral", label: "Neutral" },
];

type Props = {
  open: boolean;
  onClose: () => void;
  userId: string;
  habits: Habit[];
};

export default function LogSessionModal({ open, onClose, userId, habits }: Props) {
  const router = useRouter();
  const titleId = useId();
  const [habitId, setHabitId] = useState("");
  const [logDate, setLogDate] = useState(todayLocalISO);
  const [minutes, setMinutes] = useState("15");
  const [quality, setQuality] = useState("4");
  const [completed, setCompleted] = useState(true);
  const [notes, setNotes] = useState("");
  const [dailyFocus, setDailyFocus] = useState("");
  const [energyLevel, setEnergyLevel] = useState("");
  const [mentalState, setMentalState] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setHabitId(habits[0]?.id ?? "");
    setLogDate(todayLocalISO());
    setMinutes("15");
    setQuality("4");
    setCompleted(true);
    setNotes("");
    setDailyFocus("");
    setEnergyLevel("");
    setMentalState("");
    setError(null);
  }, [habits]);

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

  const hasHabits = habits.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!hasHabits) {
      setError("Crea al menos un hábito antes de registrar una sesión.");
      return;
    }

    if (!habitId) {
      setError("Selecciona un hábito.");
      return;
    }

    const mins = Number.parseInt(minutes, 10);
    const qual = Number.parseInt(quality, 10);

    if (!Number.isFinite(mins) || mins < 0) {
      setError("Los minutos deben ser un número válido (0 o más).");
      return;
    }
    if (!Number.isFinite(qual) || qual < 1 || qual > 5) {
      setError("La calidad debe estar entre 1 y 5.");
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(logDate)) {
      setError("La fecha no es válida.");
      return;
    }

    const payload: HabitLog = {
      log_date: logDate,
      minutes_completed: mins,
      quality_score: qual,
      completed: completed || mins > 0,
      notes: notes.trim() || undefined,
      daily_focus: dailyFocus.trim() || undefined,
      energy_level:
        energyLevel === "" ? undefined : Number.parseInt(energyLevel, 10),
      mental_state: mentalState || undefined,
    };

    setSubmitting(true);
    try {
      const result = await saveHabitLog(habitId, payload, userId);
      if (!result.success) {
        setError(
          "error" in result && typeof result.error === "string"
            ? result.error
            : "No se pudo guardar el registro.",
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
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      aria-labelledby={titleId}
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Cerrar"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative max-h-[min(90vh,720px)] w-full max-w-lg overflow-y-auto rounded-[1.75rem] border border-white/10 bg-[#0a0a0a] shadow-2xl shadow-black/40"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/10 bg-[#0a0a0a]/95 px-6 py-5 backdrop-blur">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-emerald-500/90">
              Registro de sesión
            </p>
            <h2 id={titleId} className="mt-2 text-xl font-black tracking-tight text-white">
              Registrar sesión
            </h2>
            <p className="mt-1 text-xs font-medium text-white/45">
              Guarda un log en <code className="text-emerald-400/90">habit_logs</code> con la
              fecha y métricas que elijas.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-xl border border-white/10 p-2 text-white/50 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
          {!hasHabits ? (
            <p className="rounded-xl border border-amber-500/30 bg-amber-950/30 px-4 py-3 text-xs font-medium text-amber-100">
              Aún no tienes hábitos. Usa <strong>Nuevo hábito</strong> para crear uno y luego
              podrás registrar sesiones aquí.
            </p>
          ) : null}

          <div>
            <label
              htmlFor="log-habit"
              className="text-[10px] font-bold uppercase tracking-widest text-white/40"
            >
              Hábito
            </label>
            <select
              id="log-habit"
              name="habit_id"
              value={habitId}
              onChange={(e) => setHabitId(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-medium text-white outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
              disabled={submitting || !hasHabits}
            >
              <option value="" className="bg-neutral-900">
                — Seleccionar —
              </option>
              {habits.map((h) => (
                <option key={h.id} value={h.id} className="bg-neutral-900">
                  {h.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="log-date"
              className="text-[10px] font-bold uppercase tracking-widest text-white/40"
            >
              Fecha del registro
            </label>
            <input
              id="log-date"
              name="log_date"
              type="date"
              value={logDate}
              onChange={(e) => setLogDate(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-medium text-white outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 [color-scheme:dark]"
              disabled={submitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="log-minutes"
                className="text-[10px] font-bold uppercase tracking-widest text-white/40"
              >
                Minutos
              </label>
              <input
                id="log-minutes"
                name="minutes_completed"
                type="number"
                min={0}
                max={1440}
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-medium text-white outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
                disabled={submitting}
              />
            </div>
            <div>
              <label
                htmlFor="log-quality"
                className="text-[10px] font-bold uppercase tracking-widest text-white/40"
              >
                Calidad (1–5)
              </label>
              <select
                id="log-quality"
                name="quality_score"
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-medium text-white outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
                disabled={submitting}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={String(n)} className="bg-neutral-900">
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
            <input
              type="checkbox"
              checked={completed}
              onChange={(e) => setCompleted(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-black/40 text-emerald-500 focus:ring-emerald-500/30"
              disabled={submitting}
            />
            <span className="text-sm font-medium text-white/80">
              Marcar como completado
            </span>
          </label>

          <div>
            <label
              htmlFor="log-focus"
              className="text-[10px] font-bold uppercase tracking-widest text-white/40"
            >
              Enfoque del día
            </label>
            <input
              id="log-focus"
              name="daily_focus"
              value={dailyFocus}
              onChange={(e) => setDailyFocus(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-medium text-white placeholder:text-white/25 outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
              placeholder="Ej. Profundidad en un solo proyecto"
              disabled={submitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="log-energy"
                className="text-[10px] font-bold uppercase tracking-widest text-white/40"
              >
                Energía (1–5)
              </label>
              <select
                id="log-energy"
                name="energy_level"
                value={energyLevel}
                onChange={(e) => setEnergyLevel(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-medium text-white outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
                disabled={submitting}
              >
                <option value="" className="bg-neutral-900">
                  — Opcional —
                </option>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={String(n)} className="bg-neutral-900">
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="log-mental"
                className="text-[10px] font-bold uppercase tracking-widest text-white/40"
              >
                Estado mental
              </label>
              <select
                id="log-mental"
                name="mental_state"
                value={mentalState}
                onChange={(e) => setMentalState(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-medium text-white outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
                disabled={submitting}
              >
                {MENTAL_OPTIONS.map((o) => (
                  <option key={o.value || "none"} value={o.value} className="bg-neutral-900">
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="log-notes"
              className="text-[10px] font-bold uppercase tracking-widest text-white/40"
            >
              Notas
            </label>
            <textarea
              id="log-notes"
              name="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-1.5 w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-medium text-white placeholder:text-white/25 outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
              placeholder="Detalles opcionales de la sesión"
              disabled={submitting}
            />
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
              className="rounded-xl border border-white/15 px-5 py-3 text-[11px] font-black uppercase tracking-widest text-white/70 transition hover:bg-white/5 hover:text-white"
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-xl border border-emerald-500/40 bg-emerald-900/30 px-5 py-3 text-[11px] font-black uppercase tracking-widest text-emerald-300 transition hover:border-emerald-400/60 hover:bg-emerald-900/45 disabled:opacity-50"
              disabled={submitting || !hasHabits}
            >
              {submitting ? "Guardando…" : "Guardar registro"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
