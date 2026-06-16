/** Contratos UI para Mis hábitos — datos agregados desde habits + habit_logs. */

export interface HabitHeatmapDay {
  date: string;
  count: number;
}

export interface HabitOverview {
  id: string;
  title: string;
  category: string;
  totalCompletions: number;
  completionsThisMonth: number;
  completionsLastThreeMonths: number;
  totalMinutesDedicated: number;
  currentStreakDays: number;
  /** Rango que cubre el heatmap (p. ej. último mes o ~90 días). */
  heatmapStart: string;
  heatmapEnd: string;
  heatmapDays: HabitHeatmapDay[];
  /** Posición en ranking por total de completaciones (1 = más hecho). */
  rank: number;
}

export interface HabitRankingEntry {
  habitId: string;
  title: string;
  completionCount: number;
  /** 0–100 para ancho relativo de la barra (normalizado en el servicio). */
  barPercent: number;
}

export interface HabitsGlobalInsights {
  totalMinutesDedicated: number;
  currentLongestStreakDays: number;
  habitWithLongestStreakTitle: string;
  /** Día con más “actividad de racha” (ej. más hábitos en racha ese día). */
  bestStreakDayLabel: string;
  bestStreakDayDetail: string;
  rankings: HabitRankingEntry[];
}
