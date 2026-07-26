"use server";

import type {
  HabitOverview,
  HabitsGlobalInsights,
  HabitsOverviewPagination,
} from "@/app/(dashboard)/habits/types";
import { HABITS_OVERVIEW_PAGE_SIZE } from "@/app/(dashboard)/habits/types";
import {
  getGlobalInsights,
  getHabitOverviews,
  getHabitOverviewsPage,
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

export async function fetchHabitsPageData(
  userId: string,
  page = 1,
): Promise<{
  overviews: HabitOverview[];
  insights: HabitsGlobalInsights;
  pagination: HabitsOverviewPagination;
}> {
  try {
    return await getHabitsPageData(userId, page, HABITS_OVERVIEW_PAGE_SIZE);
  } catch {
    return {
      overviews: [],
      insights: EMPTY_INSIGHTS,
      pagination: {
        page: 1,
        pageSize: HABITS_OVERVIEW_PAGE_SIZE,
        totalHabits: 0,
        totalPages: 1,
      },
    };
  }
}

export async function fetchHabitOverviewsPage(
  userId: string,
  page: number,
): Promise<{
  overviews: HabitOverview[];
  pagination: HabitsOverviewPagination;
}> {
  try {
    return await getHabitOverviewsPage(userId, page, HABITS_OVERVIEW_PAGE_SIZE);
  } catch {
    return {
      overviews: [],
      pagination: {
        page: 1,
        pageSize: HABITS_OVERVIEW_PAGE_SIZE,
        totalHabits: 0,
        totalPages: 1,
      },
    };
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
