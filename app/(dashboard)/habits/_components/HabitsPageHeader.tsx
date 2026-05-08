import type { Habit } from "@/lib/types";
import CreateHabitCta from "./CreateHabitCta";
import LogSessionCta from "./LogSessionCta";

export default function HabitsPageHeader({
  userId,
  habits,
}: {
  userId: string;
  habits: Habit[];
}) {
  return (
    <header className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div className="mb-3 flex items-center gap-2">
          <div className="h-[2px] w-8 bg-emerald-500" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500/90">
            Centro de hábitos
          </p>
        </div>
        <h1 className="text-4xl font-black tracking-tighter text-neutral-950">
          Mis hábitos
        </h1>
        <p className="mt-3 max-w-xl text-sm font-medium leading-relaxed text-neutral-500">
          Vista consolidada de cada rutina, consistencia tipo contribuciones y ranking
          de cumplimiento. Los datos mostrados aquí son mock hasta conectar tu API.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
        <LogSessionCta userId={userId} habits={habits} />
        <CreateHabitCta userId={userId} />
      </div>
    </header>
  );
}
