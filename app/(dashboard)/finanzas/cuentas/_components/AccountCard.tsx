import { Eye, EyeOff, Pencil } from "lucide-react";
import type { Account } from "@/lib/types";
import { ACCOUNT_TYPE_LABELS } from "../accounts.constants";
import { btnSecondary } from "../cuentas-ui";
import { AccountTypeIcon } from "../utils/AccountTypeIcon";
import { formatMoney } from "../utils/formatMoney";

const btnIcon =
  "inline-flex size-12 shrink-0 items-center justify-center rounded-xl border border-brand-forest/15 bg-surface-card text-brand-slate shadow-sm transition hover:bg-brand-offwhite active:bg-brand-offwhite";

export default function AccountCard({
  account: a,
  onEdit,
  onDeactivate,
  onReactivate,
}: {
  account: Account;
  onEdit: () => void;
  onDeactivate: () => void;
  onReactivate: () => void;
}) {
  return (
    <article
      className={`relative flex h-full flex-col rounded-2xl border border-brand-forest/10 bg-surface-card p-6 shadow-md transition hover:shadow-lg ${
        !a.is_active ? "opacity-[0.88] saturate-[0.88]" : ""
      }`}
    >
      {!a.is_active ? (
        <span className="absolute right-5 top-5 rounded-full border border-brand-forest/15 bg-brand-offwhite px-3 py-1 text-xs font-semibold text-text-secondary">
          Inactiva
        </span>
      ) : null}

      <div
        className={`flex items-start gap-4 ${!a.is_active ? "pr-16 sm:pr-20" : ""}`}
      >
        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-brand-forest/15 bg-brand-offwhite text-brand-forest shadow-sm">
          <AccountTypeIcon type={a.type} />
        </span>
        <div className="min-w-0 flex-1 space-y-2">
          <h3 className="truncate text-base font-semibold tracking-tight text-brand-slate md:text-lg">
            {a.account_name}
          </h3>
          <p className="text-base text-text-secondary">
            <span className="font-semibold text-brand-slate">
              {ACCOUNT_TYPE_LABELS[a.type]}
            </span>
            {a.institution ? (
              <>
                <span className="text-text-muted"> · </span>
                {a.institution}
              </>
            ) : null}
            <span className="text-text-muted"> · </span>
            <span className="font-semibold text-brand-slate">{a.currency}</span>
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-brand-forest/10 bg-brand-offwhite p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-forest">
          Saldo
        </p>
        <p className="mt-2 text-xl font-bold tabular-nums tracking-tight text-brand-slate md:text-2xl">
          {formatMoney(a.balance, a.currency)}
        </p>
        <p className="mt-3 text-sm text-text-secondary">
          Actualizado{" "}
          {new Date(a.updated_at).toLocaleString("es-CO", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 border-t border-brand-forest/10 pt-6">
        <button type="button" onClick={onEdit} className={`${btnSecondary} flex-1`}>
          <Pencil className="size-5" strokeWidth={2} />
          Editar
        </button>
        {a.is_active ? (
          <button
            type="button"
            onClick={onDeactivate}
            className={`${btnIcon} text-text-secondary hover:border-amber-200/80 hover:bg-amber-50 hover:text-amber-900`}
            title="Desactivar"
          >
            <EyeOff className="size-5" strokeWidth={2} />
          </button>
        ) : (
          <button
            type="button"
            onClick={onReactivate}
            className={`${btnIcon} text-text-secondary hover:border-brand-forest/25 hover:bg-brand-offwhite hover:text-brand-slate`}
            title="Reactivar"
          >
            <Eye className="size-5" strokeWidth={2} />
          </button>
        )}
      </div>
    </article>
  );
}
