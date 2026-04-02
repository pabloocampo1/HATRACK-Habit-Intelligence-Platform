import { getCurrentUser, getUserFromToken } from "@/services/authService";
import { fetchHabits } from "../actions/habitActions";
import {
  getHabitLogsLastWeek,
  fecthTodayHabitLogs,
} from "../actions/habitLogsActions";

import DailyStats from "./_components/DailyStats";
import { cookies } from "next/headers";
import Link from "next/link";
import { Habit, HabitLog, Stats } from "@/lib/types";

import { fetchTodayStats, fetchWeekStats } from "../actions/StatsActions";
import WeekStats from "./_components/WeekStats";
import HabitRegister from "./_components/HabitRegister";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const user = await getUserFromToken(token || "");

  if (user == null) {
    redirect("/noAuthenticated");
  }

  if (!token) {
    redirect("/noAuthenticated");
  }

  // data from actions - today stats
  const todayStats: Stats = await fetchTodayStats(user?.id ?? "");
  const habits: Habit[] = await fetchHabits(user?.id ?? "");
  const todayLogs: HabitLog[] = await fecthTodayHabitLogs(user?.id ?? "");

  // week stats
  const weekStats: Stats = await fetchWeekStats(user?.id ?? "");
  const weekHabitsLogs: HabitLog[] = await getHabitLogsLastWeek(user?.id ?? "");

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
      </div>
    </div>
  );
}
