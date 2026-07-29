"use server";

import {
  addSavingsContribution,
  createAccount,
  createCategory,
  createObligation,
  createSavingsGoal,
  createTransaction,
  createQuickExpenseTemplate,
  deactivateAccount,
  deleteCategory,
  deleteObligation,
  deleteQuickExpenseTemplate,
  deleteSavingsGoal,
  deleteTransaction,
  getAccountsByUser,
  getAccountById,
  getCategoriesByUser,
  getFinanceDashboardData,
  getObligationsByUser,
  getQuickExpenseTemplatesByUser,
  getSavingsGoalsByUser,
  getTransactionsByUser,
  getTransactionsByAccount,
  reactivateAccount,
  registerObligationPayment,
  registerQuickExpense,
  registerWithdrawal,
  updateAccount,
  updateObligation,
  updateObligationStatus,
  updateQuickExpenseTemplate,
  updateSavingsGoal,
  updateTransaction,
} from "@/services/finance/financeService";
import { Account, FinanceCategory, Obligation, QuickExpenseTemplate, QuickExpenseType, SavingsGoal } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function getFinanceOverviewAction(userId: string) {
  return getFinanceDashboardData(userId);
}

export async function getFinanceAccountsAction(userId: string, activeOnly = false) {
  return getAccountsByUser(userId, activeOnly);
}

export async function getFinanceAccountAction(userId: string, accountId: string) {
  return getAccountById(userId, accountId);
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

export async function getTransactionsByAccountAction(userId: string, accountId: string) {
  return getTransactionsByAccount(userId, accountId);
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
    status?: "pending" | "completed" | "cancelled";
    to_account_id?: number | null;
  },
) {
  const created = await createTransaction(userId, payload);
  revalidatePath("/finanzas/transacciones");
  revalidatePath("/finanzas/cuentas");
  revalidatePath("/finanzas/reportes");
  return created;
}

export async function updateTransactionAction(
  userId: string,
  transactionId: number,
  payload: {
    category_id?: number | null;
    account_id: number;
    amount: number;
    title: string;
    description?: string;
    type: "income" | "expense" | "transfer";
    transaction_date?: string;
    status?: "pending" | "completed" | "cancelled";
    to_account_id?: number | null;
  },
) {
  const updated = await updateTransaction(userId, transactionId, payload);
  revalidatePath("/finanzas/transacciones");
  revalidatePath("/finanzas/cuentas");
  revalidatePath("/finanzas/reportes");
  return updated;
}

export async function deleteTransactionAction(userId: string, transactionId: number) {
  await deleteTransaction(userId, transactionId);
  revalidatePath("/finanzas/transacciones");
  revalidatePath("/finanzas/cuentas");
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
  revalidatePath("/finanzas/deudas");
  revalidatePath("/finanzas/obligaciones");
  return created;
}

export async function updateObligationAction(
  userId: string,
  obligationId: number,
  payload: {
    title?: string;
    description?: string;
    amount?: number;
    frequency?: Obligation["frequency"];
    next_due_date?: string;
    status?: Obligation["status"];
  },
) {
  const updated = await updateObligation(userId, obligationId, payload);
  revalidatePath("/finanzas/deudas");
  revalidatePath("/finanzas/obligaciones");
  return updated;
}

export async function updateObligationStatusAction(
  userId: string,
  obligationId: number,
  status: Obligation["status"],
) {
  const updated = await updateObligationStatus(userId, obligationId, status);
  revalidatePath("/finanzas/deudas");
  revalidatePath("/finanzas/obligaciones");
  revalidatePath("/finanzas/reportes");
  return updated;
}

export async function deleteObligationAction(userId: string, obligationId: number) {
  await deleteObligation(userId, obligationId);
  revalidatePath("/finanzas/deudas");
  revalidatePath("/finanzas/obligaciones");
  revalidatePath("/finanzas/reportes");
}

