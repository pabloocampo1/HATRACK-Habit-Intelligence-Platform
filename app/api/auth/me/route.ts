import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase/config/supabaseClient";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data) {
      return NextResponse.json({ error: "Usuario no autenticado" }, { status: 401 });
    }

    return NextResponse.json({ user: data.user, message: "Autenticado correctamente" });
  } catch (err) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
