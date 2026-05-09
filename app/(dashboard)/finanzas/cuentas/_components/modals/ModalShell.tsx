"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function ModalShell({
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  if (!mounted || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-brand-scrim backdrop-blur-md"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 flex max-h-[min(90dvh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-brand-forest/15 bg-white shadow-2xl shadow-black/20"
      >
        <div className="relative shrink-0 border-b border-brand-forest/10 bg-brand-offwhite px-6 py-5 md:px-8 md:py-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 space-y-2 pr-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-forest">
                {title}
              </h2>
              {subtitle ? (
                <p className="text-base leading-relaxed text-brand-slate/90">
                  {subtitle}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-brand-forest/15 bg-white text-brand-slate shadow-sm transition hover:bg-brand-offwhite active:bg-brand-offwhite"
            >
              <X className="size-5" strokeWidth={2} />
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto bg-white px-6 py-6 md:px-8 md:py-8">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
