import { subscriptionRepository } from "@/lib/supabase/repository/subscriptionRepository";
import { habitRepository } from "@/lib/supabase/repository/habitRepository";
import { challengeRepository } from "@/lib/supabase/repository/challengeRepository";
import { getLimits, formatLimit } from "@/lib/plans/limits";
import type { PlanId, Subscription } from "@/lib/types";

// ── Core plan fetcher ────────────────────────────────────────

export async function getSubscription(userId: string): Promise<Subscription> {
  return subscriptionRepository.findByUser(userId);
}

// ── Plan identity helpers ────────────────────────────────────

export function isFreeUser(plan: PlanId): boolean {
  return plan === "free";
}

export function isProUser(plan: PlanId): boolean {
  return plan === "pro" || plan === "pro_plus" || plan === "lifetime";
}

export function isPremiumFeatureEnabled(plan: PlanId): boolean {
  return getLimits(plan).isPremium;
}

export function getCurrentPlanLabel(plan: PlanId): string {
  return getLimits(plan).label;
}

// ── Capability checks ─────────────────────────────────────────

export interface CapabilityResult {
  allowed: boolean;
  /** Friendly message shown to the user when not allowed */
  reason?: string;
  current: number;
  limit: number;
}

/**
 * Checks whether the user can create a new habit.
 * Always validates server-side regardless of frontend state.
 */
export async function canCreateHabit(userId: string): Promise<CapabilityResult> {
  const [subscription, habits] = await Promise.all([
    subscriptionRepository.findByUser(userId),
    habitRepository.getAllHabitsUser(userId),
  ]);

  const limits = getLimits(subscription.plan);
  const current = habits.length;

  if (current >= limits.habits) {
    return {
      allowed: false,
      reason:
        `Has alcanzado el límite de ${formatLimit(limits.habits)} hábito${limits.habits === 1 ? "" : "s"} ` +
        `del plan ${getCurrentPlanLabel(subscription.plan)}. ` +
        (isFreeUser(subscription.plan)
          ? "Actualiza a Pro para crear hábitos ilimitados."
          : ""),
      current,
      limit: limits.habits,
    };
  }

  return { allowed: true, current, limit: limits.habits };
}

/**
 * Checks whether the user can create a new challenge.
 * Only counts *active* challenges toward the limit.
 */
export async function canCreateChallenge(userId: string): Promise<CapabilityResult> {
  const [subscription, challenges] = await Promise.all([
    subscriptionRepository.findByUser(userId),
    challengeRepository.findAllByUser(userId),
  ]);

  const limits = getLimits(subscription.plan);
  const activeCount = challenges.filter((c) => c.status === "active").length;

  if (activeCount >= limits.challenges) {
    return {
      allowed: false,
      reason:
        `Has alcanzado el límite de ${formatLimit(limits.challenges)} reto${limits.challenges === 1 ? "" : "s"} activo${limits.challenges === 1 ? "" : "s"} ` +
        `del plan ${getCurrentPlanLabel(subscription.plan)}. ` +
        (isFreeUser(subscription.plan)
          ? "Actualiza a Pro para crear retos ilimitados."
          : ""),
      current: activeCount,
      limit: limits.challenges,
    };
  }

  return { allowed: true, current: activeCount, limit: limits.challenges };
}

/**
 * Checks whether a challenge can accept more exclusive (non-linked) habits.
 */
export async function canAddChallengeHabit(
  userId: string,
  currentExclusiveCount: number,
): Promise<CapabilityResult> {
  const subscription = await subscriptionRepository.findByUser(userId);
  const limits = getLimits(subscription.plan);

  if (currentExclusiveCount >= limits.challengeHabits) {
    return {
      allowed: false,
      reason:
        `Puedes agregar máximo ${formatLimit(limits.challengeHabits)} hábito${limits.challengeHabits === 1 ? "" : "s"} exclusivo${limits.challengeHabits === 1 ? "" : "s"} por reto ` +
        `en el plan ${getCurrentPlanLabel(subscription.plan)}. ` +
        (isFreeUser(subscription.plan) ? "Actualiza a Pro para agregar hábitos ilimitados." : ""),
      current: currentExclusiveCount,
      limit: limits.challengeHabits,
    };
  }

  return { allowed: true, current: currentExclusiveCount, limit: limits.challengeHabits };
}

// ── Upgrade helper (ready for Stripe / MercadoPago) ──────────

/**
 * Called by the payments webhook after a successful charge.
 * Pass the provider's subscription ID in externalId.
 */
export async function upgradePlan(
  userId: string,
  plan: PlanId,
  opts?: { externalId?: string; expiresAt?: string },
): Promise<{ success: boolean; error?: string }> {
  return subscriptionRepository.upsert(userId, plan, opts);
}
