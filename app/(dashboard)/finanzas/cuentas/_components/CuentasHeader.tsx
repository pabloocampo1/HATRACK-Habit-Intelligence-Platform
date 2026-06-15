import { ArrowLeftRight, Plus } from "lucide-react";
import {
  btnPrimary,
  btnSecondary,
  elevSurface,
  panelPadding,
} from "../cuentas-ui";

export default function CuentasHeader({
  onTransfer,
  onCreate,
}: {
  onTransfer: () => void;
  onCreate: () => void;
}) {
  return (
    <header className={`${elevSurface} ${panelPadding}`}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
        <div className="max-w-2xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-forest">
            Finanzas · Cuentas
          </p>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight text-brand-slate md:text-4xl">
              Cuentas y liquidez
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-text-secondary">
              Panel principal de cuentas: totales por moneda, validación de
              saldos y acceso rápido a transferencias y altas.
            </p>
          </div>
        </div>

        <div className="flex w-full flex-shrink-0 flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={onTransfer}
            className={`${btnSecondary} w-full sm:w-auto`}
          >
            <ArrowLeftRight
              className="size-5 text-brand-forest"
              strokeWidth={2}
            />
            Transferir
          </button>
          <button
            type="button"
            onClick={onCreate}
            className={`${btnPrimary} w-full sm:w-auto`}
          >
            <Plus className="size-5" strokeWidth={2} />
            Nueva cuenta
          </button>
        </div>
      </div>
    </header>
  );
}
