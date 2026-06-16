import { habitRepository } from "@/lib/supabase/repository/habitRepository";
import { canCreateHabit } from "@/services/plans/subscriptionService";
import { Habit } from "@/lib/types";

export async function getAllHabitsByUser(userId: string): Promise<Habit[]> {
  return await habitRepository.getAllHabitsUser(userId);
}

export async function saveHabit(habit: Habit, userId: string) {
  try {
    const capability = await canCreateHabit(userId);
    if (!capability.allowed) {
      return { success: false, error: capability.reason! };
    }

    const newHabit = { ...habit, user_id: userId };
    return await habitRepository.save(newHabit);
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message };
  }
}

export async function updateHabit(
  habitId: string,
  fields: Partial<Omit<Habit, "id" | "user_id" | "created_at">>,
) {
  try {
    return await habitRepository.update(habitId, fields);
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteHabit(habitId: string) {
  try {
    const isExistHabit = await habitRepository.findById(habitId);

    if (!isExistHabit) return { success: false, error: "Hábito no encontrado" };

    const res = await habitRepository.delete(habitId);

    return res;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
