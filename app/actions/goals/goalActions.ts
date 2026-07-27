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
  addMilestoneStep,
  toggleMilestoneStep,
  deleteMilestoneStep,
  canCreateGoal,
} from "@/services/goals/goalService";
import { subscriptionRepository } from "@/lib/supabase/repository/subscriptionRepository";
import { getLimits } from "@/lib/plans/limits";
import { getCurrentPlanLabel, isFreeUser } from "@/services/plans/subscriptionService";
import type { CreateGoalPayload, Goal } from "@/lib/types";
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
    return { success: false as const, error: "El título de la submeta es obligatorio." };
  }
  try {
    return await addMilestone(goalId, userId, title, dueDate);
  } catch {
    return { success: false as const, error: "Error al agregar la submeta." };
  }
}

export async function toggleMilestoneAction(milestoneId: string, completed: boolean) {
  try {
    return await toggleMilestone(milestoneId, completed);
  } catch {
    return { success: false as const, error: "Error al actualizar la submeta." };
  }
}

export async function deleteMilestoneAction(milestoneId: string) {
  try {
    return await deleteMilestone(milestoneId);
  } catch {
    return { success: false as const, error: "Error al eliminar la submeta." };
  }
}

// ── Milestone steps ───────────────────────────────────────────

export async function addMilestoneStepAction(
  milestoneId: string,
  title: string,
) {
  if (!title?.trim()) {
    return { success: false as const, error: "El título del paso es obligatorio." };
  }
  try {
    return await addMilestoneStep(milestoneId, title);
  } catch {
    return { success: false as const, error: "Error al agregar el paso." };
  }
}

export async function toggleMilestoneStepAction(stepId: string, completed: boolean) {
  try {
    return await toggleMilestoneStep(stepId, completed);
  } catch {
    return { success: false as const, error: "Error al actualizar el paso." };
  }
}

export async function deleteMilestoneStepAction(stepId: string) {
  try {
    return await deleteMilestoneStep(stepId);
  } catch {
    return { success: false as const, error: "Error al eliminar el paso." };
  }
}
