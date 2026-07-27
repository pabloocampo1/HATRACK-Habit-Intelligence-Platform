import { DEFAULT_HABIT_CATEGORIES } from "@/lib/habits/defaultHabitCategories";
import { slugifyCategoryName } from "@/lib/habits/habitCategoryUtils";
import { habitCategoryRepository } from "@/lib/supabase/repository/habitCategoryRepository";
import type {
  CreateHabitCategoryPayload,
  HabitCategory,
  UpdateHabitCategoryPayload,
} from "@/lib/types";

function fallbackCategories(userId: string): HabitCategory[] {
  return DEFAULT_HABIT_CATEGORIES.map((cat, index) => ({
    id: `fallback-${cat.slug}-${index}`,
    user_id: userId,
    slug: cat.slug,
    name: cat.name,
    color: cat.color,
    icon: cat.icon,
    is_system: true,
  }));
}

async function ensureDefaultCategories(userId: string): Promise<HabitCategory[]> {
  const count = await habitCategoryRepository.countByUser(userId);
  if (count > 0) {
    return habitCategoryRepository.getByUser(userId);
  }

  await habitCategoryRepository.insertMany(
    userId,
    DEFAULT_HABIT_CATEGORIES.map((cat) => ({
      slug: cat.slug,
      name: cat.name,
      color: cat.color,
      icon: cat.icon,
      is_system: true,
    })),
  );

  return habitCategoryRepository.getByUser(userId);
}

export async function getHabitCategoriesByUser(
  userId: string,
): Promise<HabitCategory[]> {
  if (!userId) return [];

  try {
    return await ensureDefaultCategories(userId);
  } catch {
    return fallbackCategories(userId);
  }
}

export async function createHabitCategory(
  userId: string,
  payload: CreateHabitCategoryPayload,
): Promise<HabitCategory> {
  const name = payload.name.trim();
  if (!name) throw new Error("El nombre de la categoría es obligatorio.");

  let slug = slugifyCategoryName(name);
  const existing = await getHabitCategoriesByUser(userId);
  const taken = new Set(existing.map((c) => c.slug));

  if (taken.has(slug)) {
    let suffix = 2;
    while (taken.has(`${slug}_${suffix}`)) suffix += 1;
    slug = `${slug}_${suffix}`;
  }

  return habitCategoryRepository.create(userId, {
    ...payload,
    name,
    slug,
  });
}

export async function updateHabitCategory(
  userId: string,
  categoryId: string,
  payload: UpdateHabitCategoryPayload,
): Promise<HabitCategory> {
  if (payload.name !== undefined && !payload.name.trim()) {
    throw new Error("El nombre de la categoría es obligatorio.");
  }

  return habitCategoryRepository.update(userId, categoryId, payload);
}

export async function deleteHabitCategory(
  userId: string,
  categoryId: string,
): Promise<void> {
  await habitCategoryRepository.remove(userId, categoryId);
}
