import { NextResponse } from "next/server";
import { supabase } from "../../../../../lib/supabaseClient";
import { log } from "node:console";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {


    const resolvedParams = await params; 
    const habitId = resolvedParams.id;

    console.log("ID que llega al endpoint (YA RESUELTO):", habitId);
	
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) {
      return NextResponse.json({ error: "Usuario no válido" }, { status: 401 });
    }

    

    const {
      minutes_completed,
      quality_score,
      completed,
      notes,
      daily_focus,
      energy_level,
      mental_state,
    } = await request.json();

    const today = new Date().toISOString().split("T")[0]; 

    if (minutes_completed === undefined || quality_score === undefined) {
      return NextResponse.json({ error: "Faltan datos requeridos: minutes_completed, quality_score" }, { status: 400 });
    }

    // Convertir strings vacíos a null
    const logPayload = {
      habit_id: habitId,
      user_id: userData.user.id,
      log_date: today,
      minutes_completed: parseInt(String(minutes_completed)) || 0,
      quality_score: parseInt(String(quality_score)) || 1,
      completed: Boolean(completed),
      notes: notes && notes.trim() ? notes.trim() : null,
      daily_focus: daily_focus && daily_focus.trim() ? daily_focus.trim() : null,
      energy_level: energy_level ? parseInt(String(energy_level)) : null,
      mental_state: mental_state && mental_state.trim() ? mental_state.trim() : null,
    };

    console.log("📝 Log payload a insertar:", logPayload);

    const { data, error } = await supabase
      .from("habit_logs")
      .insert([logPayload])
      .select();

    if (error) {
      console.error("❌ Error de Supabase:", error);
      return NextResponse.json(
        { error: `Error en Supabase: ${error.message}` },
        { status: 400 }
      );
    }

    console.log("✅ Registro insertado exitosamente:", data[0]);
    return NextResponse.json(data[0], { status: 201 });
  } catch (err: any) {
    console.error("❌ Error catch:", err);
    return NextResponse.json(
      { error: `Error al registrar actividad: ${err.message || err}` },
      { status: 500 }
    );
  }
}


export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }>  }
) {

  const habitId = (await params).id;
  console.log("ID que llega al endpoint GET (YA RESUELTO):", habitId);

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

    const { data, error } = await supabase
      .from("habit_logs")
      .select("*")
      .eq("habit_id", habitId)
      .eq("user_id", userData.user.id)
      .order("log_date", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Error al obtener registros" }, { status: 500 });
  }
}
