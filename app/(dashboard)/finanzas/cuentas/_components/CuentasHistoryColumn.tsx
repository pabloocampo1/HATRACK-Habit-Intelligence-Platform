import type { AccountRow, MovementRow } from "../accounts.constants";
import AccountHistoryPanel from "./AccountHistoryPanel";
import CuentasSectionIntro from "./CuentasSectionIntro";

export default function CuentasHistoryColumn({
  account,
  movements,
  onClear,
}: {
  account: AccountRow | null;
  movements: MovementRow[];
  onClear: () => void;
}) {
  return (
    <aside className="space-y-6 md:space-y-8 xl:sticky xl:top-24 xl:self-start">
      <CuentasSectionIntro
        eyebrow="Auditoría"
        title="Historial por cuenta"
        description="Contexto de movimientos para la cuenta activa en el panel. Sustituye el mock por datos paginados cuando conectes el servicio de transacciones."
      />
      <AccountHistoryPanel
        account={account}
        movements={movements}
        onClear={onClear}
      />
    </aside>
  );
}
