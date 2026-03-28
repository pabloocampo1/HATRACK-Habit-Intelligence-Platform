import { supabase } from "@/lib/supabase/config/supabaseClient";
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

    // supabase.auth.setAuth no existe en esta versión del cliente
    // usare el filtro user_id en cada consulta

    // Obtener todos los hábitos del usuario
    const { data: habits, error: habitsError } = await supabase
      .from("habits")
      .select("id, frequency, target_minutes")
      .eq("user_id", userData.user.id);

    if (habitsError || !habits) {
      return NextResponse.json({ error: "Error al obtener hábitos" }, { status: 400 });
    }

    // Obtener último mes de registros
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startDate = thirtyDaysAgo.toISOString().split("T")[0];

    const { data: logs, error: logsError } = await supabase
      .from("habit_logs")
      .select("*")
      .eq("user_id", userData.user.id)
      .gte("log_date", startDate);

    if (logsError || !logs) {
      return NextResponse.json({ error: "Error al obtener registros" }, { status: 400 });
    }

    // Calcular estadísticas
    const totalHabits = habits.length;
    const completedLogs = logs.filter((log) => log.completed).length;
    const totalDays = 30;

    // Disciplina: % de actividades completadas
    const disciplina =
      totalHabits > 0 ? Math.round((completedLogs / (totalHabits * totalDays)) * 100) : 0;

    // Consistencia: días consecutivos completando al menos un hábito
    const uniqueDays = new Set(logs.filter((log) => log.completed).map((log) => log.log_date));
    const consistencia = Math.round((uniqueDays.size / totalDays) * 100);

    // Enfoque: promedio de calidad
    const avgQuality =
      logs.length > 0
        ? Math.round(logs.reduce((sum, log) => sum + log.quality_score, 0) / logs.length)
        : 0;
    const enfoque = Math.min(avgQuality, 100);

    // Crecimiento: comparación vs semana pasada
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastWeekStr = lastWeek.toISOString().split("T")[0];

    const thisWeekLogs = logs.filter((log) => log.log_date > lastWeekStr);
    const thisWeekCompleted = thisWeekLogs.filter((log) => log.completed).length;
    const lastWeekLogs = logs.filter(
      (log) => log.log_date <= lastWeekStr && log.log_date > startDate
    );
    const lastWeekCompleted = lastWeekLogs.filter((log) => log.completed).length;

    const crecimiento =
      lastWeekCompleted > 0
        ? Math.round(((thisWeekCompleted - lastWeekCompleted) / lastWeekCompleted) * 100) + 80
        : 80;

    // Dedicación: promedio de minutos dedicados por día
    const totalMinutes = logs.reduce((sum, log) => sum + (log.minutes_completed || 0), 0);
    const dedicacion = Math.round((totalMinutes / totalDays) * 2); // Asumiendo meta de 30 min/día, ajustar según necesidad

    return NextResponse.json({
      disciplina: Math.min(disciplina, 100),
      consistencia: Math.min(consistencia, 100),
      enfoque: Math.min(enfoque, 100),
      crecimiento: Math.min(crecimiento, 100),
      dedicacion: Math.min(dedicacion, 100),
      totalHabits,
      completedThisMonth: completedLogs,
      avgQuality,
    });
  } catch (err) {
    return NextResponse.json({ error: "Error al calcular estadísticas" }, { status: 500 });
  }
}
