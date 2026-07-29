import {
  getCategoriesAction,
  getFinanceAccountAction,
  getFinanceAccountsAction,
  getTransactionsByAccountAction,
} from "@/app/actions/finance/financeActions";
import { getCurrentUser } from "@/services/authService";
import { notFound, redirect } from "next/navigation";
import AccountTransactionsClient from "./_components/AccountTransactionsClient";

type PageProps = {
  params: Promise<{ accountId: string }>;
};

export default async function AccountTransactionsPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user?.id) redirect("/login");

  const { accountId } = await params;

  let account;
  try {
    account = await getFinanceAccountAction(user.id, accountId);
  } catch {
    notFound();
  }

  const [transactions, accounts, categories] = await Promise.all([
    getTransactionsByAccountAction(user.id, accountId),
    getFinanceAccountsAction(user.id),
    getCategoriesAction(user.id),
  ]);

  return (
    <AccountTransactionsClient
      account={account}
      accounts={accounts}
      categories={categories}
      transactions={transactions}
    />
  );
}
