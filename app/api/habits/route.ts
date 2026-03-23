import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";


export async function GET(request: Request) {
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

    // supabase.auth.setAuth no existe en esta versión; usamos filtros por user_id

    const { data, error } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", userData.user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Error al obtener hábitos" }, { status: 500 });
  }
}

export async function POST(request: Request) {
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

    if (!title || !category || !frequency || !target_minutes) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("habits")
      .insert([
        {
          user_id: userData.user.id,
          title,
          description,
          category,
          frequency,
          target_minutes,
        },
      ])
      .select();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json(data[0], { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Error al crear hábito" }, { status: 500 });
  }
}
