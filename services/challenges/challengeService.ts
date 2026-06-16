import { challengeRepository } from "@/lib/supabase/repository/challengeRepository";
import { habitLogRepository } from "@/lib/supabase/repository/habitLogRepository";
import {
  canCreateChallenge,
  canAddChallengeHabit,
} from "@/services/plans/subscriptionService";
import type {
  Challenge,
  ChallengeHabit,
  ChallengeLog,
  CreateChallengePayload,
} from "@/lib/types";

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export interface ChallengeDetail {
  challenge: Challenge;
  habits: ChallengeHabit[];
  logs: ChallengeLog[];
  /** Set of "YYYY-MM-DD" dates where ALL habits were completed */
  perfectDays: Set<string>;
  /** Completion rate 0-100 */
  completionRate: number;
  /** Days elapsed (capped at duration_days) */
  daysElapsed: number;
  isFinished: boolean;
}

export async function getChallengesByUser(userId: string): Promise<Challenge[]> {
  const challenges = await challengeRepository.findAllByUser(userId);
  // Auto-complete challenges whose end_date has passed
  const today = todayISO();
  for (const c of challenges) {
    if (c.status === "active" && c.end_date < today) {
      await challengeRepository.updateStatus(c.id, "completed");
      c.status = "completed";
    }
  }
  return challenges;
}

export async function getChallengeDetail(
  challengeId: string,
): Promise<ChallengeDetail | null> {
  const challenge = await challengeRepository.findById(challengeId);
  if (!challenge) return null;

  const [habits, logs] = await Promise.all([
    challengeRepository.findHabitsByChallenge(challengeId),
    challengeRepository.findLogsByChallenge(challengeId),
  ]);

  const today = todayISO();
  const isFinished =
    challenge.status !== "active" || challenge.end_date < today;

  // Build perfect days
  const logsByDate = new Map<string, Set<string>>();
  for (const log of logs) {
    if (!log.completed) continue;
    if (!logsByDate.has(log.log_date)) logsByDate.set(log.log_date, new Set());
    logsByDate.get(log.log_date)!.add(log.challenge_habit_id);
  }
  const habitIds = new Set(habits.map((h) => h.id));
  const perfectDays = new Set<string>();
  for (const [date, done] of logsByDate.entries()) {
    if (done.size >= habitIds.size && habitIds.size > 0) {
      perfectDays.add(date);
    }
  }

  // Days elapsed
  const startMs = new Date(challenge.start_date + "T00:00:00").getTime();
  const nowMs = new Date(today + "T00:00:00").getTime();
  const daysElapsed = Math.min(
    challenge.duration_days,
    Math.max(0, Math.floor((nowMs - startMs) / 86_400_000) + 1),
  );

  const totalPossible = daysElapsed * Math.max(habits.length, 1);
  const totalDone = logs.filter((l) => l.completed).length;
  const completionRate =
    totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0;

  return { challenge, habits, logs, perfectDays, completionRate, daysElapsed, isFinished };
}

export async function createChallenge(
  userId: string,
  payload: CreateChallengePayload,
): Promise<{ success: true; data: Challenge } | { success: false; error: string }> {
  // Guard: active challenge limit
  const challengeCapability = await canCreateChallenge(userId);
  if (!challengeCapability.allowed) {
    return { success: false, error: challengeCapability.reason! };
  }

  // Guard: exclusive habits per challenge limit
  const exclusiveHabits = payload.habits.filter((h) => !h.is_linked_habit);
  const habitCapability = await canAddChallengeHabit(userId, exclusiveHabits.length);
  if (!habitCapability.allowed) {
    return { success: false, error: habitCapability.reason! };
  }

  const result = await challengeRepository.create(userId, payload);
  if (!result.success) return result;

  try {
    await challengeRepository.createHabits(result.data.id, payload.habits);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error creando hábitos del reto";
    return { success: false, error: msg };
  }

  return { success: true, data: result.data };
}

export async function toggleChallengeHabit(
  challengeLog: Omit<ChallengeLog, "id" | "created_at">,
  linkedHabitId: string | null | undefined,
): Promise<{ success: boolean; error?: string }> {
  if (challengeLog.completed) {
    // Mark as done
    const upsertResult = await challengeRepository.upsertLog(challengeLog);
    if (!upsertResult.success) return { success: false, error: upsertResult.error };

    // If linked to a real habit, create a habit_log entry
    if (linkedHabitId) {
      await habitLogRepository.save(linkedHabitId, {
        log_date: challengeLog.log_date,
        minutes_completed: 0,
        quality_score: 4,
        completed: true,
        notes: "Completado desde reto",
      }, challengeLog.user_id);
    }

    return { success: true };
  } else {
    // Unmark
    return challengeRepository.deleteLog(
      challengeLog.challenge_habit_id,
      challengeLog.log_date,
    );
  }
}

export async function abandonChallenge(
  challengeId: string,
): Promise<{ success: boolean; error?: string }> {
  return challengeRepository.updateStatus(challengeId, "abandoned");
}
