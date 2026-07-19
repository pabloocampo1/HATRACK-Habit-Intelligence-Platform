import {
  Account,
  Budget,
  FinanceCategory,
  FinanceTransaction,
  Obligation,
  SavingsGoal,
} from "@/lib/types";
import { accountRepository } from "@/lib/supabase/repository/finance/accountRepository";
import { budgetRepository } from "@/lib/supabase/repository/finance/budgetRepository";
import { categoryRepository } from "@/lib/supabase/repository/finance/categoryRepository";
import { obligationRepository } from "@/lib/supabase/repository/finance/obligationRepository";
import { savingsGoalRepository } from "@/lib/supabase/repository/finance/savingsGoalRepository";
import { transactionRepository } from "@/lib/supabase/repository/finance/transactionRepository";

export async function getFinanceDashboardData(userId: string) {
  const [accounts, transactions, goals, obligations] = await Promise.all([
    accountRepository.getAccountsByUser(userId, true),
    transactionRepository.getByUser(userId),
    savingsGoalRepository.getByUser(userId),
    obligationRepository.getByUser(userId),
  ]);

  const balance = accounts.reduce((sum, account) => sum + Number(account.balance ?? 0), 0);
  const income = transactions
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + Number(tx.amount ?? 0), 0);
  const expense = transactions
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + Number(tx.amount ?? 0), 0);

  return {
    accounts,
    transactions,
    goals,
    obligations,
    metrics: {
      balance,
      income,
      expense,
      cashflow: income - expense,
      activeGoals: goals.filter((goal) => goal.status === "active").length,
      upcomingObligations: obligations.filter((item) => item.status === "active").length,
    },
  };
}

export async function getAccountsByUser(
  userId: string,
  activeOnly = false,
): Promise<Account[]> {
  return accountRepository.getAccountsByUser(userId, activeOnly);
}

export async function createAccount(
  userId: string,
  payload: {
    account_name: string;
    type: Account["type"];
    institution?: string;
    balance?: number;
    currency?: Account["currency"];
  },
) {
  return accountRepository.saveAccount(userId, payload);
}

export async function updateAccount(
  userId: string,
  accountId: string,
  payload: {
    account_name?: string;
    type?: Account["type"];
    institution?: string | null;
    balance?: number;
    currency?: Account["currency"];
    is_active?: boolean;
  },
) {
  return accountRepository.updateAccount(userId, accountId, payload);
}

export async function deactivateAccount(userId: string, accountId: string) {
  await accountRepository.deactivateAccount(userId, accountId);
}

export async function reactivateAccount(userId: string, accountId: string) {
  await accountRepository.reactivateAccount(userId, accountId);
}

export async function getCategoriesByUser(userId: string): Promise<FinanceCategory[]> {
  return categoryRepository.getByUser(userId);
}

export async function createCategory(
  userId: string,
  payload: {
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    kind?: FinanceCategory["kind"];
  },
) {
  if (!payload.name.trim()) {
    throw new Error("El nombre de la categoría es obligatorio.");
  }
  return categoryRepository.create(userId, payload);
}

export async function deleteCategory(userId: string, categoryId: number) {
  await categoryRepository.remove(userId, categoryId);
}

export async function getTransactionsByUser(userId: string): Promise<FinanceTransaction[]> {
  return transactionRepository.getByUser(userId);
}

export async function createTransaction(
  userId: string,
  payload: {
    category_id?: number | null;
    account_id: number;
    amount: number;
    title: string;
    description?: string;
    type: FinanceTransaction["type"];
    transaction_date?: string;
    to_account_id?: number | null;
  },
) {
  if (payload.amount <= 0) {
    throw new Error("El monto debe ser mayor a cero.");
  }
  if (payload.type === "transfer" && !payload.to_account_id) {
    throw new Error("Debes seleccionar cuenta destino para transferencias.");
  }

  const transaction = await transactionRepository.create(userId, payload);

  if (payload.type === "income") {
    await accountRepository.applyBalanceDelta(userId, String(payload.account_id), payload.amount);
  }
  if (payload.type === "expense") {
    await accountRepository.applyBalanceDelta(userId, String(payload.account_id), -payload.amount);
  }
  if (payload.type === "transfer") {
    await accountRepository.applyBalanceDelta(userId, String(payload.account_id), -payload.amount);
    await accountRepository.applyBalanceDelta(userId, String(payload.to_account_id), payload.amount);
  }

  return transaction;
}

export async function deleteTransaction(userId: string, transactionId: number) {
  const deleted = await transactionRepository.remove(userId, transactionId);
  const amount = Number(deleted.amount ?? 0);

  if (deleted.type === "income") {
    await accountRepository.applyBalanceDelta(userId, String(deleted.account_id), -amount);
  }
  if (deleted.type === "expense") {
    await accountRepository.applyBalanceDelta(userId, String(deleted.account_id), amount);
  }
  if (deleted.type === "transfer" && deleted.to_account_id) {
    await accountRepository.applyBalanceDelta(userId, String(deleted.account_id), amount);
    await accountRepository.applyBalanceDelta(userId, String(deleted.to_account_id), -amount);
  }
}

export async function getBudgetsByUser(userId: string): Promise<Budget[]> {
  return budgetRepository.getByUser(userId);
}

export async function createBudget(
  userId: string,
  payload: { category_id: number; month_date: string; limit_amount: number },
) {
  if (payload.limit_amount <= 0) {
    throw new Error("El límite del presupuesto debe ser mayor a cero.");
  }
  return budgetRepository.create(userId, payload);
}

export async function deleteBudget(userId: string, budgetId: number) {
  await budgetRepository.remove(userId, budgetId);
}

export async function getObligationsByUser(userId: string): Promise<Obligation[]> {
  return obligationRepository.getByUser(userId);
}

export async function createObligation(
  userId: string,
  payload: {
    title: string;
    description?: string;
    amount: number;
    frequency: Obligation["frequency"];
    next_due_date: string;
    category_id?: number | null;
    account_id?: number | null;
  },
) {
  return obligationRepository.create(userId, payload);
}

export async function updateObligationStatus(
  userId: string,
  obligationId: number,
  status: Obligation["status"],
) {
  return obligationRepository.updateStatus(userId, obligationId, status);
}

export async function getSavingsGoalsByUser(userId: string): Promise<SavingsGoal[]> {
  return savingsGoalRepository.getByUser(userId);
}

export async function createSavingsGoal(
  userId: string,
  payload: {
    title: string;
    description?: string;
    target_amount: number;
    target_date?: string;
  },
) {
  if (payload.target_amount <= 0) {
    throw new Error("La meta objetivo debe ser mayor a cero.");
  }
  return savingsGoalRepository.create(userId, payload);
}

export async function addSavingsContribution(
  userId: string,
  goalId: number,
  amount: number,
  accountId?: number,
  note?: string,
) {
  if (amount <= 0) {
    throw new Error("El aporte debe ser mayor a cero.");
  }
  if (accountId) {
    await accountRepository.applyBalanceDelta(userId, String(accountId), -amount);
  }
  return savingsGoalRepository.addContribution(userId, goalId, amount, accountId, note);
}
