import { CalendarDays, CheckCircle2, Flame, Target, Trophy } from "lucide-react";
import type { ChallengeDetail } from "@/services/challenges/challengeService";

function Stat({ label, value, sub, icon }: { label: string; value: string | number; sub?: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border-subtle bg-surface-card p-5">
      <div className="flex items-center gap-2 text-brand-forest">{icon}</div>
      <p className="text-[9px] font-bold uppercase tracking-widest text-text-muted">{label}</p>
      <p className="text-3xl font-black tabular-nums text-text-primary">{value}</p>
      {sub && <p className="text-xs text-text-muted">{sub}</p>}
    </div>
  );
}

export default function ChallengeStats({ detail }: { detail: ChallengeDetail }) {
  const { challenge, perfectDays, completionRate, daysElapsed } = detail;
  const streak = computeStreak(perfectDays, daysElapsed, challenge.start_date);

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Stat
        label="Días completados"
        value={perfectDays.size}
        sub={`de ${daysElapsed} transcurridos`}
        icon={<CheckCircle2 className="size-5" strokeWidth={2} />}
      />
      <Stat
        label="% Cumplimiento"
        value={`${completionRate}%`}
        sub="hábitos × días"
        icon={<Target className="size-5" strokeWidth={2} />}
      />
      <Stat
        label="Racha actual"
        value={streak}
        sub="días perfectos seguidos"
        icon={<Flame className="size-5" strokeWidth={2} />}
      />
      <Stat
        label="Progreso"
        value={`${daysElapsed}/${challenge.duration_days}`}
        sub="días"
        icon={<CalendarDays className="size-5" strokeWidth={2} />}
      />
    </div>
  );
}

function computeStreak(perfectDays: Set<string>, daysElapsed: number, startDate: string): number {
  let streak = 0;
  const start = new Date(startDate + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let cur = new Date(today);
  while (cur >= start) {
    const key = cur.toISOString().slice(0, 10);
    if (perfectDays.has(key)) { streak++; }
    else if (cur < today) break;
    cur.setDate(cur.getDate() - 1);
  }
  return streak;
}
