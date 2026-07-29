import { addDaysBogotaYMD, bogotaDateToYMD, bogotaYMDToDate } from "@/lib/dates/bogota";

export const OBLIGATION_META_PREFIX = "[[HATRACK_OBLIGATION_META]]";
export const OBLIGATION_PAYMENT_META_PREFIX = "[[HATRACK_OBLIGATION_PAYMENT_META]]";

export type ObligationMeta = {
  notes?: string;
  totalInstallments?: number;
  paidInstallments?: number;
  /** Valor total de la deuda (no solo la cuota). */
  totalDebt?: number;
};

export function encodeObligationDescription(notes: string, meta: ObligationMeta) {
  const clean = notes.trim();
  const total = Math.max(1, Number(meta.totalInstallments ?? 1));
  const paid = Math.min(total, Math.max(0, Number(meta.paidInstallments ?? 0)));
  const totalDebt =
    meta.totalDebt != null && Number(meta.totalDebt) > 0
      ? Number(meta.totalDebt)
      : undefined;
  const normalized: ObligationMeta = {
    notes: clean || undefined,
    totalInstallments: total,
    paidInstallments: paid,
    ...(totalDebt != null ? { totalDebt } : {}),
  };
  return `${clean}${clean ? "\n" : ""}${OBLIGATION_META_PREFIX}${JSON.stringify(normalized)}`;
}

export function parseObligationDescription(raw?: string | null): {
  notes: string;
  meta: ObligationMeta;
} {
  if (!raw) return { notes: "", meta: { totalInstallments: 1, paidInstallments: 0 } };
  const idx = raw.indexOf(OBLIGATION_META_PREFIX);
  if (idx === -1) return { notes: raw.trim(), meta: { totalInstallments: 1, paidInstallments: 0 } };
  const notes = raw.slice(0, idx).trim();
  try {
    const meta = JSON.parse(raw.slice(idx + OBLIGATION_META_PREFIX.length)) as ObligationMeta;
    const totalDebt =
      meta.totalDebt != null && Number(meta.totalDebt) > 0
        ? Number(meta.totalDebt)
        : undefined;
    return {
      notes,
      meta: {
        totalInstallments: Math.max(1, Number(meta.totalInstallments ?? 1)),
        paidInstallments: Math.max(0, Number(meta.paidInstallments ?? 0)),
        ...(totalDebt != null ? { totalDebt } : {}),
      },
    };
  } catch {
    return { notes, meta: { totalInstallments: 1, paidInstallments: 0 } };
  }
}

export function buildObligationPaymentDescription(
  obligationId: number,
  installmentNumber?: number,
  note?: string,
) {
  const meta = `${OBLIGATION_PAYMENT_META_PREFIX}${JSON.stringify({
    obligation_id: obligationId,
    installment_number: installmentNumber ?? null,
  })}`;
  const clean = note?.trim();
  return clean ? `${clean}\n${meta}` : meta;
}

export function stripInternalFinanceMeta(raw: string): string {
  let text = raw;
  for (const prefix of [OBLIGATION_META_PREFIX, OBLIGATION_PAYMENT_META_PREFIX]) {
    const idx = text.indexOf(prefix);
    if (idx !== -1) text = text.slice(0, idx);
  }
  return text.trim();
}

export function advanceObligationDueDate(
  frequency: "once" | "weekly" | "monthly" | "yearly",
  currentDate: string,
) {
  if (frequency === "once") return currentDate;
  if (frequency === "weekly") return addDaysBogotaYMD(currentDate, 7);
  const date = bogotaYMDToDate(currentDate);
  if (frequency === "monthly") date.setUTCMonth(date.getUTCMonth() + 1);
  if (frequency === "yearly") date.setUTCFullYear(date.getUTCFullYear() + 1);
  return bogotaDateToYMD(date);
}
