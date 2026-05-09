"use client";

import { useEffect, useState } from "react";
import type { AccountRow } from "../../accounts.constants";
import { btnGhost, btnPrimary, inputSurface } from "../../cuentas-ui";
import { formatMoney, parseMoneyInput } from "../../utils/formatMoney";
import FormField from "./FormField";
import ModalShell from "./ModalShell";

export default function TransferModal({
  accounts,
  onClose,
  onApply,
}: {
  accounts: AccountRow[];
  onClose: () => void;
  onApply: (p: {
    fromId: string;
    toId: string;
    amount: number;
    note: string;
  }) => void;
}) {
  const defaultFrom = accounts[0]?.id ?? "";
  const defaultTo =
    accounts.find((a) => a.id !== defaultFrom)?.id ?? defaultFrom;
  const [fromId, setFromId] = useState(defaultFrom);
  const [toId, setToId] = useState(defaultTo);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (fromId === toId) {
      const other = accounts.find((a) => a.id !== fromId);
      if (other) setToId(other.id);
    }
  }, [fromId, toId, accounts]);

  const from = accounts.find((a) => a.id === fromId);
  const to = accounts.find((a) => a.id === toId);
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
    if (!from.allowNegative && from.balanceStored < n) {
      setError("Saldo insuficiente: esta cuenta no permite quedar en negativo.");
      return;
    }
    onApply({ fromId, toId, amount: n, note: note.trim() });
  };

  return (
    <ModalShell
      title="Transferir entre cuentas"
      subtitle="Mueve saldo entre dos fuentes del mismo usuario y misma moneda. En backend esto debería crear dos apuntes enlazados (salida y entrada) más actualización atómica de balances."
      onClose={onClose}
    >
      <div className="grid gap-7 sm:grid-cols-2">
        <FormField
          label="Cuenta origen"
          hint="Debe tener saldo suficiente si no permites negativos."
        >
          <select
            value={fromId}
            onChange={(e) => setFromId(e.target.value)}
            className={inputSurface}
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} · {a.currency}
              </option>
            ))}
          </select>
        </FormField>
        <FormField
          label="Cuenta destino"
          hint="Recibirá el mismo monto en la misma moneda."
        >
          <select
            value={toId}
            onChange={(e) => setToId(e.target.value)}
            className={inputSurface}
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} · {a.currency}
              </option>
            ))}
          </select>
        </FormField>
        <FormField
          label="Monto a mover"
          hint="Escribe números simples; el backend normalizará formato local."
        >
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={`${inputSurface} tabular-nums`}
          />
        </FormField>
        <FormField
          label="Nota interna (opcional)"
          hint="Aparecerá en la descripción del movimiento mock."
        >
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={inputSurface}
          />
        </FormField>
      </div>

      {from && to ? (
        <div className="mt-8 rounded-xl border border-brand-forest/15 bg-brand-offwhite px-5 py-4 text-base leading-relaxed text-neutral-600 shadow-sm">
          <span className="font-semibold text-brand-forest">Vista previa · </span>
          Se descontará{" "}
          <span className="font-bold tabular-nums text-brand-slate">
            {formatMoney(
              Math.max(0, parseMoneyInput(amount, from.currency)),
              from.currency,
            )}
          </span>{" "}
          de <span className="font-semibold text-brand-slate">{from.name}</span> y se
          acreditará en{" "}
          <span className="font-semibold text-brand-slate">{to.name}</span>.
          {!sameCurrency ? (
            <span className="mt-2 block font-medium text-amber-800">
              Monedas distintas: ajusta las cuentas o añade conversión FX en otra
              iteración.
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
