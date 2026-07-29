import { habitLogRepository } from "@/lib/supabase/repository/habitLogRepository";
import { HabitLog } from "@/lib/types";
import {
  bogotaTodayYMD,
  monthRangeBogotaYMD,
  startOfWeekBogotaYMD,
} from "@/lib/dates/bogota";

export async function getTodayHabitsLogsByUser(
  userId: string,
): Promise<HabitLog[]> {
  return await habitLogRepository.findTodayLogs(userId, bogotaTodayYMD());
}

export async function getLastWeekHabitsLogsByUser(
  userId: string,
): Promise<HabitLog[]> {
  return await habitLogRepository.findWeeklyLogs(userId, startOfWeekBogotaYMD());
}

export async function getAllHabitsLogsByUser(userId: string) {
  return habitLogRepository.findAllByUser(userId);
}

export async function getAllHabitsLogsByMonth(
  userId: string,
): Promise<HabitLog[]> {
  try {
    const { start: startDate, end: endDate } = monthRangeBogotaYMD();

    return await habitLogRepository.findAllHabitLogsByMonth(
      userId,
      startDate,
      endDate,
    );
  } catch {
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "";
    return {
      success: false,
      error: `No se pudo registrar la actividad${message ? `: ${message}` : ""}`,
    };
  }
}

export async function removeTodayHabitLogs(
  habitId: string,
  userId: string,
) {
  return habitLogRepository.deleteTodayLogsForHabit(
    habitId,
    userId,
    bogotaTodayYMD(),
  );
}
