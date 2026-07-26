import { createClient } from "@/lib/supabase/config/server";
import { SavingsContribution, SavingsGoal } from "@/lib/types";

type SaveGoalPayload = {
  title: string;
  description?: string;
  target_amount: number;
  target_date?: string;
};

export const savingsGoalRepository = {
  async getByUser(userId: string): Promise<SavingsGoal[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("savings_goals")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as SavingsGoal[];
  },

  async create(userId: string, payload: SaveGoalPayload): Promise<SavingsGoal> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("savings_goals")
      .insert({
        user_id: userId,
        title: payload.title,
        description: payload.description ?? null,
        target_amount: payload.target_amount,
        saved_amount: 0,
        target_date: payload.target_date ?? null,
        status: "active",
      })
      .select("*")
      .single();
    if (error) throw error;
    return data as SavingsGoal;
  },

  async addContribution(
    userId: string,
    goalId: number,
    amount: number,
    accountId?: number | null,
    note?: string,
  ): Promise<SavingsContribution> {
    const supabase = await createClient();

    const { data: goal, error: goalError } = await supabase
      .from("savings_goals")
      .select("saved_amount, target_amount")
      .eq("id_saving_goal", goalId)
      .eq("user_id", userId)
      .single();
    if (goalError) throw goalError;

    const nextAmount = Number(goal.saved_amount ?? 0) + amount;
    const nextStatus = nextAmount >= Number(goal.target_amount ?? 0) ? "completed" : "active";

    const { error: updateError } = await supabase
      .from("savings_goals")
      .update({
        saved_amount: nextAmount,
        status: nextStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id_saving_goal", goalId)
      .eq("user_id", userId);
    if (updateError) throw updateError;

    const { data: contribution, error: contributionError } = await supabase
      .from("savings_goal_contributions")
      .insert({
        user_id: userId,
        saving_goal_id: goalId,
        account_id: accountId ?? null,
        amount,
        note: note ?? null,
      })
      .select("*")
      .single();
    if (contributionError) throw contributionError;
    return contribution as SavingsContribution;
  },
};
