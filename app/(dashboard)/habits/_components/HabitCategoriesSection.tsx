"use client";

import { countHabitsByCategory } from "@/lib/habits/habitCategoryUtils";
import type { Habit, HabitCategory } from "@/lib/types";
import { ChevronRight, LayoutGrid, Tag } from "lucide-react";
import { useMemo, useState } from "react";
import HabitCategoriesAdminModal from "./HabitCategoriesAdminModal";

const TOP_PREVIEW = 5;

export default function HabitCategoriesSection({
  userId,
  categories,
  habits,
}: {
  userId: string;
  categories: HabitCategory[];
  habits: Habit[];
}) {
  const [adminOpen, setAdminOpen] = useState(false);

  const ranked = useMemo(
    () => countHabitsByCategory(habits, categories),
    [habits, categories],
  );

  const topCategories = ranked.slice(0, TOP_PREVIEW);
  const hasMoreCategories = categories.length > TOP_PREVIEW || ranked.length > TOP_PREVIEW;

  return (
    <>
      <section className="rounded-[2rem] border border-border-subtle bg-surface-card p-6 sm:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <div className="h-[2px] w-6 bg-brand-forest" />
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-forest/80">
                Clasificación
              </p>
            </div>
            <h2 className="text-xl font-black tracking-tight text-text-primary">
              Categorías de hábitos
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-text-muted">
              Tus áreas más activas. Administra todas las categorías —del sistema y
              personalizadas— desde el panel completo.
            </p>
          </div>
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-brand-forest/25 bg-accent-subtle text-brand-forest">
            <LayoutGrid className="size-5" strokeWidth={2} />
          </div>
        </div>

        {topCategories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border-subtle bg-surface-muted/50 px-6 py-10 text-center">
            <Tag className="mx-auto mb-3 size-8 text-text-muted" strokeWidth={1.5} />
            <p className="text-sm font-semibold text-text-primary">
              Aún no hay categorías en uso
            </p>
            <p className="mx-auto mt-1 max-w-sm text-xs text-text-muted">
              Cuando asignes categorías a tus hábitos, aquí verás las más usadas.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {topCategories.map((row, index) => (
              <article
                key={row.slug}
                className="group relative overflow-hidden rounded-2xl border border-border-subtle bg-gradient-to-br from-surface-muted/80 via-surface-card to-accent-subtle/20 p-4 transition hover:border-brand-forest/30 hover:shadow-md"
              >
                <div
                  className="pointer-events-none absolute -right-4 -top-4 size-16 rounded-full opacity-20 blur-2xl transition group-hover:opacity-30"
                  style={{ backgroundColor: row.color }}
                />
                <div className="relative flex items-start justify-between gap-2">
                  <span
                    className="flex size-9 shrink-0 items-center justify-center rounded-xl text-sm font-black text-white shadow-sm"
                    style={{ backgroundColor: row.color }}
                  >
                    #{index + 1}
                  </span>
                  <span className="rounded-full border border-border-subtle bg-surface-card px-2 py-0.5 text-[10px] font-black tabular-nums text-text-secondary">
                    {row.count} hábito{row.count !== 1 ? "s" : ""}
                  </span>
                </div>
                <h3 className="relative mt-4 truncate text-sm font-bold text-text-primary">
                  {row.name}
                </h3>
                <p className="relative mt-1 text-[10px] font-medium uppercase tracking-wider text-text-muted">
                  {index === 0 ? "Más usada" : `Top ${index + 1}`}
                </p>
              </article>
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
          <p className="text-xs text-text-muted">
            {categories.length} categoría{categories.length !== 1 ? "s" : ""} en total
            {ranked.length > 0
              ? ` · ${ranked.length} en uso`
              : ""}
          </p>
          {hasMoreCategories || categories.length > 0 ? (
            <button
              type="button"
              onClick={() => setAdminOpen(true)}
              className="group inline-flex items-center gap-2 rounded-2xl border border-brand-forest/30 bg-gradient-to-b from-accent-subtle to-surface-card px-6 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-brand-forest shadow-sm transition hover:border-brand-forest/50 hover:shadow-md"
            >
              Ver más
              <ChevronRight className="size-4 transition group-hover:translate-x-0.5" />
            </button>
          ) : null}
        </div>
      </section>

      <HabitCategoriesAdminModal
        open={adminOpen}
        onClose={() => setAdminOpen(false)}
        userId={userId}
        categories={categories}
      />
    </>
  );
}
