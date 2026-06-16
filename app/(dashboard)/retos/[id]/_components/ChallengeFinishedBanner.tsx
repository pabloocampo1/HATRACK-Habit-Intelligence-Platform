import { Trophy, CheckCircle2, XCircle } from "lucide-react";
import type { ChallengeDetail } from "@/services/challenges/challengeService";

export default function ChallengeFinishedBanner({ detail }: { detail: ChallengeDetail }) {
  const { challenge, completionRate, perfectDays } = detail;
  const totalDays = challenge.duration_days;
  const perfectCount = perfectDays.size;
  const success = completionRate >= 70;

  const endDateLabel = new Date(challenge.end_date + "T12:00:00").toLocaleDateString("es-ES", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className={`rounded-2xl border p-6 sm:p-8 ${success ? "border-brand-forest/40 bg-accent-subtle/60" : "border-border-default bg-surface-muted"}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        <div className={`flex size-16 shrink-0 items-center justify-center rounded-2xl ${success ? "bg-brand-forest text-brand-forest-fg" : "bg-surface-subtle text-text-muted"}`}>
          {success ? <Trophy className="size-8" strokeWidth={2} /> : <XCircle className="size-8" strokeWidth={2} />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-text-muted">
            {challenge.status === "abandoned" ? "Reto abandonado" : "Reto finalizado"}
          </p>
          <h2 className={`mt-1 text-2xl font-black tracking-tight ${success ? "text-brand-forest" : "text-text-primary"}`}>
            {success ? "¡Lo lograste!" : "Buen intento"}
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            {endDateLabel} · {perfectCount} día{perfectCount !== 1 ? "s" : ""} perfecto{perfectCount !== 1 ? "s" : ""} de {totalDays}
          </p>
          {challenge.goal && (
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-border-subtle bg-surface-card p-3">
              <CheckCircle2 className={`mt-0.5 size-4 shrink-0 ${success ? "text-brand-forest" : "text-text-muted"}`} strokeWidth={2.5} />
              <p className="text-sm text-text-secondary"><span className="font-bold text-text-primary">Meta: </span>{challenge.goal}</p>
            </div>
          )}
        </div>
        <div className="flex flex-col items-center rounded-2xl border border-border-subtle bg-surface-card px-6 py-4 text-center shrink-0">
          <p className="text-[9px] font-bold uppercase tracking-widest text-text-muted">Cumplimiento</p>
          <p className={`text-4xl font-black tabular-nums ${success ? "text-brand-forest" : "text-text-primary"}`}>
            {completionRate}%
          </p>
        </div>
      </div>
    </div>
  );
}
