"use client";

import {
  createObligationAction,
  updateObligationStatusAction,
} from "@/app/actions/finance/financeActions";
import FinanceFormField from "../../_components/FinanceFormField";
import FinanceModal, { financeInputClass } from "../../_components/FinanceModal";
import { Obligation } from "@/lib/types";
import { CalendarClock, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

const FREQUENCY_LABELS: Record<Obligation["frequency"], string> = {
  once: "Pago único",
  weekly: "Cada semana",
  monthly: "Cada mes",
  yearly: "Cada año",
};

const STATUS_LABELS: Record<Obligation["status"], string> = {
  active: "Pendiente",
  paid: "Pagada",
  paused: "Pausada",
};

type Props = {
  userId: string;
  obligations: Obligation[];
};

export default function ObligacionesModuleClient({ userId, obligations }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    amount: "",
    frequency: "monthly" as Obligation["frequency"],
    next_due_date: "",
    description: "",
  });

  const handleCreate = () => {
    startTransition(async () => {
      await createObligationAction(userId, {
        title: form.title.trim(),
        amount: Number(form.amount),
        frequency: form.frequency,
        next_due_date: form.next_due_date,
        description: form.description.trim() || undefined,
      });
      setForm({
        title: "",
        amount: "",
        frequency: "monthly",
        next_due_date: "",
        description: "",
      });
      setModalOpen(false);
      router.refresh();
    });
  };

  const changeStatus = (obligationId: number, status: Obligation["status"]) => {
    startTransition(async () => {
      await updateObligationStatusAction(userId, obligationId, status);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-border-subtle bg-surface-card p-5">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Obligaciones</h1>
          <p className="mt-1 max-w-xl text-sm text-text-secondary">
            Pagos que debes hacer: arriendo, Netflix, créditos, servicios. Regístralos
            para no olvidar fechas ni montos.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black"
        >
          <Plus className="size-4" />
          Nueva obligación
        </button>
      </div>

      <div className="rounded-2xl border border-border-subtle bg-surface-card p-5">
        <h2 className="text-base font-semibold text-text-primary">Compromisos registrados</h2>
        <div className="mt-3 space-y-2">
          {obligations.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border-default p-8 text-center">
              <CalendarClock className="mx-auto size-8 text-text-muted" />
              <p className="mt-2 text-sm text-text-muted">
                Sin obligaciones aún. Agrega arriendo, suscripciones o cuotas de deuda.
              </p>
            </div>
          ) : null}
          {obligations.map((item) => (
            <div
              key={item.id_obligation}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border-default bg-surface-muted p-3"
            >
              <div>
                <p className="text-sm font-semibold text-text-primary">{item.title}</p>
                <p className="text-xs text-text-muted">
                  {FREQUENCY_LABELS[item.frequency]} · vence {item.next_due_date} · $
                  {Number(item.amount).toLocaleString("es-CO")} ·{" "}
                  {STATUS_LABELS[item.status]}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => changeStatus(item.id_obligation, "paid")}
                  className="rounded-lg border border-emerald-500/40 px-2 py-1 text-xs text-emerald-300"
                >
                  Pagada
                </button>
                <button
                  type="button"
                  onClick={() => changeStatus(item.id_obligation, "paused")}
                  className="rounded-lg border border-amber-500/40 px-2 py-1 text-xs text-amber-300"
                >
                  Pausar
                </button>
                <button
                  type="button"
                  onClick={() => changeStatus(item.id_obligation, "active")}
                  className="rounded-lg border border-blue-500/40 px-2 py-1 text-xs text-blue-300"
                >
                  Activar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modalOpen ? (
        <FinanceModal
          title="Nueva obligación"
          subtitle="Registra un pago recurrente o puntual que debes cumplir."
          onClose={() => setModalOpen(false)}
        >
          <div className="space-y-4">
            <FinanceFormField
              label="Nombre del compromiso"
              required
              hint='Ej: "Arriendo", "Spotify", "Cuota tarjeta Davivienda".'
            >
              <input
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="¿Qué debes pagar?"
                className={financeInputClass}
              />
            </FinanceFormField>
            <FinanceFormField
              label="Monto a pagar"
              required
              hint="Valor en pesos colombianos de cada pago."
            >
              <input
                type="number"
                value={form.amount}
                onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
                placeholder="Ej: 1200000"
                className={financeInputClass}
              />
            </FinanceFormField>
            <FinanceFormField
              label="Frecuencia"
              hint="Con qué regularidad se repite este pago."
            >
              <select
                value={form.frequency}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    frequency: event.target.value as Obligation["frequency"],
                  }))
                }
                className={financeInputClass}
              >
                <option value="once">Pago único</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
                <option value="yearly">Anual</option>
              </select>
            </FinanceFormField>
            <FinanceFormField
              label="Próxima fecha de pago"
              required
              hint="Cuándo vence o debes pagar la siguiente cuota."
            >
              <input
                type="date"
                value={form.next_due_date}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, next_due_date: event.target.value }))
                }
                className={financeInputClass}
              />
            </FinanceFormField>
            <FinanceFormField label="Notas (opcional)" hint="Detalle extra que quieras recordar.">
              <input
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, description: event.target.value }))
                }
                placeholder="Ej: Pago automático día 5"
                className={financeInputClass}
              />
            </FinanceFormField>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-xl border border-border-default px-4 py-2 text-sm text-text-secondary"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={
                  isPending ||
                  !form.title.trim() ||
                  !form.next_due_date ||
                  Number(form.amount) <= 0
                }
                className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
              >
                {isPending ? "Guardando…" : "Registrar obligación"}
              </button>
            </div>
          </div>
        </FinanceModal>
      ) : null}
    </div>
  );
}
