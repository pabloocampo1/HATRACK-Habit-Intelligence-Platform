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
      <section className="rounded-[2.5rem] border border-border-subtle bg-surface-card p-10 shadow-2xl">
        <header className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="h-[2px] w-8 bg-brand-forest" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-forest/80">
                Análisis de Rendimiento Mensual
              </h2>
            </div>
            <p className="text-4xl font-black capitalize tracking-tighter text-text-primary">
              {monthName}
            </p>
          </div>

          <div className="rounded-2xl border border-brand-forest/25 bg-accent-subtle px-6 py-3 shadow-sm">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-brand-forest">
              Disciplina Total
            </p>
            <p className="text-3xl font-black text-text-primary">
              {stats.disciplina}%
            </p>
          </div>
        </header>

        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
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
              className="group rounded-3xl border border-border-subtle bg-surface-muted p-8 transition-all hover:border-brand-forest/25 hover:bg-accent-subtle"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted transition-colors group-hover:text-brand-forest">
                {kpi.label}
              </p>

              <p className="mt-4 text-4xl font-black italic tracking-tight text-text-primary transition-colors group-hover:text-brand-forest">
                {kpi.value}
              </p>

              <p className="mt-2 text-[11px] font-medium text-text-muted transition-colors group-hover:text-brand-forest/80">
                {kpi.sub}
              </p>

              <p className="mt-2 text-[10px] text-text-muted">{kpi.desc}</p>
            </article>
          ))}
        </div>

        <div className="rounded-[2rem] border border-border-subtle bg-surface-muted p-8">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-5">
            {[
              { label: "Disciplina", val: stats.disciplina },
              { label: "Consistencia", val: stats.consistencia },
              { label: "Enfoque", val: stats.enfoque },
              { label: "Dedicación", val: stats.dedicacion },
              { label: "Crecimiento", val: stats.crecimiento },
            ].map((attr, i) => (
              <div key={i} className="space-y-4">
                <div className="flex items-end justify-between border-b border-border-default pb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                    {attr.label}
                  </span>
                  <span className="text-sm font-black italic text-brand-forest">
                    {attr.val}%
                  </span>
                </div>

                <div className="relative h-2 overflow-hidden rounded-full bg-surface-subtle">
                  <div
                    className="h-full bg-brand-forest shadow-[0_0_12px_rgba(16,185,129,0.35)] transition-all duration-1000 ease-out"
                    style={{ width: `${attr.val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <footer className="mt-10 border-t border-border-subtle pt-6 text-center">
          <p className="text-[9px] font-mono uppercase tracking-[0.5em] text-text-muted/50">
            Métricas Consolidadas — Vista de Alto Nivel
          </p>
        </footer>
      </section>
    </div>
  );
}
