import { createClient } from "@/lib/supabase/config/server";
import type {
  CreateHabitCategoryPayload,
  HabitCategory,
  UpdateHabitCategoryPayload,
} from "@/lib/types";

export const habitCategoryRepository = {
  async getByUser(userId: string): Promise<HabitCategory[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("habit_categories")
      .select("*")
      .eq("user_id", userId)
      .order("is_system", { ascending: false })
      .order("name", { ascending: true });

    if (error) throw error;
    return (data ?? []) as HabitCategory[];
  },

  async countByUser(userId: string): Promise<number> {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from("habit_categories")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (error) throw error;
    return count ?? 0;
  },

  async insertMany(
    userId: string,
    rows: Array<{
      slug: string;
      name: string;
      color: string;
      icon?: string;
      is_system: boolean;
    }>,
  ): Promise<HabitCategory[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("habit_categories")
      .insert(
        rows.map((row) => ({
          user_id: userId,
          slug: row.slug,
          name: row.name,
          color: row.color,
          icon: row.icon ?? null,
          is_system: row.is_system,
        })),
      )
      .select("*");

    if (error) throw error;
    return (data ?? []) as HabitCategory[];
  },

  async create(
    userId: string,
    payload: CreateHabitCategoryPayload & { slug: string },
  ): Promise<HabitCategory> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("habit_categories")
      .insert({
        user_id: userId,
        slug: payload.slug,
        name: payload.name.trim(),
        color: payload.color ?? "#10b981",
        icon: payload.icon ?? "tag",
        is_system: false,
      })
      .select("*")
      .single();

    if (error) throw error;
    return data as HabitCategory;
  },

  async update(
    userId: string,
    categoryId: string,
    payload: UpdateHabitCategoryPayload,
  ): Promise<HabitCategory> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("habit_categories")
      .update({
        ...(payload.name !== undefined ? { name: payload.name.trim() } : {}),
        ...(payload.color !== undefined ? { color: payload.color } : {}),
        ...(payload.icon !== undefined ? { icon: payload.icon } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq("id", categoryId)
      .eq("user_id", userId)
      .eq("is_system", false)
      .select("*")
      .single();

    if (error) throw error;
    return data as HabitCategory;
  },

  async remove(userId: string, categoryId: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from("habit_categories")
      .delete()
      .eq("id", categoryId)
      .eq("user_id", userId)
      .eq("is_system", false);

    if (error) throw error;
  },
};
