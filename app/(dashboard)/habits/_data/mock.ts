import {
  dateLocalYMD,
  densifyHeatmapValues,
  threeMonthWindow,
} from "@/lib/heatmapMonth";
import type { HabitHeatmapDay, HabitOverview, HabitsGlobalInsights } from "../types";

/** Fecha de referencia para mocks (alinear con entorno local). */
const REF = new Date(2026, 4, 8);

function buildHeatmapLastDays(days: number, density: number): HabitHeatmapDay[] {
  const out: HabitHeatmapDay[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(REF);
    d.setDate(d.getDate() - i);
    const roll = Math.random();
    let count = 0;
    if (roll < density) count = 1;
    if (roll < density * 0.45) count = 2;
    if (roll < density * 0.18) count = 3;
    if (roll < density * 0.06) count = 4;
    out.push({ date: dateLocalYMD(d), count });
  }
  return out;
}

function sumCounts(days: HabitHeatmapDay[], predicate: (d: Date) => boolean) {
  return days.reduce((acc, { date, count }) => {
    const dt = new Date(date + "T12:00:00");
    return predicate(dt) ? acc + count : acc;
  }, 0);
}

function countMonth(days: HabitHeatmapDay[], year: number, monthIndex: number) {
  return sumCounts(
    days,
    (d) => d.getFullYear() === year && d.getMonth() === monthIndex,
  );
}

/** Suma completaciones en el mes actual y los dos meses calendario anteriores. */
function lastThreeCalendarMonthsTotal(days: HabitHeatmapDay[]) {
  let total = 0;
  for (let k = 0; k < 3; k++) {
    const anchor = new Date(REF.getFullYear(), REF.getMonth() - k, 1);
    total += countMonth(days, anchor.getFullYear(), anchor.getMonth());
  }
  return total;
}

function streakFromEnd(days: HabitHeatmapDay[]) {
  const byDate = new Map(days.map((d) => [d.date, d.count]));
  let streak = 0;
  for (let i = 0; i < 400; i++) {
    const d = new Date(REF);
    d.setDate(d.getDate() - i);
    const key = dateLocalYMD(d);
    const c = byDate.get(key) ?? 0;
    if (c > 0) streak++;
    else break;
  }
  return streak;
}

const heatA = buildHeatmapLastDays(150, 0.62);
const heatB = buildHeatmapLastDays(150, 0.48);
const heatC = buildHeatmapLastDays(150, 0.38);

const { start: heatWinStart, end: heatWinEnd } = threeMonthWindow(REF);
const heatWinStartStr = dateLocalYMD(heatWinStart);
const heatWinEndStr = dateLocalYMD(heatWinEnd);

function overview(
  id: string,
  title: string,
  category: string,
  heat: HabitHeatmapDay[],
  minutesScale: number,
): HabitOverview {
  const slice = densifyHeatmapValues(heat, heatWinStart, heatWinEnd);
  const totalCompletions = heat.reduce((s, x) => s + x.count, 0);
  const completionsThisMonth = countMonth(heat, REF.getFullYear(), REF.getMonth());
  const completionsLastThreeMonths = lastThreeCalendarMonthsTotal(heat);
  const totalMinutesDedicated = Math.round(totalCompletions * minutesScale);
  return {
    id,
    title,
    category,
    totalCompletions,
    completionsThisMonth,
    completionsLastThreeMonths,
    totalMinutesDedicated,
    currentStreakDays: streakFromEnd(heat),
    heatmapStart: heatWinStartStr,
    heatmapEnd: heatWinEndStr,
    heatmapDays: slice,
  };
}

const habitA = overview("h1", "Lectura 25 min", "Enfoque", heatA, 22);
const habitB = overview("h2", "Entrenamiento", "Salud", heatB, 48);
const habitC = overview("h3", "Deep work", "Productividad", heatC, 35);

/** Lista de hábitos + métricas por tarjeta — reemplazar por fetch del backend. */
export const MOCK_HABIT_OVERVIEWS: HabitOverview[] = [habitA, habitB, habitC];

const rankings = [...MOCK_HABIT_OVERVIEWS]
  .sort((a, b) => b.totalCompletions - a.totalCompletions)
  .map((h, i, arr) => ({
    habitId: h.id,
    title: h.title,
    completionCount: h.totalCompletions,
    barPercent: Math.round(
      (h.totalCompletions / (arr[0]?.totalCompletions || 1)) * 100,
    ),
  }));

/** Resumen global — reemplazar por fetch del backend. */
export const MOCK_GLOBAL_INSIGHTS: HabitsGlobalInsights = {
  totalMinutesDedicated: MOCK_HABIT_OVERVIEWS.reduce(
    (s, h) => s + h.totalMinutesDedicated,
    0,
  ),
  currentLongestStreakDays: Math.max(
    ...MOCK_HABIT_OVERVIEWS.map((h) => h.currentStreakDays),
  ),
  habitWithLongestStreakTitle:
    MOCK_HABIT_OVERVIEWS.reduce((a, b) =>
      b.currentStreakDays > a.currentStreakDays ? b : a,
    ).title,
  bestStreakDayLabel: "Domingo 4 may 2026",
  bestStreakDayDetail: "3 hábitos alcanzaron su mejor racha simultánea",
  rankings,
};
