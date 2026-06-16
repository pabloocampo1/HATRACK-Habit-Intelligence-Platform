import type {
  Goal,
  GoalMilestone,
  GoalHabit,
  GoalChallenge,
} from "@/lib/types";
import { supabase } from "../config/supabaseClient";

export const goalRepository = {
  // ── Goals ──────────────────────────────────────────────────

  async findAllByUser(userId: string): Promise<Goal[]> {
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []) as Goal[];
  },

  async findById(goalId: string): Promise<Goal | null> {
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("id", goalId)
      .single();

    if (error) return null;
    return data as Goal;
  },

  async create(goal: Omit<Goal, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase
      .from("goals")
      .insert([goal])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { success: true, data: data as Goal };
  },

  async update(
    goalId: string,
    fields: Partial<Omit<Goal, "id" | "user_id" | "created_at">>,
  ) {
    const { data, error } = await supabase
      .from("goals")
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq("id", goalId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { success: true, data: data as Goal };
  },

  async delete(goalId: string) {
    const { error } = await supabase.from("goals").delete().eq("id", goalId);
    if (error) throw new Error(error.message);
    return { success: true };
  },

  // ── Milestones ──────────────────────────────────────────────

  async findMilestonesByGoal(goalId: string): Promise<GoalMilestone[]> {
    const { data, error } = await supabase
      .from("goal_milestones")
      .select("*")
      .eq("goal_id", goalId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return (data ?? []) as GoalMilestone[];
  },

  async createMilestone(milestone: Omit<GoalMilestone, "id" | "created_at">) {
    const { data, error } = await supabase
      .from("goal_milestones")
      .insert([milestone])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { success: true, data: data as GoalMilestone };
  },

  async updateMilestone(
    milestoneId: string,
    fields: Partial<Pick<GoalMilestone, "title" | "completed" | "due_date">>,
  ) {
    const { data, error } = await supabase
      .from("goal_milestones")
      .update(fields)
      .eq("id", milestoneId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { success: true, data: data as GoalMilestone };
  },

  async deleteMilestone(milestoneId: string) {
    const { error } = await supabase
      .from("goal_milestones")
      .delete()
      .eq("id", milestoneId);

    if (error) throw new Error(error.message);
    return { success: true };
  },

  // ── Linked habits ───────────────────────────────────────────

  async findLinkedHabits(goalId: string): Promise<GoalHabit[]> {
    const { data, error } = await supabase
      .from("goal_habits")
      .select("*, habit:habits(*)")
      .eq("goal_id", goalId);

    if (error) throw error;
    return (data ?? []) as GoalHabit[];
  },

  async linkHabit(goalId: string, habitId: string) {
    const { data, error } = await supabase
      .from("goal_habits")
      .insert([{ goal_id: goalId, habit_id: habitId }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { success: true, data: data as GoalHabit };
  },

  async unlinkHabit(goalHabitId: string) {
    const { error } = await supabase
      .from("goal_habits")
      .delete()
      .eq("id", goalHabitId);

    if (error) throw new Error(error.message);
    return { success: true };
  },

  // ── Linked challenges ───────────────────────────────────────

  async findLinkedChallenges(goalId: string): Promise<GoalChallenge[]> {
    const { data, error } = await supabase
      .from("goal_challenges")
      .select("*")
      .eq("goal_id", goalId);

    if (error) throw error;
    return (data ?? []) as GoalChallenge[];
  },

  async linkChallenge(goalId: string, challengeId: string) {
    const { data, error } = await supabase
      .from("goal_challenges")
      .insert([{ goal_id: goalId, challenge_id: challengeId }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { success: true, data: data as GoalChallenge };
  },

  async unlinkChallenge(goalChallengeId: string) {
    const { error } = await supabase
      .from("goal_challenges")
      .delete()
      .eq("id", goalChallengeId);

    if (error) throw new Error(error.message);
    return { success: true };
  },

  async countActiveGoals(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from("goals")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "active");

    if (error) throw error;
    return count ?? 0;
  },

  async countMilestonesForGoal(goalId: string): Promise<number> {
    const { count, error } = await supabase
      .from("goal_milestones")
      .select("id", { count: "exact", head: true })
      .eq("goal_id", goalId);

    if (error) throw error;
    return count ?? 0;
  },
};