export async function registerObligationPaymentAction(
  userId: string,
  obligationId: number,
  payload: {
    amount: number;
    account_id: number;
    installment_number?: number;
    note?: string;
    mark_as_paid?: boolean;
  },
) {
  const updated = await registerObligationPayment(userId, obligationId, payload);
  revalidatePath("/finanzas/deudas");
  revalidatePath("/finanzas/deudas");
  revalidatePath("/finanzas/obligaciones");
  revalidatePath("/finanzas/transacciones");
  revalidatePath("/finanzas/cuentas");
  revalidatePath("/finanzas/reportes");
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
    account_id: number;
  },
) {
  const created = await createSavingsGoal(userId, payload);
  revalidatePath("/finanzas/metas");
  revalidatePath("/finanzas/reportes");
  return created;
}

export async function updateSavingsGoalAction(
  userId: string,
  goalId: number,
  payload: {
    title?: string;
    description?: string;
    target_amount?: number;
    target_date?: string | null;
    account_id?: number;
    status?: SavingsGoal["status"];
  },
) {
  const updated = await updateSavingsGoal(userId, goalId, payload);
  revalidatePath("/finanzas/metas");
  revalidatePath("/finanzas/reportes");
  return updated;
}

export async function deleteSavingsGoalAction(userId: string, goalId: number) {
  await deleteSavingsGoal(userId, goalId);
  revalidatePath("/finanzas/metas");
  revalidatePath("/finanzas/reportes");
}

export async function addSavingsContributionAction(
  userId: string,
  goalId: number,
  amount: number,
  sourceAccountId: number,
  note?: string,
) {
  const contribution = await addSavingsContribution(
    userId,
    goalId,
    amount,
    sourceAccountId,
    note,
  );
  revalidatePath("/finanzas/metas");
  revalidatePath("/finanzas/cuentas");
  revalidatePath("/finanzas/transacciones");
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

export async function getQuickExpenseTemplatesAction(userId: string) {
  return getQuickExpenseTemplatesByUser(userId);
}

export async function createQuickExpenseTemplateAction(
  userId: string,
  payload: {
    label: string;
    icon?: string;
    default_amount: number;
    currency?: QuickExpenseTemplate["currency"];
    category_id?: number | null;
    account_id: string;
    type?: QuickExpenseType;
    sort_order?: number;
  },
) {
  const created = await createQuickExpenseTemplate(userId, payload);
  revalidatePath("/finanzas/gastos-fijos");
  revalidatePath("/finanzas/transacciones/fijos");
  revalidatePath("/finanzas/transacciones");
  return created;
}

export async function updateQuickExpenseTemplateAction(
  userId: string,
  templateId: string,
  payload: {
    label?: string;
    icon?: string;
    default_amount?: number;
    currency?: QuickExpenseTemplate["currency"];
    category_id?: number | null;
    account_id?: string;
    type?: QuickExpenseType;
    sort_order?: number;
    is_active?: boolean;
  },
) {
  const updated = await updateQuickExpenseTemplate(userId, templateId, payload);
  revalidatePath("/finanzas/gastos-fijos");
  revalidatePath("/finanzas/transacciones/fijos");
  revalidatePath("/finanzas/transacciones");
  return updated;
}

export async function deleteQuickExpenseTemplateAction(userId: string, templateId: string) {
  await deleteQuickExpenseTemplate(userId, templateId);
  revalidatePath("/finanzas/gastos-fijos");
  revalidatePath("/finanzas/transacciones/fijos");
  revalidatePath("/finanzas/transacciones");
}

export async function registerQuickExpenseAction(
  userId: string,
  templateId: string,
  amountOverride?: number,
  transactionDate?: string,
) {
  const transaction = await registerQuickExpense(
    userId,
    templateId,
    amountOverride,
    transactionDate,
  );
  revalidatePath("/finanzas/gastos-fijos");
  revalidatePath("/finanzas/transacciones/fijos");
  revalidatePath("/finanzas/transacciones");
  revalidatePath("/finanzas/cuentas");
  revalidatePath("/finanzas/reportes");
  return transaction;
}

export async function registerWithdrawalAction(
  userId: string,
  sourceAccountId: string | number,
  amount: number,
  note?: string,
) {
  const transaction = await registerWithdrawal(userId, sourceAccountId, amount, note);
  revalidatePath("/finanzas/transacciones");
  revalidatePath("/finanzas/cuentas");
  revalidatePath("/finanzas/reportes");
  return transaction;
}
