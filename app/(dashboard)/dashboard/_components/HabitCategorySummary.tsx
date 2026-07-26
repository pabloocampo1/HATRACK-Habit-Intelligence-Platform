"use client";

import type { HabitCategory } from "@/lib/types";
import { countHabitsByCategory } from "@/lib/habits/habitCategoryUtils";
import type { Habit } from "@/lib/types";
import { LayoutGrid } from "lucide-react";

export default function HabitCategorySummary({
  habits,
  categories,
}: {
  habits: Habit[];
  categories: HabitCategory[];
}) {
  const rows = countHabitsByCategory(habits, categories);
  if (rows.length === 0) return null;

  return (
    <div className="mb-6 rounded-2xl border border-border-subtle bg-gradient-to-br from-surface-muted via-surface-card to-accent-subtle/30 p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex size-9 items-center justify-center rounded-xl border border-brand-forest/25 bg-accent-subtle text-brand-forest">
          <LayoutGrid className="size-4" strokeWidth={2.2} />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-brand-forest/80">
            Por categoría
          </p>
          <p className="text-sm font-semibold text-text-primary">
            {habits.length} hábito{habits.length !== 1 ? "s" : ""} distribuidos
          </p>
        </div>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((row) => (
          <div
            key={row.slug}
            className="flex items-center justify-between gap-3 rounded-xl border border-border-subtle bg-surface-card px-4 py-3 transition hover:border-brand-forest/25 hover:shadow-sm"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                className="size-2.5 shrink-0 rounded-full ring-2 ring-white/10"
                style={{ backgroundColor: row.color }}
                aria-hidden
              />
              <span className="truncate text-sm font-semibold text-text-primary">
                {row.name}
              </span>
            </div>
            <span className="shrink-0 rounded-full border border-border-subtle bg-surface-muted px-2.5 py-0.5 text-xs font-black tabular-nums text-text-secondary">
              {row.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
