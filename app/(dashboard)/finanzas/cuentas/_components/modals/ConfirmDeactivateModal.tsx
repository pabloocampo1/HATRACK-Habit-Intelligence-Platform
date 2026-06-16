import { btnDanger, btnGhost } from "../../cuentas-ui";
import ModalShell from "./ModalShell";

export default function ConfirmDeactivateModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <ModalShell
      title="Desactivar cuenta"
      subtitle="No se borra nada: solo cambia el estado operativo para que deje de aparecer en flujos de gasto o ingreso por defecto."
      onClose={onClose}
    >
      <p className="text-base leading-relaxed text-text-secondary">
        Las transacciones históricas siguen asociadas al mismo{" "}
        <code className="rounded-md border border-brand-forest/15 bg-brand-offwhite px-2 py-0.5 text-sm font-medium text-brand-slate">
          accountId
        </code>
        . Reactivar es simplemente volver a marcar la cuenta como ACTIVE cuando el
        usuario lo necesite.
      </p>
      <div className="mt-8 flex flex-wrap justify-end gap-3 sm:gap-4">
        <button type="button" onClick={onClose} className={btnGhost}>
          Conservar activa
        </button>
        <button type="button" onClick={onConfirm} className={btnDanger}>
          Desactivar cuenta
        </button>
      </div>
    </ModalShell>
  );
}
