import { Account } from "@/lib/types";
import {
  createAccount as createFinanceAccount,
  getAccountsByUser as getFinanceAccountsByUser,
} from "./financeService";

export async function getAccountsByUser(userId: string): Promise<Account[]> {
  return getFinanceAccountsByUser(userId);
}

export async function saveAccount(account: Account, userId: string): Promise<Account> {
  return createFinanceAccount(userId, {
    account_name: account.account_name,
    type: account.type,
    institution: account.institution,
    balance: Number(account.balance ?? 0),
    currency: account.currency,
  });
}
