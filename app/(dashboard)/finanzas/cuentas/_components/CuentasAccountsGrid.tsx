"use client";

import { motion } from "framer-motion";
import type { Account } from "@/lib/types";
import AccountCard from "./AccountCard";

export default function CuentasAccountsGrid({
  accounts,
  onEdit,
  onDeactivate,
  onReactivate,
}: {
  accounts: Account[];
  onEdit: (id: string) => void;
  onDeactivate: (id: string) => void;
  onReactivate: (id: string) => void;
}) {
  return (
    <div className="space-y-6 md:space-y-8">
      {accounts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brand-forest/20 bg-surface-card p-8 text-center shadow-md md:p-10">
          <p className="text-base font-semibold text-brand-slate">
            No hay cuentas con este filtro.
          </p>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-text-secondary">
            Cambia el filtro superior o crea una cuenta.
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
              key={acc.account_id}
              variants={{
                hidden: { opacity: 0, y: 12 },
                show: { opacity: 1, y: 0 },
              }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            >
              <AccountCard
                account={acc}
                onEdit={() => onEdit(acc.account_id)}
                onDeactivate={() => onDeactivate(acc.account_id)}
                onReactivate={() => onReactivate(acc.account_id)}
              />
            </motion.li>
          ))}
        </motion.ul>
      )}
    </div>
  );
}
