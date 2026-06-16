import { Sparkles, Lock } from "lucide-react";
import { formatLimit } from "@/lib/plans/limits";

interface Props {
  /** Message to display (comes from CapabilityResult.reason) */
  message: string;
  /** Current usage count */
  current: number;
  /** Plan limit (may be Infinity for PRO) */
  limit: number;
  /** Whether to show the upgrade CTA */
  showUpgrade?: boolean;
  /** Compact inline variant (no card, just a text row) */
  variant?: "banner" | "inline";
}

export default function PlanLimitBanner({
  message,
  current,
  limit,
  showUpgrade = true,
  variant = "banner",
}: Props) {
  const pct = limit === Infinity ? 100 : Math.min(100, Math.round((current / limit) * 100));
  const isAtLimit = current >= limit;

  if (variant === "inline") {
    return (
      <p className="flex items-center gap-1.5 text-xs font-medium text-amber-400">
        <Lock className="size-3 shrink-0" strokeWidth={2.5} />
        {message}
      </p>
    );
  }

  return (
    <div className={`rounded-2xl border p-4 ${isAtLimit ? "border-amber-500/30 bg-amber-500/8" : "border-border-subtle bg-surface-muted"}`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 shrink-0 ${isAtLimit ? "text-amber-400" : "text-text-muted"}`}>
          {isAtLimit ? <Lock className="size-4" strokeWidth={2.5} /> : <Sparkles className="size-4" strokeWidth={2} />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary">{message}</p>

          {limit !== Infinity && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between text-[10px] text-text-muted">
                <span>{current} / {formatLimit(limit)} usados</span>
                <span>{pct}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-surface-subtle">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${isAtLimit ? "bg-amber-400" : "bg-brand-forest"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )}

          {showUpgrade && isAtLimit && (
            <p className="mt-2 text-xs text-text-muted">
              Contacta al administrador para actualizar tu plan.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
