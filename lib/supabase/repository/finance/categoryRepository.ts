import { createClient } from "@/lib/supabase/config/server";
import { FinanceCategory } from "@/lib/types";

type SaveCategoryPayload = {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  kind?: FinanceCategory["kind"];
};

export const categoryRepository = {
  async getByUser(userId: string): Promise<FinanceCategory[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("category_transaction")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as FinanceCategory[];
  },

  async create(userId: string, payload: SaveCategoryPayload): Promise<FinanceCategory> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("category_transaction")
      .insert({
        user_id: userId,
        name: payload.name,
        description: payload.description ?? null,
        color: payload.color ?? "#10b981",
        icon: payload.icon ?? "tag",
        kind: payload.kind ?? "both",
      })
      .select("*")
      .single();
    if (error) throw error;
    return data as FinanceCategory;
  },

  async remove(userId: string, categoryId: number): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from("category_transaction")
      .delete()
      .eq("id_category", categoryId)
      .eq("user_id", userId);
    if (error) throw error;
  },
};
