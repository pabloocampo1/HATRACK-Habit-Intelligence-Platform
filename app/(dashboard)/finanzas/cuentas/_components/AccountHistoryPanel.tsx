import { ChevronRight, History } from "lucide-react";
import type { AccountRow, MovementRow } from "../accounts.constants";
import { btnSecondary } from "../cuentas-ui";
import { formatMoney } from "../utils/formatMoney";

export default function AccountHistoryPanel({
  account,
  movements,
  onClear,
}: {
  account: AccountRow | null;
  movements: MovementRow[];
  onClear: () => void;
}) {
  if (!account) {
    return (
      <div className="rounded-2xl border border-dashed border-brand-forest/20 bg-white p-8 text-center shadow-md md:p-10">
        <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-xl border border-brand-forest/15 bg-brand-offwhite text-brand-forest/50 shadow-sm">
          <History className="size-6" strokeWidth={1.75} />
        </div>
        <p className="text-base font-semibold text-brand-slate">
          Selecciona una cuenta
        </p>
        <p className="mx-auto mt-3 max-w-sm text-base leading-relaxed text-neutral-600">
          Usa <span className="font-semibold text-brand-slate">Historial</span>{" "}
          en una tarjeta de la izquierda para cargar movimientos aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-brand-forest/10 bg-white shadow-md">
      <div className="border-b border-brand-forest/10 bg-brand-offwhite p-6 md:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-forest">
              {account.name}
            </p>
            <p className="text-xl font-bold tabular-nums tracking-tight text-brand-slate md:text-2xl">
              {formatMoney(account.balanceStored, account.currency)}
            </p>
            <p className="max-w-md text-base leading-relaxed text-neutral-600">
              Orden reciente primero. Sustituye por paginación e infinite scroll
              cuando tengas volumen real.
            </p>
          </div>
          <button
            type="button"
            onClick={onClear}
            className={`${btnSecondary} shrink-0 self-start`}
          >
            Cerrar
          </button>
        </div>
      </div>
      <ul className="max-h-[min(440px,58vh)] space-y-1 overflow-y-auto p-3 md:p-4">
        {movements.length === 0 ? (
          <li className="rounded-xl py-12 text-center">
            <p className="text-base font-medium text-neutral-600">
              Sin movimientos para esta cuenta.
            </p>
          </li>
        ) : (
          movements.map((m) => (
            <li key={m.id}>
              <div className="flex gap-3 rounded-xl border border-transparent px-3 py-3 transition hover:border-brand-forest/10 hover:bg-brand-offwhite md:gap-4 md:px-4">
                <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border border-brand-forest/10 bg-brand-offwhite text-brand-forest/45 shadow-sm">
                  <ChevronRight className="size-4 -rotate-90" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-base font-medium leading-snug text-brand-slate">
                    {m.description}
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-600">
                    {new Date(m.at).toLocaleString("es-CO", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                <p
                  className={`shrink-0 text-base font-bold tabular-nums ${
                    m.amount >= 0 ? "text-emerald-700" : "text-brand-slate"
                  }`}
                >
                  {m.amount >= 0 ? "+" : ""}
                  {formatMoney(m.amount, account.currency)}
                </p>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
