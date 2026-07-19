"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

const inputClass =
  "w-full rounded-xl border border-border-default bg-surface-muted px-3 py-2.5 text-sm text-text-primary outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30";

export { inputClass as financeInputClass };

export default function FinanceModal({
  title,
  subtitle,
  children,
  onClose,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="finance-modal-title"
        className="relative z-10 flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-border-subtle bg-surface-card shadow-2xl sm:rounded-2xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border-subtle px-5 py-4">
          <div className="min-w-0 space-y-1">
            <h2 id="finance-modal-title" className="text-base font-semibold text-text-primary">
              {title}
            </h2>
            {subtitle ? (
              <p className="text-sm leading-relaxed text-text-secondary">{subtitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border-default text-text-secondary transition hover:bg-surface-muted"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
