import { accountRepository } from "@/lib/supabase/repository/finance/accountRepository";
import { Account } from "@/lib/types";

export async function getAccountsByUser(userId: string): Promise<Account[]> {
  return accountRepository.getAccountsByUser(userId);
}

export async function saveAccount(account: Account, userId: string): Promise<Account> {
  return accountRepository.saveAccount({ ...account, user_id: userId });
}
