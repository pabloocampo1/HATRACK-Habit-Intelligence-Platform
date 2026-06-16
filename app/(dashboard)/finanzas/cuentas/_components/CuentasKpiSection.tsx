import { formatMoney } from "../utils/formatMoney";
import { surfaceSoft } from "../cuentas-ui";
import CuentasKpiCard from "./CuentasKpiCard";

export default function CuentasKpiSection({
  cop,
  usd,
  activeCount,
  totalCount,
}: {
  cop: number;
  usd: number;
  activeCount: number;
  totalCount: number;
}) {
  return (
    <section className="space-y-6 md:space-y-8">
      <div className={`${surfaceSoft} p-5 md:p-6 lg:p-8`}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-2 xl:grid-cols-4">
          <CuentasKpiCard
            label="Patrimonio en pesos"
            value={formatMoney(cop, "COP")}
            hint="Cuentas activas en COP."
            description="Suma de balance de todas tus cuentas activas en pesos."
          />
          <CuentasKpiCard
            label="Patrimonio en dólares"
            value={formatMoney(usd, "USD")}
            hint="Cuentas activas en USD."
            description="Mantén COP y USD separados para totales claros."
          />
          <CuentasKpiCard
            label="Cuentas activas"
            value={String(activeCount)}
            hint="is_active = true"
            description="Cuentas disponibles para operar y transferir."
            accent
          />
          <CuentasKpiCard
            label="Total registradas"
            value={String(totalCount)}
            hint="Activas + inactivas"
            description="Incluye cuentas archivadas sin borrar historial."
          />
        </div>
      </div>
    </section>
  );
}
