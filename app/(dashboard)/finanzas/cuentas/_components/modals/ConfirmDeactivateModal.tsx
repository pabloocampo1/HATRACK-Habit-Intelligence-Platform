import { btnDanger, btnGhost } from "../../cuentas-ui";
import ModalShell from "./ModalShell";

export default function ConfirmDeactivateModal({
  isPending,
  onClose,
  onConfirm,
}: {
  isPending?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <ModalShell
      title="Desactivar cuenta"
      subtitle="La cuenta dejará de aparecer en listas activas, pero conserva su historial."
      onClose={onClose}
    >
      <p className="text-base leading-relaxed text-text-secondary">
        Puedes reactivarla cuando quieras desde la misma pantalla. No se eliminan
        transacciones ni movimientos anteriores.
      </p>
      <div className="mt-8 flex flex-wrap justify-end gap-3 sm:gap-4">
        <button type="button" onClick={onClose} className={btnGhost} disabled={isPending}>
          Conservar activa
        </button>
        <button type="button" onClick={onConfirm} className={btnDanger} disabled={isPending}>
          {isPending ? "Desactivando…" : "Desactivar cuenta"}
        </button>
      </div>
    </ModalShell>
  );
}
