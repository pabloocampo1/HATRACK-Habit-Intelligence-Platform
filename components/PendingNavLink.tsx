"use client";

import { useRouter } from "next/navigation";
import { useTransition, type ReactNode } from "react";
import { createPortal } from "react-dom";

type PendingNavLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
  pendingLabel?: string;
  /** Spinner color classes, e.g. border-brand-forest/30 border-t-brand-forest */
  spinnerClassName?: string;
  showOverlay?: boolean;
};

function NavigationOverlay({ message }: { message: string }) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-background/55 backdrop-blur-[2px]"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-surface-card px-5 py-4 shadow-xl shadow-black/10">
        <span
          className="size-5 animate-spin rounded-full border-2 border-brand-forest/30 border-t-brand-forest"
          aria-hidden
        />
        <p className="text-sm font-semibold text-text-primary">{message}</p>
      </div>
    </div>,
    document.body,
  );
}

export default function PendingNavLink({
  href,
  className = "",
  children,
  pendingLabel = "Cargando…",
  spinnerClassName = "border-current/30 border-t-current",
  showOverlay = true,
}: PendingNavLinkProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <button
        type="button"
        disabled={isPending}
        aria-busy={isPending}
        onClick={() => {
          startTransition(() => {
            router.push(href);
          });
        }}
        className={`${className} ${isPending ? "pointer-events-none opacity-80" : ""}`}
      >
        {isPending ? (
          <>
            <span
              className={`size-4 shrink-0 animate-spin rounded-full border-2 ${spinnerClassName}`}
              aria-hidden
            />
            {pendingLabel}
          </>
        ) : (
          children
        )}
      </button>
      {showOverlay && isPending ? (
        <NavigationOverlay message={pendingLabel} />
      ) : null}
    </>
  );
}
