import { habitLogRepository } from "@/lib/supabase/repository/habitLogRepository";
import { HabitLog } from "@/lib/types";

export async function getTodayHabitsLogsByUser(
  userId: string,
): Promise<HabitLog[]> {
  const now = new Date();

  // Obtenemos año, mes y día por separado en local (Colombia)
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Los meses van de 0 a 11
  const day = String(now.getDate()).padStart(2, "0");

  // Formato: "2026-04-09"
  const todayDateString = `${year}-${month}-${day}`;

  return await habitLogRepository.findTodayLogs(userId, todayDateString);
}

export async function getLastWeekHabitsLogsByUser(
  userId: string,
): Promise<HabitLog[]> {
  const now = new Date();

  const dayOfWeek = now.getDay(); // 0 (domingo) a 6 (sábado)
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));

  const year = monday.getFullYear();
  const month = String(monday.getMonth() + 1).padStart(2, "0");
  const day = String(monday.getDate()).padStart(2, "0");

  const weekStartString = `${year}-${month}-${day}`;

  return await habitLogRepository.findWeeklyLogs(userId, weekStartString);
}

export async function getAllHabitsLogsByUser(userId: string) {}

export async function getAllHabitsLogsByMonth(
  userId: string,
): Promise<HabitLog[]> {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;

    const lastDay = new Date(year, month + 1, 0).getDate();
    const endDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    return await habitLogRepository.findAllHabitLogsByMonth(
      userId,
      startDate,
      endDate,
    );
  } catch (error) {
    return [];
  }
}

export async function save(
  habitId: string,
  HabitLog: HabitLog,
  userId: string,
) {
  try {
    // valid data

    const res = await habitLogRepository.save(habitId, HabitLog, userId);

    return res;
  } catch (error: any) {
    return {
      success: false,
      error: "No se pudo registrar la actividad" + error.message,
    };
  }
}
