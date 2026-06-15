export interface Habit {
  id?: string;
  user_id: string;
  title: string;
  description?: string | null;
  category: string;
  frequency: number;
  target_minutes: number;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface HabitLog {
  id?: string;
  habit_id?: string;
  user_id?: string;
  log_date?: string;
  minutes_completed: number;
  quality_score: number;
  completed: boolean;
  notes?: string;
  daily_focus?: string;
  energy_level?: number;
  mental_state?: string;
}

export interface Stats {
  disciplina: number;
  consistencia: number;
  enfoque: number;
  crecimiento: number;
  dedicacion: number;
  total_time: number;
  total_xp?: number;
  totalHabits?: number;
}

export interface CreateHabitPayload {
  title: string;
  description?: string;
  category: string;
  frequency: number;
  target_minutes: number;
}

export interface LogActivityPayload {
  minutes_completed: number;
  quality_score: number;
  completed: boolean;
  notes?: string;
  daily_focus?: string;
  energy_level?: number;
  mental_state?: string;
}

export interface DailyTracking {
  log_date: string;
  daily_focus: string;
  energy_level: number;
  mental_state: string;
  habits: Array<{
    habit_id: string;
    habit_title: string;
    times_completed: number;
    total_minutes: number;
    quality_score: number;
    notes: string;
  }>;
}

export type AccountType = "BANK" | "CASH" | "DIGITAL_WALLET" | "SAVINGS";

/** Monedas usadas en la UI; la columna en BD es VARCHAR(20). */
export type AccountCurrency = "COP" | "USD";

/** Fila de `accounts` — nombres alineados con la tabla en Postgres. */
export interface Account {
  account_id: string;
  account_name: string;
  user_id: string;
  type: AccountType;
  institution: string | null;
  balance: number;
  currency: AccountCurrency;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
