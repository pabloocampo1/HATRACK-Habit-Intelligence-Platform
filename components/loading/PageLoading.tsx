type PageLoadingProps = {
  message?: string;
  variant?: "default" | "detail";
};

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-surface-muted ${className}`}
      aria-hidden
    />
  );
}

export default function PageLoading({
  message = "Cargando módulo…",
  variant = "default",
}: PageLoadingProps) {
  if (variant === "detail") {
    return (
      <div
        className="dark mx-auto max-w-4xl space-y-8 px-6 py-10"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <Skeleton className="h-4 w-28" />
        <div className="rounded-2xl border border-border-subtle bg-surface-card p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <Skeleton className="mx-auto size-[120px] shrink-0 rounded-full sm:mx-0" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-full max-w-md" />
              <Skeleton className="h-4 w-full max-w-lg" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
        <p className="sr-only">{message}</p>
      </div>
    );
  }

  return (
    <div
      className="dark mx-auto max-w-7xl space-y-10 px-6 py-10"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex items-center gap-3">
        <span className="size-5 animate-spin rounded-full border-2 border-brand-forest/30 border-t-brand-forest" />
        <p className="text-sm font-medium text-text-muted">{message}</p>
      </div>

      <div className="space-y-4">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-10 w-72 max-w-full" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-36" />
        ))}
      </div>

      <p className="sr-only">{message}</p>
    </div>
  );
}
