"use client";

import { fetchHabitOverviewsPage } from "@/app/actions/habits/habitOverviewAction";
import type { HabitOverview, HabitsOverviewPagination } from "../types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useTransition } from "react";
import HabitOverviewCard from "./HabitOverviewCard";

export default function HabitsListSection({
  userId,
  initialHabits,
  initialPagination,
}: {
  userId: string;
  initialHabits: HabitOverview[];
  initialPagination: HabitsOverviewPagination;
}) {
  const [habits, setHabits] = useState(initialHabits);
  const [pagination, setPagination] = useState(initialPagination);
  const [isPending, startTransition] = useTransition();

  const { page, totalPages, totalHabits, pageSize } = pagination;
  const rangeStart = totalHabits === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalHabits);

  function goToPage(nextPage: number) {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page || isPending) {
      return;
    }

    startTransition(async () => {
      const result = await fetchHabitOverviewsPage(userId, nextPage);
      setHabits(result.overviews);
      setPagination(result.pagination);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-black tracking-tight text-text-primary">
            Tus rutinas
          </h2>
          <p className="text-sm font-medium text-text-muted">
            {totalHabits} hábito{totalHabits === 1 ? "" : "s"} — ordenados del más
            al menos completado
            {totalHabits > pageSize
              ? ` · mostrando ${rangeStart}–${rangeEnd}`
              : ""}
          </p>
        </div>
        {totalPages > 1 ? (
          <p className="text-[11px] font-bold uppercase tracking-widest text-text-muted">
            Página {page} de {totalPages}
          </p>
        ) : null}
      </div>

      <ul
        className={`flex flex-col gap-8 transition-opacity ${isPending ? "pointer-events-none opacity-50" : ""}`}
        aria-busy={isPending}
      >
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

      {totalPages > 1 ? (
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <p className="text-xs text-text-muted">
            {isPending ? "Cargando hábitos…" : `${pageSize} por página`}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1 || isPending}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border-default bg-surface-muted px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-text-secondary transition hover:border-border-strong hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="size-4" />
              Anterior
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => goToPage(n)}
                  disabled={isPending}
                  aria-current={n === page ? "page" : undefined}
                  className={`min-h-10 min-w-10 rounded-xl text-sm font-bold tabular-nums transition ${
                    n === page
                      ? "bg-brand-forest text-brand-forest-fg shadow-sm"
                      : "border border-border-default bg-surface-card text-text-secondary hover:border-brand-forest/30 hover:text-brand-forest"
                  } disabled:opacity-40`}
                >
                  {n}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages || isPending}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border-default bg-surface-muted px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-text-secondary transition hover:border-border-strong hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
