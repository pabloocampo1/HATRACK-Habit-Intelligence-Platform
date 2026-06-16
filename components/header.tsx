"use client";
import { supabase } from "@/lib/supabase/config/supabaseClient";
import { Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import Link from "next/link";
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
    // Sign out on both server (clears HttpOnly cookies) and client (clears browser state)
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
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border-subtle bg-surface-card px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={onOpenMenu}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border-default text-text-secondary hover:bg-surface-muted transition-all md:hidden"
          aria-label="Abrir menú"
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
          className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border-default text-text-muted hover:bg-surface-muted hover:text-text-secondary hover:border-border-strong transition-all"
          onClick={toggleTheme}
        >
          {theme === "dark" ? (
            <Sun size={13} strokeWidth={1.75} />
          ) : (
            <Moon size={13} strokeWidth={1.75} />
          )}
        </button>

        {/* Avatar — navega a /profile */}
        <Link
          href="/profile"
          title={`${userName} · Ver perfil`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-brand-forest/40 bg-brand-forest text-[12px] font-black tracking-tight text-brand-forest-fg shadow-sm hover:brightness-110 hover:scale-105 transition-all select-none"
        >
          {initials}
        </Link>

        <button
          onClick={handleLogout}
          className="hidden sm:block min-h-11 rounded-lg border border-border-default px-3 text-[12.5px] font-medium text-text-secondary hover:bg-surface-muted hover:text-text-primary hover:border-border-strong transition-all"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
