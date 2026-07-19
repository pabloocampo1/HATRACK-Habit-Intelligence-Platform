"use client";

import { useState } from "react";
import type { Account, AccountCurrency, AccountType } from "@/lib/types";
import { ACCOUNT_TYPE_LABELS } from "../../accounts.constants";
import { btnGhost, btnPrimary, inputSurface } from "../../cuentas-ui";
import { parseMoneyInput } from "../../utils/formatMoney";
import FormField from "./FormField";
import ModalShell from "./ModalShell";

export default function AccountFormModal({
  mode,
  initial,
  userId,
  isPending,
  error,
  onClose,
  onSave,
}: {
  mode: "create" | "edit";
  initial: Account | null;
  userId: string;
  isPending?: boolean;
  error?: string | null;
  onClose: () => void;
  onSave: (row: Account) => void;
}) {
  const [accountName, setAccountName] = useState(initial?.account_name ?? "");
  const [institution, setInstitution] = useState(initial?.institution ?? "");
  const [type, setType] = useState<AccountType>(
    initial?.type ?? "DIGITAL_WALLET",
  );
  const [currency, setCurrency] = useState<AccountCurrency>(
    initial?.currency ?? "COP",
  );
  const [balance, setBalance] = useState(
    initial ? String(initial.balance) : "0",
  );
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);

  const submit = () => {
    const now = new Date().toISOString();
    onSave({
      account_id: initial?.account_id ?? "",
      account_name: accountName.trim() || "Sin nombre",
      user_id: initial?.user_id ?? userId,
      type,
      institution: institution.trim() || null,
      balance: parseMoneyInput(balance, currency),
      currency,
      is_active: mode === "create" ? true : isActive,
      created_at: initial?.created_at ?? now,
      updated_at: now,
    });
  };

  return (
    <ModalShell
      title={mode === "create" ? "Nueva cuenta" : "Editar cuenta"}
      subtitle={
        mode === "create"
          ? "Registra dónde tienes tu dinero: banco, efectivo, billetera digital o ahorros."
          : "Actualiza los datos de la cuenta. Para cambios grandes de saldo usa el módulo de transacciones."
      }
      onClose={onClose}
    >
      <div className="grid gap-7 sm:grid-cols-2">
        <FormField
          label="Nombre de la cuenta"
          hint='Ej: "Nequi principal", "Efectivo billetera", "Ahorro viaje".'
        >
          <input
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            placeholder="Nombre que reconocerás fácil"
            className={inputSurface}
          />
        </FormField>
        <FormField
          label="Institución (opcional)"
          hint="Banco o app: Bancolombia, Nequi, Davivienda… Déjalo vacío si es efectivo."
        >
          <input
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            placeholder="Nombre del banco o fintech"
            className={inputSurface}
          />
        </FormField>
        <FormField
          label="Tipo de cuenta"
          hint="Clasifica la cuenta para organizar mejor tu patrimonio."
        >
          <select
            value={type}
            onChange={(e) => setType(e.target.value as AccountType)}
            className={inputSurface}
          >
            {(Object.keys(ACCOUNT_TYPE_LABELS) as AccountType[]).map((t) => (
              <option key={t} value={t}>
                {ACCOUNT_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </FormField>
        <FormField
          label="Moneda"
          hint="Elige la moneda en la que manejas esta cuenta."
        >
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as AccountCurrency)}
            className={inputSurface}
          >
            <option value="COP">COP — Peso colombiano</option>
            <option value="USD">USD — Dólar estadounidense</option>
          </select>
        </FormField>
        <FormField
          label="Saldo inicial"
          hint="Cuánto dinero tienes hoy en esta cuenta. Luego se actualiza con tus transacciones."
        >
          <input
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            inputMode="decimal"
            placeholder="0"
            className={`${inputSurface} tabular-nums`}
          />
        </FormField>
        {mode === "edit" ? (
          <FormField
            label="Estado"
            hint="Inactiva archiva la cuenta sin borrar su historial."
          >
            <select
              value={isActive ? "true" : "false"}
              onChange={(e) => setIsActive(e.target.value === "true")}
              className={inputSurface}
            >
              <option value="true">Activa</option>
              <option value="false">Inactiva</option>
            </select>
          </FormField>
        ) : null}
      </div>

      {error ? (
        <p className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      ) : null}

      <div className="mt-10 flex flex-wrap justify-end gap-4">
        <button type="button" onClick={onClose} className={btnGhost} disabled={isPending}>
          Cancelar
        </button>
        <button
          type="button"
          onClick={submit}
          className={btnPrimary}
          disabled={isPending || !accountName.trim()}
        >
          {isPending ? "Guardando…" : "Guardar cuenta"}
        </button>
      </div>
    </ModalShell>
  );
}
