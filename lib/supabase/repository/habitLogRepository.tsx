// Tu cliente de Supabase

import { HabitLog } from "@/lib/types";
import { supabase } from "../config/supabaseClient";

export const habitLogRepository = {
  async findTodayLogs(userId: string, todayStart: string) {
    const { data, error } = await supabase
      .from("habit_logs")
      .select("*, habits!inner(*)")
      .eq("habits.user_id", userId)
      .eq("log_date", todayStart)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async findWeeklyLogs(userId: string, weekStart: string) {
    const { data, error } = await supabase
      .from("habit_logs")
      .select("*, habits!inner(*)")
      .eq("habits.user_id", userId)
      .gte("log_date", weekStart)
      .order("log_date", { ascending: true });

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

  async findSinceDate(userId: string, startDate: string): Promise<HabitLog[]> {
    const { data, error } = await supabase
      .from("habit_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("log_date", startDate)
      .order("log_date", { ascending: true });

    if (error) throw error;
    return data ?? [];
  },

  async findAllByUser(userId: string): Promise<HabitLog[]> {
    const { data, error } = await supabase
      .from("habit_logs")
      .select("*")
      .eq("user_id", userId)
      .order("log_date", { ascending: true });

    if (error) throw error;
    return data ?? [];
  },

  async save(habitId: string, habitLog: HabitLog, userId: string) {
    if (!habitId?.trim()) {
      return { success: false as const, error: "Debes elegir un hábito." };
    }

    const now = new Date();
    const todayLocal = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    const logDate =
      typeof habitLog.log_date === "string" &&
      /^\d{4}-\d{2}-\d{2}/.test(habitLog.log_date)
        ? habitLog.log_date.slice(0, 10)
        : todayLocal;

    const habitLogPayload = {
      habit_id: habitId,
      user_id: userId,
      log_date: logDate,
      minutes_completed: Math.max(0, Number(habitLog.minutes_completed) || 0),
      quality_score: Math.min(
        5,
        Math.max(1, Number(habitLog.quality_score) || 1),
      ),
      completed: Boolean(habitLog.completed),
      notes: habitLog.notes?.trim() ? habitLog.notes.trim() : null,
      daily_focus: habitLog.daily_focus?.trim()
        ? habitLog.daily_focus.trim()
        : null,
      energy_level:
        habitLog.energy_level == null ||
        Number.isNaN(Number(habitLog.energy_level))
          ? null
          : Math.min(5, Math.max(1, Number(habitLog.energy_level))),
      mental_state: habitLog.mental_state?.trim()
        ? habitLog.mental_state.trim()
        : null,
    };

    try {
      const { data, error } = await supabase
        .from("habit_logs")
        .insert([habitLogPayload])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return { success: true as const, data };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error al guardar el registro";
      return { success: false as const, error: msg };
    }
  },
};
