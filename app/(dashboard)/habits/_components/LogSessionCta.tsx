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
        className="group inline-flex items-center gap-2 rounded-2xl border border-border-default bg-surface-muted px-5 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-text-primary transition hover:border-brand-forest/30 hover:bg-accent-subtle hover:text-brand-forest"
        onClick={() => setOpen(true)}
      >
        <ClipboardCheck
          className="h-4 w-4 text-brand-forest transition group-hover:scale-110"
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
