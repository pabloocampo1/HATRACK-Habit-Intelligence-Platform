"use client";

import deleteHabit, { updateHabit } from "@/app/actions/habitActions";
import type { Habit } from "@/lib/types";
import {
  X,
  Pencil,
  Trash2,
  Check,
  XCircle,
  Plus,
  AlertTriangle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState, useTransition } from "react";
import CreateHabitModal from "./CreateHabitModal";

// ── constants ────────────────────────────────────────────────

const CATEGORIES = [
  { value: "health", label: "Salud" },
  { value: "focus", label: "Enfoque" },
  { value: "productivity", label: "Productividad" },
  { value: "fitness", label: "Fitness" },
  { value: "learning", label: "Aprendizaje" },
  { value: "programming", label: "Programación" },
  { value: "reading", label: "Lectura" },
  { value: "languages", label: "Idiomas" },
  { value: "meditation", label: "Meditación" },
  { value: "finance", label: "Finanzas" },
  { value: "social", label: "Social" },
  { value: "other", label: "Otro" },
];

// ── types ────────────────────────────────────────────────────

type EditState = {
  title: string;
  description: string;
  category: string;
  frequency: string;
  target_minutes: string;
};

// ── inline edit row ──────────────────────────────────────────

function EditRow({
  habit,
  onSave,
  onCancel,
  isSaving,
}: {
  habit: Habit;
  onSave: (state: EditState) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [state, setState] = useState<EditState>({
    title: habit.title,
    description: habit.description ?? "",
    category: habit.category,
    frequency: String(habit.frequency),
    target_minutes: String(habit.target_minutes),
  });

  function set<K extends keyof EditState>(key: K, val: EditState[K]) {
    setState((prev) => ({ ...prev, [key]: val }));
  }

  const inputCls =
    "w-full rounded-lg border border-brand-forest/30 bg-surface-card px-2 py-1.5 text-sm text-text-primary outline-none focus:border-brand-forest/60 focus:ring-1 focus:ring-brand-forest/20";

  return (
    <tr className="border-b border-brand-forest/20 bg-accent-subtle/20">
      <td className="px-3 py-3 align-top">
        <div className="space-y-1.5">
          <input
            className={inputCls}
            value={state.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Título"
            disabled={isSaving}
          />
          <input
            className={inputCls}
            value={state.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Descripción (opcional)"
            disabled={isSaving}
          />
        </div>
      </td>
      <td className="px-3 py-3 align-top">
        <select
          className={inputCls}
          value={state.category}
          onChange={(e) => set("category", e.target.value)}
          disabled={isSaving}
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value} className="bg-surface-card">
              {c.label}
            </option>
          ))}
        </select>
      </td>
      <td className="px-3 py-3 align-top">
        <input
          type="number"
          min={1}
          max={21}
          className={`${inputCls} w-16`}
          value={state.frequency}
          onChange={(e) => set("frequency", e.target.value)}
          disabled={isSaving}
        />
      </td>
      <td className="px-3 py-3 align-top">
        <input
          type="number"
          min={1}
          max={600}
          className={`${inputCls} w-20`}
          value={state.target_minutes}
          onChange={(e) => set("target_minutes", e.target.value)}
          disabled={isSaving}
        />
      </td>
      <td className="px-3 py-3 align-top">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onSave(state)}
            disabled={isSaving}
            className="flex min-h-8 min-w-8 items-center justify-center rounded-lg bg-brand-forest text-brand-forest-fg transition hover:brightness-110 disabled:opacity-50"
            aria-label="Guardar cambios"
          >
            <Check className="size-4" strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="flex min-h-8 min-w-8 items-center justify-center rounded-lg border border-border-default text-text-muted transition hover:bg-surface-muted disabled:opacity-50"
            aria-label="Cancelar"
          >
            <XCircle className="size-4" strokeWidth={2} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── delete confirmation row ──────────────────────────────────

function DeleteRow({
  habit,
  onConfirm,
  onCancel,
  isDeleting,
}: {
  habit: Habit;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}) {
  return (
    <tr className="border-b border-red-500/20 bg-red-500/5">
      <td colSpan={5} className="px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <AlertTriangle className="size-4 text-red-400 shrink-0" strokeWidth={2} />
          <p className="text-sm font-medium text-text-primary">
            ¿Eliminar{" "}
            <span className="font-black text-red-400">{habit.title}</span>? Esta acción no se puede deshacer.
          </p>
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isDeleting}
              className="min-h-8 rounded-lg border border-border-default px-3 text-xs font-bold text-text-secondary transition hover:bg-surface-muted disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="min-h-8 rounded-lg border border-red-500/30 bg-red-500/10 px-3 text-xs font-bold text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
            >
              {isDeleting ? "Eliminando…" : "Sí, eliminar"}
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
}

// ── main component ───────────────────────────────────────────

