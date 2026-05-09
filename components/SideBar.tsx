"use client";

import LinkComponent from "next/link";
import { useState } from "react";
import {
  LayoutGrid,
  BarChart2,
  User,
  LogOut,
  Home,
  Landmark,
  ArrowLeftRight,
  Tags,
  CalendarClock,
  Gauge,
  Target,
  LineChart,
  ChevronDown,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Image from "next/image";

import logo from "../public/images/hatrack_logo.png";

const personalNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/habits", label: "Mis hábitos", icon: BarChart2 },
  { href: "/profile", label: "Perfil", icon: User },
] as const;

const financeNav = [
  { href: "/finanzas", label: "Inicio finanzas", icon: Home },
  { href: "/finanzas/cuentas", label: "Cuentas", icon: Landmark },
  { href: "/finanzas/transacciones", label: "Transacciones", icon: ArrowLeftRight },
  { href: "/finanzas/categorias", label: "Categorías", icon: Tags },
  { href: "/finanzas/obligaciones", label: "Obligaciones", icon: CalendarClock },
  { href: "/finanzas/presupuestos", label: "Presupuestos", icon: Gauge },
  { href: "/finanzas/metas", label: "Metas de ahorro", icon: Target },
  { href: "/finanzas/reportes", label: "Reportes", icon: LineChart },
] as const;

function isNavActive(pathname: string, href: string) {
  if (href === "/finanzas") {
    return pathname === "/finanzas" || pathname === "/finanzas/";
  }
  if (href.startsWith("/finanzas/")) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }
  return pathname === href;
}

function NavSection({
  title,
  items,
  onClose,
  pathname,
  defaultOpen = true,
}: {
  title: string;
  items: readonly { href: string; label: string; icon: typeof LayoutGrid }[];
  onClose?: () => void;
  pathname: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const sectionId = title.replace(/\s+/g, "-").toLowerCase();

  return (
    <div className="mt-6 first:mt-0">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="flex w-full min-h-11 cursor-pointer items-center justify-between gap-2 rounded-lg px-5 py-2.5 text-left transition-colors hover:bg-gray-50 active:bg-gray-100 mx-1"
        aria-expanded={open}
        aria-controls={`nav-section-${sectionId}`}
      >
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500">
          {title}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-gray-400 transition-transform duration-200 ${
            open ? "rotate-180" : "rotate-0"
          }`}
          aria-hidden
        />
      </button>
      <nav
        id={`nav-section-${sectionId}`}
        className="flex flex-col gap-1 px-3 pt-1 pb-0.5"
        hidden={!open}
      >
        {items.map(({ href, label, icon: Icon }) => {
          const active = isNavActive(pathname, href);

          return (
            <LinkComponent
              key={href}
              href={href}
              onClick={onClose}
              className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] transition-all duration-200
                ${
                  active
                    ? "bg-emerald-50 text-brand-forest font-semibold"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
            >
              {active && (
                <span className="absolute left-0 w-1 h-5 bg-brand-forest rounded-r-full" />
              )}

              <Icon
                size={18}
                strokeWidth={active ? 2.25 : 1.75}
                className={`transition-colors ${
                  active
                    ? "text-brand-forest"
                    : "text-gray-400 group-hover:text-gray-600"
                }`}
              />
              {label}
            </LinkComponent>
          );
        })}
      </nav>
    </div>
  );
}

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathName = usePathname();

  return (
    <div className="flex flex-col h-full py-6">
      <Image
        src={logo}
        alt="Descripción de la imagen"
        width={150}
        height={150}
      />

      <NavSection
        title="Vida personal"
        items={personalNav}
        onClose={onClose}
        pathname={pathName}
      />
      <NavSection
        title="Vida financiera"
        items={financeNav}
        onClose={onClose}
        pathname={pathName}
      />

      <div className="mt-auto px-4 pt-6">
        <div className="p-3 bg-gray-50/50 border border-gray-100 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-forest flex items-center justify-center text-[12px] font-bold text-white shadow-sm flex-shrink-0">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-gray-900 font-bold truncate">
                Juan Díaz
              </p>
              <p className="text-[11px] text-gray-500">Free Plan</p>
            </div>
          </div>
          <button
            onClick={() => {}}
            className="mt-3 w-full flex items-center justify-center gap-2 py-2 text-[12px] font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
          >
            <LogOut size={14} />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}
