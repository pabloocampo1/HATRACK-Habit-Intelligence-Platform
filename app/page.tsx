import Image from "next/image";
import Link from "next/link";
import {
  BarChart3,
  Brain,
  CreditCard,
  Dumbbell,
  Flag,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import logo from "../public/images/hatrack_logo.png";
import {
  HomeCtaAuthActions,
  HomeHeroAuthActions,
  HomeNavAuthActions,
} from "./_components/HomeAuthActions";

const modules = [
  {
    title: "Habitos",
    icon: Brain,
    description:
      "Registra tiempo, calidad, energia y estado mental. No solo marcas checks: entiendes como ejecutas.",
  },
  {
    title: "Retos",
    icon: Flag,
    description:
      "Desafios de 7 a 90 dias con seguimiento diario, rachas, mapa de progreso y resumen final.",
  },
  {
    title: "Metas",
    icon: Target,
    description:
      "Objetivos grandes con hitos y prioridad. Conecta tus acciones diarias con resultados reales.",
  },
  {
    title: "Finanzas",
    icon: CreditCard,
    description:
      "Control de cuentas, ingresos, gastos y reportes para que tu dinero siga tu estrategia.",
  },
  {
    title: "Analitica",
    icon: BarChart3,
    description:
      "KPIs de disciplina, consistencia, enfoque, dedicacion y crecimiento en dashboard semanal y mensual.",
  },
  {
    title: "Fitness (proximo)",
    icon: Dumbbell,
    description:
      "Seguimiento de entrenamientos, progresion y rendimiento para integrar cuerpo y productividad.",
  },
] as const;

const highlights = [
  { label: "Modulos", value: "Habitos · Retos · Metas · Finanzas" },
  { label: "Metricas", value: "5 KPIs de rendimiento" },
  { label: "Seguimiento", value: "Diario, semanal y mensual" },
  { label: "Enfoque", value: "Vida personal + dinero" },
] as const;

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-40 border-b border-border-subtle bg-background/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-forest text-sm font-black text-brand-forest-fg">
              C
            </div>
            <div>
              <p className="text-lg font-black leading-none tracking-tight">Cima</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted">
                Personal OS
              </p>
            </div>
          </Link>

          <HomeNavAuthActions />
        </div>
      </nav>

      <header className="relative overflow-hidden border-b border-border-subtle">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(rgba(52,211,153,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.08) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(52,211,153,0.18) 0%, rgba(52,211,153,0) 72%)",
          }}
        />

        <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-forest/30 bg-accent-subtle px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-forest">
              <Sparkles className="size-3.5" strokeWidth={2.5} />
              Gestion total de tu vida en un sistema
            </span>

            <h1 className="text-4xl font-black tracking-tighter text-text-primary sm:text-6xl">
              Cima convierte tus acciones en decisiones.
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-text-secondary sm:text-lg">
              Habitos, retos, metas y finanzas en un solo lugar. Mide lo que haces,
              interpreta tus patrones y construye una version mas fuerte de ti.
            </p>

            <HomeHeroAuthActions />

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {highlights.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-border-subtle bg-surface-card px-3 py-3"
                >
                  <p className="text-[9px] font-bold uppercase tracking-widest text-text-muted">
                    {item.label}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-text-secondary">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="w-full max-w-md rounded-3xl border border-border-subtle bg-surface-card p-6 shadow-2xl shadow-black/15">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-forest/80">
                  Vista del sistema
                </p>
                <span className="rounded-full border border-brand-forest/25 bg-accent-subtle px-2 py-0.5 text-[10px] font-bold text-brand-forest">
                  Personal OS
                </span>
              </div>
              <div className="flex items-center justify-center rounded-2xl border border-border-subtle bg-surface-muted p-8">
                <Image src={logo} alt="Logo de Cima" width={210} height={210} />
              </div>
              <div className="mt-4 rounded-2xl border border-border-subtle bg-surface-muted px-4 py-3 text-xs text-text-secondary">
                Dashboard diario + analitica semanal + enfoque mensual en una sola experiencia.
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-7xl px-6 py-16">
        <div className="mb-10 max-w-3xl">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-brand-forest/80">
            Que resuelve Cima
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-text-primary sm:text-4xl">
            Un solo sistema para rendimiento personal real.
          </h2>
          <p className="mt-3 text-text-secondary">
            Deja de usar apps separadas para habitos, metas y dinero. Cima conecta todo para que tomes decisiones con contexto.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <article
                key={module.title}
                className="rounded-2xl border border-border-subtle bg-surface-card p-6 transition hover:-translate-y-0.5 hover:border-brand-forest/30"
              >
                <div className="mb-4 inline-flex rounded-xl border border-brand-forest/25 bg-accent-subtle p-2.5 text-brand-forest">
                  <Icon className="size-5" strokeWidth={2.2} />
                </div>
                <h3 className="text-lg font-black tracking-tight text-text-primary">
                  {module.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  {module.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-y border-border-subtle bg-surface-card">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-16 md:grid-cols-3">
          <div className="rounded-2xl border border-border-subtle bg-surface-muted p-6">
            <TrendingUp className="mb-3 size-6 text-brand-forest" strokeWidth={2.2} />
            <h3 className="text-lg font-black text-text-primary">Disciplina medible</h3>
            <p className="mt-2 text-sm text-text-secondary">
              KPIs claros de disciplina, consistencia, enfoque, dedicacion y crecimiento.
            </p>
          </div>
          <div className="rounded-2xl border border-border-subtle bg-surface-muted p-6">
            <ShieldCheck className="mb-3 size-6 text-brand-forest" strokeWidth={2.2} />
            <h3 className="text-lg font-black text-text-primary">Escalable y seguro</h3>
            <p className="mt-2 text-sm text-text-secondary">
              Arquitectura modular con Server Actions, Services, Repository y RLS en Supabase.
            </p>
          </div>
          <div className="rounded-2xl border border-border-subtle bg-surface-muted p-6">
            <Target className="mb-3 size-6 text-brand-forest" strokeWidth={2.2} />
            <h3 className="text-lg font-black text-text-primary">Orientado a resultados</h3>
            <p className="mt-2 text-sm text-text-secondary">
              Cada registro diario te acerca a metas grandes, no solo a mantener rachas.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-16">
        <div className="rounded-3xl border border-brand-forest/30 bg-accent-subtle p-8 text-center sm:p-12">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-brand-forest/80">
            Tu siguiente paso
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-text-primary sm:text-5xl">
            Empieza hoy y sube tu nivel en Cima.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-text-secondary sm:text-base">
            Crea tu cuenta, define tus primeras metas y convierte tu progreso en un sistema sostenible.
          </p>

          <HomeCtaAuthActions />
        </div>
      </section>

      <footer className="border-t border-border-subtle bg-surface-card py-10">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 px-6 text-xs text-text-muted sm:flex-row">
          <p>
            © {new Date().getFullYear()} Cima. Sistema operativo personal.
          </p>
          <p className="uppercase tracking-[0.15em]">Habitos · Metas · Retos · Finanzas</p>
        </div>
      </footer>
    </div>
  );
}
