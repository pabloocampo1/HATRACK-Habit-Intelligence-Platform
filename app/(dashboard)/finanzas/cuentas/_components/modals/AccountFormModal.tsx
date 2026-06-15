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
  onClose,
  onSave,
}: {
  mode: "create" | "edit";
  initial: Account | null;
  userId: string;
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
      account_id:
        initial?.account_id ?? `local-${Date.now().toString(36)}`,
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
          ? "Registra una fuente de dinero. El saldo inicial se guarda en balance; luego lo ajustan las transacciones."
          : "Actualiza los datos de la cuenta. Cambios grandes de saldo deberían venir del módulo de transacciones."
      }
      onClose={onClose}
    >
      <div className="grid gap-7 sm:grid-cols-2">
        <FormField
          label="Nombre de cuenta"
          hint="Corresponde a account_name en la base de datos."
        >
          <input
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            className={inputSurface}
          />
        </FormField>
        <FormField
          label="Institución (opcional)"
          hint="Banco, fintech o vacío si es efectivo."
        >
          <input
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            className={inputSurface}
          />
        </FormField>
        <FormField label="Tipo" hint="Valores permitidos por la tabla accounts.">
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
        <FormField label="Moneda" hint="Default COP en la base de datos.">
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
          hint="Campo balance. En edición, úsalo solo para migraciones o correcciones."
        >
          <input
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            className={`${inputSurface} tabular-nums`}
          />
        </FormField>
        {mode === "edit" ? (
          <FormField
            label="Estado"
            hint="is_active: false archiva la cuenta sin borrarla."
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

      <div className="mt-10 flex flex-wrap justify-end gap-4">
        <button type="button" onClick={onClose} className={btnGhost}>
          Cancelar
        </button>
        <button type="button" onClick={submit} className={btnPrimary}>
          Guardar
        </button>
      </div>
    </ModalShell>
  );
}
