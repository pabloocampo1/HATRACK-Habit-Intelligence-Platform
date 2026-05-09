import { formatMoney } from "../utils/formatMoney";
import { surfaceSoft } from "../cuentas-ui";
import CuentasKpiCard from "./CuentasKpiCard";
import CuentasSectionIntro from "./CuentasSectionIntro";

export default function CuentasKpiSection({
  cop,
  usd,
  drift,
  defaultAccountName,
}: {
  cop: number;
  usd: number;
  drift: number;
  defaultAccountName: string | null;
}) {
  return (
    <section className="space-y-6 md:space-y-8">
      <CuentasSectionIntro
        eyebrow="Resumen rápido"
        title="Panorama de tus fuentes de dinero"
        description="Indicadores clave antes del detalle: totales por moneda en cuentas activas, cuenta sugerida por defecto, y alerta de integridad cuando el saldo guardado no coincide con el calculado desde movimientos."
      />

      <div className={`${surfaceSoft} p-5 md:p-6 lg:p-8`}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-2 xl:grid-cols-4">
          <CuentasKpiCard
            label="Patrimonio en pesos"
            value={formatMoney(cop, "COP")}
            hint="Solo cuentas ACTIVE en COP."
            description="Liquidez local consolidada. Tu API puede excluir cuentas congeladas."
          />
          <CuentasKpiCard
            label="Patrimonio en dólares"
            value={formatMoney(usd, "USD")}
            hint="Solo cuentas ACTIVE en USD."
            description="Mantén COP y USD separados para evitar totales engañosos."
          />
          <CuentasKpiCard
            label="Cuenta por defecto"
            value={defaultAccountName ?? "—"}
            hint="Preselección en formularios."
            description="Una sola cuenta default por usuario reduce fricción al registrar."
            accent
          />
          <CuentasKpiCard
            label="Integridad saldo"
            value={drift === 0 ? "Alineado" : `${drift} revisar`}
            hint="Almacenado vs calculado."
            description="Si hay drift, conviene reconciliar con el libro de transacciones."
            warn={drift > 0}
          />
        </div>
      </div>
    </section>
  );
}
