import Image from "next/image";
import Link from "next/link";
import {
  BarChart3,
  Brain,
  CreditCard,
  Dumbbell,
  Flag,
  Target,
  Sparkles,
  TrendingUp,
  Wallet,
  CheckCircle2,
  Zap,
  ArrowRight,
  BarChart2,
  Calendar,
  ShieldCheck,
} from "lucide-react";
import logo from "../public/images/cima_logo.png";
import {
  HomeCtaAuthActions,
  HomeHeroAuthActions,
  HomeNavAuthActions,
} from "./_components/HomeAuthActions";

// ── data ─────────────────────────────────────────────────────

const pillars = [
  {
    icon: Brain,
    tag: "Hábitos",
    title: "Ejecuta con intención",
    description:
      "Registra tiempo, calidad, energía y estado mental en cada sesión. No marcas checks — entiendes cómo ejecutas y mejoras semana a semana.",
    highlights: ["Categorías personalizables", "Registro rápido o detallado", "Heatmap de actividad"],
    accent: "text-brand-forest",
    border: "border-brand-forest/20",
  },
  {
    icon: Wallet,
    tag: "Finanzas",
    title: "Tu dinero, bajo control",
    description:
      "Administra cuentas, registra ingresos y gastos, y sigue tus obligaciones financieras. Visualiza tu salud financiera con reportes claros.",
    highlights: ["Cuentas y movimientos", "Obligaciones e ingresos", "Reportes visuales"],
    accent: "text-emerald-400",
    border: "border-emerald-500/20",
  },
  {
    icon: Flag,
    tag: "Retos",
    title: "Desafíos que te transforman",
    description:
      "Crea retos de 7 a 90 días, vincula hábitos, construye rachas diarias y obtén un resumen real de tu cumplimiento al final.",
    highlights: ["Mapa de días cumplidos", "Vinculación con hábitos", "Badge de logro"],
    accent: "text-amber-400",
    border: "border-amber-500/20",
  },
  {
    icon: Target,
    tag: "Metas",
    title: "Objetivos grandes, pasos claros",
    description:
      "Divide tus metas en submetas y pasos concretos. Conecta tus acciones diarias con los resultados que realmente importan.",
    highlights: ["Submetas y pasos", "Seguimiento de progreso", "Fecha límite con alertas"],
    accent: "text-blue-400",
    border: "border-blue-500/20",
  },
] as const;

const kpis = [
  { icon: TrendingUp,  label: "Disciplina",   desc: "Hábitos completados vs. planeados"        },
  { icon: BarChart2,   label: "Consistencia",  desc: "Estabilidad en el tiempo"                 },
  { icon: Zap,         label: "Dedicación",    desc: "Tiempo real vs. tiempo objetivo"          },
  { icon: BarChart3,   label: "Enfoque",       desc: "Calidad promedio de ejecución"            },
  { icon: ArrowRight,  label: "Crecimiento",   desc: "Mejora de calidad semana a semana"        },
];

