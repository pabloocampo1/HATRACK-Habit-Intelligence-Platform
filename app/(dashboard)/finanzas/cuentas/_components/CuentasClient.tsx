"use client";

import { useCuentasState } from "../hooks/useCuentasState";
import type { Account } from "@/lib/types";
import CuentasAccountsGrid from "./CuentasAccountsGrid";
import CuentasFilterBar from "./CuentasFilterBar";
import CuentasHeader from "./CuentasHeader";
import CuentasKpiSection from "./CuentasKpiSection";
import CuentasPageBackground from "./CuentasPageBackground";
import AccountFormModal from "./modals/AccountFormModal";
import ConfirmDeactivateModal from "./modals/ConfirmDeactivateModal";
import TransferModal from "./modals/TransferModal";

type Props = {
  userId: string;
  initialAccounts: Account[];
};

export default function CuentasClient({ userId, initialAccounts }: Props) {
  const c = useCuentasState(userId, initialAccounts);

  return (
    <div className="relative min-h-[60vh] bg-brand-surface">
      <CuentasPageBackground />

      <div className="relative mx-auto w-full max-w-6xl space-y-8 px-4 pb-16 pt-6 sm:px-6 md:pb-20 md:pt-8 xl:max-w-7xl">
        <CuentasHeader onTransfer={c.openTransfer} onCreate={c.openCreate} />

        <CuentasKpiSection
          cop={c.totals.cop}
          usd={c.totals.usd}
          activeCount={c.totals.activeCount}
          totalCount={c.totals.totalCount}
        />

        <CuentasFilterBar filter={c.filter} onChange={c.setFilter} />

        <section className="space-y-6 border-t border-brand-forest/10 pt-8 md:space-y-8 md:pt-10">
          <CuentasAccountsGrid
            accounts={c.filteredAccounts}
            onEdit={c.openEdit}
            onDeactivate={c.openDeactivate}
            onReactivate={c.reactivateAccount}
          />
        </section>
      </div>

      {c.modal === "create" || c.modal === "edit" ? (
        <AccountFormModal
          key={c.editingId ?? "create"}
          mode={c.modal}
          userId={c.userId}
          initial={
            c.modal === "edit" && c.editingId
              ? (c.accounts.find((a) => a.account_id === c.editingId) ?? null)
              : null
          }
          isPending={c.isPending}
          error={c.error}
          onClose={c.closeModal}
          onSave={(row) => {
            if (c.modal === "create" || c.modal === "edit") {
              c.saveAccount(row, c.modal);
            }
          }}
        />
      ) : null}

      {c.modal === "transfer" ? (
        <TransferModal
          accounts={c.accounts.filter((a) => a.is_active)}
          isPending={c.isPending}
          serverError={c.error}
          onClose={c.closeModal}
          onApply={c.applyTransfer}
        />
      ) : null}

      {c.modal === "deactivate" && c.deactivateTargetId ? (
        <ConfirmDeactivateModal
          isPending={c.isPending}
          onClose={c.closeModal}
          onConfirm={c.confirmDeactivate}
        />
      ) : null}
    </div>
  );
}
