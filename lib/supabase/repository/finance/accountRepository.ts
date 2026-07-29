import { createClient } from "@/lib/supabase/config/server";
import { Account } from "@/lib/types";

export type SaveAccountPayload = {
  account_name: string;
  type: Account["type"];
  institution?: string | null;
  balance?: number;
  currency?: Account["currency"];
  is_active?: boolean;
};

export const accountRepository = {
  async getAccountsByUser(userId: string, activeOnly = false): Promise<Account[]> {
    const supabase = await createClient();
    let query = supabase
      .from("accounts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (activeOnly) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data ?? []) as Account[];
  },

  async getOne(userId: string, accountId: string): Promise<Account> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .eq("account_id", accountId)
      .eq("user_id", userId)
      .single();
    if (error) throw error;
    return data as Account;
  },

  async saveAccount(userId: string, payload: SaveAccountPayload): Promise<Account> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("accounts")
      .insert({
        user_id: userId,
        account_name: payload.account_name,
        type: payload.type,
        institution: payload.institution ?? null,
        balance: payload.balance ?? 0,
        currency: payload.currency ?? "COP",
      })
      .select("*")
      .single();

    if (error) throw error;
    return data as Account;
  },

  async updateAccount(
    userId: string,
    accountId: string,
    payload: Partial<SaveAccountPayload>,
  ): Promise<Account> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("accounts")
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq("account_id", accountId)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) throw error;
    return data as Account;
  },

  async setAccountActive(
    userId: string,
    accountId: string,
    isActive: boolean,
  ): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from("accounts")
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq("account_id", accountId)
      .eq("user_id", userId);

    if (error) throw error;
  },

  async deactivateAccount(userId: string, accountId: string): Promise<void> {
    await accountRepository.setAccountActive(userId, accountId, false);
  },

  async reactivateAccount(userId: string, accountId: string): Promise<void> {
    await accountRepository.setAccountActive(userId, accountId, true);
  },

  async applyBalanceDelta(userId: string, accountId: string, delta: number): Promise<void> {
    const supabase = await createClient();
    const { data: account, error: getError } = await supabase
      .from("accounts")
      .select("balance")
      .eq("account_id", accountId)
      .eq("user_id", userId)
      .single();

    if (getError) throw getError;

    const currentBalance = Number(account.balance ?? 0);
    const nextBalance = currentBalance + delta;

    if (nextBalance < 0) {
      throw new Error("Saldo insuficiente para completar la operación.");
    }

    const { error: updateError } = await supabase
      .from("accounts")
      .update({
        balance: nextBalance,
        updated_at: new Date().toISOString(),
      })
      .eq("account_id", accountId)
      .eq("user_id", userId);

    if (updateError) throw updateError;
  },
};