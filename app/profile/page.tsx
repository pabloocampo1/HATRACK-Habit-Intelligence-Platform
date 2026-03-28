// app/perfil/page.tsx
"use client";

import { useEffect, useState } from "react";
import PlayerCard from "@/components/PlayerCard";
import "react-calendar-heatmap/dist/styles.css";
import { Zap, Target, Flame, Bot, BookOpen, BrainCircuit } from "lucide-react";
import { motion } from "framer-motion";
import CalendarHeatMap from "react-calendar-heatmap";

// --- DATOS FICTICIOS ---
const mockCounters = [
  {
    id: 1,
    name: "Racha Actual",
    value: 14,
    unit: "días",
    icon: Flame,
    color: "text-orange-500",
  },
  {
    id: 2,
    name: "Nivel de Enfoque",
    value: 85,
    unit: "%",
    icon: BrainCircuit,
    color: "text-emerald-600",
  },
  {
    id: 3,
    name: "Roadmaps Completados",
    value: 3,
    unit: "proyectos",
    icon: Zap,
    color: "text-blue-500",
  },
  {
    id: 4,
    name: "IA Queries",
    value: 120,
    unit: "peticiones",
    icon: Bot,
    color: "text-purple-600",
  },
];

const mockRecentLogs = [
  {
    id: 1,
    habit: "Entrenamiento Backend",
    time: "Hace 2h",
    points: 50,
    icon: BookOpen,
  },
  {
    id: 2,
    habit: "Meditación de Enfoque",
    time: "Hace 5h",
    points: 30,
    icon: BrainCircuit,
  },
  { id: 3, habit: "Generar Roadmap IA", time: "Ayer", points: 100, icon: Bot },
];

const generateHeatmapData = () => {
  const data = [];
  const now = new Date();
  for (let i = 0; i < 90; i++) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    data.push({
      date: date.toISOString().slice(0, 10),
      count: Math.floor(Math.random() * 3),
    });
  }
  return data;
};

const heatmapValues = generateHeatmapData();

