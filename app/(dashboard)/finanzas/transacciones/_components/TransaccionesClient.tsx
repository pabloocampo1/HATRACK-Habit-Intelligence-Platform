"use client";

import { useState } from "react";
import { useTransaccionesState } from "../hooks/useTransaccionesState";
import NewTransactionModal from "./NewTransactionModal";
import TransaccionesFilters from "./TransaccionesFilters";
import TransaccionesHeader from "./TransaccionesHeader";
import TransaccionesKpiSection from "./TransaccionesKpiSection";
import TransaccionesList from "./TransaccionesList";
import TransaccionesPageBackground from "./TransaccionesPageBackground";

export default function TransaccionesClient() {
  const [modalOpen, setModalOpen] = useState(false);
  const t = useTransaccionesState();

  return (
    <div className="relative min-h-[60vh] bg-brand-surface">
      <TransaccionesPageBackground />

      <div className="relative mx-auto w-full max-w-6xl space-y-8 pb-16 pt-2 md:pb-20 xl:max-w-7xl">
        <TransaccionesHeader onNew={() => setModalOpen(true)} />

        <TransaccionesKpiSection
          incomeCop={t.totals.incomeCop}
          expenseCop={t.totals.expenseCop}
          netCop={t.totals.netCop}
          count={t.totals.count}
        />

        <TransaccionesFilters
          period={t.period}
          onPeriod={t.setPeriod}
          typeFilter={t.typeFilter}
          onType={t.setTypeFilter}
          categoryId={t.categoryId}
          onCategory={t.setCategoryId}
          search={t.search}
          onSearch={t.setSearch}
          categories={t.categories}
        />

        <div className="border-t border-brand-forest/10 pt-8 md:pt-10">
          <TransaccionesList
            transactions={t.transactions}
            categories={t.categories}
          />
        </div>
      </div>

      {modalOpen ? (
        <NewTransactionModal
          onClose={() => setModalOpen(false)}
          onSave={(row) => {
            t.addTransaction(row);
          }}
        />
      ) : null}
    </div>
  );
}
