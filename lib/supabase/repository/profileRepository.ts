import { supabase } from "../config/supabaseClient";
import type { Profile } from "@/lib/types";

export const profileRepository = {
  async findByUser(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !data) return null;
    return data as Profile;
  },

  async upsert(
    userId: string,
    patch: { display_name?: string; avatar_url?: string },
  ): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase.from("profiles").upsert(
      { id: userId, ...patch, updated_at: new Date().toISOString() },
      { onConflict: "id" },
    );
    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  /** Hard-deletes the auth user — cascades to all tables via FK */
  async deleteAccount(userId: string): Promise<{ success: boolean; error?: string }> {
    // Supabase only allows deleting your own account via the admin API
    // We call a Postgres function that runs with SECURITY DEFINER
    const { error } = await supabase.rpc("delete_own_account");
    if (error) return { success: false, error: error.message };
    return { success: true };
  },
};
