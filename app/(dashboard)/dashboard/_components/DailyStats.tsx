import { Habit, HabitLog, Stats } from "@/lib/types";

export default function DailyStats({
  todayStats,
  habits,
  todayLogs,
}: {
  todayStats: Stats | null;
  habits: Habit[];
  todayLogs: HabitLog[];
}) {
  return (
    <div className="my-8">
      <section className="rounded-[2rem] p-10 bg-[#fafafa] ">
        <header className="mb-10">
          <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-black/40 mb-2">
            Métricas de Rendimiento
          </h2>
          <p className="text-3xl font-black tracking-tighter text-black capitalize">
            {new Date().toLocaleDateString("es-ES", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              label: "Habitos Completados hoy",
              subLabel: "Hábitos activos",
              value: `${todayLogs.filter((l) => l.completed).length}/${habits.length}`,
              sub: "Cantidad de hábitos que lograste completar hoy frente al total de hábitos activos que tenías definidos.",
            },
            {
              label: "Tiempo Total dedicado hoy",
              subLabel: "Dedicación hoy",
              value: `${todayStats?.total_time || 0}m`,
              sub: "Tiempo total que invertiste hoy en tus hábitos. Refleja el esfuerzo acumulado sin importar si completaste todos o no.",
            },
            {
              label: "Dedicación de hoy",
              subLabel: "Nivel de enfoque",
              value: `${todayStats?.dedicacion || 0}%`,
              sub: "Qué tanto tiempo cumpliste respecto al que planeaste invertir hoy. Mide tu nivel real de compromiso con tus hábitos.",
            },
            {
              label: "Disciplina de hoy",
              subLabel: "Progreso diario",
              value: `${todayStats?.disciplina || 0}%`,
              sub: "Porcentaje de hábitos que completaste hoy. Indica qué tan bien ejecutaste lo que te propusiste.",
            },
          ].map((kpi, i) => (
            <article
              key={i}
              className="group relative rounded-3xl border border-black/5 bg-white p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all hover:shadow-md"
            >
              <div className="absolute top-8 right-8 w-1.5 h-1.5 rounded-full bg-emerald-900 opacity-20 group-hover:opacity-100 transition-opacity" />

              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/80">
                {kpi.label}
              </p>

              <div className="mt-4 flex items-baseline gap-1">
                <p className="text-4xl font-black tracking-tight text-emerald-950">
                  {kpi.value}
                </p>
              </div>

              <div className="absolute bottom-0 left-8 right-8 h-1 bg-emerald-900/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-900/20 transition-all duration-1000"
                  style={{ width: `${todayStats?.disciplina || 0}%` }}
                />
              </div>

              <p className="text-[14px] font-bold mt-2  tracking-[0.1em] text-black/60">
                {kpi.subLabel}
              </p>
              <p className="text-[12px] font-bold mt-2   text-black/40">
                {kpi.sub}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
