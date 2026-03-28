"use client";

import { fetchUserStats } from "@/app/actions/habitActions";
import { HabitLog, Stats } from "@/lib/types";
import { useEffect } from "react";

export default function WeekStats({
  weekStats,
  weekLogs,
}: {
  weekStats: Stats | null;
  weekLogs: HabitLog[];
}) {
  const weekNumber = Math.ceil(
    (new Date().getDate() - new Date().getDay() + 1) / 7,
  );
  const monthName = new Date().toLocaleDateString("es-ES", { month: "long" });

  if (!weekStats) return null;

  return (
    <div className="my-12 font-sans">
      {/* Contenedor Principal: Negro Mate con bordes sutiles */}
      <section className="rounded-[2.5rem] p-10 bg-[#0a0a0a] border border-white/5 shadow-2xl">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-[2px] bg-emerald-500"></div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500/80">
                Informe de Rendimiento Semanal
              </h2>
            </div>
            <p className="text-4xl font-black tracking-tighter text-white capitalize">
              Semana {weekNumber}{" "}
              <span className="text-white/30 font-light">/ {monthName}</span>
            </p>
          </div>

          {/* Calificación Global */}
          <div className="bg-emerald-900/30 border border-emerald-500/30 px-6 py-3 rounded-2xl text-right">
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">
              Puntaje Global Semanal.
            </p>
            <p className="text-3xl font-black text-white">
              {weekStats.disciplina}%
            </p>
          </div>
        </header>

        {/* Grid de KPIs Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            {
              label: "Completadas esta semana",
              value: `${weekLogs.filter((l) => l.completed).length} / 7`,
              sub: "Registros de habitos totales a la semana",
            },
            {
              label: "Tiempo Invertido esta semana",
              value: `${weekLogs.reduce((s, l) => s + (l.minutes_completed || 0), 0)}m`,
              sub: "Trabajo enfocado",
            },
            {
              label: "Calidad Media",
              value: `${(weekLogs.reduce((s, l) => s + l.quality_score, 0) / (weekLogs.length || 1)).toFixed(1)}`,
              sub: "Nivel / 5.0",
            },
            {
              label: "Meta Lograda",
              value: `${weekStats.disciplina}%`,
              sub: "Objetivo semanal",
            },
          ].map((kpi, i) => (
            <article
              key={i}
              className="group rounded-3xl bg-white/[0.03] border border-white/35 p-8 transition-all hover:bg-emerald-900/10 hover:border-emerald-500/20"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 group-hover:text-emerald-400 transition-colors">
                {kpi.label}
              </p>
              <p className="mt-4 text-4xl font-black tracking-tight text-white italic group-hover:text-emerald-400">
                {kpi.value}
              </p>
              <p className="mt-2 text-[11px] font-medium text-white/20 group-hover:text-emerald-300 transition-colors">
                {kpi.sub}
              </p>
            </article>
          ))}
        </div>

        <div className="bg-white/[0.02] rounded-[2rem] p-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
            {[
              { label: "Disciplina", val: weekStats.disciplina },
              { label: "Consistencia", val: weekStats.consistencia },
              { label: "Enfoque", val: weekStats.enfoque },
              { label: "Dedicación", val: weekStats.dedicacion },
              { label: "Crecimiento", val: weekStats.crecimiento },
            ].map((attr, i) => (
              <div key={i} className="space-y-4">
                <div className="flex justify-between items-end border-b border-white/50 pb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                    {attr.label}
                  </span>
                  <span className="text-sm font-black text-emerald-400 italic">
                    {attr.val}%
                  </span>
                </div>
                {/* Barra de progreso con brillo */}
                <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)] transition-all duration-1000 ease-out"
                    style={{ width: `${attr.val}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <footer className="mt-10 pt-6 border-t border-white/5 text-center">
          <p className="text-[9px] font-mono text-white/10 tracking-[0.5em] uppercase">
            Sistema Autenticado — Desarrollador de Alto Rendimiento
          </p>
        </footer>
      </section>
    </div>
  );
}
