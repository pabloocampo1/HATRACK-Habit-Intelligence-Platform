"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CheckCircle2, Circle, Clock, Link2, Dumbbell } from "lucide-react";
import { toggleChallengeHabitAction } from "@/app/actions/challenges/challengeActions";
import type { ChallengeHabit, ChallengeLog } from "@/lib/types";

interface Props {
  challengeId: string;
  userId: string;
  habit: ChallengeHabit;
  logToday: ChallengeLog | null;
  today: string;
  isFinished: boolean;
}

export default function ChallengeHabitCard({
  challengeId,
  userId,
  habit,
  logToday,
  today,
  isFinished,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticDone, setOptimisticDone] = useState<boolean | null>(null);

  const isDone = optimisticDone !== null ? optimisticDone : Boolean(logToday?.completed);

  async function handleToggle() {
    if (isFinished || isPending) return;
    const newState = !isDone;
    setOptimisticDone(newState);
    startTransition(async () => {
      const result = await toggleChallengeHabitAction(
        {
          challenge_id: challengeId,
          challenge_habit_id: habit.id,
          user_id: userId,
          log_date: today,
          completed: newState,
        },
        newState ? habit.habit_id ?? null : null,
      );
      if (!result.success) {
        setOptimisticDone(!newState); // revert on error
      } else {
        router.refresh();
      }
    });
  }

  const categoryColor: Record<string, string> = {
    health: "text-emerald-400",
    fitness: "text-orange-400",
    focus: "text-blue-400",
    productivity: "text-purple-400",
    learning: "text-yellow-400",
    other: "text-text-muted",
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isFinished || isPending}
      aria-pressed={isDone}
      className={`group w-full rounded-2xl border p-5 text-left transition-all duration-200 ${
        isDone
          ? "border-brand-forest/40 bg-accent-subtle/60"
          : "border-border-subtle bg-surface-card hover:border-brand-forest/25 hover:bg-surface-muted"
      } ${isFinished ? "cursor-default" : "cursor-pointer"} ${isPending ? "opacity-60" : ""}`}
    >
      <div className="flex items-start gap-4">
        <div className={`mt-0.5 shrink-0 transition-all duration-200 ${isDone ? "text-brand-forest" : "text-text-muted group-hover:text-brand-forest/50"}`}>
          {isDone ? (
            <CheckCircle2 className="size-6" strokeWidth={2.5} />
          ) : (
            <Circle className="size-6" strokeWidth={1.75} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {habit.is_linked_habit ? (
              <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-brand-forest/70">
                <Link2 className="size-3" /> Vinculado
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-text-muted">
                <Dumbbell className="size-3" /> Exclusivo del reto
              </span>
            )}
            <span className={`text-[9px] font-bold uppercase tracking-widest ${categoryColor[habit.category] ?? "text-text-muted"}`}>
              {habit.category}
            </span>
          </div>
          <p className={`font-bold tracking-tight transition-colors ${isDone ? "text-brand-forest line-through decoration-brand-forest/40" : "text-text-primary"}`}>
            {habit.title}
          </p>
          {habit.description && (
            <p className="mt-0.5 text-xs text-text-muted line-clamp-1">{habit.description}</p>
          )}
          {habit.target_minutes > 0 && (
            <p className="mt-2 flex items-center gap-1 text-[10px] font-medium text-text-muted">
              <Clock className="size-3" strokeWidth={2} /> {habit.target_minutes} min objetivo
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
