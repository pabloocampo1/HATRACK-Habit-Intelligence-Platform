"use client";

import { useState } from "react";
import type {
  AccountCurrency,
  AccountRow,
  AccountStatus,
  AccountType,
} from "../../accounts.constants";
import { ACCOUNT_TYPE_LABELS } from "../../accounts.constants";
import { btnGhost, btnPrimary, inputSurface } from "../../cuentas-ui";
import { parseMoneyInput } from "../../utils/formatMoney";
import FormField from "./FormField";
import ModalShell from "./ModalShell";

export default function AccountFormModal({
  mode,
  initial,
  onClose,
  onSave,
}: {
  mode: "create" | "edit";
  initial: AccountRow | null;
  onClose: () => void;
  onSave: (row: AccountRow) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [institution, setInstitution] = useState(initial?.institution ?? "");
  const [type, setType] = useState<AccountType>(
    initial?.type ?? "DIGITAL_WALLET",
  );
  const [currency, setCurrency] = useState<AccountCurrency>(
    initial?.currency ?? "COP",
  );
  const [balanceStored, setBalanceStored] = useState(
    initial ? String(initial.balanceStored) : "0",
  );
  const [balanceCalculated, setBalanceCalculated] = useState(
    initial ? String(initial.balanceCalculated) : "0",
  );
  const [isDefault, setIsDefault] = useState(initial?.isDefault ?? false);
  const [allowNegative, setAllowNegative] = useState(
    initial?.allowNegative ?? false,
  );
  const [threshold, setThreshold] = useState(
    initial?.lowBalanceThreshold != null
      ? String(initial.lowBalanceThreshold)
      : "",
  );
  const [savingsPocket, setSavingsPocket] = useState(
    initial?.isSavingsPocket ?? false,
  );
  const [status, setStatus] = useState<AccountStatus>(
    initial?.status ?? "ACTIVE",
  );

  const submit = () => {
    const id = initial?.id ?? `acc-local-${Date.now().toString(36)}`;
    const stored = parseMoneyInput(balanceStored, currency);
    const calculated = parseMoneyInput(balanceCalculated, currency);
    const thr =
      threshold.trim() === ""
        ? null
        : parseMoneyInput(threshold, currency);
    onSave({
      id,
      name: name.trim() || "Sin nombre",
      institution: institution.trim() || null,
      type,
      currency,
      balanceStored: stored,
      balanceCalculated: calculated,
      isDefault,
      allowNegative,
      lowBalanceThreshold: thr,
      isSavingsPocket: savingsPocket,
      status,
      lastMovementAt: new Date().toISOString(),
    });
  };

  return (
    <ModalShell
      title={mode === "create" ? "Nueva cuenta" : "Editar cuenta"}
      subtitle={
        mode === "create"
          ? "Registra una fuente de dinero. Los saldos finos los ajustará tu backend con cada transacción; aquí defines la forma inicial y las reglas."
          : "Actualiza metadatos y reglas. Los cambios de saldo masivos deberían venir del módulo de transacciones, no a mano, salvo migraciones."
      }
      onClose={onClose}
    >
      <div className="grid gap-7 sm:grid-cols-2">
        <FormField
          label="Nombre visible"
          hint="Ej. Nequi principal, Efectivo billetera."
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputSurface}
          />
        </FormField>
        <FormField
          label="Institución (opcional)"
          hint="Banco, fintech o vacío si es efectivo suelto."
        >
          <input
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            className={inputSurface}
          />
        </FormField>
        <FormField
          label="Tipo de cuenta"
          hint="Sirve para reportes y UX: banco, efectivo, wallet o ahorros."
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
        <FormField label="Moneda" hint="No mezclar COP y USD en una misma cuenta.">
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
          label="Balance almacenado"
          hint="Valor persistido para listados rápidos. Debe alinearse con el libro de movimientos."
        >
          <input
            value={balanceStored}
            onChange={(e) => setBalanceStored(e.target.value)}
            className={`${inputSurface} tabular-nums`}
          />
        </FormField>
        <FormField
          label="Balance calculado (validación)"
          hint="Suma derivada de transacciones. Si difiere del almacenado, muestra alerta en la tarjeta."
        >
          <input
            value={balanceCalculated}
            onChange={(e) => setBalanceCalculated(e.target.value)}
            className={`${inputSurface} tabular-nums`}
          />
        </FormField>
        {mode === "edit" ? (
          <FormField
            label="Estado operativo"
            hint="INACTIVE oculta la cuenta en flujos sin borrar historial."
          >
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as AccountStatus)}
              className={inputSurface}
            >
              <option value="ACTIVE">ACTIVE — visible</option>
              <option value="INACTIVE">INACTIVE — archivada</option>
            </select>
          </FormField>
        ) : null}
      </div>

      <div className="mt-8 space-y-4 rounded-xl border border-brand-forest/10 bg-brand-offwhite p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-forest">
          Reglas y comportamiento
        </p>
        <label className="flex cursor-pointer items-start gap-4 rounded-xl px-2 py-2 text-base leading-snug text-brand-slate transition hover:bg-white/90">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="mt-1 size-4 rounded border-brand-forest/30 accent-brand-forest"
          />
          <span>
            <span className="font-semibold">Cuenta por defecto</span>
            <span className="mt-1 block text-sm text-neutral-600">
              Se preselecciona en formularios de gasto o ingreso para reducir
              fricción. Solo una por usuario.
            </span>
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-4 rounded-xl px-2 py-2 text-base leading-snug text-brand-slate transition hover:bg-white/90">
          <input
            type="checkbox"
            checked={allowNegative}
            onChange={(e) => setAllowNegative(e.target.checked)}
            className="mt-1 size-4 rounded border-brand-forest/30 accent-brand-forest"
          />
          <span>
            <span className="font-semibold">Permitir saldo negativo</span>
            <span className="mt-1 block text-sm text-neutral-600">
              Útil para líneas de crédito o cuentas técnicas. Desactiva si quieres
              bloquear gastos que dejen la cuenta bajo cero.
            </span>
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-4 rounded-xl px-2 py-2 text-base leading-snug text-brand-slate transition hover:bg-white/90">
          <input
            type="checkbox"
            checked={savingsPocket}
            onChange={(e) => setSavingsPocket(e.target.checked)}
            className="mt-1 size-4 rounded border-brand-forest/30 accent-brand-forest"
          />
          <span>
            <span className="font-semibold">Bolsa de ahorro / intocable</span>
            <span className="mt-1 block text-sm text-neutral-600">
              Marca dinero apartado para metas; en reportes puedes excluirlo de
              “disponible para gastar”.
            </span>
          </span>
        </label>
        <FormField
          label="Alerta de saldo bajo (opcional)"
          hint="Si el saldo cae por debajo de este monto, la UI puede avisar (push, banner o email desde backend)."
        >
          <input
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            placeholder="Ej. 500000"
            className={`${inputSurface} tabular-nums`}
          />
        </FormField>
      </div>

      <div className="mt-10 flex flex-wrap justify-end gap-4">
        <button type="button" onClick={onClose} className={btnGhost}>
          Cancelar
        </button>
        <button type="button" onClick={submit} className={btnPrimary}>
          Guardar cambios
        </button>
      </div>
    </ModalShell>
  );
}
