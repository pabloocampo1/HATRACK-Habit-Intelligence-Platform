"use server";

import type {
  HabitOverview,
  HabitsGlobalInsights,
} from "@/app/(dashboard)/habits/types";
import {
  getGlobalInsights,
  getHabitOverviews,
  getHabitsPageData,
} from "@/services/habits/habitOverviewService";

const EMPTY_INSIGHTS: HabitsGlobalInsights = {
  totalMinutesDedicated: 0,
  currentLongestStreakDays: 0,
  habitWithLongestStreakTitle: "—",
  bestStreakDayLabel: "—",
  bestStreakDayDetail: "Sin datos aún",
  rankings: [],
};

export async function fetchHabitsPageData(userId: string): Promise<{
  overviews: HabitOverview[];
  insights: HabitsGlobalInsights;
}> {
  try {
    return await getHabitsPageData(userId);
  } catch {
    return { overviews: [], insights: EMPTY_INSIGHTS };
  }
}

export async function fetchHabitOverviews(
  userId: string,
): Promise<HabitOverview[]> {
  try {
    return await getHabitOverviews(userId);
  } catch {
    return [];
  }
}

export async function fetchHabitsGlobalInsights(
  userId: string,
): Promise<HabitsGlobalInsights> {
  try {
    return await getGlobalInsights(userId);
  } catch {
    return EMPTY_INSIGHTS;
  }
}
