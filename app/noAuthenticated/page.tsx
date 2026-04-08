"use client";

import Link from "next/link";
import { useEffect } from "react";
import { logoutAction } from "../actions/AuthAction";

export default function NoAuthenticated() {
  useEffect(() => {
    logoutAction();
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <p className="text-black/70 mb-4">No hay usuario autenticado.</p>
      <Link href="/login" className="font-bold text-black hover:text-black/70">
        ← Volver a login
      </Link>
    </div>
  );
}
