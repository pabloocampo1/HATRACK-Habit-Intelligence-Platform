"use client";

import LinkComponent from "next/link";
import { useState } from "react";
import {
  LayoutGrid,
  BarChart2,
  Swords,
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
  Sparkles,
  Trophy,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

import logo from "../public/images/hatrack_logo.png";

const personalNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/habits", label: "Mis hábitos", icon: BarChart2 },
  { href: "/retos", label: "Retos", icon: Swords },
  { href: "/metas", label: "Metas personales", icon: Trophy },
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
  if (href === "/metas") {
    return pathname === "/metas" || pathname.startsWith("/metas/");
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
        className="flex w-full min-h-11 cursor-pointer items-center justify-between gap-2 rounded-lg px-5 py-2.5 text-left transition-colors hover:bg-surface-muted active:bg-surface-subtle mx-1"
        aria-expanded={open}
        aria-controls={`nav-section-${sectionId}`}
      >
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-secondary">
          {title}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-text-muted transition-transform duration-200 ${
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
                    ? "bg-accent-subtle text-accent-text font-semibold"
                    : "text-text-secondary hover:bg-surface-muted hover:text-text-primary"
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
                    : "text-text-muted group-hover:text-text-secondary"
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

export default function Sidebar({
  onClose,
  userName = "Usuario",
  planLabel = "Gratuito",
  isPremium = false,
}: {
  onClose?: () => void;
  userName?: string;
  planLabel?: string;
  isPremium?: boolean;
}) {
  const pathName = usePathname();
  const router = useRouter();

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    const { supabase } = await import("@/lib/supabase/config/supabaseClient");
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex flex-col h-full py-6">
      {/* Logo — fijo en la parte superior */}
      <div className="px-2 shrink-0">
        <Image src={logo} alt="Hatrack" width={150} height={150} />
      </div>

      {/* Nav — scrolleable cuando el contenido es largo, sin scrollbar visible */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <NavSection
          title="Vida personal"
          items={personalNav}
          onClose={onClose}
          pathname={pathName}
          defaultOpen={true}
        />
        {/* Finanzas cerrado por defecto para que no empuje el perfil fuera de vista */}
        <NavSection
          title="Vida financiera"
          items={financeNav}
          onClose={onClose}
          pathname={pathName}
          defaultOpen={false}
        />
      </div>

      {/* Perfil + logout — siempre visible en la parte inferior */}
      <div className="shrink-0 px-4 pt-3 pb-1 border-t border-border-subtle">
        <LinkComponent href="/profile" onClick={onClose}>
          <div className="p-3 bg-surface-muted border border-border-subtle rounded-2xl hover:border-brand-forest/30 hover:bg-accent-subtle/40 transition-all cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-brand-forest flex items-center justify-center text-[12px] font-bold text-brand-forest-fg shadow-sm shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-text-primary font-bold truncate group-hover:text-brand-forest transition-colors">
                  {userName}
                </p>
                <p className={`text-[11px] flex items-center gap-1 ${isPremium ? "text-brand-forest" : "text-text-secondary"}`}>
                  {isPremium && <Sparkles className="size-2.5" strokeWidth={2.5} />}
                  {planLabel}
                </p>
              </div>
            </div>
          </div>
        </LinkComponent>
        <button
          onClick={handleLogout}
          className="mt-1 w-full flex items-center justify-center gap-2 py-2 px-3 text-[12px] font-medium text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
        >
          <LogOut size={14} />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
