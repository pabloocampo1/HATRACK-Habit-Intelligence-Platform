import { supabase } from "@/lib/supabase/config/supabaseClient";
import { NextResponse, NextRequest } from "next/server"; // Cambiamos Request por NextRequest

// Definimos el tipo del contexto para reusarlo
type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(
  request: NextRequest, // Usamos NextRequest
  context: RouteContext, // Usamos el contexto con la Promesa
) {
  try {
    // 1. EXTRAER EL ID CON AWAIT (Esto es lo que te pide el build)
    const { id } = await context.params;

    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { data: userData, error: userError } =
      await supabase.auth.getUser(token);
    if (userError || !userData.user) {
      return NextResponse.json({ error: "Usuario no válido" }, { status: 401 });
    }

    const { title, description, category, frequency, target_minutes } =
      await request.json();

    const { data, error } = await supabase
      .from("habits")
      .update({ title, description, category, frequency, target_minutes })
      .eq("id", id) // Usamos el id extraído arriba
      .eq("user_id", userData.user.id)
      .select();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });
    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "Hábito no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json(data[0]);
  } catch (err) {
    return NextResponse.json(
      { error: "Error al actualizar hábito" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    // 1. EXTRAER EL ID CON AWAIT
    const { id } = await context.params;

    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { data: userData, error: userError } =
      await supabase.auth.getUser(token);
    if (userError || !userData.user) {
      return NextResponse.json({ error: "Usuario no válido" }, { status: 401 });
    }

    // Nota: supabase.auth.setAuth(token) suele ser para el cliente antiguo,
    // con el de SSR/Middleware se maneja distinto, pero si te funciona, déjalo.

    const { data, error } = await supabase
      .from("habits")
      .delete()
      .eq("id", id) // Usamos el id extraído arriba
      .eq("user_id", userData.user.id)
      .select();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });
    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "Hábito no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "Hábito eliminado" });
  } catch (err) {
    return NextResponse.json(
      { error: "Error al eliminar hábito" },
      { status: 500 },
    );
  }
}
