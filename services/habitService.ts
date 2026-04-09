import { habitRepository } from "@/lib/supabase/repository/habitRepository";
import { Habit } from "@/lib/types";

export async function getAllHabitsByUser(userId: string): Promise<Habit[]> {
  return await habitRepository.getAllHabitsUser(userId);
}

export async function saveHabit(habit: Habit, userId: string) {
  try {
    // agregar logica del limite de ranking de habitos.

    const userHabits: Habit[] = await getAllHabitsByUser(userId);

    // inicialmente la version 1 de este proyecto permite 10 habitos // adapater according the role of the user - future issue
    if (userHabits.length >= 10) {
      return { success: false, error: "Limite de hábitos alcanzado" };
    }

    // validar campos

    const newHabit = { ...habit, user_id: userId };

    return await habitRepository.save(newHabit);
  } catch (error: any) {
    console.error(error);

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
