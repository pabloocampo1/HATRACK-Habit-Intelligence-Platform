"use client";

import { Settings2 } from "lucide-react";
import { useState } from "react";
import type { Habit } from "@/lib/types";
import HabitAdminModal from "./HabitAdminModal";

export default function HabitAdminCta({
  habits,
  userId,
}: {
  habits: Habit[];
  userId: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-2xl border border-border-default bg-surface-muted px-5 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-text-secondary transition hover:border-border-strong hover:text-text-primary"
      >
        <Settings2 className="size-4" strokeWidth={2} />
        Administrar
      </button>

      <HabitAdminModal
        open={open}
        onClose={() => setOpen(false)}
        habits={habits}
        userId={userId}
      />
    </>
  );
}
