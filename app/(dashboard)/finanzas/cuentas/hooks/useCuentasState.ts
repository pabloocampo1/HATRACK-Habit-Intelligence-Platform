"use client";

import { useCallback, useMemo, useState } from "react";
import type { Account } from "@/lib/types";
import { INITIAL_MOCK_ACCOUNTS } from "../accounts.constants";
import type { CuentasFilterKey, CuentasModal } from "../cuentas.types";

type AccountFormMode = "create" | "edit";

const MOCK_USER_ID = "00000000-0000-0000-0000-000000000001";

export function useCuentasState() {
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_MOCK_ACCOUNTS);
  const [filter, setFilter] = useState<CuentasFilterKey>("all");
  const [modal, setModal] = useState<CuentasModal>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deactivateTargetId, setDeactivateTargetId] = useState<string | null>(
    null,
  );

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
      .reduce((s, a) => s + a.balance, 0);
    const usd = active
      .filter((a) => a.currency === "USD")
      .reduce((s, a) => s + a.balance, 0);
    return {
      cop,
      usd,
      activeCount: active.length,
      totalCount: accounts.length,
    };
  }, [accounts]);

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
    (row: Account, mode: AccountFormMode) => {
      const now = new Date().toISOString();
      if (mode === "create") {
        setAccounts((prev) => [...prev, { ...row, created_at: now, updated_at: now }]);
      } else if (editingId) {
        setAccounts((prev) =>
          prev.map((a) =>
            a.account_id === editingId
              ? { ...row, updated_at: now }
              : a,
          ),
        );
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
    }: {
      fromId: string;
      toId: string;
      amount: number;
      note: string;
    }) => {
      const from = accounts.find((a) => a.account_id === fromId);
      const to = accounts.find((a) => a.account_id === toId);
      if (!from || !to || from.currency !== to.currency) return;

      const now = new Date().toISOString();
      setAccounts((prev) =>
        prev.map((a) => {
          if (a.account_id === fromId) {
            return {
              ...a,
              balance: a.balance - amount,
              updated_at: now,
            };
          }
          if (a.account_id === toId) {
            return {
              ...a,
              balance: a.balance + amount,
              updated_at: now,
            };
          }
          return a;
        }),
      );
      closeModal();
    },
    [accounts, closeModal],
  );

  const confirmDeactivate = useCallback(() => {
    if (!deactivateTargetId) return;
    const now = new Date().toISOString();
    setAccounts((prev) =>
      prev.map((a) =>
        a.account_id === deactivateTargetId
          ? { ...a, is_active: false, updated_at: now }
          : a,
      ),
    );
    closeModal();
  }, [closeModal, deactivateTargetId]);

  const reactivateAccount = useCallback((id: string) => {
    const now = new Date().toISOString();
    setAccounts((prev) =>
      prev.map((a) =>
        a.account_id === id ? { ...a, is_active: true, updated_at: now } : a,
      ),
    );
  }, []);

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
    reactivateAccount,
    mockUserId: MOCK_USER_ID,
  };
}
