"use server";

import {
  createHabitCategory,
  deleteHabitCategory,
  getHabitCategoriesByUser,
  updateHabitCategory,
} from "@/services/habitCategoryService";
import type {
  CreateHabitCategoryPayload,
  UpdateHabitCategoryPayload,
} from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function fetchHabitCategories(userId: string) {
  return getHabitCategoriesByUser(userId);
}

export async function createHabitCategoryAction(
  userId: string,
  payload: CreateHabitCategoryPayload,
) {
  const created = await createHabitCategory(userId, payload);
  revalidatePath("/dashboard");
  revalidatePath("/habits");
  return created;
}

export async function updateHabitCategoryAction(
  userId: string,
  categoryId: string,
  payload: UpdateHabitCategoryPayload,
) {
  const updated = await updateHabitCategory(userId, categoryId, payload);
  revalidatePath("/dashboard");
  revalidatePath("/habits");
  return updated;
}

export async function deleteHabitCategoryAction(
  userId: string,
  categoryId: string,
) {
  await deleteHabitCategory(userId, categoryId);
  revalidatePath("/dashboard");
  revalidatePath("/habits");
}
