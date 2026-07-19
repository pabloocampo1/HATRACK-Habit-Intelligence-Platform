import { createClient } from "@/lib/supabase/config/server";
import { Budget } from "@/lib/types";

type SaveBudgetPayload = {
  category_id: number;
  month_date: string;
  limit_amount: number;
};

export const budgetRepository = {
  async getByUser(userId: string): Promise<Budget[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("budgets")
      .select("*")
      .eq("user_id", userId)
      .order("month_date", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Budget[];
  },

  async create(userId: string, payload: SaveBudgetPayload): Promise<Budget> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("budgets")
      .insert({
        user_id: userId,
        category_id: payload.category_id,
        month_date: payload.month_date,
        limit_amount: payload.limit_amount,
        spent_amount: 0,
      })
      .select("*")
      .single();
    if (error) throw error;
    return data as Budget;
  },

  async remove(userId: string, budgetId: number): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from("budgets")
      .delete()
      .eq("id_budget", budgetId)
      .eq("user_id", userId);
    if (error) throw error;
  },
};
