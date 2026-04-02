// src/services/authService.ts

import { createClient } from "@/lib/supabase/config/server";
import { supabase } from "@/lib/supabase/config/supabaseClient";
import { User } from "@/lib/types";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userDto: User = {
    id: user?.id ?? "",
    email: user?.email ?? "",
    created_at: user?.created_at ?? "",
  };
  return userDto; // Retorna el objeto user o null
}

export async function getUserFromToken(token: string) {
  const { data, error } = await supabase.auth.getUser(token);

  if (error) return null;

  return data.user;
}
