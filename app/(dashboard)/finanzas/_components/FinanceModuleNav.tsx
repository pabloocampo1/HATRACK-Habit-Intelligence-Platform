"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    href: "/finanzas",
    label: "Inicio",
    match: (p: string) => p === "/finanzas" || p === "/finanzas/",
  },
  {
    href: "/finanzas/cuentas",
    label: "Cuentas",
    match: (p: string) => p.startsWith("/finanzas/cuentas"),
  },
  {
    href: "/finanzas/transacciones",
    label: "Transacciones",
    match: (p: string) => p.startsWith("/finanzas/transacciones"),
  },
  {
    href: "/finanzas/categorias",
    label: "Categorías",
    match: (p: string) => p.startsWith("/finanzas/categorias"),
  },
  {
    href: "/finanzas/obligaciones",
    label: "Obligaciones",
    match: (p: string) => p.startsWith("/finanzas/obligaciones"),
  },
  {
    href: "/finanzas/presupuestos",
    label: "Presupuestos",
    match: (p: string) => p.startsWith("/finanzas/presupuestos"),
  },
  {
    href: "/finanzas/metas",
    label: "Metas",
    match: (p: string) => p.startsWith("/finanzas/metas"),
  },
  {
    href: "/finanzas/reportes",
    label: "Reportes",
    match: (p: string) => p.startsWith("/finanzas/reportes"),
  },
] as const;

export default function FinanceModuleNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex gap-1 overflow-x-auto border-b border-gray-100 bg-white px-6 py-3"
      aria-label="Módulos de vida financiera"
    >
      {tabs.map(({ href, label, match }) => {
        const active = match(pathname);
        return (
          <Link
            key={href}
            href={href}
            className={`shrink-0 rounded-lg px-3 py-2 text-[12.5px] font-medium transition-colors sm:text-[13px] ${
              active
                ? "bg-emerald-50 text-brand-forest shadow-sm"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
