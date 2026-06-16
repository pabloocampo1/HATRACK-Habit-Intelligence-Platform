"use client";

import Link from "next/link";
import { useEffect } from "react";
import { logoutAction } from "../actions/AuthAction";

export default function NoAuthenticated() {
  useEffect(() => {
    logoutAction();
  }, []);

  return (
    <div className="min-h-screen bg-surface-card flex flex-col items-center justify-center">
      <p className="text-text-secondary mb-4">No hay usuario autenticado.</p>
      <Link href="/login" className="font-bold text-foreground hover:text-text-secondary">
        ← Volver a login
      </Link>
    </div>
  );
}
