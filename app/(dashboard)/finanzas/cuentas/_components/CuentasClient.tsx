"use client";

import { useCuentasState } from "../hooks/useCuentasState";
import CuentasAccountsGrid from "./CuentasAccountsGrid";
import CuentasFilterBar from "./CuentasFilterBar";
import CuentasHeader from "./CuentasHeader";
import CuentasHistoryColumn from "./CuentasHistoryColumn";
import CuentasKpiSection from "./CuentasKpiSection";
import CuentasPageBackground from "./CuentasPageBackground";
import CuentasSectionIntro from "./CuentasSectionIntro";
import AccountFormModal from "./modals/AccountFormModal";
import ConfirmDeactivateModal from "./modals/ConfirmDeactivateModal";
import TransferModal from "./modals/TransferModal";

export default function CuentasClient() {
  const c = useCuentasState();

  return (
    <div className="relative min-h-[60vh] bg-brand-surface">
      <CuentasPageBackground />

      <div className="relative mx-auto w-full max-w-6xl space-y-8 px-4 pb-16 pt-6 sm:px-6 md:pb-20 md:pt-8 xl:max-w-7xl">
        <CuentasHeader onTransfer={c.openTransfer} onCreate={c.openCreate} />

        <CuentasKpiSection
          cop={c.totals.cop}
          usd={c.totals.usd}
          drift={c.totals.drift}
          defaultAccountName={c.defaultAccount?.name ?? null}
        />

        <CuentasFilterBar filter={c.filter} onChange={c.setFilter} />

        <section className="space-y-6 border-t border-brand-forest/10 pt-8 md:space-y-8 md:pt-10">
          <CuentasSectionIntro
            eyebrow="Layout de trabajo"
            title="Cartera e historial"
            description="A la izquierda, el inventario de cuentas filtradas. A la derecha, el historial de la cuenta seleccionada. En pantallas grandes el panel lateral permanece visible al hacer scroll, para comparar saldo y movimientos sin perder contexto."
          />

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] xl:gap-8">
            <CuentasAccountsGrid
              accounts={c.filteredAccounts}
              historyAccountId={c.historyAccountId}
              onSelectHistory={c.setHistoryAccountId}
              onEdit={c.openEdit}
              onDeactivate={c.openDeactivate}
              onReactivate={c.reactivateAccount}
            />

            <CuentasHistoryColumn
              account={
                c.accounts.find((a) => a.id === c.historyAccountId) ?? null
              }
              movements={c.historyMovements}
              onClear={() => c.setHistoryAccountId(null)}
            />
          </div>
        </section>
      </div>

      {c.modal === "create" || c.modal === "edit" ? (
        <AccountFormModal
          key={c.editingId ?? "create"}
          mode={c.modal}
          initial={
            c.modal === "edit" && c.editingId
              ? (c.accounts.find((a) => a.id === c.editingId) ?? null)
              : null
          }
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
          accounts={c.accounts.filter((a) => a.status === "ACTIVE")}
          onClose={c.closeModal}
          onApply={c.applyTransfer}
        />
      ) : null}

      {c.modal === "deactivate" && c.deactivateTargetId ? (
        <ConfirmDeactivateModal
          onClose={c.closeModal}
          onConfirm={c.confirmDeactivate}
        />
      ) : null}
    </div>
  );
}
