"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const financeTabs = [
  {
    href: "/finanzas",
    label: "Inicio",
    match: (p: string) => p === "/finanzas" || p === "/finanzas/",
  },
  {
    href: "/finanzas/reportes",
    label: "Reportes",
    match: (p: string) => p.startsWith("/finanzas/reportes"),
  },
  {
    href: "/finanzas/transacciones",
    label: "Transacciones",
    match: (p: string) =>
      p === "/finanzas/transacciones" ||
      (p.startsWith("/finanzas/transacciones/") &&
        !p.startsWith("/finanzas/transacciones/fijos")),
  },
  {
    href: "/finanzas/deudas",
    label: "Deudas pendientes",
    match: (p: string) =>
      p.startsWith("/finanzas/deudas") || p.startsWith("/finanzas/obligaciones"),
  },
  {
    href: "/finanzas/metas",
    label: "Metas de ahorro",
    match: (p: string) => p.startsWith("/finanzas/metas"),
  },
  {
    href: "/finanzas/cuentas",
    label: "Cuentas",
    match: (p: string) => p.startsWith("/finanzas/cuentas"),
  },
  {
    href: "/finanzas/gastos-fijos",
    label: "Gastos fijos",
    match: (p: string) =>
      p.startsWith("/finanzas/gastos-fijos") || p.startsWith("/finanzas/transacciones/fijos"),
  },
  {
    href: "/finanzas/categorias",
    label: "Categorías",
    match: (p: string) => p.startsWith("/finanzas/categorias"),
  },
] as const;

export default function FinanceModuleNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-border-subtle bg-surface-card" aria-label="Módulos de vida financiera">
      <div className="flex gap-1 overflow-x-auto px-6 py-3">
        {financeTabs.map(({ href, label, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              className={`shrink-0 rounded-lg px-3 py-2 text-[12.5px] font-medium transition-colors sm:text-[13px] ${
                active
                  ? "bg-accent-subtle text-brand-forest shadow-sm"
                  : "text-text-secondary hover:bg-surface-muted hover:text-text-primary"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
