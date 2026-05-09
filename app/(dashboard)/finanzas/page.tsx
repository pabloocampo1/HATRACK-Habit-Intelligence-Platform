import Link from "next/link";
import {
  Landmark,
  ArrowLeftRight,
  Tags,
  CalendarClock,
  Gauge,
  Target,
  LineChart,
} from "lucide-react";

const modules = [
  {
    href: "/finanzas/cuentas",
    title: "Cuentas",
    subtitle: "Account",
    body: "Dónde está tu dinero: bancos, efectivo, billeteras digitales.",
    icon: Landmark,
  },
  {
    href: "/finanzas/transacciones",
    title: "Transacciones",
    subtitle: "Core",
    body: "Todos los movimientos: ingresos, gastos y transferencias entre cuentas.",
    icon: ArrowLeftRight,
  },
  {
    href: "/finanzas/categorias",
    title: "Categorías",
    subtitle: "Category",
    body: "Clasifica transacciones para ver en qué ganas o gastas.",
    icon: Tags,
  },
  {
    href: "/finanzas/obligaciones",
    title: "Obligaciones",
    subtitle: "Obligation",
    body: "Compromisos futuros: arriendo, suscripciones, deudas, servicios.",
    icon: CalendarClock,
  },
  {
    href: "/finanzas/presupuestos",
    title: "Presupuestos",
    subtitle: "Budget",
    body: "Límites de gasto por categoría o periodo.",
    icon: Gauge,
  },
  {
    href: "/finanzas/metas",
    title: "Metas de ahorro",
    subtitle: "Savings / Goals",
    body: "Objetivos financieros y seguimiento.",
    icon: Target,
  },
  {
    href: "/finanzas/reportes",
    title: "Reportes",
    subtitle: "Reporting",
    body: "Métricas y análisis: respuestas clave sobre tu dinero.",
    icon: LineChart,
  },
] as const;

export default function FinanzasInicioPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-gray-900">
          Vida financiera
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-gray-600 leading-relaxed">
          Flujo modular: cuentas → transacciones (núcleo) → categorías,
          obligaciones, presupuestos, metas y reportes. Entra a cada bloque
          desde aquí o desde el menú lateral.
        </p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {modules.map(
          ({ href, title, subtitle, body, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-emerald-200/80 hover:shadow-md"
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-brand-forest">
                    <Icon size={20} strokeWidth={1.75} />
                  </span>
                  <span className="rounded-full bg-gray-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                    {subtitle}
                  </span>
                </div>
                <h2 className="text-base font-semibold text-gray-900">{title}</h2>
                <p className="mt-2 flex-1 text-[13px] leading-relaxed text-gray-500">
                  {body}
                </p>
                <span className="mt-4 text-[12px] font-medium text-brand-forest">
                  Abrir módulo →
                </span>
              </Link>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}
