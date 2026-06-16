"use server";

import { Account } from "@/lib/types";
import {
  getAccountsByUser,
  saveAccount as saveAccountService,
} from "@/services/finance/accountService";



const fetchAccounts = async (userId: string): Promise<Account[]> => {
  try {
    const accounts = await getAccountsByUser(userId);
    return accounts;
  } catch (error) {
    return [];
  }
}




export const saveAccount = async (
  account: Account,
  userId: string,
): Promise<Account> => {
  return saveAccountService(account, userId);
};