import { createClient } from "@/lib/supabase/config/server";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  // Redirect to login — Supabase clears its own session cookies automatically
  return NextResponse.json({ ok: true });
}
