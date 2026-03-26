import { Stats } from "@/lib/types";

export default function MonthStats({ stats }: { stats: Stats | null }) {
  const monthName = new Date().toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });

  if (!stats) return null;

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
              value: stats.totalHabits
                ? Math.round((stats.disciplina / 100) * stats.totalHabits * 30)
                : 0,
              sub: "Hitos alcanzados",
            },
            {
              label: "Tiempo en Enfoque",
              value: `${Math.round((stats.dedicacion / 2) * 30)}m`,
              sub: "Inversión mensual",
            },
            {
              label: "Calidad de Vida",
              value: `${stats.enfoque}/5`,
              sub: "Promedio de enfoque",
            },
            {
              label: "Progreso Real",
              value: `${stats.disciplina}%`,
              sub: "Consistencia del mes",
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

      <div className="my-14 font-sans">
        <section className="rounded-[2.5rem] p-10 bg-[#0a0a0a] border border-emerald-500/10 shadow-2xl relative overflow-hidden">
          {/* Efecto de luz ambiental verde en la esquina */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full"></div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="max-w-md">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-[1px] bg-emerald-500/50"></div>
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400">
                  Soporte al Proyecto
                </h2>
              </div>
              <p className="text-3xl font-black tracking-tighter text-white">
                ¿Te sirve este{" "}
                <span className="text-emerald-500 italic">sistema</span>?
              </p>
              <p className="mt-4 text-sm text-white/40 leading-relaxed font-medium">
                Este dashboard está en constante evolución. Si te ayuda a
                mantener tu disciplina, puedes apoyar el desarrollo comprándome
                un café o aportando para los servidores.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              {/* Opción 1: Ko-fi o BuyMeACoffee */}
              <a
                href="https://ko-fi.com/tu-usuario"
                target="_blank"
                className="group flex items-center justify-center gap-3 px-8 py-4 bg-white/[0.03] border border-white/10 rounded-2xl hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all duration-300"
              >
                <span className="text-xs font-black uppercase tracking-widest text-white group-hover:text-emerald-400">
                  Invítame un café
                </span>
                <svg
                  className="w-4 h-4 text-white group-hover:text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </a>

              {/* Opción 2: Crypto o Nequi/Daviplata (Botón Sólido) */}
              <button
                onClick={() =>
                  alert(
                    "Aquí podrías abrir un modal con tu QR de Nequi o wallet",
                  )
                }
                className="flex items-center justify-center px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] active:scale-95"
              >
                Donar ahora
              </button>
            </div>
          </div>

          <footer className="mt-10 pt-6 border-t border-white/5 flex justify-between items-center">
            <p className="text-[9px] font-mono text-white/10 tracking-[0.3em] uppercase">
              v1.0.4 — Build with focus
            </p>
            <div className="flex gap-4">
              {/* Iconos sutiles de GitHub/Twitter si quieres */}
            </div>
          </footer>
        </section>
      </div>
    </div>
  );
}
