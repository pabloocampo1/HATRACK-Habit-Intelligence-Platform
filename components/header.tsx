"use client";
import { supabase } from "@/lib/supabase/config/supabaseClient";
import { Menu, Moon } from "lucide-react";

import { useRouter } from "next/navigation";

export default function Header({
  userName = "Juan Díaz",
  onOpenMenu,
}: {
  onOpenMenu: () => void;
  userName: string;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });

    await supabase.auth.signOut();

    router.push("/login");
    router.refresh();
  };

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const today = new Date().toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-gray-100 bg-white flex-shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMenu}
          className="flex md:hidden w-8 h-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all"
        >
          <Menu size={18} />
        </button>

        <div>
          <p className="text-[15px] font-semibold text-gray-900 tracking-tight leading-tight">
            !Bienvenido¡
          </p>
          <p className="text-[11.5px] text-gray-400 capitalize">{today}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-600 hover:border-gray-300 transition-all"
          onClick={() => alert("in process to build")}
        >
          <Moon size={13} strokeWidth={1.75} />
        </button>

        <button
          onClick={handleLogout}
          className="h-8 px-3 rounded-lg border border-gray-200 text-[12.5px] font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300 transition-all"
        >
          Cerrar sesión
        </button>

        <div className="hidden sm:flex w-8 h-8 rounded-full bg-brand-forest border-2 border-emerald-200 items-center justify-center text-[11px] font-semibold text-emerald-100 cursor-pointer">
          {initials}
        </div>
      </div>
    </header>
  );
}
