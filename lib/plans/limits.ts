import type { PlanId } from "@/lib/types";

/**
 * Single source of truth for plan limits.
 * To add a new plan (e.g. "pro_plus"), add an entry here — nothing else changes.
 */
export interface PlanLimits {
  /** Max active habits. Infinity = unlimited */
  habits: number;
  /** Max active challenges. Infinity = unlimited */
  challenges: number;
  /** Max exclusive habits inside a single challenge */
  challengeHabits: number;
  /** Max log entries per *individual habit* per day (not a global daily total) */
  logsPerHabitPerDay: number;
  /** Days of history visible in heatmaps/stats. Infinity = all time */
  historyDays: number;
  /** Max active personal goals */
  goals: number;
  /** Max milestones per goal */
  goalMilestones: number;
  /** Whether PRO-only features (habit/challenge linking) are enabled */
  goalLinking: boolean;
  /** Human-readable plan name */
  label: string;
  /** Whether this plan has access to premium features */
  isPremium: boolean;
}

export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  free: {
    habits: 8,
    challenges: 4,
    challengeHabits: 5,
    logsPerHabitPerDay: 1,
    historyDays: 30,
    goals: 5,
    goalMilestones: 3,
    goalLinking: false,
    label: "Gratuito",
    isPremium: false,
  },
  pro: {
    habits: Infinity,
    challenges: Infinity,
    challengeHabits: Infinity,
    logsPerHabitPerDay: Infinity,
    historyDays: Infinity,
    goals: Infinity,
    goalMilestones: Infinity,
    goalLinking: true,
    label: "Pro",
    isPremium: true,
  },
  pro_plus: {
    habits: Infinity,
    challenges: Infinity,
    challengeHabits: Infinity,
    logsPerHabitPerDay: Infinity,
    historyDays: Infinity,
    goals: Infinity,
    goalMilestones: Infinity,
    goalLinking: true,
    label: "Pro+",
    isPremium: true,
  },
  lifetime: {
    habits: Infinity,
    challenges: Infinity,
    challengeHabits: Infinity,
    logsPerHabitPerDay: Infinity,
    historyDays: Infinity,
    goals: Infinity,
    goalMilestones: Infinity,
    goalLinking: true,
    label: "Lifetime",
    isPremium: true,
  },
} as const;

/** Convenience: get limits for a plan, falling back to FREE if unknown */
export function getLimits(plan: PlanId): PlanLimits {
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
}

/** Human-friendly limit display (shows "ilimitados" for Infinity) */
export function formatLimit(value: number): string {
  return value === Infinity ? "ilimitados" : String(value);
}
