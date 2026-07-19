import {
  getCategoriesAction,
  getFinanceAccountsAction,
  getTransactionsAction,
} from "@/app/actions/finance/financeActions";
import { getCurrentUser } from "@/services/authService";
import { redirect } from "next/navigation";
import TransaccionesModuleClient from "./_components/TransaccionesModuleClient";

export default async function TransaccionesPage() {
  const user = await getCurrentUser();
  if (!user?.id) redirect("/login");

  const [accounts, categories, transactions] = await Promise.all([
    getFinanceAccountsAction(user.id, true),
    getCategoriesAction(user.id),
    getTransactionsAction(user.id),
  ]);

  return (
    <TransaccionesModuleClient
      userId={user.id}
      accounts={accounts}
      categories={categories}
      transactions={transactions}
    />
  );
}
