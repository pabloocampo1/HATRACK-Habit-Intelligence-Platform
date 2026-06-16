import {
  dateLocalYMD,
  densifyHeatmapValues,
  threeMonthWindow,
} from "@/lib/heatmapMonth";
import { habitRepository } from "@/lib/supabase/repository/habitRepository";
import { habitLogRepository } from "@/lib/supabase/repository/habitLogRepository";
import type { Habit, HabitLog } from "@/lib/types";
import type {
  HabitHeatmapDay,
  HabitOverview,
  HabitsGlobalInsights,
} from "@/app/(dashboard)/habits/types";

const CATEGORY_LABELS: Record<string, string> = {
  health: "Salud",
  focus: "Enfoque",
  productivity: "Productividad",
  fitness: "Fitness",
  learning: "Aprendizaje",
  other: "Otro",
};

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
): Omit<HabitOverview, "rank"> {
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
    heatmapDays: buildHeatmapDays(habitWindowLogs, start, end),
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

export async function getHabitOverviews(userId: string): Promise<HabitOverview[]> {
  const habits = await habitRepository.getAllHabitsUser(userId);
  if (!habits.length) return [];

  const reference = new Date();
  const { start } = threeMonthWindow(reference);
  const windowStart = dateLocalYMD(start);

  const [allLogs, windowLogs] = await Promise.all([
    habitLogRepository.findAllByUser(userId),
    habitLogRepository.findSinceDate(userId, windowStart),
  ]);

  return sortOverviewsByCompletions(
    habits
      .filter((h): h is Habit & { id: string } => Boolean(h.id))
      .map((habit) => buildOverview(habit, allLogs, windowLogs, reference)),
  );
}

export async function getGlobalInsights(
  userId: string,
): Promise<HabitsGlobalInsights> {
  const overviews = await getHabitOverviews(userId);
  if (!overviews.length) return EMPTY_INSIGHTS;

  const allLogs = await habitLogRepository.findAllByUser(userId);
  return buildInsightsFromOverviews(overviews, allLogs);
}

export async function getHabitsPageData(userId: string): Promise<{
  overviews: HabitOverview[];
  insights: HabitsGlobalInsights;
}> {
  const habits = await habitRepository.getAllHabitsUser(userId);
  if (!habits.length) {
    return { overviews: [], insights: EMPTY_INSIGHTS };
  }

  const reference = new Date();
  const { start } = threeMonthWindow(reference);
  const windowStart = dateLocalYMD(start);

  const [allLogs, windowLogs] = await Promise.all([
    habitLogRepository.findAllByUser(userId),
    habitLogRepository.findSinceDate(userId, windowStart),
  ]);

  const overviews = sortOverviewsByCompletions(
    habits
      .filter((h): h is Habit & { id: string } => Boolean(h.id))
      .map((habit) => buildOverview(habit, allLogs, windowLogs, reference)),
  );

  return {
    overviews,
    insights: buildInsightsFromOverviews(overviews, allLogs),
  };
}
