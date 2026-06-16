import Link from "next/link";
import { CalendarDays, CheckCircle2, Clock, Flame, Trophy } from "lucide-react";
import type { Challenge } from "@/lib/types";

function statusBadge(status: Challenge["status"]) {
  switch (status) {
    case "active":
      return (
        <span className="flex items-center gap-1 rounded-full border border-brand-forest/30 bg-accent-subtle px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-brand-forest">
          <Flame className="size-3" strokeWidth={2.5} /> Activo
        </span>
      );
    case "completed":
      return (
        <span className="flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-400">
          <Trophy className="size-3" strokeWidth={2.5} /> Completado
        </span>
      );
    case "abandoned":
      return (
        <span className="rounded-full border border-border-default bg-surface-muted px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-text-muted">
          Abandonado
        </span>
      );
  }
}

function progressBar(start: string, end: string, durationDays: number, status: Challenge["status"]) {
  if (status !== "active") return status === "completed" ? 100 : null;
  const startMs = new Date(start + "T00:00:00").getTime();
  const endMs = new Date(end + "T00:00:00").getTime();
  const nowMs = Date.now();
  const pct = Math.min(100, Math.max(0, Math.round(((nowMs - startMs) / (endMs - startMs + 86_400_000)) * 100)));
  return pct;
}

function daysRemaining(end: string, status: Challenge["status"]) {
  if (status !== "active") return null;
  const endMs = new Date(end + "T00:00:00").getTime();
  const diff = Math.ceil((endMs - Date.now()) / 86_400_000) + 1;
  return Math.max(0, diff);
}

export default function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const pct = progressBar(challenge.start_date, challenge.end_date, challenge.duration_days, challenge.status);
  const remaining = daysRemaining(challenge.end_date, challenge.status);

  return (
    <Link href={`/retos/${challenge.id}`} className="group block">
      <article className="rounded-2xl border border-border-subtle bg-surface-card p-5 shadow-sm transition hover:border-brand-forest/30 hover:shadow-md sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {statusBadge(challenge.status)}
              <span className="rounded-full border border-border-subtle bg-surface-muted px-2.5 py-1 text-[10px] font-bold text-text-muted">
                {challenge.duration_days} días
              </span>
            </div>
            <h3 className="truncate text-base font-black tracking-tight text-text-primary group-hover:text-brand-forest transition-colors sm:text-lg">
              {challenge.title}
            </h3>
            {challenge.description && (
              <p className="mt-1 line-clamp-2 text-sm text-text-secondary">{challenge.description}</p>
            )}
            {challenge.goal && (
              <p className="mt-2 flex items-start gap-1.5 text-xs text-text-muted">
                <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-brand-forest" strokeWidth={2.5} />
                {challenge.goal}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {pct !== null && (
            <div>
              <div className="flex items-center justify-between text-[10px] text-text-muted mb-1">
                <span className="font-bold">{pct}% completado</span>
                {remaining !== null && (
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" strokeWidth={2} />
                    {remaining} día{remaining !== 1 ? "s" : ""} restante{remaining !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-surface-subtle">
                <div
                  className="h-full rounded-full bg-brand-forest transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
            <CalendarDays className="size-3.5 shrink-0" strokeWidth={2} />
            {new Date(challenge.start_date + "T12:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
            {" — "}
            {new Date(challenge.end_date + "T12:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
          </div>
        </div>
      </article>
    </Link>
  );
}
