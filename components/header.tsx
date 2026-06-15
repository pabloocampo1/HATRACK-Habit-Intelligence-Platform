"use client";
import { supabase } from "@/lib/supabase/config/supabaseClient";
import { Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";

import { useRouter } from "next/navigation";

export default function Header({
  userName = "Juan Díaz",
  onOpenMenu,
}: {
  onOpenMenu: () => void;
  userName: string;
}) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

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
    <header className="h-14 flex items-center justify-between px-6 border-b border-border-subtle bg-surface-card flex-shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMenu}
          className="flex md:hidden w-8 h-8 items-center justify-center rounded-lg border border-border-default text-text-secondary hover:bg-surface-muted transition-all"
        >
          <Menu size={18} />
        </button>

        <div>
          <p className="text-[15px] font-semibold text-text-primary tracking-tight leading-tight">
            !Bienvenido¡
          </p>
          <p className="text-[11.5px] text-text-muted capitalize">{today}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={theme === "dark" ? "Modo claro" : "Modo oscuro"}
          className="w-8 h-8 rounded-lg border border-border-default flex items-center justify-center text-text-muted hover:bg-surface-muted hover:text-text-secondary hover:border-border-strong transition-all"
          onClick={toggleTheme}
        >
          {theme === "dark" ? (
            <Sun size={13} strokeWidth={1.75} />
          ) : (
            <Moon size={13} strokeWidth={1.75} />
          )}
        </button>

        <button
          onClick={handleLogout}
          className="h-8 px-3 rounded-lg border border-border-default text-[12.5px] font-medium text-text-secondary hover:bg-surface-muted hover:text-text-primary hover:border-border-strong transition-all"
        >
          Cerrar sesión
        </button>

        <div className="hidden sm:flex w-8 h-8 rounded-full bg-brand-forest border-2 border-emerald-500/30 items-center justify-center text-[11px] font-semibold text-brand-forest-fg cursor-pointer">
          {initials}
        </div>
      </div>
    </header>
  );
}
