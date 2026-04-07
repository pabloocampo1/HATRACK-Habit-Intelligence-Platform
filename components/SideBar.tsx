"use client";

import LinkComponent from "next/link";
import { LayoutGrid, BarChart2, User, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import Image from "next/image";

import logo from "../public/images/hatrack_logo.png";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/habits", label: "Mis Hábitos", icon: BarChart2 },
  { href: "/profile", label: "Mi Perfil", icon: User },
];

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

      {/* Label del Menú */}
      <p className="px-6 mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">
        Menú Principal
      </p>

      {/* Navegación */}
      <nav className="flex flex-col gap-1 px-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathName === href;

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

      <div className="mt-auto px-4">
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
