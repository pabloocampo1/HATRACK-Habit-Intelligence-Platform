import { supabase } from "@/lib/supabase/config/supabaseClient";
import { NextResponse } from "next/server";


export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) {
      return NextResponse.json({ error: "Usuario no válido" }, { status: 401 });
    }

    const { title, description, category, frequency, target_minutes } = await request.json();

    const { data, error } = await supabase
      .from("habits")
      .update({ title, description, category, frequency, target_minutes })
      .eq("id", params.id)
      .eq("user_id", userData.user.id)
      .select();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    if (!data || data.length === 0) {
      return NextResponse.json({ error: "Hábito no encontrado" }, { status: 404 });
    }

    return NextResponse.json(data[0]);
  } catch (err) {
    return NextResponse.json({ error: "Error al actualizar hábito" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) {
      return NextResponse.json({ error: "Usuario no válido" }, { status: 401 });
    }

    await supabase.auth.setAuth(token);

    const { data, error } = await supabase
      .from("habits")
      .delete()
      .eq("id", params.id)
      .eq("user_id", userData.user.id)
      .select();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    if (!data || data.length === 0) {
      return NextResponse.json({ error: "Hábito no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ message: "Hábito eliminado" });
  } catch (err) {
    return NextResponse.json({ error: "Error al eliminar hábito" }, { status: 500 });
  }
}
