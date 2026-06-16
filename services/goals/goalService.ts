import { goalRepository } from "@/lib/supabase/repository/goalRepository";
import { subscriptionRepository } from "@/lib/supabase/repository/subscriptionRepository";
import { getLimits, formatLimit } from "@/lib/plans/limits";
import { getCurrentPlanLabel, isFreeUser } from "@/services/plans/subscriptionService";
import type {
  Goal,
  GoalDetail,
  GoalMilestone,
  CreateGoalPayload,
  GoalPriority,
  GoalStatus,
  GoalCategory,
} from "@/lib/types";

// ── Progress calculation ─────────────────────────────────────

function calcProgress(
  milestones: GoalMilestone[],
  progressManual: number | null | undefined,
): number {
  if (milestones.length > 0) {
    const done = milestones.filter((m) => m.completed).length;
    return Math.round((done / milestones.length) * 100);
  }
  return progressManual ?? 0;
}

function calcDaysRemaining(targetDate: string | null | undefined): number | null {
  if (!targetDate) return null;
  const diff = new Date(targetDate).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ── Capability guard ─────────────────────────────────────────

export async function canCreateGoal(userId: string) {
  const [subscription, activeCount] = await Promise.all([
    subscriptionRepository.findByUser(userId),
    goalRepository.countActiveGoals(userId),
  ]);

  const limits = getLimits(subscription.plan);
  const limit = limits.goals;

  if (activeCount >= limit) {
    return {
      allowed: false as const,
      reason:
        `Has alcanzado el límite de ${formatLimit(limit)} meta${limit === 1 ? "" : "s"} activa${limit === 1 ? "" : "s"} ` +
        `del plan ${getCurrentPlanLabel(subscription.plan)}. ` +
        (isFreeUser(subscription.plan)
          ? "Actualiza a Pro para crear metas ilimitadas."
          : ""),
      current: activeCount,
      limit,
    };
  }

  return { allowed: true as const, current: activeCount, limit };
}

export async function canAddMilestone(userId: string, goalId: string) {
  const [subscription, count] = await Promise.all([
    subscriptionRepository.findByUser(userId),
    goalRepository.countMilestonesForGoal(goalId),
  ]);

  const limits = getLimits(subscription.plan);
  const limit = limits.goalMilestones;

  if (count >= limit) {
    return {
      allowed: false as const,
      reason:
        `Has alcanzado el límite de ${formatLimit(limit)} hito${limit === 1 ? "" : "s"} por meta ` +
        `del plan ${getCurrentPlanLabel(subscription.plan)}. ` +
        (isFreeUser(subscription.plan)
          ? "Actualiza a Pro para agregar hitos ilimitados."
          : ""),
      current: count,
      limit,
    };
  }

  return { allowed: true as const, current: count, limit };
}

export async function canLinkGoalItems(userId: string) {
  const subscription = await subscriptionRepository.findByUser(userId);
  const limits = getLimits(subscription.plan);

  if (!limits.goalLinking) {
    return {
      allowed: false as const,
      reason: `Vincular hábitos y retos a una meta es una función exclusiva del plan Pro. Actualiza para desbloquearla.`,
    };
  }

  return { allowed: true as const };
}

// ── Read ─────────────────────────────────────────────────────

export async function getGoalsByUser(userId: string): Promise<Goal[]> {
  return goalRepository.findAllByUser(userId);
}

export async function getGoalDetail(
  goalId: string,
  userId: string,
): Promise<GoalDetail | null> {
  const [goal, milestones, linkedHabits, linkedChallenges] = await Promise.all([
    goalRepository.findById(goalId),
    goalRepository.findMilestonesByGoal(goalId),
    goalRepository.findLinkedHabits(goalId),
    goalRepository.findLinkedChallenges(goalId),
  ]);

  if (!goal || goal.user_id !== userId) return null;

  const progressPct = calcProgress(milestones, goal.progress_manual);
  const daysRemaining = calcDaysRemaining(goal.target_date);

  return {
    ...goal,
    milestones,
    linkedHabits,
    linkedChallenges,
    progressPct,
    daysRemaining,
    isOverdue: daysRemaining !== null && daysRemaining < 0 && goal.status === "active",
  };
}

// ── Write ─────────────────────────────────────────────────────

export async function createGoal(userId: string, payload: CreateGoalPayload) {
  const capability = await canCreateGoal(userId);
  if (!capability.allowed) {
    return { success: false as const, error: capability.reason };
  }

  return goalRepository.create({
    user_id: userId,
    title: payload.title.trim(),
    description: payload.description?.trim() || null,
    why: payload.why?.trim() || null,
    category: payload.category,
    priority: payload.priority,
    status: "active",
    target_date: payload.target_date || null,
    progress_manual: null,
  });
}

export async function updateGoal(
  goalId: string,
  userId: string,
  fields: Partial<Pick<Goal, "title" | "description" | "why" | "category" | "priority" | "status" | "target_date" | "progress_manual">>,
) {
  const goal = await goalRepository.findById(goalId);
  if (!goal || goal.user_id !== userId) {
    return { success: false as const, error: "Meta no encontrada." };
  }

  return goalRepository.update(goalId, fields);
}

export async function deleteGoal(goalId: string, userId: string) {
  const goal = await goalRepository.findById(goalId);
  if (!goal || goal.user_id !== userId) {
    return { success: false as const, error: "Meta no encontrada." };
  }

  return goalRepository.delete(goalId);
}

// ── Milestones ────────────────────────────────────────────────

export async function addMilestone(
  goalId: string,
  userId: string,
  title: string,
  dueDate?: string,
) {
  const capability = await canAddMilestone(userId, goalId);
  if (!capability.allowed) {
    return { success: false as const, error: capability.reason };
  }

  return goalRepository.createMilestone({
    goal_id: goalId,
    title: title.trim(),
    completed: false,
    due_date: dueDate || null,
  });
}

export async function toggleMilestone(milestoneId: string, completed: boolean) {
  return goalRepository.updateMilestone(milestoneId, { completed });
}

export async function deleteMilestone(milestoneId: string) {
  return goalRepository.deleteMilestone(milestoneId);
}

// ── Linking ───────────────────────────────────────────────────

export async function linkHabitToGoal(
  goalId: string,
  habitId: string,
  userId: string,
) {
  const capability = await canLinkGoalItems(userId);
  if (!capability.allowed) {
    return { success: false as const, error: capability.reason };
  }

  return goalRepository.linkHabit(goalId, habitId);
}

export async function unlinkHabitFromGoal(goalHabitId: string) {
  return goalRepository.unlinkHabit(goalHabitId);
}

export async function linkChallengeToGoal(
  goalId: string,
  challengeId: string,
  userId: string,
) {
  const capability = await canLinkGoalItems(userId);
  if (!capability.allowed) {
    return { success: false as const, error: capability.reason };
  }

  return goalRepository.linkChallenge(goalId, challengeId);
}

export async function unlinkChallengeFromGoal(goalChallengeId: string) {
  return goalRepository.unlinkChallenge(goalChallengeId);
}
