"use server";

import {
  getGoalsByUser,
  getGoalDetail,
  createGoal,
  updateGoal,
  deleteGoal,
  addMilestone,
  toggleMilestone,
  deleteMilestone,
  linkHabitToGoal,
  unlinkHabitFromGoal,
  linkChallengeToGoal,
  unlinkChallengeFromGoal,
  canCreateGoal,
  canLinkGoalItems,
} from "@/services/goals/goalService";
import { subscriptionRepository } from "@/lib/supabase/repository/subscriptionRepository";
import { getLimits, formatLimit } from "@/lib/plans/limits";
import { getCurrentPlanLabel, isFreeUser } from "@/services/plans/subscriptionService";
import type { CreateGoalPayload, Goal, GoalCategory, GoalPriority, GoalStatus } from "@/lib/types";
import type { PlanId } from "@/lib/types";

// ── Read ─────────────────────────────────────────────────────

export async function fetchGoals(userId: string) {
  try {
    return await getGoalsByUser(userId);
  } catch {
    return [];
  }
}

export async function fetchGoalDetail(goalId: string, userId: string) {
  try {
    return await getGoalDetail(goalId, userId);
  } catch {
    return null;
  }
}

export interface GoalPlanInfo {
  goalCapability: { allowed: boolean; reason?: string; current: number; limit: number };
  goalLinking: boolean;
  limits: { goals: number; goalMilestones: number };
  planLabel: string;
  isFree: boolean;
}

export async function fetchGoalPlanInfo(userId: string): Promise<GoalPlanInfo> {
  const [subscription, goalCapability] = await Promise.all([
    subscriptionRepository.findByUser(userId),
    canCreateGoal(userId),
  ]);

  const plan = subscription.plan as PlanId;
  const limits = getLimits(plan);

  return {
    goalCapability,
    goalLinking: limits.goalLinking,
    limits: { goals: limits.goals, goalMilestones: limits.goalMilestones },
    planLabel: getCurrentPlanLabel(plan),
    isFree: isFreeUser(plan),
  };
}

// ── Goal CRUD ─────────────────────────────────────────────────

export async function createGoalAction(userId: string, payload: CreateGoalPayload) {
  if (!payload.title?.trim()) {
    return { success: false as const, error: "El título es obligatorio." };
  }
  try {
    return await createGoal(userId, payload);
  } catch {
    return { success: false as const, error: "Error al crear la meta." };
  }
}

export async function updateGoalAction(
  goalId: string,
  userId: string,
  fields: Partial<Pick<Goal, "title" | "description" | "why" | "category" | "priority" | "status" | "target_date" | "progress_manual">>,
) {
  try {
    return await updateGoal(goalId, userId, fields);
  } catch {
    return { success: false as const, error: "Error al actualizar la meta." };
  }
}

export async function deleteGoalAction(goalId: string, userId: string) {
  try {
    return await deleteGoal(goalId, userId);
  } catch {
    return { success: false as const, error: "Error al eliminar la meta." };
  }
}

// ── Milestones ────────────────────────────────────────────────

export async function addMilestoneAction(
  goalId: string,
  userId: string,
  title: string,
  dueDate?: string,
) {
  if (!title?.trim()) {
    return { success: false as const, error: "El título del hito es obligatorio." };
  }
  try {
    return await addMilestone(goalId, userId, title, dueDate);
  } catch {
    return { success: false as const, error: "Error al agregar el hito." };
  }
}

export async function toggleMilestoneAction(milestoneId: string, completed: boolean) {
  try {
    return await toggleMilestone(milestoneId, completed);
  } catch {
    return { success: false as const, error: "Error al actualizar el hito." };
  }
}

export async function deleteMilestoneAction(milestoneId: string) {
  try {
    return await deleteMilestone(milestoneId);
  } catch {
    return { success: false as const, error: "Error al eliminar el hito." };
  }
}

// ── Linking ───────────────────────────────────────────────────

export async function linkHabitAction(goalId: string, habitId: string, userId: string) {
  try {
    return await linkHabitToGoal(goalId, habitId, userId);
  } catch {
    return { success: false as const, error: "Error al vincular el hábito." };
  }
}

export async function unlinkHabitAction(goalHabitId: string) {
  try {
    return await unlinkHabitFromGoal(goalHabitId);
  } catch {
    return { success: false as const, error: "Error al desvincular el hábito." };
  }
}

export async function linkChallengeAction(goalId: string, challengeId: string, userId: string) {
  try {
    return await linkChallengeToGoal(goalId, challengeId, userId);
  } catch {
    return { success: false as const, error: "Error al vincular el reto." };
  }
}

export async function unlinkChallengeAction(goalChallengeId: string) {
  try {
    return await unlinkChallengeFromGoal(goalChallengeId);
  } catch {
    return { success: false as const, error: "Error al desvincular el reto." };
  }
}
