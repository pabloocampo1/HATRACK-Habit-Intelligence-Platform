"use client";

import type { Habit } from "@/lib/types";
import { ClipboardCheck } from "lucide-react";
import { useState } from "react";
import LogSessionModal from "./LogSessionModal";

/** Acción principal para anotar cumplimiento: más claro que “log” o “marcar”. */
export default function LogSessionCta({
  userId,
  habits,
}: {
  userId: string;
  habits: Habit[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="group inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-neutral-950 px-5 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white/90 transition hover:border-emerald-500/35 hover:bg-emerald-950/20 hover:text-emerald-200"
        onClick={() => setOpen(true)}
      >
        <ClipboardCheck
          className="h-4 w-4 text-emerald-400 transition group-hover:scale-110 group-hover:text-emerald-300"
          strokeWidth={2.5}
        />
        Registrar sesión
      </button>
      <LogSessionModal
        open={open}
        onClose={() => setOpen(false)}
        userId={userId}
        habits={habits}
      />
    </>
  );
}
