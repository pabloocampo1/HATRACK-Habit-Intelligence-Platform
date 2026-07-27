import { goalRepository } from "@/lib/supabase/repository/goalRepository";
import { subscriptionRepository } from "@/lib/supabase/repository/subscriptionRepository";
import { getLimits, formatLimit } from "@/lib/plans/limits";
import { getCurrentPlanLabel, isFreeUser } from "@/services/plans/subscriptionService";
import type {
  Goal,
  GoalDetail,
  GoalMilestone,
  GoalMilestoneStep,
  CreateGoalPayload,
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

function milestoneCompletedFromSteps(
  milestone: GoalMilestone,
  steps: GoalMilestoneStep[],
): boolean {
  if (steps.length === 0) return milestone.completed;
  return steps.every((step) => step.completed);
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
        `Has alcanzado el límite de ${formatLimit(limit)} submeta${limit === 1 ? "" : "s"} por meta ` +
        `del plan ${getCurrentPlanLabel(subscription.plan)}. ` +
        (isFreeUser(subscription.plan)
          ? "Actualiza a Pro para crear submetas ilimitadas."
          : ""),
      current: count,
      limit,
    };
  }

  return { allowed: true as const, current: count, limit };
}

// ── Read ─────────────────────────────────────────────────────

export async function getGoalsByUser(userId: string): Promise<Goal[]> {
  const goals = await goalRepository.findAllByUser(userId);

  const progressByGoal = await Promise.all(
    goals.map(async (goal) => {
      const milestones = await goalRepository.findMilestonesByGoal(goal.id!);
      const milestonesWithStatus = await Promise.all(
        milestones.map(async (milestone) => {
          const steps = await goalRepository.findStepsByMilestone(milestone.id!);
          return {
            ...milestone,
            completed: milestoneCompletedFromSteps(milestone, steps),
          };
        }),
      );
      return {
        goalId: goal.id!,
        progress: calcProgress(milestonesWithStatus, goal.progress_manual),
      };
    }),
  );

  const progressMap = new Map(
    progressByGoal.map((item) => [item.goalId, item.progress]),
  );

  return goals.map((goal) => ({
    ...goal,
    progress_manual: progressMap.get(goal.id!) ?? 0,
  }));
}

export async function getGoalDetail(
  goalId: string,
  userId: string,
): Promise<GoalDetail | null> {
  const [goal, milestones] = await Promise.all([
    goalRepository.findById(goalId),
    goalRepository.findMilestonesByGoal(goalId),
  ]);

  if (!goal || goal.user_id !== userId) return null;

  const milestonesWithSteps = await Promise.all(
    milestones.map(async (milestone) => {
      const steps = await goalRepository.findStepsByMilestone(milestone.id!);
      return {
        ...milestone,
        steps,
        completed: milestoneCompletedFromSteps(milestone, steps),
      };
    }),
  );

  const progressPct = calcProgress(milestonesWithSteps, goal.progress_manual);
  const daysRemaining = calcDaysRemaining(goal.target_date);

  return {
    ...goal,
    milestones: milestonesWithSteps,
    linkedHabits: [],
    linkedChallenges: [],
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
  const steps = await goalRepository.findStepsByMilestone(milestoneId);
  if (steps.length > 0) {
    return {
      success: false as const,
      error:
        "Esta submeta tiene pasos. Completa sus pasos para terminarla.",
    };
  }

  const result = await goalRepository.updateMilestone(milestoneId, { completed });
  await syncGoalCompletionFromMilestones(result.data.goal_id);

  return result;
}

export async function deleteMilestone(milestoneId: string) {
  const milestone = await goalRepository.findMilestoneById(milestoneId);
  if (!milestone) {
    return { success: false as const, error: "Submeta no encontrada." };
  }
  const result = await goalRepository.deleteMilestone(milestoneId);
  await syncGoalCompletionFromMilestones(milestone.goal_id);
  return result;
}

// ── Milestone steps ───────────────────────────────────────────

export async function addMilestoneStep(milestoneId: string, title: string) {
  const milestone = await goalRepository.findMilestoneById(milestoneId);
  if (!milestone) {
    return { success: false as const, error: "Submeta no encontrada." };
  }

  const result = await goalRepository.createStep({
    milestone_id: milestoneId,
    title: title.trim(),
    completed: false,
  });

  await goalRepository.updateMilestone(milestoneId, { completed: false });
  await syncGoalCompletionFromMilestones(milestone.goal_id);
  return result;
}

export async function toggleMilestoneStep(stepId: string, completed: boolean) {
  const step = await goalRepository.findStepById(stepId);
  if (!step) {
    return { success: false as const, error: "Paso no encontrado." };
  }

  const result = await goalRepository.updateStep(stepId, { completed });
  await syncMilestoneCompletionFromSteps(step.milestone_id);
  return result;
}

export async function deleteMilestoneStep(stepId: string) {
  const step = await goalRepository.findStepById(stepId);
  if (!step) {
    return { success: false as const, error: "Paso no encontrado." };
  }

  const result = await goalRepository.deleteStep(stepId);
  await syncMilestoneCompletionFromSteps(step.milestone_id);
  return result;
}

async function syncMilestoneCompletionFromSteps(milestoneId: string) {
  const milestone = await goalRepository.findMilestoneById(milestoneId);
  if (!milestone) return;

  const steps = await goalRepository.findStepsByMilestone(milestoneId);
  if (steps.length === 0) {
    await syncGoalCompletionFromMilestones(milestone.goal_id);
    return;
  }

  const shouldBeCompleted = steps.every((step) => step.completed);
  if (milestone.completed !== shouldBeCompleted) {
    await goalRepository.updateMilestone(milestoneId, {
      completed: shouldBeCompleted,
    });
  }

  await syncGoalCompletionFromMilestones(milestone.goal_id);
}

async function syncGoalCompletionFromMilestones(goalId: string) {
  const [goal, milestones] = await Promise.all([
    goalRepository.findById(goalId),
    goalRepository.findMilestonesByGoal(goalId),
  ]);
  if (!goal) return;

  const milestonesWithStatus = await Promise.all(
    milestones.map(async (milestone) => {
      const steps = await goalRepository.findStepsByMilestone(milestone.id!);
      return {
        ...milestone,
        completed: milestoneCompletedFromSteps(milestone, steps),
      };
    }),
  );

  const hasSubGoals = milestonesWithStatus.length > 0;
  const allDone =
    hasSubGoals && milestonesWithStatus.every((milestone) => milestone.completed);
  const progress = calcProgress(milestonesWithStatus, goal.progress_manual);

  if (allDone && goal.status !== "completed") {
    await goalRepository.update(goalId, { status: "completed", progress_manual: 100 });
    return;
  }

  if (!allDone && goal.status === "completed") {
    await goalRepository.update(goalId, {
      status: "active",
      progress_manual: progress,
    });
    return;
  }

  await goalRepository.update(goalId, { progress_manual: progress });
}

