/**
 * Datos mock + tipos para el módulo Cuentas.
 * Reemplazar por fetch / acciones del backend cuando conectes la API.
 */

export type AccountType = "BANK" | "CASH" | "DIGITAL_WALLET" | "SAVINGS";

export type AccountStatus = "ACTIVE" | "INACTIVE";

export type AccountCurrency = "COP" | "USD";

export interface AccountRow {
  id: string;
  name: string;
  institution: string | null;
  type: AccountType;
  currency: AccountCurrency;
  /** Balance persistido (rápido en listados) */
  balanceStored: number;
  /** Balance derivado de transacciones (validación / auditoría) */
  balanceCalculated: number;
  isDefault: boolean;
  allowNegative: boolean;
  /** Alerta si el saldo cae por debajo de este monto (misma moneda) */
  lowBalanceThreshold: number | null;
  /** Dinero “intocable” / aparte para metas */
  isSavingsPocket: boolean;
  status: AccountStatus;
  lastMovementAt: string;
}

export type MovementKind =
  | "INCOME"
  | "EXPENSE"
  | "TRANSFER_IN"
  | "TRANSFER_OUT";

export interface MovementRow {
  id: string;
  accountId: string;
  at: string;
  description: string;
  amount: number;
  kind: MovementKind;
}

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  BANK: "Banco",
  CASH: "Efectivo",
  DIGITAL_WALLET: "Billetera digital",
  SAVINGS: "Cuenta de ahorros",
};

export const INITIAL_MOCK_ACCOUNTS: AccountRow[] = [
  {
    id: "acc-1",
    name: "Nequi principal",
    institution: "Bancolombia",
    type: "DIGITAL_WALLET",
    currency: "COP",
    balanceStored: 2_847_500,
    balanceCalculated: 2_847_500,
    isDefault: true,
    allowNegative: false,
    lowBalanceThreshold: 500_000,
    isSavingsPocket: false,
    status: "ACTIVE",
    lastMovementAt: "2026-05-01T10:22:00",
  },
  {
    id: "acc-2",
    name: "Ahorro viaje Europa",
    institution: "Davivienda",
    type: "SAVINGS",
    currency: "COP",
    balanceStored: 8_200_000,
    balanceCalculated: 8_195_000,
    isDefault: false,
    allowNegative: false,
    lowBalanceThreshold: null,
    isSavingsPocket: true,
    status: "ACTIVE",
    lastMovementAt: "2026-04-28T09:00:00",
  },
  {
    id: "acc-3",
    name: "Efectivo billetera",
    institution: null,
    type: "CASH",
    currency: "COP",
    balanceStored: 180_000,
    balanceCalculated: 180_000,
    isDefault: false,
    allowNegative: false,
    lowBalanceThreshold: 100_000,
    isSavingsPocket: false,
    status: "ACTIVE",
    lastMovementAt: "2026-04-30T18:40:00",
  },
  {
    id: "acc-4",
    name: "Cuenta USD freelance",
    institution: "Wise",
    type: "BANK",
    currency: "USD",
    balanceStored: 3_420,
    balanceCalculated: 3_420,
    isDefault: false,
    allowNegative: true,
    lowBalanceThreshold: 500,
    isSavingsPocket: false,
    status: "ACTIVE",
    lastMovementAt: "2026-04-25T14:00:00",
  },
  {
    id: "acc-5",
    name: "Daviplata (vieja)",
    institution: "Davivienda",
    type: "DIGITAL_WALLET",
    currency: "COP",
    balanceStored: 0,
    balanceCalculated: 0,
    isDefault: false,
    allowNegative: false,
    lowBalanceThreshold: null,
    isSavingsPocket: false,
    status: "INACTIVE",
    lastMovementAt: "2025-11-02T12:00:00",
  },
];

export const INITIAL_MOCK_MOVEMENTS: MovementRow[] = [
  {
    id: "mov-1",
    accountId: "acc-1",
    at: "2026-05-01T10:22:00",
    description: "Pago freelance · UI kit",
    amount: 890_000,
    kind: "INCOME",
  },
  {
    id: "mov-2",
    accountId: "acc-1",
    at: "2026-04-30T19:10:00",
    description: "Transferencia a Nequi → Ahorro viaje",
    amount: -400_000,
    kind: "TRANSFER_OUT",
  },
  {
    id: "mov-3",
    accountId: "acc-2",
    at: "2026-04-30T19:10:00",
    description: "Transferencia desde Nequi",
    amount: 400_000,
    kind: "TRANSFER_IN",
  },
  {
    id: "mov-4",
    accountId: "acc-1",
    at: "2026-04-29T08:00:00",
    description: "Mercado · despensa",
    amount: -142_300,
    kind: "EXPENSE",
  },
  {
    id: "mov-5",
    accountId: "acc-3",
    at: "2026-04-28T12:00:00",
    description: "Retiro cajero",
    amount: 200_000,
    kind: "INCOME",
  },
];
