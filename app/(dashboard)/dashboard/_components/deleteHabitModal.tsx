interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  habitTitle: string;
  isDeleting: boolean;
}

export default function DeleteHabitModal({
  isOpen,
  onClose,
  onConfirm,
  habitTitle,
  isDeleting,
}: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rouded border-black p-6 max-w-sm">
        <h2 className="text-xl font-bold mb-2">¿Borrar hábito?</h2>
        <p className="text-black/70 mb-6">
          Estás a punto de eliminar{" "}
          <span className="font-bold text-black">{habitTitle}</span>. Esta
          acción no se puede deshacer, bro.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 font-bold border-2 border-black hover:bg-black/5 transition-colors"
          >
            CANCELAR
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 font-bold bg-red-500 text-white border-2 border-black hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            {isDeleting ? "BORRANDO..." : "SÍ, BORRAR"}
          </button>
        </div>
      </div>
    </div>
  );
}
