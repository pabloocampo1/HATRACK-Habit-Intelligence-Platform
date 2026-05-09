"use client";

import { motion } from "framer-motion";
import type { AccountRow } from "../accounts.constants";
import AccountCard from "./AccountCard";
import CuentasSectionIntro from "./CuentasSectionIntro";

export default function CuentasAccountsGrid({
  accounts,
  historyAccountId,
  onSelectHistory,
  onEdit,
  onDeactivate,
  onReactivate,
}: {
  accounts: AccountRow[];
  historyAccountId: string | null;
  onSelectHistory: (id: string) => void;
  onEdit: (id: string) => void;
  onDeactivate: (id: string) => void;
  onReactivate: (id: string) => void;
}) {
  return (
    <div className="space-y-6 md:space-y-8">
      <CuentasSectionIntro
        eyebrow="Cartera"
        title={`${accounts.length} cuenta(s) en esta vista`}
        description="Tarjetas alineadas al modelo de dominio: nombre, tipo, moneda, saldos y reglas. La selección de historial se resalta para enlazar con el panel derecho."
      />

      {accounts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brand-forest/20 bg-white p-8 text-center shadow-md md:p-10">
          <p className="text-base font-semibold text-brand-slate">
            No hay cuentas con este filtro.
          </p>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-neutral-600">
            Cambia el filtro superior o crea una cuenta. Este estado vacío es
            válido en onboarding hasta que existan fuentes registradas.
          </p>
        </div>
      ) : (
        <motion.ul
          className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-6"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.05 } },
          }}
        >
          {accounts.map((acc) => (
            <motion.li
              key={acc.id}
              variants={{
                hidden: { opacity: 0, y: 12 },
                show: { opacity: 1, y: 0 },
              }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            >
              <AccountCard
                account={acc}
                selected={historyAccountId === acc.id}
                onSelectHistory={() => onSelectHistory(acc.id)}
                onEdit={() => onEdit(acc.id)}
                onDeactivate={() => onDeactivate(acc.id)}
                onReactivate={() => onReactivate(acc.id)}
              />
            </motion.li>
          ))}
        </motion.ul>
      )}
    </div>
  );
}
