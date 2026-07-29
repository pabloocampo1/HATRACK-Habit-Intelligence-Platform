"use client";

import {
  addSavingsContributionAction,
  createSavingsGoalAction,
  deleteSavingsGoalAction,
  updateSavingsGoalAction,
} from "@/app/actions/finance/financeActions";
import FinanceFormField from "../../_components/FinanceFormField";
import FinanceConfirmModal from "../../_components/FinanceConfirmModal";
import FinanceModal, { financeInputClass } from "../../_components/FinanceModal";
import { Account, SavingsGoal } from "@/lib/types";
import { ArrowLeftRight, Landmark, Pencil, Plus, Target, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

type Props = {
  userId: string;
  goals: SavingsGoal[];
  accounts: Account[];
};

type GoalFormState = {
  title: string;
  target_amount: string;
  target_date: string;
  description: string;
  account_id: string;
};

function formatMoney(value: number) {
  return `$${Number(value).toLocaleString("es-CO")}`;
}

function pickDefaultSourceAccount(accounts: Account[], excludedAccountId?: string | null) {
  const account = accounts.find(
    (item) => String(item.account_id) !== String(excludedAccountId ?? ""),
  );
  return account ? String(account.account_id) : "";
}

function emptyGoalForm(accounts: Account[]): GoalFormState {
  return {
    title: "",
    target_amount: "",
    target_date: "",
    description: "",
    account_id: accounts[0] ? String(accounts[0].account_id) : "",
  };
}

export default function MetasAhorroModuleClient({ userId, goals, accounts }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<number | null>(null);
  const [contributionGoalId, setContributionGoalId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SavingsGoal | null>(null);
  const [goalForm, setGoalForm] = useState<GoalFormState>(() => emptyGoalForm(accounts));
  const [contributionForm, setContributionForm] = useState({
    amount: "",
    source_account_id: pickDefaultSourceAccount(accounts),
    note: "",
  });

  const accountMap = useMemo(
    () => new Map(accounts.map((account) => [String(account.account_id), account])),
    [accounts],
  );

  const activeGoal = useMemo(
    () => goals.find((goal) => goal.id_saving_goal === contributionGoalId) ?? null,
    [goals, contributionGoalId],
  );

  const linkedAccountId = activeGoal?.account_id != null ? String(activeGoal.account_id) : null;

  const sourceAccounts = useMemo(
    () =>
      accounts.filter((account) => String(account.account_id) !== String(linkedAccountId ?? "")),
    [accounts, linkedAccountId],
  );

  const selectedSourceAccount = sourceAccounts.find(
    (account) => String(account.account_id) === contributionForm.source_account_id,
  );

  const contributionAmount = Number(contributionForm.amount.replace(/[^\d.]/g, "") || 0);
  const sourceBalanceAfter = selectedSourceAccount
    ? Number(selectedSourceAccount.balance ?? 0) - contributionAmount
    : null;

  const openCreateGoal = () => {
    setEditingGoalId(null);
    setGoalForm(emptyGoalForm(accounts));
    setError(null);
    setGoalModalOpen(true);
  };

  const openEditGoal = (goal: SavingsGoal) => {
    setEditingGoalId(goal.id_saving_goal);
    setGoalForm({
      title: goal.title,
      target_amount: String(goal.target_amount),
      target_date: goal.target_date ?? "",
      description: goal.description ?? "",
      account_id: String(goal.account_id),
    });
    setError(null);
    setGoalModalOpen(true);
  };

  const handleSaveGoal = () => {
    if (!goalForm.title.trim()) {
      setError("El nombre de la meta es obligatorio.");
      return;
    }
    if (!goalForm.account_id) {
      setError("La cuenta destino es obligatoria.");
      return;
    }
    if (Number(goalForm.target_amount) <= 0) {
      setError("El monto objetivo debe ser mayor a cero.");
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        const payload = {
          title: goalForm.title.trim(),
          target_amount: Number(goalForm.target_amount),
          target_date: goalForm.target_date || undefined,
          description: goalForm.description.trim() || undefined,
          account_id: Number(goalForm.account_id),
        };

        if (editingGoalId) {
          await updateSavingsGoalAction(userId, editingGoalId, {
            ...payload,
            target_date: goalForm.target_date || null,
          });
        } else {
          await createSavingsGoalAction(userId, payload);
        }

        setGoalForm(emptyGoalForm(accounts));
        setEditingGoalId(null);
        setGoalModalOpen(false);
        router.refresh();
      } catch (actionError) {
        setError(
          actionError instanceof Error
            ? actionError.message
            : "No se pudo guardar la meta.",
        );
      }
    });
  };

  const handleDeleteGoal = (goal: SavingsGoal) => {
    setError(null);
    setDeleteTarget(goal);
  };

  const confirmDeleteGoal = () => {
    if (!deleteTarget) return;

    setError(null);
    startTransition(async () => {
      try {
        await deleteSavingsGoalAction(userId, deleteTarget.id_saving_goal);
        if (editingGoalId === deleteTarget.id_saving_goal) {
          setEditingGoalId(null);
          setGoalModalOpen(false);
        }
        if (contributionGoalId === deleteTarget.id_saving_goal) {
          setContributionGoalId(null);
        }
        setDeleteTarget(null);
        router.refresh();
      } catch (actionError) {
        setError(
          actionError instanceof Error
            ? actionError.message
            : "No se pudo eliminar la meta.",
        );
      }
    });
  };

  const openContribution = (goalId: number) => {
    const goal = goals.find((item) => item.id_saving_goal === goalId);
    const excluded = goal?.account_id != null ? String(goal.account_id) : null;
    setContributionGoalId(goalId);
    setContributionForm({
      amount: "",
      source_account_id: pickDefaultSourceAccount(accounts, excluded),
      note: "",
    });
    setError(null);
  };

  const handleContribution = () => {
    if (!contributionGoalId) return;
    if (!contributionForm.source_account_id) {
      setError("Selecciona la cuenta de origen del aporte.");
      return;
    }
    if (contributionAmount <= 0) {
      setError("El monto del aporte debe ser mayor a cero.");
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        await addSavingsContributionAction(
          userId,
          contributionGoalId,
          contributionAmount,
          Number(contributionForm.source_account_id),
          contributionForm.note.trim() || undefined,
        );
        setContributionForm({
          amount: "",
          source_account_id: "",
          note: "",
        });
        setContributionGoalId(null);
        router.refresh();
      } catch (actionError) {
        setError(
          actionError instanceof Error
            ? actionError.message
            : "No se pudo registrar el aporte.",
        );
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border-subtle bg-surface-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Objetivos financieros
              </p>
              <h1 className="mt-1 text-xl font-semibold text-text-primary">Metas de ahorro</h1>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                Cada meta se asocia a una <strong className="font-medium text-text-primary">cuenta destino</strong>.
                Los aportes salen de otra cuenta, crean una transferencia en Transacciones y suman al progreso.
                Si borras una meta, el dinero ya movido se queda donde está.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="rounded-xl border border-border-default bg-surface-muted p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-300">
                  1. Crea la meta
                </p>
                <p className="mt-1 text-xs text-text-secondary">
                  Nombre, monto objetivo y cuenta destino obligatoria (donde se acumula el ahorro).
                </p>
              </div>
              <div className="rounded-xl border border-border-default bg-surface-muted p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-300">
                  2. Aporta dinero
                </p>
                <p className="mt-1 text-xs text-text-secondary">
                  Elige una cuenta de origen distinta. Se hace una transferencia hacia la cuenta destino.
                </p>
              </div>
              <div className="rounded-xl border border-border-default bg-surface-muted p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-300">
                  3. Editar / borrar
                </p>
                <p className="mt-1 text-xs text-text-secondary">
                  Puedes editar o borrar la meta. Borrar no elimina transacciones ni revierte saldos.
                </p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={openCreateGoal}
            disabled={accounts.length < 2}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black disabled:opacity-50"
          >
            <Plus className="size-4" />
            Nueva meta
          </button>
        </div>
      </div>

      {accounts.length < 2 ? (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Necesitas al menos 2 cuentas: una destino (donde acumulas) y otra origen (de donde sales a aportar).
        </p>
      ) : null}

      {error && !goalModalOpen && !contributionGoalId ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {goals.length === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed border-border-default p-8 text-center">
            <Target className="mx-auto size-8 text-text-muted" />
            <p className="mt-2 text-sm font-medium text-text-primary">Sin metas de ahorro</p>
            <p className="mt-1 text-sm text-text-secondary">
              Crea tu primera meta con una cuenta destino para empezar a separar dinero.
            </p>
          </div>
        ) : null}
        {goals.map((goal) => {
          const progress = Math.min(
            100,
            (Number(goal.saved_amount ?? 0) / Number(goal.target_amount || 1)) * 100,
          );
          const linkedAccount = accountMap.get(String(goal.account_id));

          return (
            <div
              key={goal.id_saving_goal}
              className="rounded-2xl border border-border-subtle bg-surface-card p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-text-primary">{goal.title}</p>
                  {goal.description ? (
                    <p className="mt-1 text-xs text-text-muted">{goal.description}</p>
                  ) : null}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditGoal(goal)}
                    disabled={isPending}
                    className="flex size-8 items-center justify-center rounded-lg border border-border-default text-text-secondary hover:bg-surface-muted"
                    aria-label="Editar meta"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteGoal(goal)}
                    disabled={isPending}
                    className="flex size-8 items-center justify-center rounded-lg border border-border-default text-text-secondary hover:border-red-500/40 hover:text-red-300"
                    aria-label="Eliminar meta"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                  <span
                    className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                      goal.status === "completed"
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-surface-muted text-text-muted"
                    }`}
                  >
                    {goal.status === "completed" ? "Completada" : "Activa"}
                  </span>
                </div>
              </div>

              <p className="mt-3 text-sm text-text-secondary">
                {formatMoney(Number(goal.saved_amount))} de {formatMoney(Number(goal.target_amount))}
                {goal.target_date ? ` · meta ${goal.target_date}` : ""}
              </p>

              <div className="mt-3 h-2 rounded-full bg-surface-muted">
                <div
                  className="h-2 rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-text-muted">{progress.toFixed(1)}% completado</p>

              <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] text-emerald-200">
                <Landmark className="size-3.5" />
                Destino: {linkedAccount?.account_name ?? `Cuenta #${goal.account_id}`}
              </p>

              <button
                type="button"
                onClick={() => openContribution(goal.id_saving_goal)}
                disabled={accounts.length < 2}
                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-emerald-500/50 px-3 py-2 text-xs font-semibold text-emerald-300 disabled:opacity-50"
              >
                <ArrowLeftRight className="size-3.5" />
                Registrar aporte
              </button>
            </div>
          );
        })}
      </div>

      {goalModalOpen ? (
        <FinanceModal
          title={editingGoalId ? "Editar meta de ahorro" : "Nueva meta de ahorro"}
          subtitle="La cuenta destino es obligatoria: ahí se acumula el dinero de cada aporte."
          onClose={() => setGoalModalOpen(false)}
        >
          <div className="space-y-4">
            {error ? (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {error}
              </p>
            ) : null}

            <FinanceFormField
              label="Nombre de la meta"
              required
              hint='Ej: "Fondo de emergencia", "Viaje a Cartagena".'
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
              hint="Cuánto dinero quieres reunir para cumplir esta meta."
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
              label="Cuenta destino"
              required
              hint="Cuenta donde se acumula el ahorro. Los aportes saldrán desde otras cuentas hacia esta."
            >
              <select
                value={goalForm.account_id}
                onChange={(event) =>
                  setGoalForm((prev) => ({ ...prev, account_id: event.target.value }))
                }
                className={financeInputClass}
              >
                <option value="">Selecciona cuenta destino</option>
                {accounts.map((account) => (
                  <option key={account.account_id} value={account.account_id}>
                    {account.account_name} · {formatMoney(Number(account.balance))}
                  </option>
                ))}
              </select>
            </FinanceFormField>
            <FinanceFormField label="Fecha objetivo (opcional)" hint="Para cuándo quieres lograrlo.">
              <input
                type="date"
                value={goalForm.target_date}
                onChange={(event) =>
                  setGoalForm((prev) => ({ ...prev, target_date: event.target.value }))
                }
                className={financeInputClass}
              />
            </FinanceFormField>
            <FinanceFormField label="Descripción (opcional)">
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
                onClick={() => setGoalModalOpen(false)}
                className="rounded-xl border border-border-default px-4 py-2 text-sm text-text-secondary"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveGoal}
                disabled={
                  isPending ||
                  !goalForm.title.trim() ||
                  !goalForm.account_id ||
                  Number(goalForm.target_amount) <= 0
                }
                className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
              >
                {isPending ? "Guardando…" : editingGoalId ? "Guardar cambios" : "Crear meta"}
              </button>
            </div>
          </div>
        </FinanceModal>
      ) : null}

      {contributionGoalId && activeGoal ? (
        <FinanceModal
          title={`Aporte: ${activeGoal.title}`}
          subtitle={`Se transferirá dinero hacia ${accountMap.get(String(activeGoal.account_id))?.account_name ?? "la cuenta destino"} y quedará registrado en Transacciones.`}
          onClose={() => setContributionGoalId(null)}
        >
          <div className="space-y-4">
            {error ? (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {error}
              </p>
            ) : null}

            <FinanceFormField
              label="Monto del aporte"
              required
              hint="Cuánto vas a transferir hacia la cuenta destino de la meta."
            >
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

            {sourceAccounts.length > 0 ? (
              <FinanceFormField
                label="Cuenta de origen"
                required
                hint="Debe ser distinta a la cuenta destino de la meta."
              >
                <select
                  value={contributionForm.source_account_id}
                  onChange={(event) =>
                    setContributionForm((prev) => ({
                      ...prev,
                      source_account_id: event.target.value,
                    }))
                  }
                  className={financeInputClass}
                >
                  <option value="">Selecciona cuenta</option>
                  {sourceAccounts.map((account) => (
                    <option key={account.account_id} value={account.account_id}>
                      {account.account_name} · {formatMoney(Number(account.balance))}
                    </option>
                  ))}
                </select>
              </FinanceFormField>
            ) : (
              <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
                Necesitas otra cuenta distinta a la destino para poder aportar.
              </p>
            )}

            {selectedSourceAccount && contributionAmount > 0 ? (
              <div className="grid gap-3 rounded-xl border border-border-default bg-surface-muted p-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-text-muted">Saldo actual (origen)</p>
                  <p className="text-lg font-semibold text-text-primary">
                    {formatMoney(Number(selectedSourceAccount.balance))}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Después del aporte</p>
                  <p
                    className={`text-lg font-semibold ${
                      sourceBalanceAfter != null && sourceBalanceAfter < 0
                        ? "text-rose-300"
                        : "text-emerald-300"
                    }`}
                  >
                    {sourceBalanceAfter != null ? formatMoney(sourceBalanceAfter) : "—"}
                  </p>
                </div>
              </div>
            ) : null}

            <FinanceFormField label="Nota (opcional)" hint="Aparece en la transacción generada.">
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
                disabled={
                  isPending ||
                  contributionAmount <= 0 ||
                  !contributionForm.source_account_id ||
                  sourceAccounts.length === 0
                }
                className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
              >
                {isPending ? "Guardando…" : "Confirmar aporte"}
              </button>
            </div>
          </div>
        </FinanceModal>
      ) : null}

      {deleteTarget ? (
        <FinanceConfirmModal
          title={`Eliminar "${deleteTarget.title}"`}
          subtitle="Esta acción no se puede deshacer."
          description="Se borrará el seguimiento de la meta. El dinero que ya moviste y las transacciones en tu historial no se modifican."
          confirmLabel="Sí, eliminar meta"
          cancelLabel="Conservar meta"
          isPending={isPending}
          onClose={() => setDeleteTarget(null)}
          onConfirm={confirmDeleteGoal}
        />
      ) : null}
    </div>
  );
}
