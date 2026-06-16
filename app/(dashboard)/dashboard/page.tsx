import { getCurrentUser } from "@/services/authService";
import { fetchHabits } from "../../actions/habitActions";
import {
  getHabitLogsLastWeek,
  fecthTodayHabitLogs,
  fetchHabitLogsThisMonth,
} from "../../actions/habitLogsActions";

import DailyStats from "./_components/DailyStats";
import { Habit, HabitLog, Stats } from "@/lib/types";

import {
  fetchMonthStats,
  fetchTodayStats,
  fetchWeekStats,
} from "../../actions/StatsActions";
import WeekStats from "./_components/WeekStats";
import HabitRegister from "./_components/HabitRegister";
import { redirect } from "next/navigation";
import MonthStats from "./_components/MonthStats";
import FeaturedGoalWidget from "./_components/FeaturedGoalWidget";
import { fetchGoals } from "../../actions/goals/goalActions";

export default async function Dashboard() {
  const user = await getCurrentUser();

  if (!user?.id) {
    redirect("/login");
  }

  // data from actions - today stats
  const [todayStats, habits, todayLogs, goals] = await Promise.all([
    fetchTodayStats(user?.id ?? "") as Promise<Stats>,
    fetchHabits(user?.id ?? "") as Promise<Habit[]>,
    fecthTodayHabitLogs(user?.id ?? "") as Promise<HabitLog[]>,
    fetchGoals(user?.id ?? ""),
  ]);

  // week stats
  const weekStats: Stats = await fetchWeekStats(user?.id ?? "") as Stats;
  const monthStats: Stats = await fetchMonthStats(user?.id ?? "");
  const monthHabitsLogs: HabitLog[] = await fetchHabitLogsThisMonth(
    user?.id ?? "",
  );
  const weekHabitsLogs: HabitLog[] = await getHabitLogsLastWeek(user?.id ?? "");

  if (
    todayStats == null ||
    weekStats == null ||
    monthStats == null ||
    weekHabitsLogs == null ||
    todayLogs == null ||
    habits == null
  ) {
    return <div>cargando</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 ">
      <div>
        <DailyStats
          todayStats={todayStats}
          habits={habits}
          todayLogs={todayLogs}
        />
        <HabitRegister
          habitsProp={habits}
          todayLogsProps={todayLogs}
          userId={user.id}
        />
        <FeaturedGoalWidget goals={goals} />
        <WeekStats
          weekStats={weekStats}
          weekLogs={weekHabitsLogs}
          habits={habits}
        />

        <MonthStats stats={monthStats} monthHabitLogs={monthHabitsLogs} />
      </div>
    </div>
  );
}
