"use server";

import {
  canCreateChallenge,
  canCreateHabit,
  getCurrentPlanLabel,
  isFreeUser,
  isProUser,
  getSubscription,
  type CapabilityResult,
} from "@/services/plans/subscriptionService";
import { getLimits } from "@/lib/plans/limits";
import type { PlanId, Subscription } from "@/lib/types";

export interface PlanInfo {
  subscription: Subscription;
  planLabel: string;
  isFree: boolean;
  isPro: boolean;
  limits: {
    habits: number;
    challenges: number;
    challengeHabits: number;
  };
  habitCapability: CapabilityResult;
  challengeCapability: CapabilityResult;
}

/**
 * Fetches everything the UI needs to render plan-aware components in one call.
 */
export async function fetchPlanInfo(userId: string): Promise<PlanInfo> {
  const [subscription, habitCapability, challengeCapability] = await Promise.all([
    getSubscription(userId),
    canCreateHabit(userId),
    canCreateChallenge(userId),
  ]);

  const plan = subscription.plan as PlanId;
  const limits = getLimits(plan);

  return {
    subscription,
    planLabel: getCurrentPlanLabel(plan),
    isFree: isFreeUser(plan),
    isPro: isProUser(plan),
    limits: {
      habits: limits.habits,
      challenges: limits.challenges,
      challengeHabits: limits.challengeHabits,
    },
    habitCapability,
    challengeCapability,
  };
}
