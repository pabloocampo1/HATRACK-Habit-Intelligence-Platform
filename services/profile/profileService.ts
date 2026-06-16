import { profileRepository } from "@/lib/supabase/repository/profileRepository";
import { subscriptionRepository } from "@/lib/supabase/repository/subscriptionRepository";
import { habitRepository } from "@/lib/supabase/repository/habitRepository";
import { challengeRepository } from "@/lib/supabase/repository/challengeRepository";
import { getLimits } from "@/lib/plans/limits";
import type { Profile, Subscription } from "@/lib/types";

export interface ProfilePageData {
  profile: Profile | null;
  subscription: Subscription;
  stats: {
    totalHabits: number;
    totalChallenges: number;
    activeChallenges: number;
    completedChallenges: number;
    memberSince: string;
  };
  limits: {
    habits: number;
    challenges: number;
    challengeHabits: number;
    logsPerHabitPerDay: number;
    historyDays: number;
  };
  planLabel: string;
  isPremium: boolean;
}

export async function getProfilePageData(
  userId: string,
  userEmail: string,
  userCreatedAt: string,
): Promise<ProfilePageData> {
  const [profile, subscription, habits, challenges] = await Promise.all([
    profileRepository.findByUser(userId),
    subscriptionRepository.findByUser(userId),
    habitRepository.getAllHabitsUser(userId),
    challengeRepository.findAllByUser(userId),
  ]);

  const limits = getLimits(subscription.plan);

  return {
    profile,
    subscription,
    stats: {
      totalHabits: habits.length,
      totalChallenges: challenges.length,
      activeChallenges: challenges.filter((c) => c.status === "active").length,
      completedChallenges: challenges.filter((c) => c.status === "completed").length,
      memberSince: userCreatedAt,
    },
    limits: {
      habits: limits.habits,
      challenges: limits.challenges,
      challengeHabits: limits.challengeHabits,
      logsPerHabitPerDay: limits.logsPerHabitPerDay,
      historyDays: limits.historyDays,
    },
    planLabel: limits.label,
    isPremium: limits.isPremium,
  };
}

export async function updateDisplayName(
  userId: string,
  displayName: string,
): Promise<{ success: boolean; error?: string }> {
  const trimmed = displayName.trim();
  if (!trimmed) return { success: false, error: "El nombre no puede estar vacío." };
  if (trimmed.length > 60) return { success: false, error: "Máximo 60 caracteres." };
  return profileRepository.upsert(userId, { display_name: trimmed });
}

export async function deleteAccount(
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  return profileRepository.deleteAccount(userId);
}
