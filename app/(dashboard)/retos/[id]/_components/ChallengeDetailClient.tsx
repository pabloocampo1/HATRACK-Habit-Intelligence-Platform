"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { abandonChallengeAction } from "@/app/actions/challenges/challengeActions";
import type { ChallengeDetail } from "@/services/challenges/challengeService";
import type { ChallengeHabit, ChallengeLog } from "@/lib/types";
import ChallengeStats from "./ChallengeStats";
import DayMap from "./DayMap";
import ChallengeHabitCard from "./ChallengeHabitCard";
import ChallengeFinishedBanner from "./ChallengeFinishedBanner";

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function ChallengeDetailClient({
  detail,
  userId,
}: {
  detail: ChallengeDetail;
  userId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showAbandon, setShowAbandon] = useState(false);

  const today = todayISO();
  const { challenge, habits, logs, perfectDays, isFinished } = detail;

  const logsByHabit = new Map<string, ChallengeLog>();
  for (const log of logs) {
    if (log.log_date === today) logsByHabit.set(log.challenge_habit_id, log);
  }

  const todayDone = habits.filter((h) => logsByHabit.get(h.id)?.completed).length;
  const todayTotal = habits.length;

  async function handleAbandon() {
    startTransition(async () => {
      await abandonChallengeAction(challenge.id);
      router.refresh();
      setShowAbandon(false);
    });
  }

  const startLabel = new Date(challenge.start_date + "T12:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
  const endLabel = new Date(challenge.end_date + "T12:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="dark mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6 sm:py-10">
      {/* Back */}
      <Link href="/retos" className="inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-text-primary transition">
        <ArrowLeft className="size-4" strokeWidth={2} />
        Volver a retos
      </Link>

      {/* Header */}
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
            challenge.status === "active"
              ? "border-brand-forest/30 bg-accent-subtle text-brand-forest"
              : challenge.status === "completed"
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
              : "border-border-default bg-surface-muted text-text-muted"
          }`}>
            {challenge.status === "active" ? "Activo" : challenge.status === "completed" ? "Completado" : "Abandonado"}
          </span>
          <span className="rounded-full border border-border-subtle bg-surface-muted px-3 py-1 text-[10px] font-bold text-text-muted">
            {challenge.duration_days} días
          </span>
        </div>
        <h1 className="text-3xl font-black tracking-tighter text-text-primary sm:text-4xl">
          {challenge.title}
        </h1>
        {challenge.description && (
          <p className="max-w-xl text-base text-text-secondary">{challenge.description}</p>
        )}
        <p className="text-sm text-text-muted">
          {startLabel} → {endLabel}
        </p>
        {challenge.status === "active" && (
          <button
            type="button"
            onClick={() => setShowAbandon(true)}
            className="text-xs text-text-muted underline underline-offset-2 hover:text-red-400 transition"
          >
            Abandonar reto
          </button>
        )}
      </header>

      {/* Finished banner */}
      {isFinished && <ChallengeFinishedBanner detail={detail} />}

      {/* Stats */}
      <ChallengeStats detail={detail} />

      {/* Day Map */}
      <section className="rounded-2xl border border-border-subtle bg-surface-card p-5 sm:p-7">
        <div className="mb-1 flex items-center gap-2">
          <div className="h-[2px] w-6 bg-brand-forest" />
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-forest/80">
            Mapa de días
          </p>
        </div>
        <h2 className="mb-5 text-lg font-black text-text-primary">
          Días completos vs incompletos
        </h2>
        <DayMap
          startDate={challenge.start_date}
          endDate={challenge.end_date}
          perfectDays={[...perfectDays]}
          today={today}
        />
      </section>

      {/* Today habits */}
      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-[2px] w-6 bg-brand-forest" />
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-forest/80">
                {isFinished ? "Hábitos del reto" : "Hábitos de hoy"}
              </p>
            </div>
            {!isFinished && (
              <p className="text-sm text-text-muted">
                {new Date(today + "T12:00:00").toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
              </p>
            )}
          </div>
          {!isFinished && (
            <div className="flex items-center gap-2 rounded-xl border border-border-subtle bg-surface-card px-4 py-2">
              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-surface-subtle sm:w-32">
                <div
                  className="h-full rounded-full bg-brand-forest transition-all duration-500"
                  style={{ width: todayTotal > 0 ? `${Math.round((todayDone / todayTotal) * 100)}%` : "0%" }}
                />
              </div>
              <span className="text-sm font-bold tabular-nums text-text-primary">
                {todayDone}/{todayTotal}
              </span>
            </div>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {habits.map((habit) => (
            <ChallengeHabitCard
              key={habit.id}
              challengeId={challenge.id}
              userId={userId}
              habit={habit}
              logToday={logsByHabit.get(habit.id) ?? null}
              today={today}
              isFinished={isFinished}
            />
          ))}
        </div>

        {!isFinished && todayDone === todayTotal && todayTotal > 0 && (
          <div className="rounded-2xl border border-brand-forest/30 bg-accent-subtle p-4 text-center">
            <p className="text-sm font-bold text-brand-forest">
              ¡Día perfecto! Completaste todos los hábitos de hoy 🎯
            </p>
          </div>
        )}
      </section>

      {/* Abandon confirm modal */}
      {showAbandon && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-brand-scrim backdrop-blur-sm" onClick={() => setShowAbandon(false)} aria-label="Cerrar" />
          <div className="relative w-full max-w-sm rounded-2xl border border-border-subtle bg-surface-card p-6 shadow-2xl">
            <AlertTriangle className="mx-auto mb-3 size-10 text-amber-400" strokeWidth={1.75} />
            <h2 className="text-center text-lg font-black text-text-primary">¿Abandonar este reto?</h2>
            <p className="mt-2 text-center text-sm text-text-muted">
              No podrás registrar más avances. El progreso actual se conservará.
            </p>
            <div className="mt-5 flex gap-2">
              <button type="button" onClick={() => setShowAbandon(false)} disabled={isPending}
                className="flex-1 min-h-11 rounded-xl border border-border-default text-sm font-bold text-text-secondary hover:bg-surface-muted transition">
                Cancelar
              </button>
              <button type="button" onClick={handleAbandon} disabled={isPending}
                className="flex-1 min-h-11 rounded-xl bg-red-500 text-sm font-bold text-white hover:bg-red-600 transition disabled:opacity-50">
                {isPending ? "…" : "Abandonar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
