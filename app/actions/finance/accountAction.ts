"use server";

import { Account } from "@/lib/types";
import {
  getAccountsByUser,
  saveAccount as saveAccountService,
} from "@/services/finance/accountService";
import { revalidatePath } from "next/cache";



export const fetchAccounts = async (userId: string): Promise<Account[]> => {
  try {
    const accounts = await getAccountsByUser(userId);
    return accounts;
  } catch {
    return [];
  }
};




export const saveAccount = async (
  account: Account,
  userId: string,
): Promise<Account> => {
  const created = await saveAccountService(account, userId);
  revalidatePath("/finanzas/cuentas");
  revalidatePath("/finanzas/reportes");
  return created;
};