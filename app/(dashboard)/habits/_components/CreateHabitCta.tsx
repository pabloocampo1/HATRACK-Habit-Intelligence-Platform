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
        className="group inline-flex items-center gap-2 rounded-2xl border border-brand-forest/30 bg-accent-subtle px-5 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-brand-forest transition hover:border-brand-forest/50 hover:bg-brand-forest/15"
        onClick={() => setOpen(true)}
      >
        <Plus
          className="h-4 w-4 text-brand-forest transition group-hover:scale-110"
          strokeWidth={2.5}
        />
        Nuevo hábito
      </button>
      <CreateHabitModal open={open} onClose={() => setOpen(false)} userId={userId} />
    </>
  );
}
