import { supabase } from "../config/supabaseClient";
import type {
  Challenge,
  ChallengeHabit,
  ChallengeLog,
  CreateChallengePayload,
} from "@/lib/types";

export const challengeRepository = {
  // ── Challenges ──────────────────────────────────────────────

  async findAllByUser(userId: string): Promise<Challenge[]> {
    const { data, error } = await supabase
      .from("challenges")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async findById(id: string): Promise<Challenge | null> {
    const { data, error } = await supabase
      .from("challenges")
      .select("*")
      .eq("id", id)
      .single();
    if (error) return null;
    return data;
  },

  async create(
    userId: string,
    payload: CreateChallengePayload,
  ): Promise<{ success: true; data: Challenge } | { success: false; error: string }> {
    const startDate = new Date(payload.start_date);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + payload.duration_days - 1);

    const { data, error } = await supabase
      .from("challenges")
      .insert({
        user_id: userId,
        title: payload.title.trim(),
        description: payload.description?.trim() || null,
        goal: payload.goal?.trim() || null,
        duration_days: payload.duration_days,
        start_date: payload.start_date,
        end_date: endDate.toISOString().slice(0, 10),
        status: "active",
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  async updateStatus(
    id: string,
    status: Challenge["status"],
  ): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from("challenges")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  // ── Challenge habits ────────────────────────────────────────

  async findHabitsByChallenge(challengeId: string): Promise<ChallengeHabit[]> {
    const { data, error } = await supabase
      .from("challenge_habits")
      .select("*")
      .eq("challenge_id", challengeId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  async createHabits(
    challengeId: string,
    habits: CreateChallengePayload["habits"],
  ): Promise<ChallengeHabit[]> {
    const rows = habits.map((h) => ({
      challenge_id: challengeId,
      habit_id: h.habit_id || null,
      title: h.title.trim(),
      description: h.description?.trim() || null,
      category: h.category || "other",
      target_minutes: h.target_minutes ?? 0,
      is_linked_habit: Boolean(h.is_linked_habit),
    }));

    const { data, error } = await supabase
      .from("challenge_habits")
      .insert(rows)
      .select();
    if (error) throw error;
    return data ?? [];
  },

  // ── Challenge logs ──────────────────────────────────────────

  async findLogsByChallenge(challengeId: string): Promise<ChallengeLog[]> {
    const { data, error } = await supabase
      .from("challenge_logs")
      .select("*")
      .eq("challenge_id", challengeId)
      .order("log_date", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  async findLogsByDate(
    challengeId: string,
    logDate: string,
  ): Promise<ChallengeLog[]> {
    const { data, error } = await supabase
      .from("challenge_logs")
      .select("*")
      .eq("challenge_id", challengeId)
      .eq("log_date", logDate);
    if (error) throw error;
    return data ?? [];
  },

  async upsertLog(
    log: Omit<ChallengeLog, "id" | "created_at">,
  ): Promise<{ success: true; data: ChallengeLog } | { success: false; error: string }> {
    const { data, error } = await supabase
      .from("challenge_logs")
      .upsert(log, { onConflict: "challenge_habit_id,log_date" })
      .select()
      .single();
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  async deleteLog(
    challengeHabitId: string,
    logDate: string,
  ): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from("challenge_logs")
      .delete()
      .eq("challenge_habit_id", challengeHabitId)
      .eq("log_date", logDate);
    if (error) return { success: false, error: error.message };
    return { success: true };
  },
};
