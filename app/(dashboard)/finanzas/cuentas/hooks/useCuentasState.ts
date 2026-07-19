"use client";

import {
  createAccountAction,
  createTransactionAction,
  deactivateFinanceAccountAction,
  reactivateFinanceAccountAction,
  updateFinanceAccountAction,
} from "@/app/actions/finance/financeActions";
import type { Account } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import type { CuentasFilterKey, CuentasModal } from "../cuentas.types";

type AccountFormMode = "create" | "edit";

export function useCuentasState(userId: string, initialAccounts: Account[]) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [filter, setFilter] = useState<CuentasFilterKey>("all");
  const [modal, setModal] = useState<CuentasModal>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deactivateTargetId, setDeactivateTargetId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setAccounts(initialAccounts);
  }, [initialAccounts]);

  const filteredAccounts = useMemo(() => {
    return accounts.filter((a) => {
      if (filter === "active") return a.is_active;
      if (filter === "inactive") return !a.is_active;
      if (filter === "savings") return a.type === "SAVINGS";
      return true;
    });
  }, [accounts, filter]);

  const totals = useMemo(() => {
    const active = accounts.filter((a) => a.is_active);
    const cop = active
      .filter((a) => a.currency === "COP")
      .reduce((s, a) => s + Number(a.balance ?? 0), 0);
    const usd = active
      .filter((a) => a.currency === "USD")
      .reduce((s, a) => s + Number(a.balance ?? 0), 0);
    return {
      cop,
      usd,
      activeCount: active.length,
      totalCount: accounts.length,
    };
  }, [accounts]);

  const openCreate = useCallback(() => {
    setError(null);
    setEditingId(null);
    setModal("create");
  }, []);

  const openEdit = useCallback((id: string) => {
    setError(null);
    setEditingId(id);
    setModal("edit");
  }, []);

  const openTransfer = useCallback(() => {
    setError(null);
    setModal("transfer");
  }, []);

  const openDeactivate = useCallback((id: string) => {
    setDeactivateTargetId(id);
    setModal("deactivate");
  }, []);

  const closeModal = useCallback(() => {
    setModal(null);
    setEditingId(null);
    setDeactivateTargetId(null);
    setError(null);
  }, []);

  const saveAccount = useCallback(
    (row: Account, mode: AccountFormMode) => {
      setError(null);
      startTransition(async () => {
        try {
          if (mode === "create") {
            await createAccountAction(userId, {
              account_name: row.account_name,
              type: row.type,
              institution: row.institution ?? undefined,
              balance: Number(row.balance ?? 0),
              currency: row.currency,
            });
          } else if (editingId) {
            await updateFinanceAccountAction(userId, editingId, {
              account_name: row.account_name,
              type: row.type,
              institution: row.institution,
              balance: Number(row.balance ?? 0),
              currency: row.currency,
              is_active: row.is_active,
            });
          }
          closeModal();
          router.refresh();
        } catch (actionError) {
          setError(
            actionError instanceof Error
              ? actionError.message
              : "No se pudo guardar la cuenta.",
          );
        }
      });
    },
    [closeModal, editingId, router, userId],
  );

  const applyTransfer = useCallback(
    ({
      fromId,
      toId,
      amount,
      note,
    }: {
      fromId: string;
      toId: string;
      amount: number;
      note: string;
    }) => {
      setError(null);
      startTransition(async () => {
        try {
          await createTransactionAction(userId, {
            account_id: Number(fromId),
            to_account_id: Number(toId),
            amount,
            title: note.trim() || "Transferencia entre cuentas",
            type: "transfer",
          });
          closeModal();
          router.refresh();
        } catch (actionError) {
          setError(
            actionError instanceof Error
              ? actionError.message
              : "No se pudo completar la transferencia.",
          );
        }
      });
    },
    [closeModal, router, userId],
  );

  const confirmDeactivate = useCallback(() => {
    if (!deactivateTargetId) return;
    startTransition(async () => {
      await deactivateFinanceAccountAction(userId, deactivateTargetId);
      closeModal();
      router.refresh();
    });
  }, [closeModal, deactivateTargetId, router, userId]);

  const reactivateAccountHandler = useCallback(
    (id: string) => {
      startTransition(async () => {
        await reactivateFinanceAccountAction(userId, id);
        router.refresh();
      });
    },
    [router, userId],
  );

  return {
    accounts,
    filter,
    setFilter,
    modal,
    editingId,
    deactivateTargetId,
    filteredAccounts,
    totals,
    openCreate,
    openEdit,
    openTransfer,
    openDeactivate,
    closeModal,
    saveAccount,
    applyTransfer,
    confirmDeactivate,
    reactivateAccount: reactivateAccountHandler,
    userId,
    isPending,
    error,
  };
}
