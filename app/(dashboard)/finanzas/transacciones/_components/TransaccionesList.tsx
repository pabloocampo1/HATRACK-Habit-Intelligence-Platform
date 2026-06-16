"use client";

import { motion } from "framer-motion";
import type { CategoryRow, TransactionRow } from "../transacciones.types";
import { groupTransactionsByDay } from "../utils/groupTransactionsByDay";
import TransaccionesSectionIntro from "./TransaccionesSectionIntro";
import TransactionRowCard from "./TransactionRowCard";

export default function TransaccionesList({
  transactions,
  categories,
}: {
  transactions: TransactionRow[];
  categories: CategoryRow[];
}) {
  const groups = groupTransactionsByDay(transactions);
  const catMap = new Map(categories.map((c) => [c.id, c]));

  if (transactions.length === 0) {
    return (
      <section className="space-y-6">
        <TransaccionesSectionIntro
          eyebrow="Listado"
          title="Sin resultados con estos filtros"
          description="Amplía el período, limpia la búsqueda o cambia categoría. Los datos son mock: cualquier combinación es solo demostración."
        />
        <div className="rounded-2xl border border-dashed border-brand-forest/25 bg-surface-card p-10 text-center shadow-md">
          <p className="text-base font-semibold text-brand-slate">
            No hay movimientos que coincidan.
          </p>
          <p className="mx-auto mt-3 max-w-md text-base text-text-secondary">
            Prueba con otro rango de fechas o restablece los filtros desde arriba.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6 md:space-y-8">
      <TransaccionesSectionIntro
        eyebrow="Listado"
        title={`${transactions.length} movimiento(s)`}
        description="Agrupados por día. Cada fila resume tipo, categoría, cuentas y monto. Conecta tu API para paginación e infinite scroll."
      />

      <div className="space-y-10">
        {groups.map((group) => (
          <div key={group.sortKey}>
            <h3 className="mb-4 border-b border-brand-forest/10 pb-2 text-sm font-semibold uppercase tracking-wider text-brand-forest">
              {group.label}
            </h3>
            <motion.ul
              className="space-y-3 md:space-y-4"
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.04 } },
              }}
            >
              {group.items.map((tx) => (
                <motion.li
                  key={tx.id}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    show: { opacity: 1, y: 0 },
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                >
                  <TransactionRowCard
                    tx={tx}
                    category={catMap.get(tx.categoryId)}
                  />
                </motion.li>
              ))}
            </motion.ul>
          </div>
        ))}
      </div>
    </section>
  );
}
