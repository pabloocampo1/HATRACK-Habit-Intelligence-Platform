import { createClient } from "@/lib/supabase/config/server";
import { FinanceTransaction } from "@/lib/types";

type SaveTransactionPayload = {
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

export const transactionRepository = {
  async getOne(userId: string, transactionId: number): Promise<FinanceTransaction> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("id_transaction", transactionId)
      .eq("user_id", userId)
      .single();
    if (error) throw error;
    return data as FinanceTransaction;
  },

  async getByUser(userId: string): Promise<FinanceTransaction[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("transaction_date", { ascending: false });
    if (error) throw error;
    return (data ?? []) as FinanceTransaction[];
  },

  async getByAccount(userId: string, accountId: string | number): Promise<FinanceTransaction[]> {
    const supabase = await createClient();
    const id = String(accountId);
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .or(`account_id.eq.${id},to_account_id.eq.${id}`)
      .order("transaction_date", { ascending: false });
    if (error) throw error;
    return (data ?? []) as FinanceTransaction[];
  },

  async create(userId: string, payload: SaveTransactionPayload): Promise<FinanceTransaction> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("transactions")
      .insert({
        user_id: userId,
        category_id: payload.category_id ?? null,
        account_id: payload.account_id,
        amount: payload.amount,
        title: payload.title,
        description: payload.description ?? null,
        type: payload.type,
        transaction_date: payload.transaction_date ?? new Date().toISOString(),
        status: payload.status ?? "completed",
        to_account_id: payload.to_account_id ?? null,
        quick_expense_template_id: payload.quick_expense_template_id ?? null,
      })
      .select("*")
      .single();
    if (error) throw error;
    return data as FinanceTransaction;
  },

  async update(
    userId: string,
    transactionId: number,
    payload: SaveTransactionPayload,
  ): Promise<FinanceTransaction> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("transactions")
      .update({
        category_id: payload.category_id ?? null,
        account_id: payload.account_id,
        amount: payload.amount,
        title: payload.title,
        description: payload.description ?? null,
        type: payload.type,
        transaction_date: payload.transaction_date ?? new Date().toISOString(),
        status: payload.status ?? "completed",
        to_account_id: payload.to_account_id ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id_transaction", transactionId)
      .eq("user_id", userId)
      .select("*")
      .single();
    if (error) throw error;
    return data as FinanceTransaction;
  },

  async remove(userId: string, transactionId: number): Promise<FinanceTransaction> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("transactions")
      .delete()
      .eq("id_transaction", transactionId)
      .eq("user_id", userId)
      .select("*")
      .single();
    if (error) throw error;
    return data as FinanceTransaction;
  },
};
