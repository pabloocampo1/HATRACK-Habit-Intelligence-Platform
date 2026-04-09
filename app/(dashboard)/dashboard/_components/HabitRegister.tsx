"use client";

import deleteHabit, { save } from "@/app/actions/habitActions";
import { CreateHabitPayload, Habit, HabitLog } from "@/lib/types";
import { AwardIcon, Delete } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import DeleteHabitModal from "./deleteHabitModal";
import { saveHabitLog } from "@/app/actions/habitLogsActions";

export default function HabitRegister({
  habitsProp = [],
  todayLogsProps = [],
  userId,
}: {
  habitsProp: Habit[] | [];
  todayLogsProps: HabitLog[] | [];
  userId: string;
}) {
  const router = useRouter();

  const [showNewHabitForm, setShowNewHabitForm] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingSaveLog, setLoadingSaveLog] = useState(false);

  const [habitTitle, setHabitTitle] = useState("");
  const [habitCategory, setHabitCategory] = useState("other");
  const [habitFrequency, setHabitFrequency] = useState(0);
  const [habitMinutes, setHabitMinutes] = useState(30);

  const [message, setMessage] = useState("");
  const [habitId, setHabitId] = useState("");
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);

  const [activityMinutes, setActivityMinutes] = useState(0);
  const [activityQuality, setActivityQuality] = useState(0);
  const [activityNotes, setActivityNotes] = useState("");
  const [activityFocus, setActivityFocus] = useState("");
  const [activityEnergy, setActivityEnergy] = useState(3); // Valor por defecto neutro
  const [activityMentalState, setActivityMentalState] = useState("focused"); // O dejarlo vacío para obligar a elegir

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const habit: CreateHabitPayload = {
        title: habitTitle || "",
        category: habitCategory || "",
        frequency: habitFrequency || 0,
        target_minutes: habitMinutes || 0,
      };

      const response = await save(habit, userId);

      console.log(response);

      if (response.success) {
        setHabitTitle("");
        setShowNewHabitForm(false);
        setMessage("¡Hábito creado! ✅");
        router.refresh();
      } else {
        setMessage(
          `Error al crear hábito: ${response.error || "Desconocido"} ❌`,
        );
      }
    } catch (error: any) {
      setMessage(error.message || "Error al registrar actividad");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHabit = async () => {
    if (!habitToDelete) return;

    setLoadingDelete(true);
    const response = await deleteHabit(habitToDelete.id || "");

    if (response.success) {
      setHabitToDelete(null);
      setMessage("Hábito eliminado exitosamente ✅");

      router.refresh();
    } else {
      setMessage(
        `Error al eliminar hábito: ${response.error || "Desconocido"} ❌`,
      );
    }

    setLoadingDelete(false);
  };

  const handleLogActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSaveLog(true);

    const res = await saveHabitLog(
      selectedHabit?.id || "",
      {
        minutes_completed: activityMinutes,
        quality_score: activityQuality,
        completed: activityMinutes > 0 ? true : false,
        notes: activityNotes,
        daily_focus: activityFocus,
        energy_level: activityEnergy,
        mental_state: activityMentalState,
      },
      userId,
    );

    if (res.success) {
      setShowActivityForm(false);

      setActivityFocus("");
      setActivityEnergy(0);
      setActivityMentalState("focused");
      setActivityMinutes(0);
      setActivityQuality(0);
      setActivityNotes("");
      setMessage("Actividad registrada exitosamente ✅");
      router.refresh();
    } else {
      setMessage(
        `Error al registrar actividad: ${res.error || "Desconocido"} ❌`,
      );
    }

    setLoadingSaveLog(false);
  };

  return (
    <div
      className=" 
     p-6 md:p-10 font-sans bg-white selection:text-emerald-900 "
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 ">
        <section className="rounded-3xl  p-8">
          <h2 className="text-xl font-black mb-4">📋 Mis hábitos</h2>
          <button
            disabled={loading}
            onClick={() => setShowNewHabitForm(!showNewHabitForm)}
            className="w-full rounded-full border-2 border-black bg-black px-4 py-2 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-white hover:text-black mb-4"
          >
            {loading ? "Cargando..." : " + Nuevo hábito"}
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
                <option value="fitness">🏋️ Fitness & Sport</option>
                <option value="programming">💻 Programming & Tech</option>
                <option value="reading">📚 Reading</option>
                <option value="learning">🧠 Learning & Studies</option>
                <option value="languages">🗣️ Languages (English)</option>
                <option value="health">❤️ Health & Diet</option>
                <option value="productivity">🚀 Productivity</option>
                <option value="meditation">🧘 Mental Health & Focus</option>
                <option value="finance">💰 Finance</option>
                <option value="social">🤝 Social & Family</option>
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
                disabled={loading}
                type="submit"
                className="w-full rounded border-2 border-black bg-black text-white text-xs font-bold px-2 py-1 hover:bg-white hover:text-black transition"
              >
                {loading ? "Guardando..." : "Guardar"}
              </button>
              <button
                disabled={loading}
                onClick={() => {
                  setShowNewHabitForm(false);
                  setHabitCategory("other");
                  setHabitTitle("");
                  setHabitFrequency(0);
                  setHabitMinutes(0);
                }}
                className="w-full rounded border-2 border-black bg-white text-black text-xs font-bold px-2 py-1 hover:bg-red-900 hover:border-white hover:text-white hover: transition"
              >
                {loading ? "Guardando..." : "Cancelar"}
              </button>
            </form>
          )}

          <div className="space-y-2">
            {habitsProp.length === 0 ? (
              <p className="text-sm text-black/70">
                No hay hábitos. Crea uno para empezar.
              </p>
            ) : (
              habitsProp.map((habit) => {
                const habitLogs = todayLogsProps.filter(
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
                        Registrar habito +
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

                    <button
                      disabled={loadingDelete}
                      onClick={() => setHabitToDelete(habit || null)}
                      className="bg-black/10 px-3 mt-5 rounded hover:transform hover:scale-105"
                    >
                      Eliminar
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="lg:col-span-2 rounded-3xl p-8">
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
                  onChange={(e) => setActivityMinutes(parseInt(e.target.value))}
                  placeholder="0"
                  className="w-full text-sm rounded border-2 border-black px-3 py-2 outline-none focus:bg-black/5"
                  min="0"
                  required
                />
                <p className="text-[10px] text-black/60">
                  Tiempo real que invertiste. Esto mide tu dedicación frente a
                  lo planificado.
                </p>
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
                <p className="text-[10px] text-black/60">
                  Qué tan bien lo hiciste. No es solo cumplir, es cómo lo
                  ejecutas.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase">
                  ⚡ Energía (1-5)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setActivityEnergy(e)}
                      className={`flex-1 py-2 border-2 font-bold rounded ${
                        activityEnergy === e
                          ? "border-black bg-black text-white"
                          : "border-black/20 hover:border-black"
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-black/60">
                  Nivel físico/mental. Te ayuda a entender tu rendimiento en
                  distintos estados.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase">
                  🧠 Estado mental
                </label>
                <select
                  value={activityMentalState}
                  onChange={(e) => setActivityMentalState(e.target.value)}
                  className="w-full text-sm rounded border-2 border-black px-3 py-2 outline-none focus:bg-black/5"
                >
                  <option value="">Selecciona</option>
                  <option value="focused">Enfocado</option>
                  <option value="distracted">Distraído</option>
                  <option value="tired">Cansado</option>
                  <option value="motivated">Motivado</option>
                  <option value="stressed">Estresado</option>
                </select>
                <p className="text-[10px] text-black/60">
                  Cómo te sentías. Esto conecta rendimiento con tu mente.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase">
                  Notas {"(Optional)"}
                </label>
                <textarea
                  value={activityNotes}
                  onChange={(e) => setActivityNotes(e.target.value)}
                  placeholder="Rápidas notas..."
                  className="w-full text-sm rounded border-2 border-black px-3 py-2 outline-none focus:bg-black/5 h-20"
                />
              </div>

              <div className="flex gap-2">
                <button
                  disabled={loadingSaveLog}
                  type="submit"
                  className="flex-1 rounded-full border-2 border-black bg-black px-4 py-2 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-white hover:text-black"
                >
                  {loadingSaveLog ? "Guardando..." : " Registrar ✓"}
                </button>
                <button
                  type="button"
                  disabled={loadingSaveLog}
                  onClick={() => {
                    setShowActivityForm(false);
                    setSelectedHabit(null);
                    setActivityMinutes(0);
                    setActivityQuality(399999);
                    setActivityNotes("");
                  }}
                  className="flex-1 rounded-full border-2 border-black/30 px-4 py-2 text-xs font-bold uppercase tracking-widest hover:border-black transition"
                >
                  {loadingSaveLog ? "Cargando" : "Cancelar"}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-sm text-black/70 p-4 border-2 border-black/20 rounded-lg">
              {habitsProp.length === 0
                ? "Crea un hábito primero para registrar actividades."
                : "Selecciona un hábito de la izquierda para registrar actividad."}
            </div>
          )}

          {/* TODAY'S SUMMARY TABLE */}
          {todayLogsProps.length > 0 && (
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
                    {todayLogsProps.map((log, idx) => {
                      const habit = habitsProp.find(
                        (h) => h.id === log.habit_id,
                      );
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

      {message && (
        <div className="fixed bottom-6 right-6 bg-black text-white px-6 py-3 rounded-full text-sm font-bold">
          {message}

          <button onClick={() => setMessage("")}>Cerrar</button>
        </div>
      )}

      <DeleteHabitModal
        isOpen={!!habitToDelete}
        onClose={() => setHabitToDelete(null)}
        onConfirm={handleDeleteHabit}
        habitTitle={habitToDelete?.title || ""}
        isDeleting={loadingDelete}
      />
    </div>
  );
}
