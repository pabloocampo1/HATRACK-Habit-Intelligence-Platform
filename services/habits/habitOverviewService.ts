import {
  dateLocalYMD,
  densifyHeatmapValues,
  threeMonthWindow,
} from "@/lib/heatmapMonth";
import { DEFAULT_HABIT_CATEGORIES } from "@/lib/habits/defaultHabitCategories";
import { habitRepository } from "@/lib/supabase/repository/habitRepository";
import { habitLogRepository } from "@/lib/supabase/repository/habitLogRepository";
import type { Habit, HabitLog } from "@/lib/types";
import type {
  HabitHeatmapDay,
  HabitOverview,
  HabitsGlobalInsights,
  HabitsOverviewPagination,
} from "@/app/(dashboard)/habits/types";
import { HABITS_OVERVIEW_PAGE_SIZE } from "@/app/(dashboard)/habits/types";

const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  DEFAULT_HABIT_CATEGORIES.map((c) => [c.slug, c.name]),
);

const EMPTY_INSIGHTS: HabitsGlobalInsights = {
  totalMinutesDedicated: 0,
  currentLongestStreakDays: 0,
  habitWithLongestStreakTitle: "—",
  bestStreakDayLabel: "—",
  bestStreakDayDetail: "Sin datos aún",
  rankings: [],
};

function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category;
}

function isCompletedLog(log: HabitLog): boolean {
  return Boolean(log.completed);
}

function logDateKey(log: HabitLog): string | null {
  if (!log.log_date) return null;
  return log.log_date.slice(0, 10);
}

function countMonth(logs: HabitLog[], year: number, monthIndex: number): number {
  return logs.filter((log) => {
    const key = logDateKey(log);
    if (!key || !isCompletedLog(log)) return false;
    const d = new Date(`${key}T12:00:00`);
    return d.getFullYear() === year && d.getMonth() === monthIndex;
  }).length;
}

function lastThreeCalendarMonthsTotal(logs: HabitLog[], reference: Date): number {
  let total = 0;
  for (let k = 0; k < 3; k++) {
    const anchor = new Date(reference.getFullYear(), reference.getMonth() - k, 1);
    total += countMonth(logs, anchor.getFullYear(), anchor.getMonth());
  }
  return total;
}

function streakFromEnd(completedDates: Set<string>, reference: Date): number {
  let streak = 0;
  for (let i = 0; i < 400; i++) {
    const d = new Date(reference);
    d.setDate(d.getDate() - i);
    const key = dateLocalYMD(d);
    if (completedDates.has(key)) streak++;
    else break;
  }
  return streak;
}

function buildHeatmapDays(
  logs: HabitLog[],
  start: Date,
  end: Date,
): HabitHeatmapDay[] {
  const byDate = new Map<string, number>();

  for (const log of logs) {
    const key = logDateKey(log);
    if (!key || !isCompletedLog(log)) continue;
    byDate.set(key, (byDate.get(key) ?? 0) + 1);
  }

  const values = [...byDate.entries()].map(([date, count]) => ({
    date,
    count: Math.min(count, 4),
  }));

  return densifyHeatmapValues(values, start, end);
}

function buildOverview(
  habit: Habit,
  allLogs: HabitLog[],
  windowLogs: HabitLog[],
  reference: Date,
  options?: { includeHeatmap?: boolean },
): Omit<HabitOverview, "rank"> {
  const includeHeatmap = options?.includeHeatmap ?? true;
  const habitId = habit.id!;
  const habitAllLogs = allLogs.filter((log) => log.habit_id === habitId);
  const habitWindowLogs = windowLogs.filter((log) => log.habit_id === habitId);
  const completedAll = habitAllLogs.filter(isCompletedLog);
  const completedWindow = habitWindowLogs.filter(isCompletedLog);

  const { start, end } = threeMonthWindow(reference);
  const completedDates = new Set(
    completedWindow
      .map(logDateKey)
      .filter((d): d is string => Boolean(d)),
  );

  return {
    id: habitId,
    title: habit.title,
    category: categoryLabel(habit.category),
    totalCompletions: completedAll.length,
    completionsThisMonth: countMonth(
      completedAll,
      reference.getFullYear(),
      reference.getMonth(),
    ),
    completionsLastThreeMonths: lastThreeCalendarMonthsTotal(
      completedAll,
      reference,
    ),
    totalMinutesDedicated: habitAllLogs.reduce(
      (sum, log) => sum + (log.minutes_completed || 0),
      0,
    ),
    currentStreakDays: streakFromEnd(completedDates, reference),
    heatmapStart: dateLocalYMD(start),
    heatmapEnd: dateLocalYMD(end),
    heatmapDays: includeHeatmap
      ? buildHeatmapDays(habitWindowLogs, start, end)
      : [],
  };
}

function findBestStreakDay(allLogs: HabitLog[]): {
  label: string;
  detail: string;
} {
  const byDate = new Map<string, number>();

  for (const log of allLogs) {
    const key = logDateKey(log);
    if (!key || !isCompletedLog(log)) continue;
    byDate.set(key, (byDate.get(key) ?? 0) + 1);
  }

  if (byDate.size === 0) {
    return { label: "—", detail: "Sin datos aún" };
  }

  let bestDate = "";
  let bestCount = 0;

  for (const [date, count] of byDate.entries()) {
    if (count > bestCount) {
      bestDate = date;
      bestCount = count;
    }
  }

  const d = new Date(`${bestDate}T12:00:00`);
  const label = d.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return {
    label: label.charAt(0).toUpperCase() + label.slice(1),
    detail: `${bestCount} hábito${bestCount === 1 ? "" : "s"} completado${bestCount === 1 ? "" : "s"} ese día`,
  };
}

