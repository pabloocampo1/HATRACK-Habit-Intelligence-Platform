// lib/supabase/repository/habitRepository.t

import { Habit } from "@/lib/types";
import { supabase } from "../config/supabaseClient";

export const habitRepository = {
  async getAllHabitsUser(userId: string) {
    const { data, error } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },
  async save(habit: Omit<Habit, "id">) {
    try {
      const { data, error } = await supabase
        .from("habits")
        .insert([habit])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return { success: true, data: data as Habit };
    } catch (err: any) {
      console.error(err);

      return { success: false, error: err.message || "Error de conexión" };
    }
  },

  async delete(id: string) {
    try {
      const { error } = await supabase.from("habits").delete().eq("id", id);
      if (error) throw error;
      return { success: true, data: null };
    } catch (error: any) {
      console.error(error);
      return { success: false, error: error.message };
    }
  },

  async findById(id: string) {
    try {
      const { data, error } = await supabase
        .from("habits")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Habit;
    } catch (error: any) {
      console.error(error);
      return null;
    }
  },
};
