"use client";

import { Plus, Lock } from "lucide-react";
import { useState } from "react";
import CreateHabitModal from "./CreateHabitModal";

export default function CreateHabitCta({
  userId,
  disabled = false,
}: {
  userId: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        title={disabled ? "Límite de hábitos alcanzado" : undefined}
        className={`group inline-flex items-center gap-2 rounded-2xl border px-5 py-3 text-[11px] font-black uppercase tracking-[0.2em] transition ${
          disabled
            ? "cursor-not-allowed border-border-default bg-surface-muted text-text-muted opacity-60"
            : "border-brand-forest/30 bg-accent-subtle text-brand-forest hover:border-brand-forest/50 hover:bg-brand-forest/15"
        }`}
        onClick={() => !disabled && setOpen(true)}
      >
        {disabled ? (
          <Lock className="h-4 w-4" strokeWidth={2.5} />
        ) : (
          <Plus className="h-4 w-4 transition group-hover:scale-110" strokeWidth={2.5} />
        )}
        Nuevo hábito
      </button>
      {!disabled && (
        <CreateHabitModal open={open} onClose={() => setOpen(false)} userId={userId} />
      )}
    </>
  );
}
