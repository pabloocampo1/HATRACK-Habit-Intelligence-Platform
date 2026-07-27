"use client";

import { useState } from "react";
import type { Account } from "@/lib/types";
import { btnGhost, btnPrimary, inputSurface } from "../../cuentas-ui";
import { formatMoney, parseMoneyInput } from "../../utils/formatMoney";
import FormField from "./FormField";
import ModalShell from "./ModalShell";

export default function TransferModal({
  accounts,
  isPending,
  serverError,
  onClose,
  onApply,
}: {
  accounts: Account[];
  isPending?: boolean;
  serverError?: string | null;
  onClose: () => void;
  onApply: (p: {
    fromId: string;
    toId: string;
    amount: number;
    note: string;
  }) => void;
}) {
  const defaultFrom = accounts[0]?.account_id ?? "";
  const defaultTo =
    accounts.find((a) => a.account_id !== defaultFrom)?.account_id ??
    defaultFrom;
  const [fromId, setFromId] = useState(defaultFrom);
  const [toId, setToId] = useState(defaultTo);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleFromChange = (nextFromId: string) => {
    setFromId(nextFromId);
    if (nextFromId === toId) {
      const other = accounts.find((a) => a.account_id !== nextFromId);
      if (other) setToId(other.account_id);
    }
  };

  const from = accounts.find((a) => a.account_id === fromId);
  const to = accounts.find((a) => a.account_id === toId);
  const sameCurrency = from && to && from.currency === to.currency;

  const submit = () => {
    setValidationError(null);
    const cur = from?.currency ?? "COP";
    const n = parseMoneyInput(amount, cur);
    if (!from || !to || fromId === toId) {
      setValidationError("Elige dos cuentas distintas.");
      return;
    }
    if (!sameCurrency) {
      setValidationError("Las cuentas deben compartir moneda para esta versión del flujo.");
      return;
    }
    if (n <= 0) {
      setValidationError("Ingresa un monto válido mayor a cero.");
      return;
    }
    if (from.balance < n) {
      setValidationError("Saldo insuficiente en la cuenta origen.");
      return;
    }
    onApply({ fromId, toId, amount: n, note: note.trim() });
  };

  const displayError = validationError ?? serverError;

  return (
    <ModalShell
      title="Transferir entre cuentas"
      subtitle="Mueve dinero de una cuenta a otra. Ambas deben usar la misma moneda."
      onClose={onClose}
    >
      <div className="grid gap-7 sm:grid-cols-2">
        <FormField
          label="Desde (cuenta origen)"
          hint="Se restará el monto de esta cuenta. Debe tener saldo suficiente."
        >
          <select
            value={fromId}
            onChange={(e) => handleFromChange(e.target.value)}
            className={inputSurface}
          >
            {accounts.map((a) => (
              <option key={a.account_id} value={a.account_id}>
                {a.account_name} · {a.currency}
              </option>
            ))}
          </select>
        </FormField>
        <FormField
          label="Hacia (cuenta destino)"
          hint="Recibirá el mismo monto que envías desde la cuenta origen."
        >
          <select
            value={toId}
            onChange={(e) => setToId(e.target.value)}
            className={inputSurface}
          >
            {accounts.map((a) => (
              <option key={a.account_id} value={a.account_id}>
                {a.account_name} · {a.currency}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Monto a transferir" hint="Solo números. Ej: 50000 o 1500000">
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={`${inputSurface} tabular-nums`}
          />
        </FormField>
        <FormField label="Nota (opcional)" hint='Ej: "Pago tarjeta", "Ahorro quincenal". Solo para tu referencia.'>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={inputSurface}
          />
        </FormField>
      </div>

      {from && to ? (
        <div className="mt-8 rounded-xl border border-brand-forest/15 bg-brand-offwhite px-5 py-4 text-base leading-relaxed text-text-secondary shadow-sm">
          <span className="font-semibold text-brand-forest">Vista previa · </span>
          Se descontará{" "}
          <span className="font-bold tabular-nums text-brand-slate">
            {formatMoney(
              Math.max(0, parseMoneyInput(amount, from.currency)),
              from.currency,
            )}
          </span>{" "}
          de{" "}
          <span className="font-semibold text-brand-slate">{from.account_name}</span>{" "}
          y se acreditará en{" "}
          <span className="font-semibold text-brand-slate">{to.account_name}</span>.
          {!sameCurrency ? (
            <span className="mt-2 block font-medium text-amber-800">
              Monedas distintas: elige cuentas con la misma currency.
            </span>
          ) : null}
        </div>
      ) : null}

      {displayError ? (
        <p className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {displayError}
        </p>
      ) : null}

      <div className="mt-10 flex flex-wrap justify-end gap-4">
        <button type="button" onClick={onClose} className={btnGhost} disabled={isPending}>
          Volver
        </button>
        <button type="button" onClick={submit} className={btnPrimary} disabled={isPending}>
          {isPending ? "Transfiriendo…" : "Confirmar transferencia"}
        </button>
      </div>
    </ModalShell>
  );
}
