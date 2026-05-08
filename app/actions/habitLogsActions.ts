"use server";

import { HabitLog } from "@/lib/types";
import {
  getAllHabitsLogsByMonth,
  getLastWeekHabitsLogsByUser,
  getTodayHabitsLogsByUser,
  save,
} from "@/services/habitsLogsService";

export async function fecthTodayHabitLogs(userId: string) {
  try {
    const data: HabitLog[] = await getTodayHabitsLogsByUser(userId);
    return data;
  } catch (error) {
    throw [];
  }
}
export async function getHabitLogsLastWeek(userId: string) {
  try {
    const data: HabitLog[] = await getLastWeekHabitsLogsByUser(userId);
    return data;
  } catch (error) {
    throw [];
  }
}

export async function fetchHabitLogsThisMonth(userId: string) {
  try {
    const data: HabitLog[] = await getAllHabitsLogsByMonth(userId);
    return data;
  } catch (error) {
    throw [];
  }
}

export async function saveHabitLog(
  habitId: string,
  habitLog: HabitLog,
  userId: string,
) {
  try {
    const result = await save(habitId, habitLog, userId);
    if (!result.success) {
      return {
        success: false as const,
        error:
          typeof result.error === "string"
            ? result.error
            : "No se pudo registrar la sesión.",
      };
    }
    return result;
  } catch {
    return { success: false as const, error: "Error al registrar actividad" };
  }
}
