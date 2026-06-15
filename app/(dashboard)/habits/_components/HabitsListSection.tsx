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
            {habits.length} hábito{habits.length === 1 ? "" : "s"} — detalle y
            consistencia
          </p>
        </div>
      </div>
      <ul className="flex flex-col gap-8">
        {habits.map((habit) => (
          <li key={habit.id}>
            <HabitOverviewCard habit={habit} />
          </li>
        ))}
      </ul>
    </section>
  );
}
