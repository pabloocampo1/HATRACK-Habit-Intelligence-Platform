"use client";

import { useCallback, useMemo, useState } from "react";
import type { AccountRow, AccountStatus, MovementRow } from "../accounts.constants";
import {
  INITIAL_MOCK_ACCOUNTS,
  INITIAL_MOCK_MOVEMENTS,
} from "../accounts.constants";
import type { CuentasFilterKey, CuentasModal } from "../cuentas.types";

type AccountFormMode = "create" | "edit";

export function useCuentasState() {
  const [accounts, setAccounts] = useState<AccountRow[]>(INITIAL_MOCK_ACCOUNTS);
  const [movements, setMovements] = useState<MovementRow[]>(
    INITIAL_MOCK_MOVEMENTS,
  );
  const [filter, setFilter] = useState<CuentasFilterKey>("all");
  const [historyAccountId, setHistoryAccountId] = useState<string | null>(
    "acc-1",
  );
  const [modal, setModal] = useState<CuentasModal>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deactivateTargetId, setDeactivateTargetId] = useState<string | null>(
    null,
  );

  const filteredAccounts = useMemo(() => {
    return accounts.filter((a) => {
      if (filter === "active") return a.status === "ACTIVE";
      if (filter === "inactive") return a.status === "INACTIVE";
      if (filter === "savings") return a.isSavingsPocket;
      return true;
    });
  }, [accounts, filter]);

  const totals = useMemo(() => {
    const cop = accounts
      .filter((a) => a.currency === "COP" && a.status === "ACTIVE")
      .reduce((s, a) => s + a.balanceStored, 0);
    const usd = accounts
      .filter((a) => a.currency === "USD" && a.status === "ACTIVE")
      .reduce((s, a) => s + a.balanceStored, 0);
    const drift = accounts.filter(
      (a) =>
        a.status === "ACTIVE" &&
        Math.round(a.balanceStored) !== Math.round(a.balanceCalculated),
    ).length;
    return { cop, usd, drift };
  }, [accounts]);

  const defaultAccount = useMemo(
    () => accounts.find((a) => a.isDefault && a.status === "ACTIVE"),
    [accounts],
  );

  const historyMovements = useMemo(() => {
    if (!historyAccountId) return [];
    return movements
      .filter((m) => m.accountId === historyAccountId)
      .sort((a, b) => (a.at < b.at ? 1 : -1));
  }, [movements, historyAccountId]);

  const openCreate = useCallback(() => {
    setEditingId(null);
    setModal("create");
  }, []);

  const openEdit = useCallback((id: string) => {
    setEditingId(id);
    setModal("edit");
  }, []);

  const openTransfer = useCallback(() => setModal("transfer"), []);

  const openDeactivate = useCallback((id: string) => {
    setDeactivateTargetId(id);
    setModal("deactivate");
  }, []);

  const closeModal = useCallback(() => {
    setModal(null);
    setEditingId(null);
    setDeactivateTargetId(null);
  }, []);

  const saveAccount = useCallback(
    (row: AccountRow, mode: AccountFormMode) => {
      if (mode === "create") {
        setAccounts((prev) => {
          let next = [...prev, row];
          if (row.isDefault) {
            next = next.map((a) =>
              a.id === row.id ? a : { ...a, isDefault: false },
            );
          }
          return next;
        });
      } else if (editingId) {
        setAccounts((prev) => {
          let next = prev.map((a) => (a.id === editingId ? row : a));
          if (row.isDefault) {
            next = next.map((a) =>
              a.id === row.id ? a : { ...a, isDefault: false },
            );
          }
          return next;
        });
      }
      closeModal();
    },
    [closeModal, editingId],
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
      const from = accounts.find((a) => a.id === fromId)!;
      const to = accounts.find((a) => a.id === toId)!;
      if (from.currency !== to.currency) return;
      const ts = new Date().toISOString();
      setAccounts((prev) =>
        prev.map((a) => {
          if (a.id === fromId) {
            return {
              ...a,
              balanceStored: a.balanceStored - amount,
              balanceCalculated: a.balanceCalculated - amount,
              lastMovementAt: ts,
            };
          }
          if (a.id === toId) {
            return {
              ...a,
              balanceStored: a.balanceStored + amount,
              balanceCalculated: a.balanceCalculated + amount,
              lastMovementAt: ts,
            };
          }
          return a;
        }),
      );
      setMovements((prev) => [
        {
          id: `mov-local-${Date.now()}-a`,
          accountId: fromId,
          at: ts,
          description: note
            ? `Transferencia → ${to.name} · ${note}`
            : `Transferencia → ${to.name}`,
          amount: -amount,
          kind: "TRANSFER_OUT",
        },
        {
          id: `mov-local-${Date.now()}-b`,
          accountId: toId,
          at: ts,
          description: note
            ? `Transferencia desde ${from.name} · ${note}`
            : `Transferencia desde ${from.name}`,
          amount,
          kind: "TRANSFER_IN",
        },
        ...prev,
      ]);
      closeModal();
    },
    [accounts, closeModal],
  );

  const confirmDeactivate = useCallback(() => {
    if (!deactivateTargetId) return;
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === deactivateTargetId
          ? { ...a, status: "INACTIVE" as AccountStatus }
          : a,
      ),
    );
    closeModal();
  }, [closeModal, deactivateTargetId]);

  const reactivateAccount = useCallback((id: string) => {
    setAccounts((prev) =>
      prev.map((x) =>
        x.id === id ? { ...x, status: "ACTIVE" as AccountStatus } : x,
      ),
    );
  }, []);

  return {
    accounts,
    movements,
    filter,
    setFilter,
    historyAccountId,
    setHistoryAccountId,
    modal,
    editingId,
    deactivateTargetId,
    filteredAccounts,
    totals,
    defaultAccount,
    historyMovements,
    openCreate,
    openEdit,
    openTransfer,
    openDeactivate,
    closeModal,
    saveAccount,
    applyTransfer,
    confirmDeactivate,
    reactivateAccount,
  };
}
