"use client";

import { Habit, HabitLog, Stats } from "@/lib/types";

export default function WeekStats({
  weekStats,
  weekLogs,
  habits,
}: {
  weekStats: Stats | null;
  weekLogs: HabitLog[];
  habits: Habit[];
}) {
  const weekNumber = Math.ceil(
    (new Date().getDate() - new Date().getDay() + 1) / 7,
  );
  const monthName = new Date().toLocaleDateString("es-ES", { month: "long" });

  if (!weekStats) return null;

  return (
    <div className="my-12 font-sans">
      <section className="rounded-[2.5rem] border border-border-subtle bg-surface-card p-10 shadow-2xl">
        <header className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="h-[2px] w-8 bg-brand-forest" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-forest/80">
                Informe de Rendimiento Semanal
              </h2>
            </div>
            <p className="text-4xl font-black capitalize tracking-tighter text-text-primary">
              Semana {weekNumber}{" "}
              <span className="font-light text-text-muted">/ {monthName}</span>
            </p>
          </div>

          <div className="rounded-2xl border border-brand-forest/25 bg-accent-subtle px-6 py-3 text-right">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-brand-forest">
              Puntaje Global Semanal.
            </p>
            <p className="text-3xl font-black text-text-primary">
              {weekStats.disciplina}%
            </p>
          </div>
        </header>

        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Completadas esta semana",
              value: `${weekLogs.filter((l) => l.completed).length} / ${habits.reduce((s, h) => s + (h.frequency || 0), 0)}`,
              sub: "Hábitos completados vs esperados",
              reason: `${Math.round((weekLogs.filter((l) => l.completed).length / 7) * 100)}% de cumplimiento basado en la frecuencia semanal definida`,
            },
            {
              label: "Tiempo Invertido esta semana",
              value: `${weekLogs.reduce((s, l) => s + (l.minutes_completed || 0), 0)}m`,
              sub: "Trabajo enfocado total",
              reason: `Basado en la suma de minutos registrados en cada hábito durante la semana`,
            },
            {
              label: "Calidad Media",
              value: `${(
                weekLogs.reduce((s, l) => s + (l.quality_score || 0), 0) /
                (weekLogs.length || 1)
              ).toFixed(1)}`,
              sub: "Nivel / 5.0",
              reason: `Promedio de calidad percibida en cada ejecución del hábito`,
            },
            {
              label: "Meta Lograda",
              value: `${weekStats.disciplina}%`,
              sub: "Objetivo semanal",
              reason: `Basado en hábitos completados vs los esperados según frecuencia`,
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
              <p className="mt-3 text-[10px] leading-relaxed text-text-muted">
                {kpi.reason}
              </p>
            </article>
          ))}
        </div>

        <div className="rounded-[2rem] border border-border-subtle bg-surface-muted p-8">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-5">
            {[
              {
                label: "Disciplina",
                val: weekStats.disciplina,
                desc: "Cumplimiento de hábitos planificados",
                reason: `${weekLogs.filter((l) => l.completed).length} hábitos completados de ${habits.reduce(
                  (t, h) => t + (h.frequency || 0),
                  0,
                )} esperados`,
              },
              {
                label: "Consistencia",
                val: weekStats.consistencia,
                desc: "Frecuencia con la que apareces",
                reason: `${new Set(weekLogs.map((l) => l.log_date)).size} días activos de 7`,
              },
              {
                label: "Enfoque",
                val: weekStats.enfoque,
                desc: "Calidad y presencia en tus sesiones",
                reason: `Promedio de ${(
                  weekLogs.reduce((s, l) => s + (l.quality_score || 0), 0) /
                  (weekLogs.length || 1)
                ).toFixed(1)} / 5`,
              },
              {
                label: "Dedicación",
                val: weekStats.dedicacion,
                desc: "Tiempo invertido vs esperado",
                reason: `${weekLogs.reduce((s, l) => s + (l.minutes_completed || 0), 0)} min de ${habits.reduce(
                  (t, h) => t + (h.frequency || 0) * (h.target_minutes || 0),
                  0,
                )} min esperados`,
              },
              {
                label: "Crecimiento",
                val: weekStats.crecimiento,
                desc: "Evolución respecto al rendimiento",
                reason: "Comparación con semanas anteriores (próximamente)",
              },
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

                <p className="text-[11px] text-text-muted">{attr.desc}</p>

                <p className="text-[10px] italic text-brand-forest/70">
                  {attr.reason}
                </p>
              </div>
            ))}
          </div>
        </div>

        <footer className="mt-10 border-t border-border-subtle pt-6 text-center">
          <p className="text-[9px] font-mono uppercase tracking-[0.5em] text-text-muted/50">
            Sistema Autenticado — Desarrollador de Alto Rendimiento
          </p>
        </footer>
      </section>
    </div>
  );
}
