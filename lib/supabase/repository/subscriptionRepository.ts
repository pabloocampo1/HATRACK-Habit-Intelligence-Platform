import { supabase } from "../config/supabaseClient";
import type { PlanId, Subscription } from "@/lib/types";

export const subscriptionRepository = {
  /**
   * Returns the user's subscription row.
   * Falls back to a virtual FREE subscription if none exists yet
   * (covers users created before the subscriptions table was added).
   */
  async findByUser(userId: string): Promise<Subscription> {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      // Graceful fallback — treat missing row as FREE
      return {
        id: "",
        user_id: userId,
        plan: "free",
        status: "active",
        starts_at: new Date().toISOString(),
      };
    }

    return data as Subscription;
  },

  /**
   * Upsert a subscription — used by the future payments webhook.
   * Requires service_role key on the server side.
   */
  async upsert(
    userId: string,
    plan: PlanId,
    opts?: { externalId?: string; expiresAt?: string },
  ): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase.from("subscriptions").upsert(
      {
        user_id: userId,
        plan,
        status: "active",
        external_id: opts?.externalId ?? null,
        expires_at: opts?.expiresAt ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

    if (error) return { success: false, error: error.message };
    return { success: true };
  },
};
