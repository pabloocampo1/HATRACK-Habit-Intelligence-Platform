"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import CreateHabitModal from "./CreateHabitModal";

export default function CreateHabitCta({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="group inline-flex items-center gap-2 rounded-2xl border border-emerald-500/35 bg-emerald-900/20 px-5 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-black-400 transition hover:border-emerald-400/60 hover:bg-emerald-900/35 hover:text-white"
        onClick={() => setOpen(true)}
      >
        <Plus
          className="h-4 w-4 transition group-hover:scale-110 text-emerald-400 group-hover:text-white"
          strokeWidth={2.5}
        />
        Nuevo hábito
      </button>
      <CreateHabitModal open={open} onClose={() => setOpen(false)} userId={userId} />
    </>
  );
}
