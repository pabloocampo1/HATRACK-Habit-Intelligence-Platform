import { Plus, Receipt } from "lucide-react";
import { btnPrimary, elevSurface, panelPadding } from "../../cuentas/cuentas-ui";

export default function TransaccionesHeader({
  onNew,
}: {
  onNew: () => void;
}) {
  return (
    <header className={`${elevSurface} ${panelPadding}`}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
        <div className="max-w-2xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-forest">
            Finanzas · Transacciones
          </p>
          <div className="space-y-3">
            <h1 className="flex flex-wrap items-center gap-3 text-3xl font-semibold tracking-tight text-brand-slate md:text-4xl">
              <span className="flex size-11 items-center justify-center rounded-xl border border-brand-forest/15 bg-brand-offwhite text-brand-forest shadow-sm">
                <Receipt className="size-6" strokeWidth={1.75} />
              </span>
              Movimientos
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-neutral-600">
              Registro unificado de ingresos, gastos y transferencias. Los totales
              respetan el período y los filtros activos; los datos son mock para
              maquetar la experiencia.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onNew}
          className={`${btnPrimary} w-full shrink-0 lg:w-auto`}
        >
          <Plus className="size-5" strokeWidth={2} />
          Nuevo movimiento
        </button>
      </div>
    </header>
  );
}
