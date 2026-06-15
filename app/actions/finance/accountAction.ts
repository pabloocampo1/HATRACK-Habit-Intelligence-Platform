"use server";

import { Account } from "@/lib/types";
import { getAccountsByUser } from "@/services/finance/accountService";



const fetchAccounts = async (userId: string): Promise<Account[]> => {
  try {
    const accounts = await getAccountsByUser(userId);
    return accounts;
  } catch (error) {
    return [];
  }
}




const saveAccount = async (account: Account, userId: string): Promise<Account> => {
  try {
    const newAccount = await saveAccount(account, userId);
    return newAccount;
  } catch (error) {
    return null as unknown as Account; 
  }
}