const trust = [
  { icon: Calendar,    title: "Dashboard diario",    desc: "Revisa tu día de un vistazo: hábitos pendientes, sesiones registradas y métricas en tiempo real." },
  { icon: BarChart3,   title: "Analítica semanal",   desc: "KPIs de disciplina, consistencia, dedicación, enfoque y crecimiento comparados semana a semana." },
  { icon: ShieldCheck, title: "Analítica mensual",   desc: "Retrospectiva completa del mes: tiempo invertido, hábitos cumplidos y metas alcanzadas." },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── NAV ──────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 border-b border-border-subtle bg-background/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <Image src={logo} alt="Cima" width={36} height={36} className="rounded-xl" priority />
            <div>
              <p className="text-lg font-black leading-none tracking-tight">Cima</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Personal OS</p>
            </div>
          </Link>
          <HomeNavAuthActions />
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <header className="relative overflow-hidden border-b border-border-subtle">
        {/* grid */}
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage: "linear-gradient(rgba(52,211,153,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.07) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }} />
        {/* glow */}
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(52,211,153,0.15) 0%, rgba(52,211,153,0) 70%)" }} />

        <div className="relative mx-auto grid w-full max-w-7xl gap-12 px-6 py-16 md:grid-cols-2 md:py-28">
          {/* left */}
          <div className="flex flex-col justify-center space-y-7">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-brand-forest/30 bg-accent-subtle px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-forest">
              <Sparkles className="size-3.5" strokeWidth={2.5} />
              Hábitos · Finanzas · Metas · Retos
            </span>

            <h1 className="text-5xl font-black leading-[1.05] tracking-tighter text-text-primary sm:text-7xl">
              Tu vida entera,<br />
              <span className="text-brand-forest">un solo sistema.</span>
            </h1>

            <p className="max-w-lg text-base leading-relaxed text-text-secondary sm:text-lg">
              Cima unifica el control de tus hábitos, tus finanzas, tus metas y tus retos.
              Registra, mide y toma decisiones con datos reales — todos los días.
            </p>

            <HomeHeroAuthActions />

            {/* quick stats */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "Módulos", value: "5" },
                { label: "KPIs", value: "5" },
                { label: "Seguimiento", value: "Diario" },
                { label: "Plan gratuito", value: "Sí" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-border-subtle bg-surface-card px-3 py-3">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-text-muted">{s.label}</p>
                  <p className="mt-1 text-sm font-black text-text-primary">{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* right — mini dashboard mockup */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-sm space-y-3 rounded-3xl border border-border-subtle bg-surface-card p-5 shadow-2xl shadow-black/20">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-brand-forest/80">Hoy</p>
                <span className="rounded-full border border-brand-forest/25 bg-accent-subtle px-2 py-0.5 text-[10px] font-bold text-brand-forest">4/6 hábitos</span>
              </div>

              {/* habit rows */}
              {[
                { name: "Programación", done: true,  mins: "120m" },
                { name: "Meditación",   done: true,  mins: "20m"  },
                { name: "Inglés",       done: false, mins: "—"    },
                { name: "Lectura",      done: false, mins: "—"    },
              ].map((h) => (
                <div key={h.name} className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 ${h.done ? "border-brand-forest/20 bg-accent-subtle/40" : "border-border-subtle bg-surface-muted"}`}>
                  <CheckCircle2 className={`size-4 shrink-0 ${h.done ? "text-brand-forest" : "text-text-muted/30"}`} strokeWidth={2.5} />
                  <span className={`flex-1 text-sm font-medium ${h.done ? "text-brand-forest" : "text-text-secondary"}`}>{h.name}</span>
                  <span className="text-xs text-text-muted">{h.mins}</span>
                </div>
              ))}

              <div className="grid grid-cols-3 gap-2 pt-1">
                {[
                  { label: "Disciplina", val: "67%" },
                  { label: "Dedicación", val: "83%" },
                  { label: "Balance",    val: "+$240k" },
                ].map((k) => (
                  <div key={k.label} className="rounded-xl border border-border-subtle bg-surface-muted p-2 text-center">
                    <p className="text-[8px] font-bold uppercase tracking-widest text-text-muted">{k.label}</p>
                    <p className="mt-0.5 text-sm font-black tabular-nums text-text-primary">{k.val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── 4 PILLARS ────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-7xl px-6 py-20">
        <div className="mb-12 max-w-2xl">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-brand-forest/80">Qué incluye Cima</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-text-primary sm:text-4xl">
            Todo lo que necesitas para crecer, en un solo lugar.
          </h2>
          <p className="mt-3 text-text-secondary">
            Sin apps sueltas. Sin contexto fragmentado. Cima conecta tu rutina diaria, tus finanzas y tus objetivos para que siempre sepas dónde estás.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <article key={p.tag} className={`group rounded-2xl border ${p.border} bg-surface-card p-7 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10`}>
                <div className="mb-5 flex items-center gap-3">
                  <div className={`inline-flex rounded-xl border ${p.border} bg-surface-muted p-2.5 ${p.accent}`}>
                    <Icon className="size-5" strokeWidth={2.2} />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${p.accent}`}>{p.tag}</span>
                </div>
                <h3 className="text-xl font-black tracking-tight text-text-primary">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{p.description}</p>
                <ul className="mt-5 space-y-1.5">
                  {p.highlights.map((h) => (
                    <li key={h} className="flex items-center gap-2 text-xs text-text-muted">
                      <CheckCircle2 className={`size-3.5 shrink-0 ${p.accent}`} strokeWidth={2.5} />
                      {h}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── KPIs ─────────────────────────────────────────────── */}
      <section className="border-y border-border-subtle bg-surface-card">
        <div className="mx-auto w-full max-w-7xl px-6 py-16">
          <div className="mb-10 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-brand-forest/80">Analítica de rendimiento</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-text-primary sm:text-3xl">
              5 KPIs que miden tu vida real
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {kpis.map((k) => {
              const Icon = k.icon;
              return (
                <div key={k.label} className="rounded-2xl border border-border-subtle bg-surface-muted p-5 text-center">
                  <div className="mx-auto mb-3 inline-flex rounded-xl border border-brand-forest/25 bg-accent-subtle p-2.5 text-brand-forest">
                    <Icon className="size-4" strokeWidth={2.2} />
                  </div>
                  <p className="text-sm font-black text-text-primary">{k.label}</p>
                  <p className="mt-1 text-xs text-text-muted">{k.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── ANALYTICS TIERS ──────────────────────────────────── */}
      <section className="mx-auto w-full max-w-7xl px-6 py-20">
        <div className="mb-12 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-brand-forest/80">Visibilidad total</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-text-primary sm:text-4xl">
            Diario, semanal y mensual
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-text-secondary">
            No es solo un registro — es un sistema que te da perspectiva en cada escala de tiempo para que tomes mejores decisiones.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {trust.map((t) => {
            const Icon = t.icon;
            return (
              <div key={t.title} className="rounded-2xl border border-border-subtle bg-surface-card p-7">
                <div className="mb-4 inline-flex rounded-xl border border-brand-forest/25 bg-accent-subtle p-2.5 text-brand-forest">
                  <Icon className="size-5" strokeWidth={2.2} />
                </div>
                <h3 className="text-lg font-black text-text-primary">{t.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{t.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-7xl px-6 pb-20">
        <div className="relative overflow-hidden rounded-3xl border border-brand-forest/30 bg-accent-subtle p-10 text-center sm:p-16">
          <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full"
            style={{ background: "radial-gradient(ellipse, rgba(52,211,153,0.12) 0%, transparent 70%)" }} />
          <div className="relative">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-forest/80">Empieza gratis hoy</p>
            <h2 className="mt-3 text-4xl font-black tracking-tighter text-text-primary sm:text-6xl">
              Sube a tu<br className="hidden sm:block" />{" "}
              <span className="text-brand-forest">próxima cima.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-text-secondary">
              Crea tu cuenta en segundos. Sin tarjeta de crédito. Sin complicaciones.
              Solo tú, tus hábitos, tus finanzas y tus metas en un sistema que funciona.
            </p>
            <div className="mt-8">
              <HomeCtaAuthActions />
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="border-t border-border-subtle bg-surface-card py-10">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 px-6 text-xs text-text-muted sm:flex-row">
          <div className="flex items-center gap-2">
            <Image src={logo} alt="Cima" width={22} height={22} className="rounded-lg opacity-70" />
            <p>© {new Date().getFullYear()} Cima — Sistema operativo personal.</p>
          </div>
          <p className="uppercase tracking-[0.15em]">Hábitos · Finanzas · Metas · Retos · Analítica</p>
        </div>
      </footer>
    </div>
  );
}
