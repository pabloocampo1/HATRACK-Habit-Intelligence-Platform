"use server";

import {
  addSavingsContribution,
  createAccount,
  createCategory,
  createObligation,
  createSavingsGoal,
  createTransaction,
  deactivateAccount,
  deleteCategory,
  deleteTransaction,
  getAccountsByUser,
  getCategoriesByUser,
  getFinanceDashboardData,
  getObligationsByUser,
  getSavingsGoalsByUser,
  getTransactionsByUser,
  reactivateAccount,
  updateAccount,
  updateObligationStatus,
} from "@/services/finance/financeService";
import { Account, FinanceCategory, Obligation } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function getFinanceOverviewAction(userId: string) {
  return getFinanceDashboardData(userId);
}

export async function getFinanceAccountsAction(userId: string, activeOnly = false) {
  return getAccountsByUser(userId, activeOnly);
}

export async function updateFinanceAccountAction(
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
  const updated = await updateAccount(userId, accountId, payload);
  revalidatePath("/finanzas/cuentas");
  revalidatePath("/finanzas/reportes");
  return updated;
}

export async function reactivateFinanceAccountAction(userId: string, accountId: string) {
  await reactivateAccount(userId, accountId);
  revalidatePath("/finanzas/cuentas");
}

export async function deactivateFinanceAccountAction(userId: string, accountId: string) {
  await deactivateAccount(userId, accountId);
  revalidatePath("/finanzas/cuentas");
  revalidatePath("/finanzas/reportes");
}

export async function getCategoriesAction(userId: string) {
  return getCategoriesByUser(userId);
}

export async function createCategoryAction(
  userId: string,
  payload: {
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    kind?: FinanceCategory["kind"];
  },
) {
  const created = await createCategory(userId, payload);
  revalidatePath("/finanzas/categorias");
  revalidatePath("/finanzas/transacciones");
  return created;
}

export async function deleteCategoryAction(userId: string, categoryId: number) {
  await deleteCategory(userId, categoryId);
  revalidatePath("/finanzas/categorias");
  revalidatePath("/finanzas/transacciones");
}

export async function getTransactionsAction(userId: string) {
  return getTransactionsByUser(userId);
}

export async function createTransactionAction(
  userId: string,
  payload: {
    category_id?: number | null;
    account_id: number;
    amount: number;
    title: string;
    description?: string;
    type: "income" | "expense" | "transfer";
    transaction_date?: string;
    to_account_id?: number | null;
  },
) {
  const created = await createTransaction(userId, payload);
  revalidatePath("/finanzas/transacciones");
  revalidatePath("/finanzas/cuentas");
  revalidatePath("/finanzas/reportes");
  return created;
}

export async function deleteTransactionAction(userId: string, transactionId: number) {
  await deleteTransaction(userId, transactionId);
  revalidatePath("/finanzas/transacciones");
  revalidatePath("/finanzas/reportes");
}

export async function getObligationsAction(userId: string) {
  return getObligationsByUser(userId);
}

export async function createObligationAction(
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
  const created = await createObligation(userId, payload);
  revalidatePath("/finanzas/obligaciones");
  return created;
}

export async function updateObligationStatusAction(
  userId: string,
  obligationId: number,
  status: Obligation["status"],
) {
  const updated = await updateObligationStatus(userId, obligationId, status);
  revalidatePath("/finanzas/obligaciones");
  return updated;
}

export async function getSavingsGoalsAction(userId: string) {
  return getSavingsGoalsByUser(userId);
}

export async function createSavingsGoalAction(
  userId: string,
  payload: {
    title: string;
    description?: string;
    target_amount: number;
    target_date?: string;
  },
) {
  const created = await createSavingsGoal(userId, payload);
  revalidatePath("/finanzas/metas");
  revalidatePath("/finanzas/reportes");
  return created;
}

export async function addSavingsContributionAction(
  userId: string,
  goalId: number,
  amount: number,
  accountId?: number,
  note?: string,
) {
  const contribution = await addSavingsContribution(userId, goalId, amount, accountId, note);
  revalidatePath("/finanzas/metas");
  revalidatePath("/finanzas/cuentas");
  revalidatePath("/finanzas/reportes");
  return contribution;
}

export async function createAccountAction(
  userId: string,
  payload: {
    account_name: string;
    type: Account["type"];
    institution?: string;
    balance?: number;
    currency?: Account["currency"];
  },
) {
  const account = await createAccount(userId, payload);
  revalidatePath("/finanzas/cuentas");
  return account;
}
