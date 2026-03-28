import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getHabits,
  createHabit,
  logActivity,
  getStats,
  getHabitLogs,
} from "@/app/habits/actions";
import { Habit, HabitLog, Stats } from "@/lib/types";
import PlayerCard from "@/components/PlayerCard";
import DailyStats from "./_components/DailyStats";
import WeekStats from "./_components/WeekStats";
import MonthStats from "./_components/MonthStats";
import CalendarHead from "./_components/CalendarHead";
import { get } from "http";
import { getCurrentUser } from "@/services/authService";

interface User {
  id: string;
  email: string;
  created_at: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [todayLogs, setTodayLogs] = useState<HabitLog[]>([]);
  const [weekLogs, setWeekLogs] = useState<HabitLog[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [weekStats, setWeekStats] = useState<Stats | null>(null);
  const [todayStats, setTodayStats] = useState<Stats | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyHabitCompletions, setMonthlyHabitCompletions] = useState<{
    [habitId: string]: number;
  }>({});
  const [yearlyHabitCompletions, setYearlyHabitCompletions] = useState<{
    [habitId: string]: number;
  }>({});
  const [message, setMessage] = useState("");

  // Form states
  const [showNewHabitForm, setShowNewHabitForm] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);

  // Daily tracking
  const [dailyFocus, setDailyFocus] = useState("");
  const [energyLevel, setEnergyLevel] = useState(5);
  const [mentalState, setMentalState] = useState("");
  const [isCardOpen, setIsCardOpen] = useState(false);

  // Activity logging
  const [activityMinutes, setActivityMinutes] = useState(0);
  const [activityQuality, setActivityQuality] = useState(3);
  const [activityNotes, setActivityNotes] = useState("");

  // New habit
  const [habitTitle, setHabitTitle] = useState("");
  const [habitCategory, setHabitCategory] = useState("other");
  const [habitFrequency, setHabitFrequency] = useState(Number || null);
  const [habitMinutes, setHabitMinutes] = useState(Number || null);

  const loadDashboardData = async (authToken: string) => {
    try {
      const habitsData = await getHabits(authToken);
      setHabits(habitsData);

      const statsData = await getStats(authToken);
      setStats(statsData);

      // Load today's logs
      const today = new Date().toISOString().split("T")[0];

      const allLogs: HabitLog[] = [];
      for (const habit of habitsData) {
        const logs = await getHabitLogs(authToken, habit.id);

        allLogs.push(...logs.filter((log) => log.log_date == today));
      }
      setTodayLogs(allLogs);

      // Calculate today stats
      const todayCompleted = allLogs.filter((log) => log.completed).length;
      const todayTotalHabits = habitsData.length;
      const todayDisciplina =
        todayTotalHabits > 0
          ? Math.round((todayCompleted / todayTotalHabits) * 100)
          : 0;

      const todayConsistencia = todayCompleted > 0 ? 100 : 0;

      const todayAvgQuality =
        allLogs.length > 0
          ? Math.round(
              allLogs.reduce((sum, log) => sum + log.quality_score, 0) /
                allLogs.length,
            )
          : 0;
      const todayEnfoque = Math.min(todayAvgQuality, 100);

      const todayTotalMinutes = allLogs.reduce(
        (sum, log) => sum + (log.minutes_completed || 0),
        0,
      );
      const todayDedicacion = Math.round(todayTotalMinutes * 2); // Assuming 30 min target

      const todayCrecimiento = 70; // Placeholder

      setTodayStats({
        disciplina: Math.min(todayDisciplina, 100),
        consistencia: Math.min(todayConsistencia, 100),
        enfoque: Math.min(todayEnfoque, 100),
        dedicacion: Math.min(todayDedicacion, 100),
        crecimiento: Math.min(todayCrecimiento, 100),
      });

      // Load week's logs
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekStart = weekAgo.toISOString().split("T")[0];
      const weekLogsData: HabitLog[] = [];
      for (const habit of habitsData) {
        const logs = await getHabitLogs(authToken, habit.id);
        weekLogsData.push(...logs.filter((log) => log.log_date >= weekStart));
      }
      setWeekLogs(weekLogsData);

      // Calculate week stats
      const weekCompleted = weekLogsData.filter((log) => log.completed).length;
      const weekTotalHabits = habitsData.length * 7;
      const weekDisciplina =
        weekTotalHabits > 0
          ? Math.round((weekCompleted / weekTotalHabits) * 100)
          : 0;

      const weekUniqueDays = new Set(
        weekLogsData.filter((log) => log.completed).map((log) => log.log_date),
      );
      const weekConsistencia = Math.round((weekUniqueDays.size / 7) * 100);

      const weekAvgQuality =
        weekLogsData.length > 0
          ? Math.round(
              weekLogsData.reduce((sum, log) => sum + log.quality_score, 0) /
                weekLogsData.length,
            )
          : 0;
      const weekEnfoque = Math.min(weekAvgQuality, 100);

      const weekTotalMinutes = weekLogsData.reduce(
        (sum, log) => sum + (log.minutes_completed || 0),
        0,
      );
      const weekDedicacion = Math.round((weekTotalMinutes / 7) * 2);

      const weekCrecimiento = 75; // Placeholder

      setWeekStats({
        disciplina: Math.min(weekDisciplina, 100),
        consistencia: Math.min(weekConsistencia, 100),
        enfoque: Math.min(weekEnfoque, 100),
        dedicacion: Math.min(weekDedicacion, 100),
        crecimiento: Math.min(weekCrecimiento, 100),
      });
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const loadHabitCompletions = async (month: number, year: number) => {
    try {
      const startDate = new Date(year, month - 1, 1)
        .toISOString()
        .split("T")[0];
      const endDate = new Date(year, month, 0).toISOString().split("T")[0];
      const completions: { [habitId: string]: number } = {};

      for (const habit of habits) {
        const logs = await getHabitLogs(token, habit.id);
        const monthLogs = logs.filter(
          (log) =>
            log.log_date >= startDate &&
            log.log_date <= endDate &&
            log.completed,
        );
        completions[habit.id] = monthLogs.length;
      }
      setMonthlyHabitCompletions(completions);

      // For yearly
      const yearStart = new Date(year, 0, 1).toISOString().split("T")[0];
      const yearEnd = new Date(year, 11, 31).toISOString().split("T")[0];
      const yearCompletions: { [habitId: string]: number } = {};

      for (const habit of habits) {
        const logs = await getHabitLogs(token, habit.id);
        const yearLogs = logs.filter(
          (log) =>
            log.log_date >= yearStart &&
            log.log_date <= yearEnd &&
            log.completed,
        );
        yearCompletions[habit.id] = yearLogs.length;
      }
      setYearlyHabitCompletions(yearCompletions);
    } catch (error) {
      console.error("Error loading habit completions:", error);
    }
  };

  useEffect(() => {
    if (habits.length > 0 && token) {
      loadHabitCompletions(selectedMonth, selectedYear);
    }
  }, [habits, token, selectedMonth, selectedYear]);

  useEffect(() => {
    const validateSession = async () => {
      const savedToken = localStorage.getItem("supabase_token");
      if (!savedToken) {
        setMessage("No hay sesión activa. Inicia sesión primero.");
        setLoading(false);
        return;
      }

      setToken(savedToken);

      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${savedToken}` },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        await loadDashboardData(savedToken);
      } else {
        setMessage("Token inválido o expirado.");
        localStorage.removeItem("supabase_token");
      }
      setLoading(false);
    };

    validateSession();

    async function getCurrentUserAuth() {
      const currentUser = await getCurrentUser();
      console.log("demmmm");

      console.log(currentUser);
    }

    getCurrentUserAuth();
  }, []);

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitTitle || !token) return;

    try {
      await createHabit(token, {
        title: habitTitle,
        category: habitCategory,
        frequency: habitFrequency,
        target_minutes: habitMinutes,
      });

      setHabitTitle("");
      setHabitCategory("other");

      setShowNewHabitForm(false);
      await loadDashboardData(token);
      setMessage("Hábito creado exitosamente ✅");
    } catch (error: any) {
      setMessage(error.message || "Error al crear hábito");
    }
  };

  const handleLogActivity = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedHabit || !token) return;

    try {
      await logActivity(token, selectedHabit.id, {
        minutes_completed: activityMinutes,
        quality_score: activityQuality,
        completed: activityMinutes > 0,
        notes: activityNotes,
        daily_focus: dailyFocus,
        energy_level: energyLevel,
        mental_state: mentalState,
      });

      setActivityMinutes(0);
      setActivityQuality(3);
      setActivityNotes("");
      setShowActivityForm(false);
      setSelectedHabit(null);
      await loadDashboardData(token);
      setMessage("Actividad registrada ✅");
    } catch (error: any) {
      setMessage(error.message || "Error al registrar actividad");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("supabase_token");
    setUser(null);
    setMessage("Sesión cerrada.");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-black/70">Validando sesión...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <p className="text-black/70 mb-4">No hay usuario autenticado.</p>
        <Link
          href="/login"
          className="font-bold text-black hover:text-black/70"
        >
          ← Volver a login
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      {/* NAVBAR */}
      <nav className="border-b-2 border-black bg-black/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-black">hatrack</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-black/70">{user.email}</span>
            <Link
              href="/profile"
              className="text-sm font-bold uppercase tracking-widest text-black/70 hover:text-black transition"
            >
              Ver perfil
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm font-bold uppercase tracking-widest text-black/70 hover:text-black transition"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </nav>

      {/* PLAYER CARD */}

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* HABITS TABLE & ACTIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: Hábitos creados */}
          <section className="rounded-3xl border-2 border-black p-8">
            <h2 className="text-xl font-black mb-4">📋 Mis hábitos</h2>
            <button
              onClick={() => setShowNewHabitForm(!showNewHabitForm)}
              className="w-full rounded-full border-2 border-black bg-black px-4 py-2 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-white hover:text-black mb-4"
            >
              + Nuevo hábito
            </button>

            {showNewHabitForm && (
              <form
                onSubmit={handleCreateHabit}
                className="mb-4 p-4 border-2 border-black rounded-lg space-y-3"
              >
                <input
                  type="text"
                  value={habitTitle}
                  onChange={(e) => setHabitTitle(e.target.value)}
                  placeholder="Nombre del hábito"
                  className="w-full text-sm rounded border border-black/20 px-2 py-1 outline-none focus:border-black"
                  required
                />
                <select
                  value={habitCategory}
                  onChange={(e) => setHabitCategory(e.target.value)}
                  className="w-full text-sm rounded border border-black/20 px-2 py-1 outline-none focus:border-black"
                >
                  <option value="fitness">🏋️ Fitness</option>
                  <option value="programming">💻 Programming</option>
                  <option value="reading">📚 Reading</option>
                  <option value="learning">🧠 Learning</option>
                  <option value="health">❤️ Health</option>
                  <option value="other">📌 Other</option>
                </select>
                <label htmlFor="habitFrequency">Veces por semana</label>
                <input
                  type="number"
                  value={habitFrequency}
                  onChange={(e) => setHabitFrequency(parseInt(e.target.value))}
                  placeholder="Veces por semana"
                  id="habitFrequency"
                  className="w-full text-sm rounded border border-black/20 px-2 py-1 outline-none focus:border-black"
                  min="1"
                />
                <input
                  type="number"
                  value={habitMinutes}
                  onChange={(e) => setHabitMinutes(parseInt(e.target.value))}
                  placeholder="Minutos por sesión"
                  className="w-full text-sm rounded border border-black/20 px-2 py-1 outline-none focus:border-black"
                  min="1"
                />
                <button
                  type="submit"
                  className="w-full rounded border-2 border-black bg-black text-white text-xs font-bold px-2 py-1 hover:bg-white hover:text-black transition"
                >
                  Crear
                </button>
              </form>
            )}

            <div className="space-y-2">
              {habits.length === 0 ? (
                <p className="text-sm text-black/70">
                  No hay hábitos. Crea uno para empezar.
                </p>
              ) : (
                habits.map((habit) => {
                  const habitLogs = todayLogs.filter(
                    (log) => log.habit_id === habit.id,
                  );
                  const timesCompleted = habitLogs.filter(
                    (log) => log.completed,
                  ).length;
                  const totalMinutes = habitLogs.reduce(
                    (sum, log) => sum + (log.minutes_completed || 0),
                    0,
                  );

                  return (
                    <div
                      key={habit.id}
                      className="border-2 border-black/20 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-bold text-sm">{habit.title}</p>
                          <p className="text-xs text-black/70">
                            {habit.category}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedHabit(habit);
                            setShowActivityForm(true);
                          }}
                          className="ml-2 text-xs font-bold text-white bg-black px-2 py-1 rounded hover:bg-black/80"
                        >
                          +
                        </button>
                      </div>
                      <div className="mt-2 flex gap-2 text-xs font-bold">
                        <span className="bg-black/10 px-2 py-1 rounded">
                          ✓ {timesCompleted}
                        </span>
                        <span className="bg-black/10 px-2 py-1 rounded">
                          ⏱ {totalMinutes}m
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* RIGHT: Registrar actividad */}
          <section className="lg:col-span-2 rounded-3xl border-2 border-black p-8">
            <h2 className="text-xl font-black mb-4">🎯 Registrar actividad</h2>

            {showActivityForm && selectedHabit ? (
              <form onSubmit={handleLogActivity} className="space-y-4">
                <div className="bg-black/5 rounded-lg p-4 border-2 border-black">
                  <p className="text-sm font-bold">{selectedHabit.title}</p>
                  <p className="text-xs text-black/70">
                    Meta: {selectedHabit.target_minutes} min
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase">
                    Minutos dedicados
                  </label>
                  <input
                    type="number"
                    value={activityMinutes}
                    onChange={(e) =>
                      setActivityMinutes(parseInt(e.target.value) || 0)
                    }
                    placeholder="0"
                    className="w-full text-sm rounded border-2 border-black px-3 py-2 outline-none focus:bg-black/5"
                    min="0"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase">
                    Calidad (1-5)
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => setActivityQuality(q)}
                        className={`flex-1 py-2 border-2 font-bold rounded ${
                          activityQuality === q
                            ? "border-black bg-black text-white"
                            : "border-black/20 hover:border-black"
                        }`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase">Notas</label>
                  <textarea
                    value={activityNotes}
                    onChange={(e) => setActivityNotes(e.target.value)}
                    placeholder="Rápidas notas..."
                    className="w-full text-sm rounded border-2 border-black px-3 py-2 outline-none focus:bg-black/5 h-20"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 rounded-full border-2 border-black bg-black px-4 py-2 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-white hover:text-black"
                  >
                    Registrar ✓
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowActivityForm(false);
                      setSelectedHabit(null);
                      setActivityMinutes(0);
                      setActivityQuality(399999);
                      setActivityNotes("");
                    }}
                    className="flex-1 rounded-full border-2 border-black/30 px-4 py-2 text-xs font-bold uppercase tracking-widest hover:border-black transition"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-sm text-black/70 p-4 border-2 border-black/20 rounded-lg">
                {habits.length === 0
                  ? "Crea un hábito primero para registrar actividades."
                  : "Selecciona un hábito de la izquierda para registrar actividad."}
              </div>
            )}

            {/* TODAY'S SUMMARY TABLE */}
            {todayLogs.length > 0 && (
              <div className="mt-6 border-t-2 border-black pt-6">
                <h3 className="text-sm font-black mb-4">Resumen de hoy</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="border-b-2 border-black">
                      <tr>
                        <th className="text-left py-2 font-black">Acción</th>
                        <th className="text-center py-2 font-black">Veces</th>
                        <th className="text-center py-2 font-black">Tiempo</th>
                        <th className="text-center py-2 font-black">Calidad</th>
                        <th className="text-left py-2 font-black">Notas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todayLogs.map((log, idx) => {
                        const habit = habits.find((h) => h.id === log.habit_id);
                        return (
                          <tr key={idx} className="border-b border-black/10">
                            <td className="py-2 font-bold">
                              {habit?.title || "Unknown"}
                            </td>
                            <td className="text-center py-2">
                              {log.completed ? "✓" : "—"}
                            </td>
                            <td className="text-center py-2">
                              {log.minutes_completed}m
                            </td>
                            <td className="text-center py-2">
                              {log.quality_score}/5
                            </td>
                            <td className="py-2 text-black/70">
                              {log.notes || "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </div>
        {/* DAILY STATS */}
        <DailyStats
          todayStats={todayStats}
          habits={habits}
          todayLogs={todayLogs}
        />
        {/* WEEK STATS */}
        <WeekStats weekStats={weekStats} weekLogs={weekLogs} />
        {/* MONTHLY STATS */}

        <MonthStats stats={stats} />
        {/* HABIT COMPLETIONS */}
        <section className="rounded-3xl border-2 border-black p-8 bg-black/5">
          <h2 className="text-2xl font-black mb-6">
            📈 Completaciones de Hábitos
          </h2>

          <div className="flex gap-4 mb-6">
            <div>
              <label className="text-sm font-bold">Mes:</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="ml-2 px-2 py-1 border border-black rounded"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleDateString("es-ES", {
                      month: "long",
                    })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-bold">Año:</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="ml-2 px-2 py-1 border border-black rounded"
              >
                {Array.from({ length: 5 }, (_, i) => (
                  <option
                    key={new Date().getFullYear() - i}
                    value={new Date().getFullYear() - i}
                  >
                    {new Date().getFullYear() - i}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* MONTHLY COMPLETIONS */}
            <div>
              <h3 className="text-lg font-black mb-4">
                Completaciones del Mes (
                {new Date(selectedYear, selectedMonth - 1).toLocaleDateString(
                  "es-ES",
                  { month: "long", year: "numeric" },
                )}
                )
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b-2 border-black">
                    <tr>
                      <th className="text-left py-2 font-black">Hábito</th>
                      <th className="text-center py-2 font-black">
                        Completado
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {habits.map((habit) => (
                      <tr key={habit.id} className="border-b border-black/10">
                        <td className="py-2 font-bold">{habit.title}</td>
                        <td className="text-center py-2">
                          {monthlyHabitCompletions[habit.id] || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* YEARLY COMPLETIONS */}
            <div>
              <h3 className="text-lg font-black mb-4">
                Completaciones del Año ({selectedYear})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b-2 border-black">
                    <tr>
                      <th className="text-left py-2 font-black">Hábito</th>
                      <th className="text-center py-2 font-black">
                        Completado
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {habits.map((habit) => (
                      <tr key={habit.id} className="border-b border-black/10">
                        <td className="py-2 font-bold">{habit.title}</td>
                        <td className="text-center py-2">
                          {yearlyHabitCompletions[habit.id] || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
        {/* STATUS MESSAGE */}
        {message && (
          <div className="fixed bottom-6 right-6 bg-black text-white px-6 py-3 rounded-full text-sm font-bold">
            {message}
          </div>
        )}

        <CalendarHead />
        <PlayerCard />
      </main>
    </div>
  );
}
