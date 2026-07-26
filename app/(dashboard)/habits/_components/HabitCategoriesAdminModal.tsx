"use client";

import {
  createHabitCategoryAction,
  deleteHabitCategoryAction,
  updateHabitCategoryAction,
} from "@/app/actions/habitCategoryActions";
import { HABIT_CATEGORY_COLOR_PRESETS } from "@/lib/habits/categoryColorPresets";
import type { HabitCategory } from "@/lib/types";
import {
  AlertTriangle,
  Check,
  Pencil,
  Plus,
  Tag,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState, useTransition } from "react";

type EditState = {
  name: string;
  color: string;
};

function ColorPicker({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {HABIT_CATEGORY_COLOR_PRESETS.map((preset) => (
        <button
          key={preset}
          type="button"
          disabled={disabled}
          onClick={() => onChange(preset)}
          className={`size-7 rounded-full border-2 transition disabled:opacity-50 ${
            value === preset
              ? "border-text-primary scale-110"
              : "border-transparent hover:scale-105"
          }`}
          style={{ backgroundColor: preset }}
          aria-label={`Color ${preset}`}
        />
      ))}
    </div>
  );
}

function CategoryEditRow({
  category,
  onSave,
  onCancel,
  isSaving,
}: {
  category: HabitCategory;
  onSave: (state: EditState) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [state, setState] = useState<EditState>({
    name: category.name,
    color: category.color,
  });

  const inputCls =
    "w-full rounded-lg border border-brand-forest/30 bg-surface-card px-2 py-1.5 text-sm text-text-primary outline-none focus:border-brand-forest/60";

  return (
    <tr className="border-b border-brand-forest/20 bg-accent-subtle/20">
      <td className="px-4 py-3 align-top">
        <input
          className={inputCls}
          value={state.name}
          onChange={(e) => setState((s) => ({ ...s, name: e.target.value }))}
          disabled={isSaving}
        />
      </td>
      <td className="px-3 py-3 align-top font-mono text-xs text-text-muted">
        {category.slug}
      </td>
      <td className="px-3 py-3 align-top">
        <ColorPicker
          value={state.color}
          onChange={(color) => setState((s) => ({ ...s, color }))}
          disabled={isSaving}
        />
      </td>
      <td className="px-3 py-3 align-top">
        <span className="rounded-full border border-brand-forest/25 bg-accent-subtle px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-forest">
          Personalizada
        </span>
      </td>
      <td className="px-3 py-3 align-top">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onSave(state)}
            disabled={isSaving || !state.name.trim()}
            className="flex min-h-8 min-w-8 items-center justify-center rounded-lg bg-brand-forest text-brand-forest-fg transition hover:brightness-110 disabled:opacity-50"
            aria-label="Guardar"
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

function CategoryDeleteRow({
  category,
  onConfirm,
  onCancel,
  isDeleting,
}: {
  category: HabitCategory;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}) {
  return (
    <tr className="border-b border-red-500/20 bg-red-500/5">
      <td colSpan={5} className="px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <AlertTriangle className="size-4 shrink-0 text-red-400" strokeWidth={2} />
          <p className="text-sm font-medium text-text-primary">
            ¿Eliminar{" "}
            <span className="font-black text-red-400">{category.name}</span>? Los
            hábitos que la usen conservarán el slug actual.
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

function CreateCategoryForm({
  onCreated,
  onCancel,
  userId,
}: {
  onCreated: () => void;
  onCancel: () => void;
  userId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(HABIT_CATEGORY_COLOR_PRESETS[0]);
  const [error, setError] = useState<string | null>(null);

  function handleCreate() {
    setError(null);
    startTransition(async () => {
      try {
        await createHabitCategoryAction(userId, { name, color });
        setName("");
        setColor(HABIT_CATEGORY_COLOR_PRESETS[0]);
        router.refresh();
        onCreated();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "No se pudo crear la categoría.",
        );
      }
    });
  }

  return (
    <div className="border-b border-brand-forest/20 bg-accent-subtle/15 px-6 py-5">
      <p className="mb-4 text-[10px] font-black uppercase tracking-[0.3em] text-brand-forest/80">
        Nueva categoría
      </p>
      <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
            Nombre
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Mindfulness, Side project…"
            className="mt-1.5 w-full rounded-xl border border-border-default bg-surface-card px-4 py-2.5 text-sm text-text-primary outline-none focus:border-brand-forest/50"
            disabled={isPending}
          />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
            Color
          </label>
          <div className="mt-1.5">
            <ColorPicker
              value={color}
              onChange={setColor}
              disabled={isPending}
            />
          </div>
        </div>
      </div>
      {error ? (
        <p className="mt-3 rounded-lg border border-red-500/30 bg-red-950/40 px-3 py-2 text-xs text-red-200">
          {error}
        </p>
      ) : null}
      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="rounded-xl border border-border-default px-4 py-2 text-xs font-bold uppercase tracking-wider text-text-secondary"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleCreate}
          disabled={isPending || !name.trim()}
          className="rounded-xl bg-brand-forest px-4 py-2 text-xs font-black uppercase tracking-wider text-brand-forest-fg disabled:opacity-50"
        >
          {isPending ? "Guardando…" : "Crear categoría"}
        </button>
      </div>
    </div>
  );
}

export default function HabitCategoriesAdminModal({
  open,
  onClose,
  userId,
  categories,
}: {
  open: boolean;
  onClose: () => void;
  userId: string;
  categories: HabitCategory[];
}) {
  const router = useRouter();
  const titleId = useId();
  const [isPending, startTransition] = useTransition();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      setCreateOpen(false);
      setEditingId(null);
      setDeletingId(null);
      setRowError(null);
    }
  }, [open]);

  if (!open) return null;

  function handleSaveEdit(categoryId: string, state: EditState) {
    setRowError(null);
    startTransition(async () => {
      try {
        await updateHabitCategoryAction(userId, categoryId, {
          name: state.name.trim(),
          color: state.color,
        });
        setEditingId(null);
        router.refresh();
      } catch (err) {
        setRowError(
          err instanceof Error ? err.message : "No se pudo actualizar la categoría.",
        );
      }
    });
  }

  function handleDelete(categoryId: string) {
    setRowError(null);
    startTransition(async () => {
      try {
        await deleteHabitCategoryAction(userId, categoryId);
        setDeletingId(null);
        router.refresh();
      } catch (err) {
        setRowError(
          err instanceof Error ? err.message : "No se pudo eliminar la categoría.",
        );
        setDeletingId(null);
      }
    });
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
        className="relative flex w-full max-w-4xl flex-col rounded-[1.75rem] border border-border-subtle bg-surface-card shadow-2xl"
        style={{ maxHeight: "90dvh" }}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border-subtle px-6 py-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-forest/80">
              Administración
            </p>
            <h2
              id={titleId}
              className="mt-1.5 text-xl font-black tracking-tight text-text-primary"
            >
              Categorías de hábitos
            </h2>
            <p className="mt-0.5 text-xs text-text-muted">
              {categories.length} categoría{categories.length !== 1 ? "s" : ""}{" "}
              disponible{categories.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setCreateOpen(true);
                setEditingId(null);
                setDeletingId(null);
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-brand-forest/30 bg-accent-subtle px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-brand-forest transition hover:bg-brand-forest/15"
            >
              <Plus className="size-4" strokeWidth={2.5} />
              Nueva categoría
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

        {rowError ? (
          <p className="mx-6 mt-4 rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-xs text-red-200">
            {rowError}
          </p>
        ) : null}

        {createOpen ? (
          <CreateCategoryForm
            userId={userId}
            onCreated={() => setCreateOpen(false)}
            onCancel={() => setCreateOpen(false)}
          />
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 border-b border-border-subtle bg-surface-muted">
              <tr>
                <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-text-muted">
                  Categoría
                </th>
                <th className="px-3 py-3 text-left text-[10px] font-black uppercase tracking-widest text-text-muted">
                  Slug
                </th>
                <th className="px-3 py-3 text-left text-[10px] font-black uppercase tracking-widest text-text-muted">
                  Color
                </th>
                <th className="px-3 py-3 text-left text-[10px] font-black uppercase tracking-widest text-text-muted">
                  Tipo
                </th>
                <th className="px-3 py-3 text-right text-[10px] font-black uppercase tracking-widest text-text-muted">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => {
                if (deletingId === cat.id) {
                  return (
                    <CategoryDeleteRow
                      key={cat.id}
                      category={cat}
                      onConfirm={() => handleDelete(cat.id)}
                      onCancel={() => setDeletingId(null)}
                      isDeleting={isPending}
                    />
                  );
                }

                if (editingId === cat.id && !cat.is_system) {
                  return (
                    <CategoryEditRow
                      key={cat.id}
                      category={cat}
                      onSave={(state) => handleSaveEdit(cat.id, state)}
                      onCancel={() => {
                        setEditingId(null);
                        setRowError(null);
                      }}
                      isSaving={isPending}
                    />
                  );
                }

                return (
                  <tr
                    key={cat.id}
                    className="border-b border-border-subtle transition hover:bg-surface-muted/40"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="size-3 shrink-0 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="font-semibold text-text-primary">
                          {cat.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-text-muted">
                      {cat.slug}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className="inline-block size-5 rounded-full border border-border-subtle"
                        style={{ backgroundColor: cat.color }}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          cat.is_system
                            ? "border border-border-subtle bg-surface-muted text-text-muted"
                            : "border border-brand-forest/25 bg-accent-subtle text-brand-forest"
                        }`}
                      >
                        {cat.is_system ? "Sistema" : "Personalizada"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {!cat.is_system ? (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(cat.id);
                                setDeletingId(null);
                                setCreateOpen(false);
                              }}
                              disabled={isPending}
                              className="flex min-h-8 min-w-8 items-center justify-center rounded-lg border border-border-default text-text-muted transition hover:border-brand-forest/30 hover:text-brand-forest disabled:opacity-50"
                              aria-label="Editar"
                            >
                              <Pencil className="size-3.5" strokeWidth={2} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDeletingId(cat.id);
                                setEditingId(null);
                                setCreateOpen(false);
                              }}
                              disabled={isPending}
                              className="flex min-h-8 min-w-8 items-center justify-center rounded-lg border border-red-500/20 text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                              aria-label="Eliminar"
                            >
                              <Trash2 className="size-3.5" strokeWidth={2} />
                            </button>
                          </>
                        ) : (
                          <span className="pr-2 text-xs text-text-muted">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="shrink-0 border-t border-border-subtle px-6 py-4 text-center">
          <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-text-muted/50">
            Las categorías del sistema no se pueden editar ni eliminar
          </p>
        </div>
      </div>
    </div>
  );
}
