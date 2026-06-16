import type { HabitOverview } from "../types";
import HabitOverviewCard from "./HabitOverviewCard";

export default function HabitsListSection({
  habits,
}: {
  habits: HabitOverview[];
}) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-black tracking-tight text-text-primary">
            Tus rutinas
          </h2>
          <p className="text-sm font-medium text-text-muted">
            {habits.length} hábito{habits.length === 1 ? "" : "s"} — ordenados del
            más al menos completado
          </p>
        </div>
      </div>
      <ul className="flex flex-col gap-8">
        {habits.length === 0 ? (
          <li className="rounded-[2rem] border border-dashed border-border-subtle bg-surface-card p-10 text-center">
            <p className="text-base font-semibold text-text-primary">
              Aún no tienes hábitos
            </p>
            <p className="mt-2 text-sm text-text-muted">
              Crea tu primer hábito con el botón &quot;Nuevo hábito&quot; para empezar a
              registrar tu consistencia.
            </p>
          </li>
        ) : (
          habits.map((habit) => (
            <li key={habit.id}>
              <HabitOverviewCard habit={habit} />
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
