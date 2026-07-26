import { DEFAULT_HABIT_CATEGORIES } from "./defaultHabitCategories";
import type { Habit, HabitCategory } from "@/lib/types";

const FALLBACK_COLOR = "#64748b";

const FALLBACK_TEXT: Record<string, string> = Object.fromEntries(
  DEFAULT_HABIT_CATEGORIES.map((c) => [c.slug, "text-text-muted"]),
);

/** Mapa slug → clase Tailwind aproximada (fallback si no hay color inline). */
export const CATEGORY_TEXT_CLASSES: Record<string, string> = {
  fitness: "text-orange-400",
  programming: "text-blue-400",
  reading: "text-purple-400",
  learning: "text-yellow-400",
  languages: "text-pink-400",
  health: "text-emerald-400",
  productivity: "text-cyan-400",
  focus: "text-cyan-300",
  meditation: "text-indigo-400",
  finance: "text-lime-400",
  social: "text-rose-400",
  creativity: "text-fuchsia-400",
  wellness: "text-teal-400",
  career: "text-slate-400",
  other: "text-text-muted",
  ...FALLBACK_TEXT,
};

export function slugifyCategoryName(name: string): string {
  const base = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 40);

  return base || "custom";
}

export function buildCategoryMaps(categories: HabitCategory[]) {
  const labelBySlug = new Map<string, string>();
  const colorBySlug = new Map<string, string>();

  for (const cat of categories) {
    labelBySlug.set(cat.slug, cat.name);
    colorBySlug.set(cat.slug, cat.color);
  }

  for (const fallback of DEFAULT_HABIT_CATEGORIES) {
    if (!labelBySlug.has(fallback.slug)) {
      labelBySlug.set(fallback.slug, fallback.name);
      colorBySlug.set(fallback.slug, fallback.color);
    }
  }

  return { labelBySlug, colorBySlug };
}

export function getCategoryLabel(
  slug: string,
  labelBySlug: Map<string, string>,
): string {
  return labelBySlug.get(slug) ?? slug;
}

export function getCategoryColor(
  slug: string,
  colorBySlug: Map<string, string>,
): string {
  return colorBySlug.get(slug) ?? FALLBACK_COLOR;
}

export function countHabitsByCategory(
  habits: Habit[],
  categories: HabitCategory[],
): Array<{ slug: string; name: string; color: string; count: number }> {
  const { labelBySlug, colorBySlug } = buildCategoryMaps(categories);
  const counts = new Map<string, number>();

  for (const habit of habits) {
    const slug = habit.category || "other";
    counts.set(slug, (counts.get(slug) ?? 0) + 1);
  }

  const rows = [...counts.entries()]
    .map(([slug, count]) => ({
      slug,
      name: getCategoryLabel(slug, labelBySlug),
      color: getCategoryColor(slug, colorBySlug),
      count,
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "es"));

  return rows;
}
