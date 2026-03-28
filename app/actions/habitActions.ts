
"use server";
import { getHabitPerformance } from "@/services/habitService";

export async function fetchUserStats(userId: string) {
  try {
    const stats = await getHabitPerformance(userId);
    return { success: true, data: stats };
  } catch (e) {
    return { success: false, error: "Error calculando métricas" };
  }
}