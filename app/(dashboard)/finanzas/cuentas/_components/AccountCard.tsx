import {
  AlertTriangle,
  Check,
  Eye,
  EyeOff,
  History,
  Pencil,
  Star,
} from "lucide-react";
import type { AccountRow } from "../accounts.constants";
import { ACCOUNT_TYPE_LABELS } from "../accounts.constants";
import { btnPrimary, btnSecondary } from "../cuentas-ui";
import { AccountTypeIcon } from "../utils/AccountTypeIcon";
import { formatMoney } from "../utils/formatMoney";

const btnIcon =
  "inline-flex size-12 shrink-0 items-center justify-center rounded-xl border border-brand-forest/15 bg-white text-brand-slate shadow-sm transition hover:bg-brand-offwhite active:bg-brand-offwhite";

export default function AccountCard({
  account: a,
  selected,
  onSelectHistory,
  onEdit,
  onDeactivate,
  onReactivate,
}: {
  account: AccountRow;
  selected: boolean;
  onSelectHistory: () => void;
  onEdit: () => void;
  onDeactivate: () => void;
  onReactivate: () => void;
}) {
  const drift =
    Math.round(a.balanceStored) !== Math.round(a.balanceCalculated);
  const low =
    a.lowBalanceThreshold != null &&
    a.balanceStored <= a.lowBalanceThreshold;

  return (
    <article
      className={`relative flex h-full flex-col rounded-2xl border border-brand-forest/10 bg-white p-6 shadow-md transition hover:shadow-lg ${
        selected ? "ring-2 ring-brand-forest/30" : ""
      } ${a.status === "INACTIVE" ? "opacity-[0.88] saturate-[0.88]" : ""}`}
    >
      {a.status === "INACTIVE" ? (
        <span className="absolute right-5 top-5 rounded-full border border-brand-forest/15 bg-brand-offwhite px-3 py-1 text-xs font-semibold text-neutral-600">
          Inactiva
        </span>
      ) : null}

      <div
        className={`flex items-start gap-4 ${a.status === "INACTIVE" ? "pr-16 sm:pr-20" : ""}`}
      >
        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-brand-forest/15 bg-brand-offwhite text-brand-forest shadow-sm">
          <AccountTypeIcon type={a.type} />
        </span>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold tracking-tight text-brand-slate md:text-lg">
              {a.name}
            </h3>
            {a.isDefault ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-brand-forest/20 bg-brand-forest px-2.5 py-0.5 text-xs font-semibold text-white">
                <Star className="size-3 fill-white/35" />
                Default
              </span>
            ) : null}
            {a.isSavingsPocket ? (
              <span className="rounded-full border border-brand-forest/15 bg-brand-offwhite px-2.5 py-0.5 text-xs font-semibold text-neutral-600">
                Ahorro
              </span>
            ) : null}
          </div>
          <p className="text-base text-neutral-600">
            <span className="font-semibold text-brand-slate">
              {ACCOUNT_TYPE_LABELS[a.type]}
            </span>
            {a.institution ? (
              <>
                <span className="text-neutral-400"> · </span>
                {a.institution}
              </>
            ) : null}
            <span className="text-neutral-400"> · </span>
            <span className="font-semibold text-brand-slate">{a.currency}</span>
          </p>
          <p className="text-base leading-relaxed text-neutral-600">
            Las transacciones se asocian a esta cuenta; el saldo refleja el
            estado tras aplicar movimientos.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-brand-forest/10 bg-brand-offwhite p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-forest">
          Balance almacenado
        </p>
        <p className="mt-2 text-xl font-bold tabular-nums tracking-tight text-brand-slate md:text-2xl">
          {formatMoney(a.balanceStored, a.currency)}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-brand-forest/10 pt-4 text-base text-neutral-600">
          <span>
            Calculado:{" "}
            <span className="font-semibold tabular-nums text-brand-slate">
              {formatMoney(a.balanceCalculated, a.currency)}
            </span>
          </span>
          {drift ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900">
              <AlertTriangle className="size-3 shrink-0" />
              Revisar
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50/80 px-2.5 py-1 text-xs font-semibold text-emerald-900">
              <Check className="size-3 shrink-0" />
              Coincide
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {!a.allowNegative ? (
          <span className="rounded-full border border-brand-forest/10 bg-brand-offwhite px-3 py-1.5 text-xs font-semibold text-neutral-600">
            Sin negativo
          </span>
        ) : (
          <span className="rounded-full border border-brand-forest/10 bg-brand-offwhite px-3 py-1.5 text-xs font-semibold text-neutral-600">
            Negativo ok
          </span>
        )}
        {low && a.status === "ACTIVE" ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900">
            <AlertTriangle className="size-3" />
            Bajo umbral
          </span>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap gap-2 border-t border-brand-forest/10 pt-6">
        <button
          type="button"
          onClick={onSelectHistory}
          className={`flex-1 sm:min-w-[10rem] ${
            selected ? btnPrimary : btnSecondary
          }`}
        >
          <History className="size-5" strokeWidth={2} />
          Historial
        </button>
        <button type="button" onClick={onEdit} className={btnIcon} title="Editar">
          <Pencil className="size-5" strokeWidth={2} />
        </button>
        {a.status === "ACTIVE" ? (
          <button
            type="button"
            onClick={onDeactivate}
            className={`${btnIcon} text-neutral-600 hover:border-amber-200/80 hover:bg-amber-50 hover:text-amber-900`}
            title="Desactivar"
          >
            <EyeOff className="size-5" strokeWidth={2} />
          </button>
        ) : (
          <button
            type="button"
            onClick={onReactivate}
            className={`${btnIcon} text-neutral-600 hover:border-brand-forest/25 hover:bg-brand-offwhite hover:text-brand-slate`}
            title="Reactivar"
          >
            <Eye className="size-5" strokeWidth={2} />
          </button>
        )}
      </div>
    </article>
  );
}
