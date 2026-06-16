import type { Goal } from "@/lib/types";
import { Target, CalendarDays, AlertTriangle, ChevronRight, Flame, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { CATEGORY_LABELS } from "../../metas/_components/GoalCard";

function daysRemaining(date: string | null | undefined): number | null {
  if (!date) return null;
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86_400_000);
}

function ProgressBar({ pct, isOverdue }: { pct: number; isOverdue: boolean }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-text-muted">
        <span>Progreso</span>
        <span className="text-text-primary">{pct}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-subtle">
        <div
          className={`h-full rounded-full transition-all duration-700 ${isOverdue ? "bg-red-500" : pct === 100 ? "bg-brand-forest" : "bg-brand-forest/70"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function FeaturedGoalWidget({ goals }: { goals: Goal[] }) {
  // pick the highest-priority active goal
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const featured = goals
    .filter((g) => g.status === "active")
    .sort((a, b) => (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2))[0];

  if (!featured) {
    return (
      <div className="rounded-[2rem] border border-dashed border-border-subtle bg-surface-card p-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-[2px] w-6 bg-brand-forest" />
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-forest/80">Meta destacada</p>
        </div>
        <div className="flex flex-col items-center py-6 text-center">
          <Target className="size-8 text-text-muted mb-2" strokeWidth={1.25} />
          <p className="text-sm font-semibold text-text-primary">Sin metas activas</p>
          <p className="mt-1 text-xs text-text-muted">Define tu próximo objetivo grande.</p>
          <Link href="/metas" className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-brand-forest/30 bg-accent-subtle px-3 py-2 text-xs font-bold text-brand-forest transition hover:bg-brand-forest/15">
            <Target className="size-3.5" strokeWidth={2.5} /> Crear meta
          </Link>
        </div>
      </div>
    );
  }

  const pct = featured.progress_manual ?? 0;
  const days = daysRemaining(featured.target_date);
  const isOverdue = days !== null && days < 0;

  return (
    <div className="rounded-[2rem] border border-border-subtle bg-surface-card p-8">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="h-[2px] w-6 bg-brand-forest" />
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-forest/80">
            Meta destacada
          </p>
        </div>
        <Link href="/metas" className="text-[10px] font-bold text-text-muted transition hover:text-brand-forest">
          Ver todas →
        </Link>
      </div>

      <Link href={`/metas/${featured.id}`} className="group block space-y-4">
        <div>
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            <span className="rounded-full border border-border-subtle bg-surface-muted px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-text-muted">
              {CATEGORY_LABELS[featured.category] ?? featured.category}
            </span>
            <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${
              featured.priority === "high"
                ? "border-red-500/30 bg-red-500/10 text-red-400"
                : featured.priority === "medium"
                  ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-400"
                  : "border-brand-forest/20 bg-brand-forest/8 text-brand-forest"
            }`}>
              {featured.priority === "high" ? "Alta" : featured.priority === "medium" ? "Media" : "Baja"} prioridad
            </span>
          </div>
          <h3 className="font-black text-lg tracking-tight text-text-primary group-hover:text-brand-forest transition-colors line-clamp-2 flex items-start gap-2">
            {featured.title}
            <ChevronRight className="size-4 mt-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5" strokeWidth={2} />
          </h3>
          {featured.why && (
            <p className="mt-0.5 text-xs italic text-text-muted line-clamp-1">"{featured.why}"</p>
          )}
        </div>

        <ProgressBar pct={pct} isOverdue={isOverdue} />

        {days !== null && (
          <div className={`flex items-center gap-1.5 text-xs font-medium ${
            isOverdue ? "text-red-400" : days <= 7 ? "text-yellow-400" : "text-text-muted"
          }`}>
            {isOverdue ? <AlertTriangle className="size-3.5" strokeWidth={2.5} /> : days <= 7 ? <Flame className="size-3.5" strokeWidth={2} /> : <CalendarDays className="size-3.5" strokeWidth={2} />}
            {isOverdue
              ? `Vencida hace ${Math.abs(days)} día${Math.abs(days) !== 1 ? "s" : ""}`
              : days === 0 ? "Vence hoy"
              : `${days} día${days !== 1 ? "s" : ""} restante${days !== 1 ? "s" : ""}`}
          </div>
        )}
      </Link>

      {/* other active goals count */}
      {goals.filter((g) => g.status === "active").length > 1 && (
        <div className="mt-5 border-t border-border-subtle pt-4">
          <Link href="/metas" className="flex items-center gap-2 text-xs text-text-muted transition hover:text-text-primary">
            <CheckCircle2 className="size-3.5" strokeWidth={2} />
            {goals.filter((g) => g.status === "active").length - 1} meta{goals.filter((g) => g.status === "active").length - 1 !== 1 ? "s" : ""} activa{goals.filter((g) => g.status === "active").length - 1 !== 1 ? "s" : ""} más
          </Link>
        </div>
      )}
    </div>
  );
}
