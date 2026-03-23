'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { getHabits, createHabit, logActivity, getStats, getHabitLogs } from "@/app/habits/actions";
import { Habit, HabitLog, Stats } from "@/lib/types";

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
  const [stats, setStats] = useState<Stats | null>(null);
  const [message, setMessage] = useState("");

  // Form states
  const [showNewHabitForm, setShowNewHabitForm] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);

  // Daily tracking
  const [dailyFocus, setDailyFocus] = useState("");
  const [energyLevel, setEnergyLevel] = useState(5);
  const [mentalState, setMentalState] = useState("");

  // Activity logging
  const [activityMinutes, setActivityMinutes] = useState(0);
  const [activityQuality, setActivityQuality] = useState(3);
  const [activityNotes, setActivityNotes] = useState("");

  // New habit
  const [habitTitle, setHabitTitle] = useState("");
  const [habitCategory, setHabitCategory] = useState("other");
  const [habitFrequency, setHabitFrequency] = useState(3);
  const [habitMinutes, setHabitMinutes] = useState(30);


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
        allLogs.push(...logs.filter((log) => log.log_date === today));
      }
      setTodayLogs(allLogs);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

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
      setHabitFrequency(3);
      setHabitMinutes(30);
      setShowNewHabitForm(false);
      await loadDashboardData(token);
      setMessage("Hábito creado exitosamente ✅");
    } catch (error: any) {
      setMessage(error.message || "Error al crear hábito");
    }
  };

  const handleLogActivity = async (e: React.FormEvent) => {
    e.preventDefault();


	console.log("Entero al metodo handleLogActivity");
	
    if (!selectedHabit || !token) return;

	console.log("paso la validacion de select y token");

	console.log(selectedHabit);
	
	

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

	  console.log("lo que se guarda");

	  
	  

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
        <Link href="/login" className="font-bold text-black hover:text-black/70">
          ← Volver a login
        </Link>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const completedToday = todayLogs.filter((log) => log.completed).length;
  const totalTimeToday = todayLogs.reduce((sum, log) => sum + (log.minutes_completed || 0), 0);
  const avgQualityToday = todayLogs.length > 0 ? Math.round(todayLogs.reduce((sum, log) => sum + log.quality_score, 0) / todayLogs.length) : 0;

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      {/* NAVBAR */}
      <nav className="border-b-2 border-black bg-black/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-black">hatrack</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-black/70">{user.email}</span>
            <button
              onClick={handleLogout}
              className="text-sm font-bold uppercase tracking-widest text-black/70 hover:text-black transition"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* DAILY HEADER */}
        <section className="rounded-3xl border-2 border-black p-8 bg-black/2">
          <h2 className="text-2xl font-black mb-6">📅 Registro del día</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="border-2 border-black/30 rounded-lg p-4">
              <label className="text-xs font-bold uppercase tracking-widest text-black/70">
                📅 Fecha
              </label>
              <p className="mt-1 text-lg font-black">{new Date(today).toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
            <div className="border-2 border-black/30 rounded-lg p-4">
              <label className="text-xs font-bold uppercase tracking-widest text-black/70">
                🎯 Enfoque del día
              </label>
              <input
                type="text"
                value={dailyFocus}
                onChange={(e) => setDailyFocus(e.target.value)}
                placeholder="1 sola cosa clave..."
                className="mt-1 w-full text-sm rounded border border-black/20 px-2 py-1 outline-none focus:border-black"
              />
            </div>
            <div className="border-2 border-black/30 rounded-lg p-4">
              <label className="text-xs font-bold uppercase tracking-widest text-black/70">
                🔥 Energía (1-10)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={energyLevel}
                onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                className="mt-1 w-full text-sm rounded border border-black/20 px-2 py-1 outline-none focus:border-black"
              />
            </div>
            <div className="border-2 border-black/30 rounded-lg p-4">
              <label className="text-xs font-bold uppercase tracking-widest text-black/70">
                🧠 Estado mental
              </label>
              <input
                type="text"
                value={mentalState}
                onChange={(e) => setMentalState(e.target.value)}
                placeholder="Enfocado, relajado..."
                className="mt-1 w-full text-sm rounded border border-black/20 px-2 py-1 outline-none focus:border-black"
              />
            </div>
          </div>
        </section>

        {/* KPI SECTION */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <article className="rounded-2xl border-2 border-black p-6 bg-black/5">
            <p className="text-xs font-bold uppercase tracking-widest text-black/70">Completadas hoy</p>
            <p className="mt-2 text-4xl font-black">{completedToday}/{habits.length}</p>
            <p className="mt-1 text-sm text-black/70">Hábitos activos</p>
          </article>

          <article className="rounded-2xl border-2 border-black p-6 bg-black/5">
            <p className="text-xs font-bold uppercase tracking-widest text-black/70">Tiempo total hoy</p>
            <p className="mt-2 text-4xl font-black">{totalTimeToday}m</p>
            <p className="mt-1 text-sm text-black/70">Dedicado a hábitos</p>
          </article>

          <article className="rounded-2xl border-2 border-black p-6 bg-black/5">
            <p className="text-xs font-bold uppercase tracking-widest text-black/70">Calidad promedio</p>
            <p className="mt-2 text-4xl font-black">{avgQualityToday}/5</p>
            <p className="mt-1 text-sm text-black/70">Calidad de ejecución</p>
          </article>

          <article className="rounded-2xl border-2 border-black p-6 bg-black/5">
            <p className="text-xs font-bold uppercase tracking-widest text-black/70">Progreso general</p>
            <p className="mt-2 text-4xl font-black">{stats?.disciplina || 0}%</p>
            <p className="mt-1 text-sm text-black/70">Disciplina del mes</p>
          </article>
        </section>

        {/* MONTHLY STATS */}
        {stats && (
          <section className="rounded-3xl border-2 border-black p-8 bg-black/5">
            <h2 className="text-2xl font-black mb-6">📊 Estadísticas del mes</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="border border-black/20 rounded-lg p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-black/70">Disciplina</p>
                <div className="mt-2 relative h-3 bg-black/10 rounded-full overflow-hidden">
                  <div className="h-full bg-black" style={{ width: `${stats.disciplina}%` }}></div>
                </div>
                <p className="mt-1 text-lg font-black">{stats.disciplina}%</p>
              </div>
              <div className="border border-black/20 rounded-lg p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-black/70">Consistencia</p>
                <div className="mt-2 relative h-3 bg-black/10 rounded-full overflow-hidden">
                  <div className="h-full bg-black" style={{ width: `${stats.consistencia}%` }}></div>
                </div>
                <p className="mt-1 text-lg font-black">{stats.consistencia}%</p>
              </div>
              <div className="border border-black/20 rounded-lg p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-black/70">Enfoque</p>
                <div className="mt-2 relative h-3 bg-black/10 rounded-full overflow-hidden">
                  <div className="h-full bg-black" style={{ width: `${stats.enfoque}%` }}></div>
                </div>
                <p className="mt-1 text-lg font-black">{stats.enfoque}%</p>
              </div>
              <div className="border border-black/20 rounded-lg p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-black/70">Crecimiento</p>
                <div className="mt-2 relative h-3 bg-black/10 rounded-full overflow-hidden">
                  <div className="h-full bg-black" style={{ width: `${stats.crecimiento}%` }}></div>
                </div>
                <p className="mt-1 text-lg font-black">{stats.crecimiento}%</p>
              </div>
            </div>
          </section>
        )}

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
              <form onSubmit={handleCreateHabit} className="mb-4 p-4 border-2 border-black rounded-lg space-y-3">
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
                <input
                  type="number"
                  value={habitFrequency}
                  onChange={(e) => setHabitFrequency(parseInt(e.target.value))}
                  placeholder="Veces por semana"
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
                <p className="text-sm text-black/70">No hay hábitos. Crea uno para empezar.</p>
              ) : (
                habits.map((habit) => {
                  const habitLogs = todayLogs.filter((log) => log.habit_id === habit.id);
                  const timesCompleted = habitLogs.filter((log) => log.completed).length;
                  const totalMinutes = habitLogs.reduce((sum, log) => sum + (log.minutes_completed || 0), 0);

                  return (
                    <div key={habit.id} className="border-2 border-black/20 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-bold text-sm">{habit.title}</p>
                          <p className="text-xs text-black/70">{habit.category}</p>
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
                        <span className="bg-black/10 px-2 py-1 rounded">✓ {timesCompleted}</span>
                        <span className="bg-black/10 px-2 py-1 rounded">⏱ {totalMinutes}m</span>
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
                  <p className="text-xs text-black/70">Meta: {selectedHabit.target_minutes} min</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase">Minutos dedicados</label>
                  <input
                    type="number"
                    value={activityMinutes}
                    onChange={(e) => setActivityMinutes(parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full text-sm rounded border-2 border-black px-3 py-2 outline-none focus:bg-black/5"
                    min="0"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase">Calidad (1-5)</label>
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
                      setActivityQuality(3);
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
                            <td className="py-2 font-bold">{habit?.title || "Unknown"}</td>
                            <td className="text-center py-2">{log.completed ? "✓" : "—"}</td>
                            <td className="text-center py-2">{log.minutes_completed}m</td>
                            <td className="text-center py-2">{log.quality_score}/5</td>
                            <td className="py-2 text-black/70">{log.notes || "—"}</td>
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

        {/* STATUS MESSAGE */}
        {message && (
          <div className="fixed bottom-6 right-6 bg-black text-white px-6 py-3 rounded-full text-sm font-bold">
            {message}
          </div>
        )}
      </main>
    </div>
  );
}

