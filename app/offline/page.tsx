import Link from "next/link";

export const metadata = {
  title: "Sin conexión",
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6 py-12 text-center">
      <div className="max-w-md space-y-6">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-border-subtle bg-surface-card">
          <span className="text-3xl" aria-hidden>
            📡
          </span>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black tracking-tight text-text-primary">
            Estás sin conexión
          </h1>
          <p className="text-sm leading-relaxed text-text-secondary">
            Hatrack guardó recursos básicos para que puedas ver esta pantalla. Cuando
            vuelva internet, recarga para sincronizar tus datos.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-brand-forest/40 bg-brand-forest px-6 py-3 text-sm font-bold text-brand-forest-fg transition hover:brightness-110"
        >
          Reintentar
        </Link>
      </div>
    </div>
  );
}
