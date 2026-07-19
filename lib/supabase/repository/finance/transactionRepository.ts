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
  to_account_id?: number | null;
};

export const transactionRepository = {
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
        status: "completed",
        to_account_id: payload.to_account_id ?? null,
      })
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
