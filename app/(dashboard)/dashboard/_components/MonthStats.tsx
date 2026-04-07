import { HabitLog, Stats } from "@/lib/types";

export default function MonthStats({
  stats,
  monthHabitLogs,
}: {
  stats: Stats | null;
  monthHabitLogs: HabitLog[];
}) {
  const monthName = new Date().toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });

  if (!stats) return null;

  const totalCompleted = monthHabitLogs.filter((log) => log.completed).length;

  return (
    <div className="my-14 font-sans">
      <section className="rounded-[2.5rem] p-10 bg-[#fafafa] border border-black-900/10 ">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-[2px] bg-emerald-600"></div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-900/40">
                Análisis de Rendimiento Mensual
              </h2>
            </div>
            <p className="text-4xl font-black tracking-tighter text-black capitalize">
              {monthName}
            </p>
          </div>

          {/* Calificación Global Mensual */}
          <div className="bg-white border border-emerald-900/10 px-6 py-3 rounded-2xl shadow-sm">
            <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-1">
              Disciplina Total
            </p>
            <p className="text-3xl font-black text-emerald-950">
              {stats.disciplina}%
            </p>
          </div>
        </header>

        {/* Grid de KPIs Mensuales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            {
              label: "Total Completadas",
              value: totalCompleted ? totalCompleted : 0,
              sub: "Hitos alcanzados",
              desc: "Cantidad de hábitos que lograste completar en el mes",
            },
            {
              label: "Tiempo en Enfoque",
              value: `${Math.round((stats.dedicacion / 2) * 30)}m`,
              sub: "Inversión mensual",
              desc: "Tiempo total invertido en actividades de valor",
            },
            {
              label: "Calidad de Vida",
              value: `${stats.enfoque}/5`,
              sub: "Promedio de enfoque",
              desc: "Nivel promedio de calidad en tu ejecución diaria",
            },
            {
              label: "Progreso Real",
              value: `${stats.disciplina}%`,
              sub: "Consistencia del mes",
              desc: "Qué tanto cumpliste lo que te propusiste",
            },
          ].map((kpi, i) => (
            <article
              key={i}
              className="group rounded-3xl bg-white border border-black/20 p-8 transition-all hover:border-emerald-500/30 hover:shadow-md"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 group-hover:text-emerald-600 transition-colors">
                {kpi.label}
              </p>

              <p className="mt-4 text-4xl font-black tracking-tight text-emerald-950 italic group-hover:translate-x-1 group-hover:translate-y-1 group-hover:scale-110 text-emerald-600 transition-colors">
                {kpi.value}
              </p>

              <p className="mt-2 text-[11px] font-medium text-black/20 group-hover:text-emerald-600 transition-colors">
                {kpi.sub}
              </p>

              {/* 🔥 explicación */}
              <p className="mt-2 text-[10px] text-black/40">{kpi.desc}</p>
            </article>
          ))}
        </div>

        <div className="bg-white/50 rounded-[2rem] p-8 border border-emerald-900/10">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
            {[
              { label: "Disciplina", val: stats.disciplina },
              { label: "Consistencia", val: stats.consistencia },
              { label: "Enfoque", val: stats.enfoque },
              { label: "Dedicación", val: stats.dedicacion },
              { label: "Crecimiento", val: stats.crecimiento },
            ].map((attr, i) => (
              <div key={i} className="space-y-4">
                <div className="flex justify-between items-end border-b border-emerald-900/30 pb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-900/40">
                    {attr.label}
                  </span>
                  <span className="text-sm font-black text-emerald-700 italic">
                    {attr.val}%
                  </span>
                </div>

                <div className="relative h-2 bg-emerald-900/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 transition-all duration-1000 ease-out"
                    style={{ width: `${attr.val}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <footer className="mt-10 pt-6 border-t border-emerald-900/30 text-center">
          <p className="text-[9px] font-mono text-emerald-900/60 tracking-[0.5em] uppercase">
            Métricas Consolidadas — Vista de Alto Nivel
          </p>
        </footer>
      </section>
    </div>
  );
}
