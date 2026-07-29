"use client";

import { AlertTriangle } from "lucide-react";
import FinanceModal from "./FinanceModal";

export default function FinanceConfirmModal({
  title,
  subtitle,
  description,
  confirmLabel = "Eliminar",
  cancelLabel = "Cancelar",
  isPending = false,
  onClose,
  onConfirm,
}: {
  title: string;
  subtitle?: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isPending?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <FinanceModal title={title} subtitle={subtitle} onClose={onClose}>
      <div className="space-y-5">
        <div className="flex gap-3 rounded-xl border border-rose-500/25 bg-rose-500/10 p-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/15 text-rose-300">
            <AlertTriangle className="size-5" strokeWidth={2} />
          </span>
          <p className="text-sm leading-relaxed text-text-secondary">{description}</p>
        </div>
        <div className="flex flex-wrap justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-xl border border-border-default px-4 py-2 text-sm text-text-secondary transition hover:bg-surface-muted disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="rounded-xl border border-rose-500/40 bg-rose-500/15 px-4 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/25 disabled:opacity-60"
          >
            {isPending ? "Eliminando…" : confirmLabel}
          </button>
        </div>
      </div>
    </FinanceModal>
  );
}
