import { habitLogRepository } from "@/lib/supabase/repository/habitLogRepository";
import { HabitLog } from "@/lib/types";

export async function getTodayHabitsLogsByUser(
  userId: string,
): Promise<HabitLog[]> {
  const now = new Date();
  const todayStart = new Date(now.setHours(0, 0, 0, 0)).toISOString();
  return await habitLogRepository.findTodayLogs(userId, todayStart);
}

export async function getLastWeekHabitsLogsByUser(
  userId: string,
): Promise<HabitLog[]> {
  const now = new Date();

  const firstDayOfWeek = new Date(
    now.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)),
  );
  firstDayOfWeek.setHours(0, 0, 0, 0);
  const weekStart = firstDayOfWeek.toISOString();
  return await habitLogRepository.findWeeklyLogs(userId, weekStart);
}

export async function getAllHabitsLogsByUser(userId: string) {}

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
