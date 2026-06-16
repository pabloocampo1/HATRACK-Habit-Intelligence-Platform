import type { Habit } from "@/lib/types";
import type { PlanInfo } from "@/app/actions/plans/subscriptionActions";
import { formatLimit } from "@/lib/plans/limits";
import CreateHabitCta from "./CreateHabitCta";
import HabitAdminCta from "./HabitAdminCta";
import LogSessionCta from "./LogSessionCta";
import PlanLimitBanner from "@/components/plans/PlanLimitBanner";

export default function HabitsPageHeader({
  userId,
  habits,
  planInfo,
}: {
  userId: string;
  habits: Habit[];
  planInfo: PlanInfo;
}) {
  const { habitCapability, limits, planLabel, isFree } = planInfo;
  const atLimit = !habitCapability.allowed;

  return (
    <header className="flex flex-col gap-6">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="h-[2px] w-8 bg-brand-forest" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-forest/80">
              Centro de hábitos
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-4xl font-black tracking-tighter text-text-primary">
              Mis hábitos
            </h1>
            {/* Plan badge */}
            <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${
              isFree
                ? "border-border-default bg-surface-muted text-text-muted"
                : "border-brand-forest/30 bg-accent-subtle text-brand-forest"
            }`}>
              {planLabel}
            </span>
          </div>
          <p className="mt-3 max-w-xl text-sm font-medium leading-relaxed text-text-muted">
            Vista consolidada de cada rutina, consistencia tipo contribuciones y ranking
            de cumplimiento basado en tus registros reales.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <HabitAdminCta habits={habits} userId={userId} />
          <LogSessionCta userId={userId} habits={habits} />
          <CreateHabitCta userId={userId} disabled={atLimit} />
        </div>
      </div>

      {/* Usage bar shown for FREE users */}
      {isFree && (
        <div className="max-w-sm">
          <PlanLimitBanner
            message={
              atLimit
                ? habitCapability.reason!
                : `${habitCapability.current} de ${formatLimit(limits.habits)} hábitos usados en el plan ${planLabel}.`
            }
            current={habitCapability.current}
            limit={limits.habits}
            showUpgrade={atLimit}
          />
        </div>
      )}
    </header>
  );
}
