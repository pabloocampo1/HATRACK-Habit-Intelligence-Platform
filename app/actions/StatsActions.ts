import { Habit, HabitLog, Stats } from "@/lib/types";
import {
  fecthTodayHabitLogs,
  fetchHabitLogsThisMonth,
  getHabitLogsLastWeek,
} from "./habitLogsActions";
import { fetchHabits } from "./habitActions";

export async function fetchTodayStats(userId: string): Promise<Stats> {
  const totalHabits: Habit[] = await fetchHabits(userId);
  const todayHabitsLogs: HabitLog[] = await fecthTodayHabitLogs(userId);

  const habitsCompleted = todayHabitsLogs.filter((log) => log.completed).length;
  const disciplina =
    totalHabits.length > 0
      ? Math.round((habitsCompleted / totalHabits.length) * 100)
      : 0;

  const todayAvgQuality =
    todayHabitsLogs.length > 0
      ? Math.round(
          todayHabitsLogs.reduce((sum, log) => sum + log.quality_score, 0) /
            todayHabitsLogs.length,
        )
      : 0;
  const todayFocus = Math.min(todayAvgQuality, 100);

  const commitmentTime = todayHabitsLogs.reduce(
    (total, log) => total + log.minutes_completed,
    0,
  );

  // generate the commitment total for today

  const commitmentExpectation = totalHabits.reduce(
    (total, habit) => total + habit.target_minutes || 0,
    0,
  );

  const commitmentTotal =
    commitmentExpectation > 0
      ? (commitmentTime / commitmentExpectation) * 100
      : 0;

  try {
    return {
      disciplina: Math.min(disciplina, 100),
      consistencia: 777,
      enfoque: Math.min(todayFocus, 100),
      dedicacion: Math.min(commitmentTotal, 100),
      crecimiento: 777,
      total_time: commitmentTime,
    };
  } catch (e) {
    return {
      disciplina: 0,
      consistencia: 0,
      enfoque: 0,
      dedicacion: 0,
      crecimiento: 0,
      total_time: 0,
    };
  }
}

export async function fetchWeekStats(userId: string): Promise<Stats> {
  try {
    const weekHabitLogs: HabitLog[] = await getHabitLogsLastWeek(userId);
    const totalHabits: Habit[] = await fetchHabits(userId);

    const habitsCompleted = weekHabitLogs.filter((log) => log.completed).length;

    // 🔵 DISCIPLINA
    const totalExpected = totalHabits.reduce(
      (total, habit) => total + (habit.frequency || 0),
      0,
    );

    const disciplina =
      totalExpected > 0
        ? Math.min(Math.round((habitsCompleted / totalExpected) * 100), 100)
        : 0;

    // 🟢 DEDICACIÓN
    const commitmentTime = weekHabitLogs.reduce(
      (total, log) => total + (log.minutes_completed || 0),
      0,
    );

    const commitmentTimeExpect = totalHabits.reduce(
      (total, habit) =>
        total + (habit.frequency || 0) * (habit.target_minutes || 0),
      0,
    );

    const dedicacion =
      commitmentTimeExpect > 0
        ? Math.min(
            Math.round((commitmentTime / commitmentTimeExpect) * 100),
            100,
          )
        : 0;

    // 🟡 CONSISTENCIA (estabilidad por día)
    const logsByDay: Record<string, HabitLog[]> = {};

    weekHabitLogs.forEach((log) => {
      const date = log.log_date;

      // Si no hay fecha, saltamos este log (Protección total)
      if (!date) return;

      if (!logsByDay[date]) {
        logsByDay[date] = [];
      }
      logsByDay[date].push(log);
    });

    const dailyRatios = Object.values(logsByDay).map((logs) => {
      const completed = logs.filter((l) => l.completed).length;
      return totalHabits.length > 0 ? completed / totalHabits.length : 0;
    });

    const consistencia =
      dailyRatios.length > 0
        ? Math.min(
            Math.round(
              (dailyRatios.reduce((a, b) => a + b, 0) / dailyRatios.length) *
                100,
            ),
            100,
          )
        : 0;

    // 🔴 ENFOQUE (calidad real)
    const qualityLogs = weekHabitLogs.filter(
      (log) => log.completed && log.quality_score != null,
    );

    const enfoque =
      qualityLogs.length > 0
        ? Math.min(
            Math.round(
              qualityLogs.reduce((total, log) => total + log.quality_score, 0) /
                qualityLogs.length,
            ),
            100,
          )
        : 0;

    const sortedLogs = [...weekHabitLogs].sort(
      (a, b) =>
        new Date(a.log_date!).getTime() - new Date(b.log_date!).getTime(),
    );

    const mid = Math.floor(sortedLogs.length / 2);

    const firstHalf = sortedLogs.slice(0, mid);
    const secondHalf = sortedLogs.slice(mid);

    const avgFirst =
      firstHalf.length > 0
        ? firstHalf.reduce((t, l) => t + (l.quality_score || 0), 0) /
          firstHalf.length
        : 0;

    const avgSecond =
      secondHalf.length > 0
        ? secondHalf.reduce((t, l) => t + (l.quality_score || 0), 0) /
          secondHalf.length
        : 0;

    const crecimiento = Math.round(avgSecond - avgFirst);

    // ⚪ TOTAL TIME
    const total_time = commitmentTime;

    return {
      disciplina,
      consistencia,
      enfoque,
      dedicacion,
      crecimiento,
      total_time,
    };
  } catch (error) {
    return {
      disciplina: 0,
      consistencia: 0,
      enfoque: 0,
      dedicacion: 0,
      crecimiento: 0,
      total_time: 0,
    };
  }
}

