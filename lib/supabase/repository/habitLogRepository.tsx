// Tu cliente de Supabase

import { HabitLog } from "@/lib/types";
import { supabase } from "../config/supabaseClient";

export const habitLogRepository = {
  async findTodayLogs(userId: string, todayStart: string) {
    const { data, error } = await supabase
      .from("habit_logs")
      .select("*, habits!inner(*)") // Join con la tabla de hábitos
      .eq("habits.user_id", userId)
      .gte("created_at", todayStart)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async findWeeklyLogs(userId: string, weekStart: string) {
    const { data, error } = await supabase
      .from("habit_logs")
      .select("*, habits!inner(*)")
      .eq("habits.user_id", userId)
      .gte("created_at", weekStart)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data;
  },

  async findAllHabitLogsByMonth(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<HabitLog[]> {
    try {
      const { data, error } = await supabase
        .from("habit_logs")
        .select(
          `
      *,
      habits!inner(id, title, user_id)
    `,
        )
        .eq("habits.user_id", userId)
        .gte("log_date", startDate)
        .lte("log_date", endDate)
        .order("log_date", { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      return [];
    }
  },

  async save(habitId: string, habitLog: HabitLog, userId: string) {
    const habitLogPayload = {
      ...habitLog,
      habit_id: habitId,
      user_id: userId,
      log_date: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase
        .from("habit_logs")
        .insert([habitLogPayload])
        .select();

      if (error) throw new Error(error.message);
      return { success: true, data: "Registrado correctamente." };
    } catch (e) {
      return { success: false, error: "error.message" };
    }
  },
};
