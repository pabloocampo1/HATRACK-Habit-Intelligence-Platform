"use server";

import { CreateHabitPayload, Habit } from "@/lib/types";

import {
  getAllHabitsByUser,
  saveHabit,
  deleteHabit as habitDelete,
} from "@/services/habitService";

export async function fetchHabits(userId: string): Promise<Habit[]> {
  try {
    return await getAllHabitsByUser(userId);
  } catch (e) {
    return [];
  }
}

export async function save(habit: CreateHabitPayload, userId: string) {
  try {
    const newHabit: Habit = {
      user_id: userId,
      title: habit.title,
      category: habit.category,
      frequency: habit.frequency,
      target_minutes: habit.target_minutes,
    };

    const result = await saveHabit(newHabit, userId);

    if (!result.success) {
      throw new Error(result.error);
    }

    return result;
  } catch (e) {
    return { success: false, error: "Error creando hábito" };
  }
}

export default async function deleteHabit(habitId: string) {
  try {
    // this function have a nickname, the real name is deleteHabit in habit service
    const res = await habitDelete(habitId);
    return res;
  } catch (e) {
    return { success: false, error: "Error eliminando hábito" };
  }
}
