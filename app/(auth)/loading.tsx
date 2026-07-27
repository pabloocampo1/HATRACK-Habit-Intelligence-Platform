export default function AuthLoading() {
  return (
    <div
      className="dark flex min-h-dvh items-center justify-center bg-[#09090b] px-6"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-5">
        <div className="relative flex size-14 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-brand-forest/20" />
          <span className="size-10 animate-spin rounded-full border-2 border-brand-forest/25 border-t-brand-forest" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-white/80">Cargando…</p>
          <p className="mt-1 text-xs text-white/35">Preparando acceso a Cima</p>
        </div>
      </div>
    </div>
  );
}
