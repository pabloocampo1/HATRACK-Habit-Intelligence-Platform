import { Account } from "@/lib/types";
import { supabase } from "../../config/supabaseClient";


export const accountRepository = {
  async getAccountsByUser(userId: string): Promise<Account[]> {
    const { data, error } = await supabase.from("accounts").select("*").eq("user_id", userId)	;

	if (error) throw error;


	return data;
  },
  async saveAccount(account: Account): Promise<Account> {

	const { data, error } = await supabase.from("accounts").insert(account).select().single();

	if (error) throw error;

	return data;
  }



}