export default function ProfilePage() {
  const [selectedHabitId, setSelectedHabitId] = useState<number | null>(null);

  useEffect(() => {
    alert("in process");
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Header Sección - Ahora con textos oscuros */}
      <header className="flex items-center justify-between mb-12 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">
            Panel de <span className="text-emerald-600 italic">Usuario</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium tracking-tight">
            Visualizando el progreso de la{" "}
            <span className="text-slate-800 font-bold">
              Disciplina {new Date().getFullYear()}
            </span>
          </p>
        </div>
        <div className="scale-90 origin-right">
          <PlayerCard />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 space-y-8">
          {/* Contadores Grid - White Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {mockCounters.map((counter, index) => (
              <motion.article
                key={counter.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm group hover:border-emerald-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <counter.icon className={`w-6 h-6 ${counter.color}`} />
                  <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest group-hover:text-slate-400">
                    Métrica
                  </span>
                </div>
                <p className="text-5xl font-black tracking-tighter text-slate-900 tabular-nums group-hover:scale-105 transition-transform origin-left">
                  {counter.value}
                </p>
                <p className="text-xs font-medium text-slate-500 mt-1">
                  {counter.name}{" "}
                  <span className="text-slate-300">({counter.unit})</span>
                </p>
              </motion.article>
            ))}
          </div>

          <article className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-600" />
                Matriz de <span className="text-emerald-600">Consistencia</span>
              </h2>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                Últimos 3 Meses
              </span>
            </div>

            {/* Contenedor con padding a la izquierda para que los labels de los días no se corten */}
            <div className="text-slate-400 text-[9px] heatmap-white font-medium pl-4">
              <CalendarHeatMap
                startDate={
                  new Date(new Date().setDate(new Date().getDate() - 365))
                }
                endDate={new Date()}
                values={heatmapValues}
                showWeekdayLabels={true}
                showMonthLabels={true}
                gutterSize={2} // <--- ESTO hace los cuadros más pequeños al aumentar el espacio entre ellos
                weekdayLabels={["D", "L", "M", "M", "J", "V", "S"]}
                classForValue={(value) => {
                  if (!value || value.count === 0) return "fill-slate-100";
                  if (value.count === 1) return "fill-emerald-200";
                  return "fill-emerald-500";
                }}
                tooltipDataAttrs={(value: any) => {
                  return {
                    "data-tip": `${value.date}: ${value.count} hábitos`,
                  };
                }}
              />
            </div>
            <div className="text-slate-400 text-[9px] heatmap-white font-medium pl-4">
              <CalendarHeatMap
                startDate={
                  new Date(new Date().setDate(new Date().getDate() - 365))
                }
                endDate={new Date()}
                values={heatmapValues}
                showWeekdayLabels={true}
                showMonthLabels={true}
                gutterSize={2} // <--- ESTO hace los cuadros más pequeños al aumentar el espacio entre ellos
                weekdayLabels={["D", "L", "M", "M", "J", "V", "S"]}
                classForValue={(value) => {
                  if (!value || value.count === 0) return "fill-slate-100";
                  if (value.count === 1) return "fill-emerald-200";
                  return "fill-emerald-500";
                }}
                tooltipDataAttrs={(value: any) => {
                  return {
                    "data-tip": `${value.date}: ${value.count} hábitos`,
                  };
                }}
              />
            </div>
            <div className="text-slate-400 text-[9px] heatmap-white font-medium pl-4">
              <CalendarHeatMap
                startDate={
                  new Date(new Date().setDate(new Date().getDate() - 365))
                }
                endDate={new Date()}
                values={heatmapValues}
                showWeekdayLabels={true}
                showMonthLabels={true}
                gutterSize={2} // <--- ESTO hace los cuadros más pequeños al aumentar el espacio entre ellos
                weekdayLabels={["D", "L", "M", "M", "J", "V", "S"]}
                classForValue={(value) => {
                  if (!value || value.count === 0) return "fill-slate-100";
                  if (value.count === 1) return "fill-emerald-200";
                  return "fill-emerald-500";
                }}
                tooltipDataAttrs={(value: any) => {
                  return {
                    "data-tip": `${value.date}: ${value.count} hábitos`,
                  };
                }}
              />
            </div>

            {/* Leyenda opcional para que se vea más pro */}
            <div className="mt-4 flex justify-end items-center gap-2 text-[8px] font-bold text-slate-300 uppercase tracking-tighter">
              <span>Menos</span>
              <div className="w-2 h-2 bg-slate-100 rounded-[1px]"></div>
              <div className="w-2 h-2 bg-emerald-200 rounded-[1px]"></div>
              <div className="w-2 h-2 bg-emerald-500 rounded-[1px]"></div>
              <span>Más</span>
            </div>
          </article>
        </section>

        {/* Columna Derecha: Logs Recientes */}
        <aside className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-500" />
              Logs <span className="text-blue-600">Recientes</span>
            </h2>
            <button className="text-[10px] font-black uppercase text-slate-400 hover:text-emerald-600 transition-colors">
              Ver Todo
            </button>
          </div>

          <div className="space-y-4">
            {mockRecentLogs.map((log, index) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.5 }}
                className={`p-5 rounded-2xl border transition-all flex items-center gap-4 cursor-pointer 
                  ${
                    selectedHabitId === log.id
                      ? "bg-emerald-50 border-emerald-200 shadow-inner"
                      : "bg-slate-50 border-slate-100 hover:border-emerald-200"
                  }`}
                onClick={() => setSelectedHabitId(log.id)}
              >
                <div
                  className={`p-3 rounded-full ${selectedHabitId === log.id ? "bg-emerald-600 text-white" : "bg-white text-slate-400 border border-slate-200"}`}
                >
                  <log.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p
                    className={`text-sm font-bold ${selectedHabitId === log.id ? "text-emerald-900" : "text-slate-800"}`}
                  >
                    {log.habit}
                  </p>
                  <p className="text-xs text-slate-400 font-mono">{log.time}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-emerald-600 tabular-nums">
                    +{log.points}
                  </p>
                  <p className="text-[9px] font-black uppercase text-emerald-400 tracking-widest">
                    XP
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}
