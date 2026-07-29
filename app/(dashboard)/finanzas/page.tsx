import Link from "next/link";
import {
  Landmark,
  ArrowLeftRight,
  Tags,
  CalendarClock,
  Target,
  LineChart,
  Zap,
} from "lucide-react";
import { getFinanceOverviewAction } from "@/app/actions/finance/financeActions";
import { getCurrentUser } from "@/services/authService";
import { redirect } from "next/navigation";

const modules = [
  {
    href: "/finanzas/cuentas",
    title: "Cuentas",
    subtitle: "Billeteras",
    body: "Registra dónde tienes el dinero (banco, efectivo, Nequi, ahorros). Cada transacción y aporte usa estas cuentas.",
    icon: Landmark,
  },
  {
    href: "/finanzas/gastos-fijos",
    title: "Gastos fijos",
    subtitle: "Recurrentes",
    body: "Plantillas para pagos que se repiten: arriendo, suscripciones, servicios. Regístralos con un clic y quedan en transacciones.",
    icon: Zap,
  },
  {
    href: "/finanzas/transacciones",
    title: "Transacciones",
    subtitle: "Movimientos",
    body: "Historial de ingresos, gastos y transferencias. También aparecen pagos de deudas y aportes a metas.",
    icon: ArrowLeftRight,
  },
  {
    href: "/finanzas/deudas",
    title: "Deudas pendientes",
    subtitle: "Compromisos",
    body: "Deudas y pagos futuros: créditos, préstamos, cuotas. Registra cada pago y descuenta de tu cuenta automáticamente.",
    icon: CalendarClock,
  },
  {
    href: "/finanzas/metas",
    title: "Metas de ahorro",
    subtitle: "Objetivos",
    body: "Define metas (viaje, emergencia) y aporta desde otras cuentas. Cada aporte mueve dinero y crea una transacción.",
    icon: Target,
  },
  {
    href: "/finanzas/categorias",
    title: "Categorías",
    subtitle: "Clasificación",
    body: "Etiquetas como comida, transporte o salario para entender en qué se va o entra tu plata.",
    icon: Tags,
  },
  {
    href: "/finanzas/reportes",
    title: "Reportes",
    subtitle: "Resumen",
    body: "Panorama de saldo, ingresos, gastos, metas activas y últimos movimientos para decidir con datos.",
    icon: LineChart,
  },
] as const;

export default async function FinanzasInicioPage() {
  const user = await getCurrentUser();
  if (!user?.id) redirect("/login");

  const overview = await getFinanceOverviewAction(user.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-text-primary">
          Vida financiera
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-text-secondary leading-relaxed">
          Administra tu dinero por módulos: crea cuentas, registra movimientos, controla deudas
          pendientes, metas de ahorro y gastos fijos para organizar y planificar.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Kpi title="Saldo total" value={overview.metrics.balance} />
        <Kpi title="Ingresos" value={overview.metrics.income} />
        <Kpi title="Gastos" value={overview.metrics.expense} />
        <Kpi title="Flujo neto" value={overview.metrics.cashflow} />
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {modules.map(
          ({ href, title, subtitle, body, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex h-full flex-col rounded-2xl border border-border-subtle bg-surface-card p-5 shadow-sm transition hover:border-emerald-200/80 hover:shadow-md"
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-subtle text-brand-forest">
                    <Icon size={20} strokeWidth={1.75} />
                  </span>
                  <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
                    {subtitle}
                  </span>
                </div>
                <h2 className="text-base font-semibold text-text-primary">{title}</h2>
                <p className="mt-2 flex-1 text-[13px] leading-relaxed text-text-secondary">
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

function Kpi({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface-card p-4">
      <p className="text-xs text-text-muted">{title}</p>
      <p className="mt-1 text-2xl font-semibold text-text-primary">
        ${Number(value).toLocaleString("es-CO")}
      </p>
    </div>
  );
}
