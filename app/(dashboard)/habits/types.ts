/** Contratos UI para Mis hábitos — sustituir por respuestas del backend. */

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
}

export interface HabitRankingEntry {
  habitId: string;
  title: string;
  completionCount: number;
  /** 0–100 para ancho relativo de la barra (ya normalizado en backend o mock). */
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
