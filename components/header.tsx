"use client";

import { Link } from "lucide-react";

export default function Header() {
  const handleLogout = () => {
    localStorage.removeItem("supabase_token");
    window.location.href = "/";
  };
  return (
    <header>
      <nav className="border-b-2 border-black bg-black/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-black">hatrack</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-black/70">ver perfil juan</span>
            <Link
              href="/profile"
              className="text-sm font-bold uppercase tracking-widest text-black/70 hover:text-black transition"
            >
              Ver perfil
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm font-bold uppercase tracking-widest text-black/70 hover:text-black transition"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
