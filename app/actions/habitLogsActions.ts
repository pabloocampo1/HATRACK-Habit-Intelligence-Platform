"use server";

import { HabitLog } from "@/lib/types";
import {
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

export async function saveHabitLog(
  habitId: string,
  habitLog: HabitLog,
  userId: string,
) {
  try {
    return await save(habitId, habitLog, userId);
  } catch (error) {
    return { success: false, error: "Error al registrar actividad" };
  }
}
