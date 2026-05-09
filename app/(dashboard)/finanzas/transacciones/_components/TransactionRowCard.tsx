import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
} from "lucide-react";
import type { CategoryRow, TransactionRow } from "../transacciones.types";
import { formatMoney } from "../utils/formatMoney";
import { categoryToneClasses } from "../utils/categoryToneClasses";

function TypeIcon({ type }: { type: TransactionRow["type"] }) {
  const wrap =
    "flex size-11 shrink-0 items-center justify-center rounded-xl border shadow-sm ";
  if (type === "INCOME") {
    return (
      <span
        className={`${wrap} border-emerald-200/80 bg-emerald-50 text-emerald-700`}
      >
        <ArrowDownLeft className="size-5" strokeWidth={2} />
      </span>
    );
  }
  if (type === "EXPENSE") {
    return (
      <span className={`${wrap} border-rose-200/80 bg-rose-50 text-rose-700`}>
        <ArrowUpRight className="size-5" strokeWidth={2} />
      </span>
    );
  }
  return (
    <span className={`${wrap} border-sky-200/80 bg-sky-50 text-sky-800`}>
      <ArrowLeftRight className="size-5" strokeWidth={2} />
    </span>
  );
}

export default function TransactionRowCard({
  tx,
  category,
}: {
  tx: TransactionRow;
  category: CategoryRow | undefined;
}) {
  const tone = categoryToneClasses(category?.tone ?? "slate");
  const time = new Date(tx.at).toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const isPositive = tx.amount >= 0;

  return (
    <article className="flex gap-4 rounded-2xl border border-brand-forest/10 bg-white p-4 shadow-sm transition hover:border-brand-forest/20 hover:shadow-md md:gap-5 md:p-5">
      <TypeIcon type={tx.type} />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-2 gap-y-1">
          <h3 className="text-base font-semibold leading-snug text-brand-slate md:text-lg">
            {tx.description}
          </h3>
          <p
            className={`shrink-0 text-right text-lg font-bold tabular-nums md:text-xl ${
              isPositive ? "text-emerald-700" : "text-brand-slate"
            }`}
          >
            {isPositive ? "+" : ""}
            {formatMoney(tx.amount, tx.currency)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-600">
          {category ? (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tone.pill}`}
            >
              <span className={`size-1.5 rounded-full ${tone.dot}`} aria-hidden />
              {category.name}
            </span>
          ) : null}
          <span className="text-neutral-400">·</span>
          <span>{tx.accountName}</span>
          {tx.type === "TRANSFER" && tx.toAccountName ? (
            <>
              <span className="text-neutral-400">→</span>
              <span>{tx.toAccountName}</span>
            </>
          ) : null}
          <span className="text-neutral-400">·</span>
          <time dateTime={tx.at} className="tabular-nums">
            {time}
          </time>
        </div>
      </div>
    </article>
  );
}
