import { createClient } from "@/lib/supabase/config/server";
import { AccountCurrency, QuickExpenseTemplate, QuickExpenseType } from "@/lib/types";

type SaveQuickExpensePayload = {
  label: string;
  icon?: string;
  default_amount: number;
  currency?: AccountCurrency;
  category_id?: number | null;
  account_id: string;
  type?: QuickExpenseType;
  sort_order?: number;
  is_active?: boolean;
};

type SupabaseErrorLike = {
  message?: string;
  code?: string;
  hint?: string;
  details?: string;
};

function throwDbError(error: SupabaseErrorLike): never {
  if (error.code === "42501") {
    throw new Error(
      "Permiso denegado en Supabase (RLS). Ejecuta scripts/quick_expense_templates.sql en el SQL Editor para crear la política y los grants.",
    );
  }
  if (
    error.code === "42P01" ||
    error.message?.includes("quick_expense_templates") ||
    error.message?.includes("schema cache")
  ) {
    throw new Error(
      "La tabla quick_expense_templates no existe. Ejecuta scripts/quick_expense_templates.sql en Supabase.",
    );
  }
  throw new Error(error.message ?? "Error de base de datos");
}

export const quickExpenseRepository = {
  async getByUser(userId: string, activeOnly = true): Promise<QuickExpenseTemplate[]> {
    const supabase = await createClient();
    let query = supabase
      .from("quick_expense_templates")
      .select("*")
      .eq("user_id", userId)
      .order("sort_order", { ascending: true })
      .order("usage_count", { ascending: false });

    if (activeOnly) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;
    if (error) throwDbError(error);
    return (data ?? []) as QuickExpenseTemplate[];
  },

  async getOne(userId: string, templateId: string): Promise<QuickExpenseTemplate> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("quick_expense_templates")
      .select("*")
      .eq("id", templateId)
      .eq("user_id", userId)
      .single();
    if (error) throwDbError(error);
    return data as QuickExpenseTemplate;
  },

  async create(userId: string, payload: SaveQuickExpensePayload): Promise<QuickExpenseTemplate> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("quick_expense_templates")
      .insert({
        user_id: userId,
        label: payload.label,
        icon: payload.icon ?? "wallet",
        default_amount: payload.default_amount,
        currency: payload.currency ?? "COP",
        category_id: payload.category_id ?? null,
        account_id: payload.account_id,
        type: payload.type ?? "expense",
        sort_order: payload.sort_order ?? 0,
        is_active: payload.is_active ?? true,
      })
      .select("*")
      .single();
    if (error) throwDbError(error);
    return data as QuickExpenseTemplate;
  },

  async update(
    userId: string,
    templateId: string,
    payload: Partial<SaveQuickExpensePayload>,
  ): Promise<QuickExpenseTemplate> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("quick_expense_templates")
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq("id", templateId)
      .eq("user_id", userId)
      .select("*")
      .single();
    if (error) throwDbError(error);
    return data as QuickExpenseTemplate;
  },

  async remove(userId: string, templateId: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from("quick_expense_templates")
      .delete()
      .eq("id", templateId)
      .eq("user_id", userId);
    if (error) throwDbError(error);
  },

  async recordUsage(userId: string, templateId: string): Promise<QuickExpenseTemplate> {
    const supabase = await createClient();
    const current = await this.getOne(userId, templateId);
    const { data, error } = await supabase
      .from("quick_expense_templates")
      .update({
        usage_count: current.usage_count + 1,
        last_used_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", templateId)
      .eq("user_id", userId)
      .select("*")
      .single();
    if (error) throwDbError(error);
    return data as QuickExpenseTemplate;
  },
};
