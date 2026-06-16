import { createClient } from "@/lib/supabase/config/server";
import type { User } from "@/lib/types";

/**
 * Returns the authenticated user from the Supabase session cookie.
 * Safe to call from Server Components, Server Actions, and Route Handlers.
 * Returns null if there is no active session.
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  return {
    id: user.id,
    email: user.email ?? "",
    created_at: user.created_at ?? "",
  };
}
