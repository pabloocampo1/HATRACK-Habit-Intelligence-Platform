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

// ── Plans & Subscriptions ─────────────────────────────────────

export type PlanId = "free" | "pro" | "pro_plus" | "lifetime";
export type SubscriptionStatus = "active" | "canceled" | "past_due" | "trialing";

export interface Subscription {
  id: string;
  user_id: string;
  plan: PlanId;
  status: SubscriptionStatus;
  external_id?: string | null;
  starts_at: string;
  expires_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Profile {
  id: string;
  display_name?: string | null;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

// ── Challenges ──────────────────────────────────────────────

export type ChallengeStatus = "active" | "completed" | "abandoned";

export const CHALLENGE_DURATIONS = [7, 15, 30, 60, 90] as const;
export type ChallengeDuration = (typeof CHALLENGE_DURATIONS)[number];

export interface Challenge {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  goal?: string | null;
  duration_days: number;
  start_date: string;
  end_date: string;
  status: ChallengeStatus;
  created_at?: string;
  updated_at?: string;
}

export interface ChallengeHabit {
  id: string;
  challenge_id: string;
  habit_id?: string | null;
  title: string;
  description?: string | null;
  category: string;
  target_minutes: number;
  is_linked_habit: boolean;
  created_at?: string;
}

export interface ChallengeLog {
  id?: string;
  challenge_id: string;
  challenge_habit_id: string;
  user_id: string;
  log_date: string;
  completed: boolean;
  habit_log_id?: string | null;
  created_at?: string;
}

export interface CreateChallengePayload {
  title: string;
  description?: string;
  goal?: string;
  duration_days: ChallengeDuration;
  start_date: string;
  habits: Array<{
    habit_id?: string;
    title: string;
    description?: string;
    category: string;
    target_minutes: number;
    is_linked_habit: boolean;
  }>;
}

// ── Accounts ─────────────────────────────────────────────────

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

// ── Goals (Metas personales) ──────────────────────────────────

export type GoalStatus   = "active" | "completed" | "paused" | "abandoned";
export type GoalPriority = "high" | "medium" | "low";
export type GoalCategory =
  | "finances" | "fitness" | "learning" | "career"
  | "personal" | "relationships" | "health" | "other";

export interface Goal {
  id?: string;
  user_id: string;
  title: string;
  description?: string | null;
  why?: string | null;
  category: GoalCategory;
  priority: GoalPriority;
  status: GoalStatus;
  target_date?: string | null;
  progress_manual?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface GoalMilestone {
  id?: string;
  goal_id: string;
  title: string;
  completed: boolean;
  due_date?: string | null;
  created_at?: string;
}

export interface GoalHabit {
  id?: string;
  goal_id: string;
  habit_id: string;
  created_at?: string;
  habit?: Habit;
}

export interface GoalChallenge {
  id?: string;
  goal_id: string;
  challenge_id: string;
  created_at?: string;
}

export interface CreateGoalPayload {
  title: string;
  description?: string;
  why?: string;
  category: GoalCategory;
  priority: GoalPriority;
  target_date?: string;
}

export interface GoalDetail extends Goal {
  milestones: GoalMilestone[];
  linkedHabits: GoalHabit[];
  linkedChallenges: GoalChallenge[];
  progressPct: number;
  daysRemaining: number | null;
  isOverdue: boolean;
}
