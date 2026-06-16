"use client";

import { useState } from "react";
import ModalShell from "../../cuentas/_components/modals/ModalShell";
import FormField from "../../cuentas/_components/modals/FormField";
import {
  btnPrimary,
  btnSecondary,
  inputSurface,
} from "../../cuentas/cuentas-ui";
import { MOCK_ACCOUNTS, MOCK_CATEGORIES } from "../transactions.constants";
import type {
  TransactionCurrency,
  TransactionRow,
  TransactionType,
} from "../transacciones.types";
import { parseMoneyInput } from "../utils/parseMoneyInput";

export default function NewTransactionModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (row: Omit<TransactionRow, "id">) => void;
}) {
  const [type, setType] = useState<TransactionType>("EXPENSE");
  const [description, setDescription] = useState("");
  const [amountRaw, setAmountRaw] = useState("");
  const [currency, setCurrency] = useState<TransactionCurrency>("COP");
  const [categoryId, setCategoryId] = useState(MOCK_CATEGORIES[1]!.id);
  const [accountId, setAccountId] = useState<string>(MOCK_ACCOUNTS[0]!.id);
  const [toAccountId, setToAccountId] = useState<string>(MOCK_ACCOUNTS[1]!.id);
  const [error, setError] = useState<string | null>(null);

  const accountName =
    MOCK_ACCOUNTS.find((a) => a.id === accountId)?.name ?? "";
  const toName = MOCK_ACCOUNTS.find((a) => a.id === toAccountId)?.name;

  const submit = () => {
    const desc = description.trim();
    if (!desc) {
      setError("Añade una descripción breve.");
      return;
    }
    const n = parseMoneyInput(amountRaw, currency);
    if (n <= 0) {
      setError("El monto debe ser mayor a cero.");
      return;
    }
    if (type === "TRANSFER") {
      if (accountId === toAccountId) {
        setError("Elige dos cuentas distintas para la transferencia.");
        return;
      }
      onSave({
        at: new Date().toISOString(),
        type: "TRANSFER",
        description: desc,
        amount: -Math.abs(n),
        currency,
        categoryId: "cat-transfer",
        accountName,
        toAccountName: toName,
      });
      onClose();
      return;
    }
    if (type === "INCOME") {
      onSave({
        at: new Date().toISOString(),
        type: "INCOME",
        description: desc,
        amount: Math.abs(n),
        currency,
        categoryId,
        accountName,
      });
    } else {
      onSave({
        at: new Date().toISOString(),
        type: "EXPENSE",
        description: desc,
        amount: -Math.abs(n),
        currency,
        categoryId,
        accountName,
      });
    }
    onClose();
  };

  return (
    <ModalShell
      title="Nuevo movimiento"
      subtitle="Simulación local: se inserta arriba del listado sin persistencia en servidor."
      onClose={onClose}
    >
      <div className="space-y-6">
        <FormField label="Tipo">
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value as TransactionType);
              setError(null);
            }}
            className={inputSurface}
          >
            <option value="EXPENSE">Gasto</option>
            <option value="INCOME">Ingreso</option>
            <option value="TRANSFER">Transferencia</option>
          </select>
        </FormField>

        <FormField label="Descripción" hint="Ej. Mercado, Nómina, Uber…">
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputSurface}
            placeholder="Qué compraste o de dónde vino el dinero"
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Monto">
            <input
              value={amountRaw}
              onChange={(e) => setAmountRaw(e.target.value)}
              className={`${inputSurface} tabular-nums`}
              placeholder={currency === "COP" ? "85000" : "120.50"}
            />
          </FormField>
          <FormField label="Moneda">
            <select
              value={currency}
              onChange={(e) =>
                setCurrency(e.target.value as TransactionCurrency)
              }
              className={inputSurface}
            >
              <option value="COP">COP — Peso colombiano</option>
              <option value="USD">USD — Dólar</option>
            </select>
          </FormField>
        </div>

        {type !== "TRANSFER" ? (
          <FormField label="Categoría">
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={inputSurface}
            >
              {MOCK_CATEGORIES.filter((c) => c.id !== "cat-transfer").map(
                (c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ),
              )}
            </select>
          </FormField>
        ) : null}

        <FormField
          label={type === "TRANSFER" ? "Cuenta origen" : "Cuenta"}
        >
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className={inputSurface}
          >
            {MOCK_ACCOUNTS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.currency})
              </option>
            ))}
          </select>
        </FormField>

        {type === "TRANSFER" ? (
          <FormField label="Cuenta destino">
            <select
              value={toAccountId}
              onChange={(e) => setToAccountId(e.target.value)}
              className={inputSurface}
            >
              {MOCK_ACCOUNTS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.currency})
                </option>
              ))}
            </select>
          </FormField>
        ) : null}

        {error ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-950">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className={btnSecondary}>
            Cancelar
          </button>
          <button type="button" onClick={submit} className={btnPrimary}>
            Guardar en la vista
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
