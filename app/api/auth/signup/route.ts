import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase/config/supabaseClient";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ user: data.user, session: data.session });
  } catch (err) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
