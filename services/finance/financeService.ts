import {
  Account,
  FinanceCategory,
  FinanceTransaction,
  Obligation,
  QuickExpenseTemplate,
  QuickExpenseType,
  SavingsGoal,
} from "@/lib/types";
import { accountRepository } from "@/lib/supabase/repository/finance/accountRepository";
import { categoryRepository } from "@/lib/supabase/repository/finance/categoryRepository";
import { obligationRepository } from "@/lib/supabase/repository/finance/obligationRepository";
import {
  advanceObligationDueDate,
  buildObligationPaymentDescription,
  encodeObligationDescription,
  parseObligationDescription,
} from "@/lib/finance/obligationMeta";
import { bogotaDateToYMD, bogotaTodayYMD } from "@/lib/dates/bogota";
import { quickExpenseRepository } from "@/lib/supabase/repository/finance/quickExpenseRepository";
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

export async function getAccountById(userId: string, accountId: string): Promise<Account> {
  return accountRepository.getOne(userId, accountId);
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
  const created = await accountRepository.saveAccount(userId, payload);

  // Seed data: crea una transacción de prueba asociada a la cuenta nueva.
  // Usamos un ingreso pequeño (1) como dato ficticio para facilitar pruebas.
  try {
    await createTransaction(userId, {
      account_id: Number(created.account_id),
      amount: 1,
      title: "Prueba (seed)",
      description: "Registro de prueba generado automáticamente.",
      type: "income",
    });
  } catch {
    // No bloquear la creación de la cuenta si la semilla falla.
  }

  return created;
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
  const current = await accountRepository.getOne(userId, accountId);
  // Protege la cuenta de efectivo del renombre o desactivación.
  if (current.type === "CASH") {
    if (payload.account_name && payload.account_name.trim().toLowerCase() !== current.account_name.trim().toLowerCase()) {
      throw new Error("La cuenta de efectivo no se puede renombrar.");
    }
    if (payload.is_active === false) {
      throw new Error("La cuenta de efectivo no se puede desactivar.");
    }
  }
  return accountRepository.updateAccount(userId, accountId, payload);
}

export async function deactivateAccount(userId: string, accountId: string) {
  const current = await accountRepository.getOne(userId, accountId);
  if (current.type === "CASH") {
    throw new Error("La cuenta de efectivo no se puede desactivar.");
  }
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

export async function getTransactionsByAccount(
  userId: string,
  accountId: string,
): Promise<FinanceTransaction[]> {
  return transactionRepository.getByAccount(userId, accountId);
}

export async function getOrCreateCashAccount(userId: string): Promise<Account> {
  const accounts = await accountRepository.getAccountsByUser(userId, true);
  const found = accounts.find((a) => a.type === "CASH" && a.account_name.toLowerCase().includes("efectivo"));
  if (found) return found;

  // Crear cuenta de efectivo por defecto
  const created = await accountRepository.saveAccount(userId, {
    account_name: "Efectivo",
    type: "CASH",
    institution: null,
    balance: 0,
    currency: "COP",
  });

  // No bloquear si la semilla falla
  try {
    await createTransaction(userId, {
      account_id: Number(created.account_id),
      amount: 1,
      title: "Prueba (seed) - efectivo",
      description: "Cuenta de efectivo creada automáticamente.",
      type: "income",
    });
  } catch {}

  return created;
}

export async function registerWithdrawal(
  userId: string,
  sourceAccountId: string | number,
  amount: number,
  note?: string,
) {
  if (amount <= 0) throw new Error("El monto debe ser mayor a cero.");
  const cash = await getOrCreateCashAccount(userId);

  // Crear transferencia: origen -> Efectivo
  const tx = await createTransaction(userId, {
    account_id: Number(sourceAccountId),
    to_account_id: Number(cash.account_id),
    amount,
    title: `Retiro: ${cash.account_name}`,
    description: note?.trim() || "Retiro a efectivo",
    type: "transfer",
  });

  return tx;
}

// ── Reports helpers ───────────────────────────────────────────────────────────
export async function getCashflowReport(userId: string, months = 12) {
  const txs = await transactionRepository.getByUser(userId);

  // build month buckets (YYYY-MM) for last `months` months
  const [year, month] = bogotaTodayYMD().split("-").map(Number);
  const monthsArr: string[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(year, month - 1 - i, 1, 17));
    monthsArr.push(bogotaDateToYMD(d).slice(0, 7));
  }

  const incomeSeries = Array(monthsArr.length).fill(0);
  const expenseSeries = Array(monthsArr.length).fill(0);

  for (const tx of txs) {
    const m = tx.transaction_date.slice(0, 7); // YYYY-MM
    const idx = monthsArr.indexOf(m);
    if (idx === -1) continue;
    const amt = Number(tx.amount ?? 0);
    if (tx.type === "income") incomeSeries[idx] += amt;
    else if (tx.type === "expense") expenseSeries[idx] += amt;
    else if (tx.type === "transfer") {
      // transfers: consider outflows from source as expense and inflows to dest as income
      // For cashflow summary we ignore transfers (they net out) to reflect real inflows/outflows.
    }
  }

  return {
    months: monthsArr,
    income: incomeSeries,
    expense: expenseSeries,
  };
}