export async function fetchMonthStats(userId: string): Promise<Stats> {
  try {
    const monthHabitLogs: HabitLog[] = await fetchHabitLogsThisMonth(userId);
    const totalHabits: Habit[] = await fetchHabits(userId);

    const habitsCompleted = monthHabitLogs.filter(
      (log) => log.completed,
    ).length;

    // 🔵 DISCIPLINA
    const totalExpected = totalHabits.reduce(
      (total, habit) => total + (habit.frequency || 0),
      0,
    );

    const disciplina =
      totalExpected > 0
        ? Math.min(Math.round((habitsCompleted / totalExpected) * 100), 100)
        : 0;

    // 🟢 DEDICACIÓN
    const commitmentTime = monthHabitLogs.reduce(
      (total, log) => total + (log.minutes_completed || 0),
      0,
    );

    const commitmentTimeExpect = totalHabits.reduce(
      (total, habit) =>
        total + (habit.frequency || 0) * (habit.target_minutes || 0),
      0,
    );

    const dedicacion =
      commitmentTimeExpect > 0
        ? Math.min(
            Math.round((commitmentTime / commitmentTimeExpect) * 100),
            100,
          )
        : 0;

    // 🟡 CONSISTENCIA (estabilidad por día)
    const logsByDay: Record<string, HabitLog[]> = {};

    monthHabitLogs.forEach((log) => {
      const date = log.log_date;

      // Si no hay fecha, saltamos este log (Protección total)
      if (!date) return;

      if (!logsByDay[date]) {
        logsByDay[date] = [];
      }
      logsByDay[date].push(log);
    });

    const dailyRatios = Object.values(logsByDay).map((logs) => {
      const completed = logs.filter((l) => l.completed).length;
      return totalHabits.length > 0 ? completed / totalHabits.length : 0;
    });

    const consistencia =
      dailyRatios.length > 0
        ? Math.min(
            Math.round(
              (dailyRatios.reduce((a, b) => a + b, 0) / dailyRatios.length) *
                100,
            ),
            100,
          )
        : 0;

    const qualityLogs = monthHabitLogs.filter(
      (log) => log.completed && log.quality_score != null,
    );

    const enfoque =
      qualityLogs.length > 0
        ? Math.min(
            Math.round(
              qualityLogs.reduce((total, log) => total + log.quality_score, 0) /
                qualityLogs.length,
            ),
            100,
          )
        : 0;

    const sortedLogs = [...monthHabitLogs].sort(
      (a, b) =>
        new Date(a.log_date!).getTime() - new Date(b.log_date!).getTime(),
    );

    const mid = Math.floor(sortedLogs.length / 2);

    const firstHalf = sortedLogs.slice(0, mid);
    const secondHalf = sortedLogs.slice(mid);

    const avgFirst =
      firstHalf.length > 0
        ? firstHalf.reduce((t, l) => t + (l.quality_score || 0), 0) /
          firstHalf.length
        : 0;

    const avgSecond =
      secondHalf.length > 0
        ? secondHalf.reduce((t, l) => t + (l.quality_score || 0), 0) /
          secondHalf.length
        : 0;

    const crecimiento = Math.round(avgSecond - avgFirst);

    // ⚪ TOTAL TIME
    const total_time = commitmentTime;

    return {
      disciplina: Math.min(disciplina, 100),
      consistencia: Math.min(consistencia, 100),
      enfoque: Math.min(enfoque, 100),
      dedicacion: Math.min(dedicacion, 100),
      crecimiento: Math.min(crecimiento, 100),
      total_time: total_time,
    };
  } catch (error) {
    return {
      disciplina: 0,
      consistencia: 0,
      enfoque: 0,
      dedicacion: 0,
      crecimiento: 0,
      total_time: 0,
    };
  }
}