function buildInsightsFromOverviews(
  overviews: HabitOverview[],
  allLogs: HabitLog[],
): HabitsGlobalInsights {
  if (!overviews.length) return EMPTY_INSIGHTS;

  const bestDay = findBestStreakDay(allLogs);
  const sorted = [...overviews].sort(
    (a, b) => b.totalCompletions - a.totalCompletions,
  );
  const maxCompletions = sorted[0]?.totalCompletions || 1;
  const longest = overviews.reduce((a, b) =>
    b.currentStreakDays > a.currentStreakDays ? b : a,
  );

  return {
    totalMinutesDedicated: overviews.reduce(
      (sum, h) => sum + h.totalMinutesDedicated,
      0,
    ),
    currentLongestStreakDays: longest.currentStreakDays,
    habitWithLongestStreakTitle: longest.title,
    bestStreakDayLabel: bestDay.label,
    bestStreakDayDetail: bestDay.detail,
    rankings: sorted.map((h) => ({
      habitId: h.id,
      title: h.title,
      completionCount: h.totalCompletions,
      barPercent: Math.round((h.totalCompletions / maxCompletions) * 100),
    })),
  };
}

function sortOverviewsByCompletions(
  overviews: Omit<HabitOverview, "rank">[],
): HabitOverview[] {
  return [...overviews]
    .sort((a, b) => {
      if (b.totalCompletions !== a.totalCompletions) {
        return b.totalCompletions - a.totalCompletions;
      }
      return b.totalMinutesDedicated - a.totalMinutesDedicated;
    })
    .map((overview, index) => ({ ...overview, rank: index + 1 }));
}

type HabitsOverviewBase = {
  habits: Array<Habit & { id: string }>;
  allLogs: HabitLog[];
  windowLogs: HabitLog[];
  reference: Date;
  rankedSummaries: HabitOverview[];
};

async function loadHabitsOverviewBase(userId: string): Promise<HabitsOverviewBase | null> {
  const habits = await habitRepository.getAllHabitsUser(userId);
  const withIds = habits.filter((h): h is Habit & { id: string } => Boolean(h.id));
  if (!withIds.length) return null;

  const reference = new Date();
  const { start } = threeMonthWindow(reference);
  const windowStart = dateLocalYMD(start);

  const [allLogs, windowLogs] = await Promise.all([
    habitLogRepository.findAllByUser(userId),
    habitLogRepository.findSinceDate(userId, windowStart),
  ]);

  const rankedSummaries = sortOverviewsByCompletions(
    withIds.map((habit) =>
      buildOverview(habit, allLogs, windowLogs, reference, {
        includeHeatmap: false,
      }),
    ),
  );

  return { habits: withIds, allLogs, windowLogs, reference, rankedSummaries };
}

function buildPaginatedOverviews(
  base: HabitsOverviewBase,
  page: number,
  pageSize: number,
): { overviews: HabitOverview[]; pagination: HabitsOverviewPagination } {
  const totalHabits = base.rankedSummaries.length;
  const totalPages = Math.max(1, Math.ceil(totalHabits / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const slice = base.rankedSummaries.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  const overviews = slice.map((summary) => {
    const habit = base.habits.find((h) => h.id === summary.id)!;
    const full = buildOverview(
      habit,
      base.allLogs,
      base.windowLogs,
      base.reference,
      { includeHeatmap: true },
    );
    return { ...full, rank: summary.rank };
  });

  return {
    overviews,
    pagination: {
      page: safePage,
      pageSize,
      totalHabits,
      totalPages,
    },
  };
}

export async function getHabitOverviewsPage(
  userId: string,
  page = 1,
  pageSize = HABITS_OVERVIEW_PAGE_SIZE,
): Promise<{
  overviews: HabitOverview[];
  pagination: HabitsOverviewPagination;
}> {
  const base = await loadHabitsOverviewBase(userId);
  if (!base) {
    return {
      overviews: [],
      pagination: {
        page: 1,
        pageSize,
        totalHabits: 0,
        totalPages: 1,
      },
    };
  }

  return buildPaginatedOverviews(base, page, pageSize);
}

export async function getHabitOverviews(userId: string): Promise<HabitOverview[]> {
  const base = await loadHabitsOverviewBase(userId);
  if (!base) return [];

  return buildPaginatedOverviews(
    base,
    1,
    base.rankedSummaries.length,
  ).overviews;
}

export async function getGlobalInsights(
  userId: string,
): Promise<HabitsGlobalInsights> {
  const base = await loadHabitsOverviewBase(userId);
  if (!base) return EMPTY_INSIGHTS;

  return buildInsightsFromOverviews(base.rankedSummaries, base.allLogs);
}

export async function getHabitsPageData(
  userId: string,
  page = 1,
  pageSize = HABITS_OVERVIEW_PAGE_SIZE,
): Promise<{
  overviews: HabitOverview[];
  insights: HabitsGlobalInsights;
  pagination: HabitsOverviewPagination;
}> {
  const base = await loadHabitsOverviewBase(userId);
  if (!base) {
    return {
      overviews: [],
      insights: EMPTY_INSIGHTS,
      pagination: {
        page: 1,
        pageSize,
        totalHabits: 0,
        totalPages: 1,
      },
    };
  }

  const { overviews, pagination } = buildPaginatedOverviews(base, page, pageSize);

  return {
    overviews,
    insights: buildInsightsFromOverviews(base.rankedSummaries, base.allLogs),
    pagination,
  };
}
