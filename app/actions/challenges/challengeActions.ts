"use server";

import type { Challenge, ChallengeLog, CreateChallengePayload } from "@/lib/types";
import {
  abandonChallenge,
  createChallenge,
  getChallengeDetail,
  getChallengesByUser,
  toggleChallengeHabit,
  type ChallengeDetail,
} from "@/services/challenges/challengeService";

export async function fetchChallenges(userId: string): Promise<Challenge[]> {
  try {
    return await getChallengesByUser(userId);
  } catch {
    return [];
  }
}

export async function fetchChallengeDetail(
  challengeId: string,
): Promise<ChallengeDetail | null> {
  try {
    return await getChallengeDetail(challengeId);
  } catch {
    return null;
  }
}

export async function createChallengeAction(
  userId: string,
  payload: CreateChallengePayload,
): Promise<{ success: true; data: Challenge } | { success: false; error: string }> {
  try {
    if (!payload.title.trim()) {
      return { success: false, error: "El título es obligatorio." };
    }
    if (!payload.habits.length) {
      return { success: false, error: "Agrega al menos un hábito al reto." };
    }
    return await createChallenge(userId, payload);
  } catch {
    return { success: false, error: "Error al crear el reto." };
  }
}

export async function toggleChallengeHabitAction(
  log: Omit<ChallengeLog, "id" | "created_at">,
  linkedHabitId: string | null | undefined,
): Promise<{ success: boolean; error?: string }> {
  try {
    return await toggleChallengeHabit(log, linkedHabitId);
  } catch {
    return { success: false, error: "Error al actualizar el registro." };
  }
}

export async function abandonChallengeAction(
  challengeId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    return await abandonChallenge(challengeId);
  } catch {
    return { success: false, error: "Error al abandonar el reto." };
  }
}
