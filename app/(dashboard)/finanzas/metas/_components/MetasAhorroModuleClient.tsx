"use client";

import {
  addSavingsContributionAction,
  createSavingsGoalAction,
} from "@/app/actions/finance/financeActions";
import FinanceFormField from "../../_components/FinanceFormField";
import FinanceModal, { financeInputClass } from "../../_components/FinanceModal";
import { Account, SavingsGoal } from "@/lib/types";
import { Plus, Target } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Props = {
  userId: string;
  goals: SavingsGoal[];
  accounts: Account[];
};

export default function MetasAhorroModuleClient({ userId, goals, accounts }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [contributionGoalId, setContributionGoalId] = useState<number | null>(null);
  const [goalForm, setGoalForm] = useState({
    title: "",
    target_amount: "",
    target_date: "",
    description: "",
  });
  const [contributionForm, setContributionForm] = useState({
    amount: "",
    account_id: accounts[0]?.account_id ? String(accounts[0].account_id) : "",
    note: "",
  });

  const handleCreateGoal = () => {
    startTransition(async () => {
      await createSavingsGoalAction(userId, {
        title: goalForm.title.trim(),
        target_amount: Number(goalForm.target_amount),
        target_date: goalForm.target_date || undefined,
        description: goalForm.description.trim() || undefined,
      });
      setGoalForm({ title: "", target_amount: "", target_date: "", description: "" });
      setCreateModalOpen(false);
      router.refresh();
    });
  };

  const handleContribution = () => {
    if (!contributionGoalId) return;
    startTransition(async () => {
      await addSavingsContributionAction(
        userId,
        contributionGoalId,
        Number(contributionForm.amount),
        contributionForm.account_id ? Number(contributionForm.account_id) : undefined,
        contributionForm.note.trim() || undefined,
      );
      setContributionForm({
        amount: "",
        account_id: accounts[0]?.account_id ? String(accounts[0].account_id) : "",
        note: "",
      });
      setContributionGoalId(null);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-border-subtle bg-surface-card p-5">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Metas de ahorro</h1>
          <p className="mt-1 max-w-xl text-sm text-text-secondary">
            Define objetivos concretos (viaje, emergencia, laptop) y ve cuánto llevas
            ahorrado hacia cada uno.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black"
        >
          <Plus className="size-4" />
          Nueva meta
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {goals.length === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed border-border-default p-8 text-center">
            <Target className="mx-auto size-8 text-text-muted" />
            <p className="mt-2 text-sm text-text-muted">
              Sin metas de ahorro. Crea tu primera meta financiera.
            </p>
          </div>
        ) : null}
        {goals.map((goal) => {
          const progress = Math.min(
            100,
            (Number(goal.saved_amount ?? 0) / Number(goal.target_amount || 1)) * 100,
          );
          return (
            <div
              key={goal.id_saving_goal}
              className="rounded-2xl border border-border-subtle bg-surface-card p-5"
            >
              <p className="text-base font-semibold text-text-primary">{goal.title}</p>
              {goal.description ? (
                <p className="mt-1 text-xs text-text-muted">{goal.description}</p>
              ) : null}
              <p className="mt-2 text-sm text-text-secondary">
                ${Number(goal.saved_amount).toLocaleString("es-CO")} de $
                {Number(goal.target_amount).toLocaleString("es-CO")}
                {goal.target_date ? ` · meta ${goal.target_date}` : ""}
              </p>
              <div className="mt-3 h-2 rounded-full bg-surface-muted">
                <div
                  className="h-2 rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-text-muted">{progress.toFixed(1)}% completado</p>
              <button
                type="button"
                onClick={() => setContributionGoalId(goal.id_saving_goal)}
                className="mt-4 rounded-xl border border-emerald-500/50 px-3 py-2 text-xs font-semibold text-emerald-300"
              >
                Registrar aporte
              </button>
            </div>
          );
        })}
      </div>

      {createModalOpen ? (
        <FinanceModal
          title="Nueva meta de ahorro"
          subtitle="Define un objetivo financiero con monto y fecha opcional."
          onClose={() => setCreateModalOpen(false)}
        >
          <div className="space-y-4">
            <FinanceFormField
              label="Nombre de la meta"
              required
              hint='Ej: "Fondo de emergencia", "Viaje a Cartagena", "Enganche apartamento".'
            >
              <input
                value={goalForm.title}
                onChange={(event) =>
                  setGoalForm((prev) => ({ ...prev, title: event.target.value }))
                }
                placeholder="¿Para qué estás ahorrando?"
                className={financeInputClass}
              />
            </FinanceFormField>
            <FinanceFormField
              label="Monto objetivo"
              required
              hint="Cuánto dinero necesitas reunir para cumplir esta meta."
            >
              <input
                type="number"
                value={goalForm.target_amount}
                onChange={(event) =>
                  setGoalForm((prev) => ({ ...prev, target_amount: event.target.value }))
                }
                placeholder="Ej: 5000000"
                className={financeInputClass}
              />
            </FinanceFormField>
            <FinanceFormField
              label="Fecha objetivo (opcional)"
              hint="Para cuándo quieres lograrlo. Te ayuda a planificar aportes."
            >
              <input
                type="date"
                value={goalForm.target_date}
                onChange={(event) =>
                  setGoalForm((prev) => ({ ...prev, target_date: event.target.value }))
                }
                className={financeInputClass}
              />
            </FinanceFormField>
            <FinanceFormField label="Descripción (opcional)" hint="Motivo o plan de ahorro.">
              <input
                value={goalForm.description}
                onChange={(event) =>
                  setGoalForm((prev) => ({ ...prev, description: event.target.value }))
                }
                placeholder="Ej: Ahorrar $200.000 quincenales"
                className={financeInputClass}
              />
            </FinanceFormField>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="rounded-xl border border-border-default px-4 py-2 text-sm text-text-secondary"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateGoal}
                disabled={isPending || !goalForm.title.trim() || Number(goalForm.target_amount) <= 0}
                className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
              >
                {isPending ? "Guardando…" : "Crear meta"}
              </button>
            </div>
          </div>
        </FinanceModal>
      ) : null}

      {contributionGoalId ? (
        <FinanceModal
          title="Registrar aporte"
          subtitle="Suma dinero al avance de tu meta. Opcionalmente descuenta de una cuenta."
          onClose={() => setContributionGoalId(null)}
        >
          <div className="space-y-4">
            <FinanceFormField label="Monto del aporte" required hint="Cuánto vas a sumar a la meta.">
              <input
                type="number"
                value={contributionForm.amount}
                onChange={(event) =>
                  setContributionForm((prev) => ({ ...prev, amount: event.target.value }))
                }
                placeholder="Ej: 200000"
                className={financeInputClass}
              />
            </FinanceFormField>
            {accounts.length > 0 ? (
              <FinanceFormField
                label="Descontar de cuenta (opcional)"
                hint="Si eliges una cuenta, el aporte restará ese monto de su saldo."
              >
                <select
                  value={contributionForm.account_id}
                  onChange={(event) =>
                    setContributionForm((prev) => ({ ...prev, account_id: event.target.value }))
                  }
                  className={financeInputClass}
                >
                  <option value="">No descontar de ninguna cuenta</option>
                  {accounts.map((account) => (
                    <option key={account.account_id} value={account.account_id}>
                      {account.account_name}
                    </option>
                  ))}
                </select>
              </FinanceFormField>
            ) : null}
            <FinanceFormField label="Nota (opcional)" hint="Referencia del aporte.">
              <input
                value={contributionForm.note}
                onChange={(event) =>
                  setContributionForm((prev) => ({ ...prev, note: event.target.value }))
                }
                placeholder="Ej: Aporte quincenal"
                className={financeInputClass}
              />
            </FinanceFormField>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setContributionGoalId(null)}
                className="rounded-xl border border-border-default px-4 py-2 text-sm text-text-secondary"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleContribution}
                disabled={isPending || Number(contributionForm.amount) <= 0}
                className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
              >
                {isPending ? "Guardando…" : "Confirmar aporte"}
              </button>
            </div>
          </div>
        </FinanceModal>
      ) : null}
    </div>
  );
}
