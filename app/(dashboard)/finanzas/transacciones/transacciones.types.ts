export type TransactionCurrency = "COP" | "USD";

export type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER";

export type PeriodFilter = "month" | "7d" | "all";

export type CategoryTone = "emerald" | "amber" | "violet" | "sky" | "rose" | "slate";

export type CategoryRow = {
  id: string;
  name: string;
  tone: CategoryTone;
};

export type TransactionRow = {
  id: string;
  at: string;
  type: TransactionType;
  description: string;
  amount: number;
  currency: TransactionCurrency;
  categoryId: string;
  accountName: string;
  /** Solo transferencias: cuenta destino */
  toAccountName?: string;
};