export async function getCategoryBreakdown(userId: string, months = 6) {
  const txs = await transactionRepository.getByUser(userId);
  const [year, month] = bogotaTodayYMD().split("-").map(Number);
  const cutoffDate = bogotaDateToYMD(
    new Date(Date.UTC(year, month - months, 1, 17)),
  );

  const totals = new Map<string, number>();
  const nameMap = new Map<string, string>();

  for (const tx of txs) {
    if (tx.transaction_date.slice(0, 10) < cutoffDate) continue;
    if (tx.type !== "expense") continue;
    const catId = String(tx.category_id ?? "uncategorized");
    const amt = Number(tx.amount ?? 0);
    totals.set(catId, (totals.get(catId) ?? 0) + amt);
    // try to preserve category name when available (caller can enrich)
    nameMap.set(catId, catId);
  }

  const result = Array.from(totals.entries()).map(([k, v]) => ({
    category_id: k,
    value: v,
    name: nameMap.get(k) ?? k,
  }));
  // sort desc
  result.sort((a, b) => b.value - a.value);
  return result;
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
    status?: "pending" | "completed" | "cancelled";
    to_account_id?: number | null;
    quick_expense_template_id?: string | null;
  },
) {
  if (payload.amount <= 0) {
    throw new Error("El monto debe ser mayor a cero.");
  }
  if (payload.type === "transfer" && !payload.to_account_id) {
    throw new Error("Debes seleccionar cuenta destino para transferencias.");
  }
  if (payload.type === "transfer" && payload.account_id === payload.to_account_id) {
    throw new Error("La cuenta origen y destino deben ser diferentes.");
  }

  const accounts = await accountRepository.getAccountsByUser(userId, true);
  const source = accounts.find(
    (account) => String(account.account_id) === String(payload.account_id),
  );

  if (!source) {
    throw new Error("La cuenta seleccionada no existe o está inactiva.");
  }

  if (
    (payload.type === "expense" || payload.type === "transfer") &&
    Number(source.balance ?? 0) < payload.amount
  ) {
    throw new Error("No tienes saldo suficiente para realizar esta operación.");
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

type TransactionSavePayload = {
  category_id?: number | null;
  account_id: number;
  amount: number;
  title: string;
  description?: string;
  type: FinanceTransaction["type"];
  transaction_date?: string;
  status?: "pending" | "completed" | "cancelled";
  to_account_id?: number | null;
  quick_expense_template_id?: string | null;
};

function applyVirtualDelta(
  balances: Map<string, number>,
  accountId: string | number | null | undefined,
  delta: number,
) {
  if (accountId == null) return;
  const key = String(accountId);
  balances.set(key, (balances.get(key) ?? 0) + delta);
}

function reverseTransactionEffect(
  balances: Map<string, number>,
  tx: FinanceTransaction,
) {
  const amount = Number(tx.amount ?? 0);
  if (tx.type === "income") applyVirtualDelta(balances, tx.account_id, -amount);
  if (tx.type === "expense") applyVirtualDelta(balances, tx.account_id, amount);
  if (tx.type === "transfer") {
    applyVirtualDelta(balances, tx.account_id, amount);
    applyVirtualDelta(balances, tx.to_account_id, -amount);
  }
}

function applyTransactionEffect(
  balances: Map<string, number>,
  payload: TransactionSavePayload,
) {
  if (payload.type === "income") {
    applyVirtualDelta(balances, payload.account_id, payload.amount);
  }
  if (payload.type === "expense") {
    applyVirtualDelta(balances, payload.account_id, -payload.amount);
  }
  if (payload.type === "transfer") {
    applyVirtualDelta(balances, payload.account_id, -payload.amount);
    applyVirtualDelta(balances, payload.to_account_id, payload.amount);
  }
}

export async function updateTransaction(
  userId: string,
  transactionId: number,
  payload: TransactionSavePayload,
) {
  if (payload.amount <= 0) {
    throw new Error("El monto debe ser mayor a cero.");
  }
  if (payload.type === "transfer" && !payload.to_account_id) {
    throw new Error("Debes seleccionar cuenta destino para transferencias.");
  }
  if (payload.type === "transfer" && payload.account_id === payload.to_account_id) {
    throw new Error("La cuenta origen y destino deben ser diferentes.");
  }

  const [oldTx, accounts] = await Promise.all([
    transactionRepository.getOne(userId, transactionId),
    accountRepository.getAccountsByUser(userId, true),
  ]);

  const balances = new Map(
    accounts.map((account) => [String(account.account_id), Number(account.balance ?? 0)]),
  );
  reverseTransactionEffect(balances, oldTx);
  applyTransactionEffect(balances, payload);

  if ([...balances.values()].some((balance) => balance < 0)) {
    throw new Error("No tienes saldo suficiente para realizar esta operación.");
  }

  if (oldTx.type === "income") {
    await accountRepository.applyBalanceDelta(userId, String(oldTx.account_id), -Number(oldTx.amount ?? 0));
  }
  if (oldTx.type === "expense") {
    await accountRepository.applyBalanceDelta(userId, String(oldTx.account_id), Number(oldTx.amount ?? 0));
  }
  if (oldTx.type === "transfer" && oldTx.to_account_id) {
    await accountRepository.applyBalanceDelta(userId, String(oldTx.account_id), Number(oldTx.amount ?? 0));
    await accountRepository.applyBalanceDelta(userId, String(oldTx.to_account_id), -Number(oldTx.amount ?? 0));
  }

  const updated = await transactionRepository.update(userId, transactionId, payload);

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

  return updated;
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
  if (!payload.title.trim()) {
    throw new Error("El nombre de la obligación es obligatorio.");
  }
  if (payload.amount <= 0) {
    throw new Error("El monto debe ser mayor a cero.");
  }
  return obligationRepository.create(userId, payload);
}

export async function updateObligation(
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
  if (payload.amount != null && payload.amount <= 0) {
    throw new Error("El monto debe ser mayor a cero.");
  }
  return obligationRepository.update(userId, obligationId, payload);
}

export async function deleteObligation(userId: string, obligationId: number) {
  // Solo elimina el registro de la deuda.
  // No revierte transacciones ni saldos de pagos ya registrados.
  await obligationRepository.remove(userId, obligationId);
}

export async function updateObligationStatus(
  userId: string,
  obligationId: number,
  status: Obligation["status"],
) {
  if (!["active", "paid", "paused"].includes(status)) {
    throw new Error("Estado de deuda no válido.");
  }

  const current = await obligationRepository.getOne(userId, obligationId);
  if (current.status === status) {
    return current;
  }

  // No reactivar/pausar una deuda pagada sin pasar por el flujo de pago.
  if (current.status === "paid" && status === "paused") {
    throw new Error("Una deuda pagada no se puede pausar.");
  }

  return obligationRepository.updateStatus(userId, obligationId, status);
}

export async function registerObligationPayment(
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
  if (payload.amount <= 0) {
    throw new Error("El monto del pago debe ser mayor a cero.");
  }
  if (!payload.account_id) {
    throw new Error("Debes seleccionar la cuenta de origen del pago.");
  }

  const obligation = await obligationRepository.getOne(userId, obligationId);
  const { notes, meta } = parseObligationDescription(obligation.description);
  const total = Math.max(1, Number(meta.totalInstallments ?? 1));
  const currentPaid = Math.max(0, Number(meta.paidInstallments ?? 0));

  let nextPaid = currentPaid + 1;
  if (payload.mark_as_paid) {
    nextPaid = total;
  } else if (payload.installment_number != null) {
    if (payload.installment_number < 1 || payload.installment_number > total) {
      throw new Error(`El número de cuota debe estar entre 1 y ${total}.`);
    }
    nextPaid = Math.max(currentPaid, payload.installment_number);
  }

  const installmentLabel = payload.mark_as_paid
    ? " (pago final)"
    : payload.installment_number != null
      ? ` (cuota ${payload.installment_number}/${total})`
      : total > 1
        ? ` (cuota ${nextPaid}/${total})`
        : "";

  await createTransaction(userId, {
    account_id: payload.account_id,
    amount: payload.amount,
    title: `Pago deuda: ${obligation.title}${installmentLabel}`,
    description: buildObligationPaymentDescription(
      obligationId,
      payload.mark_as_paid ? total : payload.installment_number ?? nextPaid,
      payload.note,
    ),
    type: "expense",
    category_id: obligation.category_id ?? null,
  });

  const nextStatus: Obligation["status"] =
    payload.mark_as_paid || nextPaid >= total ? "paid" : "active";
  const nextDueDate =
    nextStatus === "paid"
      ? obligation.next_due_date
      : advanceObligationDueDate(obligation.frequency, obligation.next_due_date);

  return obligationRepository.update(userId, obligationId, {
    description: encodeObligationDescription(notes, {
      totalInstallments: total,
      paidInstallments: nextPaid,
      totalDebt: meta.totalDebt,
    }),
    status: nextStatus,
    next_due_date: nextDueDate,
  });
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
    account_id: number;
  },
) {
  if (!payload.title.trim()) {
    throw new Error("El nombre de la meta es obligatorio.");
  }
  if (payload.target_amount <= 0) {
    throw new Error("La meta objetivo debe ser mayor a cero.");
  }
  if (!payload.account_id) {
    throw new Error("Debes seleccionar una cuenta destino para la meta.");
  }

  const accounts = await accountRepository.getAccountsByUser(userId, true);
  if (!accounts.some((account) => String(account.account_id) === String(payload.account_id))) {
    throw new Error("La cuenta destino no existe o está inactiva.");
  }

  return savingsGoalRepository.create(userId, payload);
}

export async function updateSavingsGoal(
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
  if (payload.title !== undefined && !payload.title.trim()) {
    throw new Error("El nombre de la meta es obligatorio.");
  }
  if (payload.target_amount !== undefined && payload.target_amount <= 0) {
    throw new Error("La meta objetivo debe ser mayor a cero.");
  }
  if (payload.account_id != null) {
    const accounts = await accountRepository.getAccountsByUser(userId, true);
    if (!accounts.some((account) => String(account.account_id) === String(payload.account_id))) {
      throw new Error("La cuenta destino no existe o está inactiva.");
    }
  }

  const updated = await savingsGoalRepository.update(userId, goalId, payload);
  const saved = Number(updated.saved_amount ?? 0);
  const target = Number(updated.target_amount ?? 0);

  if (updated.status !== "paused") {
    const nextStatus = saved >= target ? "completed" : "active";
    if (nextStatus !== updated.status) {
      return savingsGoalRepository.update(userId, goalId, { status: nextStatus });
    }
  }

  return updated;
}

export async function deleteSavingsGoal(userId: string, goalId: number) {
  // Solo elimina el seguimiento de la meta.
  // No revierte saldos ni borra transacciones (el dinero ya se movió).
  await savingsGoalRepository.remove(userId, goalId);
}

const SAVINGS_META_PREFIX = "[[HATRACK_SAVINGS_META]]";

function buildSavingsTransactionDescription(goalId: number, note?: string) {
  const meta = `${SAVINGS_META_PREFIX}${JSON.stringify({ saving_goal_id: goalId })}`;
  const clean = note?.trim();
  return clean ? `${clean}\n${meta}` : meta;
}

export async function addSavingsContribution(
  userId: string,
  goalId: number,
  amount: number,
  sourceAccountId: number,
  note?: string,
) {
  if (amount <= 0) {
    throw new Error("El aporte debe ser mayor a cero.");
  }
  if (!sourceAccountId) {
    throw new Error("Debes seleccionar la cuenta de origen del aporte.");
  }

  const goal = await savingsGoalRepository.getOne(userId, goalId);
  if (!goal.account_id) {
    throw new Error("Esta meta no tiene cuenta destino. Edítala y asígnale una.");
  }

  const destinationAccountId = Number(goal.account_id);

  if (String(destinationAccountId) === String(sourceAccountId)) {
    throw new Error(
      "La cuenta de origen no puede ser la misma cuenta destino de la meta.",
    );
  }

  const transaction = await createTransaction(userId, {
    account_id: sourceAccountId,
    to_account_id: destinationAccountId,
    amount,
    title: `Aporte: ${goal.title}`,
    description: buildSavingsTransactionDescription(goalId, note),
    type: "transfer",
  });

  return savingsGoalRepository.addContribution(
    userId,
    goalId,
    amount,
    sourceAccountId,
    note,
    transaction.id_transaction,
  );
}

export async function getQuickExpenseTemplatesByUser(
  userId: string,
  activeOnly = true,
): Promise<QuickExpenseTemplate[]> {
  return quickExpenseRepository.getByUser(userId, activeOnly);
}

export async function createQuickExpenseTemplate(
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
  if (!payload.label.trim()) {
    throw new Error("El nombre del gasto fijo es obligatorio.");
  }
  if (payload.default_amount <= 0) {
    throw new Error("El monto predeterminado debe ser mayor a cero.");
  }

  const accounts = await accountRepository.getAccountsByUser(userId, true);
  if (!accounts.some((account) => String(account.account_id) === String(payload.account_id))) {
    throw new Error("La cuenta seleccionada no existe o está inactiva.");
  }

  return quickExpenseRepository.create(userId, payload);
}

export async function updateQuickExpenseTemplate(
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
  if (payload.label !== undefined && !payload.label.trim()) {
    throw new Error("El nombre del gasto fijo es obligatorio.");
  }
  if (payload.default_amount !== undefined && payload.default_amount <= 0) {
    throw new Error("El monto predeterminado debe ser mayor a cero.");
  }

  if (payload.account_id) {
    const accounts = await accountRepository.getAccountsByUser(userId, true);
    if (!accounts.some((account) => String(account.account_id) === String(payload.account_id))) {
      throw new Error("La cuenta seleccionada no existe o está inactiva.");
    }
  }

  return quickExpenseRepository.update(userId, templateId, payload);
}

export async function deleteQuickExpenseTemplate(userId: string, templateId: string) {
  await quickExpenseRepository.remove(userId, templateId);
}

export async function registerQuickExpense(
  userId: string,
  templateId: string,
  amountOverride?: number,
  transactionDate?: string,
) {
  const template = await quickExpenseRepository.getOne(userId, templateId);
  if (!template.is_active) {
    throw new Error("Este gasto fijo ya no está activo.");
  }

  const amount = amountOverride ?? Number(template.default_amount);
  if (amount <= 0) {
    throw new Error("El monto debe ser mayor a cero.");
  }

  const transaction = await createTransaction(userId, {
    category_id: template.category_id ?? null,
    account_id: Number(template.account_id),
    amount,
    title: template.label,
    type: template.type,
    quick_expense_template_id: template.id,
    ...(transactionDate ? { transaction_date: transactionDate } : {}),
  });

  await quickExpenseRepository.recordUsage(userId, templateId);
  return transaction;
}
