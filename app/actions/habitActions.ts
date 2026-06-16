"use server";

import { CreateHabitPayload, Habit } from "@/lib/types";

import {
  getAllHabitsByUser,
  saveHabit,
  updateHabit as habitUpdate,
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
      title: habit.title.trim(),
      description: habit.description?.trim() || null,
      category: habit.category || "other",
      frequency: habit.frequency,
      target_minutes: habit.target_minutes,
    };

    const result = await saveHabit(newHabit, userId);

    if (!result.success) {
      return {
        success: false as const,
        error:
          typeof result.error === "string"
            ? result.error
            : "No se pudo crear el hábito.",
      };
    }

    return result;
  } catch {
    return { success: false as const, error: "Error creando hábito" };
  }
}

export async function updateHabit(
  habitId: string,
  fields: Partial<Pick<Habit, "title" | "description" | "category" | "frequency" | "target_minutes">>,
) {
  try {
    if (!fields.title?.trim()) {
      return { success: false as const, error: "El título es obligatorio." };
    }
    return await habitUpdate(habitId, {
      ...fields,
      title: fields.title!.trim(),
      description: fields.description?.trim() || undefined,
    });
  } catch {
    return { success: false as const, error: "Error actualizando hábito" };
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
