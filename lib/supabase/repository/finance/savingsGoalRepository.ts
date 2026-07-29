import { createClient } from "@/lib/supabase/config/server";
import { SavingsContribution, SavingsGoal } from "@/lib/types";

type SaveGoalPayload = {
  title: string;
  description?: string;
  target_amount: number;
  target_date?: string | null;
  account_id: number;
  status?: SavingsGoal["status"];
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

  async getOne(userId: string, goalId: number): Promise<SavingsGoal> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("savings_goals")
      .select("*")
      .eq("id_saving_goal", goalId)
      .eq("user_id", userId)
      .single();
    if (error) throw error;
    return data as SavingsGoal;
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
        account_id: payload.account_id,
        status: "active",
      })
      .select("*")
      .single();
    if (error) throw error;
    return data as SavingsGoal;
  },

  async update(
    userId: string,
    goalId: number,
    payload: Partial<SaveGoalPayload>,
  ): Promise<SavingsGoal> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("savings_goals")
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq("id_saving_goal", goalId)
      .eq("user_id", userId)
      .select("*")
      .single();
    if (error) throw error;
    return data as SavingsGoal;
  },

  async remove(userId: string, goalId: number): Promise<void> {
    const supabase = await createClient();

    // Solo borra el seguimiento de aportes de la meta.
    // Las transacciones reales y los saldos de cuentas se conservan.
    const { error: contributionsError } = await supabase
      .from("savings_goal_contributions")
      .delete()
      .eq("saving_goal_id", goalId)
      .eq("user_id", userId);
    if (contributionsError) throw contributionsError;

    const { error } = await supabase
      .from("savings_goals")
      .delete()
      .eq("id_saving_goal", goalId)
      .eq("user_id", userId);
    if (error) throw error;
  },

  async addContribution(
    userId: string,
    goalId: number,
    amount: number,
    sourceAccountId: number,
    note?: string,
    transactionId?: number,
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
        account_id: sourceAccountId,
        transaction_id: transactionId ?? null,
        amount,
        note: note ?? null,
      })
      .select("*")
      .single();
    if (contributionError) throw contributionError;
    return contribution as SavingsContribution;
  },
};
