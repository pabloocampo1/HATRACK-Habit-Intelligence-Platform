/**
 * Labels y datos mock del módulo Cuentas.
 * Reemplazar INITIAL_MOCK_ACCOUNTS por fetch a Supabase cuando conectes la API.
 */

import type { Account, AccountType } from "@/lib/types";

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  BANK: "Banco",
  CASH: "Efectivo",
  DIGITAL_WALLET: "Billetera digital",
  SAVINGS: "Cuenta de ahorros",
};

const MOCK_USER_ID = "00000000-0000-0000-0000-000000000001";

export const INITIAL_MOCK_ACCOUNTS: Account[] = [
  {
    account_id: "1",
    account_name: "Nequi principal",
    user_id: MOCK_USER_ID,
    type: "DIGITAL_WALLET",
    institution: "Bancolombia",
    balance: 2_847_500,
    currency: "COP",
    is_active: true,
    created_at: "2026-01-10T08:00:00",
    updated_at: "2026-05-01T10:22:00",
  },
  {
    account_id: "2",
    account_name: "Ahorro viaje Europa",
    user_id: MOCK_USER_ID,
    type: "SAVINGS",
    institution: "Davivienda",
    balance: 8_200_000,
    currency: "COP",
    is_active: true,
    created_at: "2026-01-15T08:00:00",
    updated_at: "2026-04-28T09:00:00",
  },
  {
    account_id: "3",
    account_name: "Efectivo billetera",
    user_id: MOCK_USER_ID,
    type: "CASH",
    institution: null,
    balance: 180_000,
    currency: "COP",
    is_active: true,
    created_at: "2026-02-01T08:00:00",
    updated_at: "2026-04-30T18:40:00",
  },
  {
    account_id: "4",
    account_name: "Cuenta USD freelance",
    user_id: MOCK_USER_ID,
    type: "BANK",
    institution: "Wise",
    balance: 3_420,
    currency: "USD",
    is_active: true,
    created_at: "2026-02-10T08:00:00",
    updated_at: "2026-04-25T14:00:00",
  },
  {
    account_id: "5",
    account_name: "Daviplata (vieja)",
    user_id: MOCK_USER_ID,
    type: "DIGITAL_WALLET",
    institution: "Davivienda",
    balance: 0,
    currency: "COP",
    is_active: false,
    created_at: "2025-06-01T08:00:00",
    updated_at: "2025-11-02T12:00:00",
  },
];
