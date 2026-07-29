import { createClient } from "@/lib/supabase/config/server";
import { Obligation } from "@/lib/types";

type SaveObligationPayload = {
  title: string;
  description?: string;
  amount: number;
  frequency: Obligation["frequency"];
  next_due_date: string;
  category_id?: number | null;
  account_id?: number | null;
};

export const obligationRepository = {
  async getByUser(userId: string): Promise<Obligation[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("obligations")
      .select("*")
      .eq("user_id", userId)
      .order("next_due_date", { ascending: true });
    if (error) throw error;
    return (data ?? []) as Obligation[];
  },

  async getOne(userId: string, obligationId: number): Promise<Obligation> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("obligations")
      .select("*")
      .eq("id_obligation", obligationId)
      .eq("user_id", userId)
      .single();
    if (error) throw error;
    return data as Obligation;
  },

  async create(userId: string, payload: SaveObligationPayload): Promise<Obligation> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("obligations")
      .insert({
        user_id: userId,
        title: payload.title,
        description: payload.description ?? null,
        amount: payload.amount,
        frequency: payload.frequency,
        next_due_date: payload.next_due_date,
        category_id: payload.category_id ?? null,
        account_id: payload.account_id ?? null,
        status: "active",
      })
      .select("*")
      .single();
    if (error) throw error;
    return data as Obligation;
  },

  async update(
    userId: string,
    obligationId: number,
    payload: Partial<SaveObligationPayload> & { status?: Obligation["status"] },
  ): Promise<Obligation> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("obligations")
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq("id_obligation", obligationId)
      .eq("user_id", userId)
      .select("*")
      .single();
    if (error) throw error;
    return data as Obligation;
  },

  async updateStatus(
    userId: string,
    obligationId: number,
    status: Obligation["status"],
  ): Promise<Obligation> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("obligations")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id_obligation", obligationId)
      .eq("user_id", userId)
      .select("*")
      .single();
    if (error) throw error;
    return data as Obligation;
  },

  async remove(userId: string, obligationId: number) {
    const supabase = await createClient();
    const { error } = await supabase
      .from("obligations")
      .delete()
      .eq("id_obligation", obligationId)
      .eq("user_id", userId);
    if (error) throw error;
  },
};
