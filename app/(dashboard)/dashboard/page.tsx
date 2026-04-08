import { getUserFromToken } from "@/services/authService";
import { fetchHabits } from "../../actions/habitActions";
import {
  getHabitLogsLastWeek,
  fecthTodayHabitLogs,
  fetchHabitLogsThisMonth,
} from "../../actions/habitLogsActions";

import DailyStats from "./_components/DailyStats";
import { cookies } from "next/headers";

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
import { logout } from "@/app/actions/AuthAction";

export default async function Dashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("hackhabit_auth")?.value;

  const user = await getUserFromToken(token || "");

  if (user == null) {
    await logout();
    redirect("/noAuthenticated");
  }

  if (!token) {
    await logout();
    redirect("/noAuthenticated");
  }

  // data from actions - today stats
  const todayStats: Stats = await fetchTodayStats(user?.id ?? "");
  const habits: Habit[] = await fetchHabits(user?.id ?? "");
  const todayLogs: HabitLog[] = await fecthTodayHabitLogs(user?.id ?? "");

  // week stats
  const weekStats: Stats = await fetchWeekStats(user?.id ?? "");
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
