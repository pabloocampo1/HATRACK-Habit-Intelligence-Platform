"use client";

import { useEffect, useState } from "react";
import type { Account } from "@/lib/types";
import { btnGhost, btnPrimary, inputSurface } from "../../cuentas-ui";
import { formatMoney, parseMoneyInput } from "../../utils/formatMoney";
import FormField from "./FormField";
import ModalShell from "./ModalShell";

export default function TransferModal({
  accounts,
  onClose,
  onApply,
}: {
  accounts: Account[];
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (fromId === toId) {
      const other = accounts.find((a) => a.account_id !== fromId);
      if (other) setToId(other.account_id);
    }
  }, [fromId, toId, accounts]);

  const from = accounts.find((a) => a.account_id === fromId);
  const to = accounts.find((a) => a.account_id === toId);
  const sameCurrency = from && to && from.currency === to.currency;

  const submit = () => {
    setError(null);
    const cur = from?.currency ?? "COP";
    const n = parseMoneyInput(amount, cur);
    if (!from || !to || fromId === toId) {
      setError("Elige dos cuentas distintas.");
      return;
    }
    if (!sameCurrency) {
      setError("Las cuentas deben compartir moneda para esta versión del flujo.");
      return;
    }
    if (n <= 0) {
      setError("Ingresa un monto válido mayor a cero.");
      return;
    }
    if (from.balance < n) {
      setError("Saldo insuficiente en la cuenta origen.");
      return;
    }
    onApply({ fromId, toId, amount: n, note: note.trim() });
  };

  return (
    <ModalShell
      title="Transferir entre cuentas"
      subtitle="Actualiza balance en ambas cuentas (misma moneda). En producción conviene hacerlo en una transacción atómica en el backend."
      onClose={onClose}
    >
      <div className="grid gap-7 sm:grid-cols-2">
        <FormField label="Cuenta origen" hint="Debe tener saldo suficiente.">
          <select
            value={fromId}
            onChange={(e) => setFromId(e.target.value)}
            className={inputSurface}
          >
            {accounts.map((a) => (
              <option key={a.account_id} value={a.account_id}>
                {a.account_name} · {a.currency}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Cuenta destino" hint="Recibe el mismo monto.">
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
        <FormField label="Monto" hint="Se resta del balance origen y suma al destino.">
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={`${inputSurface} tabular-nums`}
          />
        </FormField>
        <FormField label="Nota (opcional)" hint="Referencia interna del movimiento.">
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

      {error ? (
        <p className="mt-6 rounded-[1.25rem] border-2 border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-950">
          {error}
        </p>
      ) : null}

      <div className="mt-10 flex flex-wrap justify-end gap-4">
        <button type="button" onClick={onClose} className={btnGhost}>
          Volver
        </button>
        <button type="button" onClick={submit} className={btnPrimary}>
          Confirmar transferencia
        </button>
      </div>
    </ModalShell>
  );
}
