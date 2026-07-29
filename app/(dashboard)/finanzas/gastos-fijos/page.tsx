import {
  getCategoriesAction,
  getFinanceAccountsAction,
  getQuickExpenseTemplatesAction,
} from "@/app/actions/finance/financeActions";
import { getCurrentUser } from "@/services/authService";
import { redirect } from "next/navigation";
import GastosFijosClient from "../transacciones/fijos/_components/GastosFijosClient";

export default async function GastosFijosPage() {
  const user = await getCurrentUser();
  if (!user?.id) redirect("/login");

  const [accounts, categories, templates] = await Promise.all([
    getFinanceAccountsAction(user.id, true),
    getCategoriesAction(user.id),
    getQuickExpenseTemplatesAction(user.id),
  ]);

  return (
    <GastosFijosClient
      userId={user.id}
      accounts={accounts}
      categories={categories}
      templates={templates}
    />
  );
}