export default function HabitAdminModal({
  open,
  onClose,
  habits,
  userId,
}: {
  open: boolean;
  onClose: () => void;
  habits: Habit[];
  userId: string;
}) {
  const router = useRouter();
  const titleId = useId();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [rowError, setRowError] = useState<{ id: string; msg: string } | null>(null);

  // close on Escape
  useEffect(() => {
    if (!open) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [open, onClose]);

  // lock scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [open]);

  if (!open) return null;

  function handleSave(habit: Habit, state: EditState) {
    setRowError(null);
    if (!state.title.trim()) {
      setRowError({ id: habit.id!, msg: "El título es obligatorio." });
      return;
    }
    startTransition(async () => {
      const res = await updateHabit(habit.id!, {
        title: state.title.trim(),
        description: state.description.trim() || undefined,
        category: state.category,
        frequency: Number(state.frequency),
        target_minutes: Number(state.target_minutes),
      });
      if (!res.success) {
        setRowError({ id: habit.id!, msg: (res as any).error ?? "Error al guardar." });
        return;
      }
      setEditingId(null);
      router.refresh();
    });
  }

  function handleDelete(habitId: string) {
    startTransition(async () => {
      const res = await deleteHabit(habitId);
      if (!res.success) {
        setRowError({ id: habitId, msg: (res as any).error ?? "Error al eliminar." });
        setDeletingId(null);
        return;
      }
      setDeletingId(null);
      router.refresh();
    });
  }

  return (
    <>
      <div
        className="dark fixed inset-0 z-[100] flex items-center justify-center p-4"
        aria-labelledby={titleId}
        role="presentation"
      >
        {/* backdrop */}
        <button
          type="button"
          className="absolute inset-0 bg-brand-scrim backdrop-blur-sm"
          aria-label="Cerrar"
          onClick={onClose}
        />

        {/* panel */}
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="relative flex w-full max-w-4xl flex-col rounded-[1.75rem] border border-border-subtle bg-surface-card shadow-2xl"
          style={{ maxHeight: "90dvh" }}
        >
          {/* header */}
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border-subtle px-6 py-5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-forest/80">
                Administración
              </p>
              <h2
                id={titleId}
                className="mt-1.5 text-xl font-black tracking-tight text-text-primary"
              >
                Mis hábitos
              </h2>
              <p className="mt-0.5 text-xs text-text-muted">
                {habits.length} hábito{habits.length !== 1 ? "s" : ""} registrado{habits.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-brand-forest/30 bg-accent-subtle px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-brand-forest transition hover:bg-brand-forest/15"
              >
                <Plus className="size-4" strokeWidth={2.5} />
                Nuevo hábito
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex items-center justify-center rounded-xl border border-border-default p-2.5 text-text-muted transition hover:border-border-strong hover:bg-surface-muted hover:text-text-primary"
                aria-label="Cerrar"
              >
                <X className="size-5" strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* table */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            {habits.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center">
                <p className="text-sm font-semibold text-text-primary">Sin hábitos</p>
                <p className="mt-1 text-xs text-text-muted">
                  Crea tu primer hábito con el botón "Nuevo hábito".
                </p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 border-b border-border-subtle bg-surface-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-text-muted">
                      Hábito
                    </th>
                    <th className="px-3 py-3 text-left text-[10px] font-black uppercase tracking-widest text-text-muted">
                      Categoría
                    </th>
                    <th className="px-3 py-3 text-left text-[10px] font-black uppercase tracking-widest text-text-muted">
                      Freq/sem
                    </th>
                    <th className="px-3 py-3 text-left text-[10px] font-black uppercase tracking-widest text-text-muted">
                      Meta (min)
                    </th>
                    <th className="px-3 py-3 text-left text-[10px] font-black uppercase tracking-widest text-text-muted">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {habits.map((habit) => {
                    if (deletingId === habit.id) {
                      return (
                        <DeleteRow
                          key={habit.id}
                          habit={habit}
                          onConfirm={() => handleDelete(habit.id!)}
                          onCancel={() => setDeletingId(null)}
                          isDeleting={isPending}
                        />
                      );
                    }

                    if (editingId === habit.id) {
                      return (
                        <EditRow
                          key={habit.id}
                          habit={habit}
                          onSave={(state) => handleSave(habit, state)}
                          onCancel={() => { setEditingId(null); setRowError(null); }}
                          isSaving={isPending}
                        />
                      );
                    }

                    const errMsg = rowError !== null && rowError.id === habit.id ? rowError.msg : null;

                    return (
                      <>
                        <tr
                          key={habit.id}
                          className="border-b border-border-subtle transition hover:bg-surface-muted/40"
                        >
                          <td className="px-4 py-3">
                            <p className="font-semibold text-text-primary">{habit.title}</p>
                            {habit.description && (
                              <p className="mt-0.5 text-xs text-text-muted line-clamp-1">
                                {habit.description}
                              </p>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            <span className="rounded-full border border-border-subtle bg-surface-muted px-2 py-0.5 text-[10px] font-bold capitalize text-text-secondary">
                              {habit.category}
                            </span>
                          </td>
                          <td className="px-3 py-3 tabular-nums text-text-secondary">
                            {habit.frequency}×
                          </td>
                          <td className="px-3 py-3 tabular-nums text-text-secondary">
                            {habit.target_minutes} min
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingId(habit.id!);
                                  setDeletingId(null);
                                  setRowError(null);
                                }}
                                className="flex min-h-8 min-w-8 items-center justify-center rounded-lg border border-border-default text-text-muted transition hover:border-brand-forest/30 hover:bg-brand-forest/10 hover:text-brand-forest"
                                aria-label="Editar"
                              >
                                <Pencil className="size-3.5" strokeWidth={2} />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setDeletingId(habit.id!);
                                  setEditingId(null);
                                  setRowError(null);
                                }}
                                className="flex min-h-8 min-w-8 items-center justify-center rounded-lg border border-border-default text-text-muted transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                                aria-label="Eliminar"
                              >
                                <Trash2 className="size-3.5" strokeWidth={2} />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {errMsg && (
                          <tr key={`${habit.id}-err`} className="border-b border-red-500/20 bg-red-500/5">
                            <td colSpan={5} className="px-4 py-2 text-xs text-red-400">
                              {errMsg}
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* footer */}
          <div className="shrink-0 border-t border-border-subtle px-6 py-4 text-center">
            <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-text-muted/50">
              Los cambios se guardan directamente en tu cuenta
            </p>
          </div>
        </div>
      </div>

      {/* nested create modal */}
      <CreateHabitModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        userId={userId}
      />
    </>
  );
}
