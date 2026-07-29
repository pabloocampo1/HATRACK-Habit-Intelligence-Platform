import {
  getCategoriesAction,
  getFinanceOverviewAction,
  getObligationsAction,
  getQuickExpenseTemplatesAction,
  getSavingsGoalsAction,
} from "@/app/actions/finance/financeActions";
import { getCurrentUser } from "@/services/authService";
import { redirect } from "next/navigation";
import ReportsDashboardClient from "./_components/ReportsDashboardClient";

export default async function ReportesPage() {
  const user = await getCurrentUser();
  if (!user?.id) redirect("/login");

  const [overview, categories, goals, obligations, quickExpenses] = await Promise.all([
    getFinanceOverviewAction(user.id),
    getCategoriesAction(user.id),
    getSavingsGoalsAction(user.id),
    getObligationsAction(user.id),
    getQuickExpenseTemplatesAction(user.id),
  ]);

  return (
    <ReportsDashboardClient
      accounts={overview.accounts}
      categories={categories}
      goals={goals}
      obligations={obligations}
      quickExpenses={quickExpenses}
      transactions={overview.transactions}
    />
  );
}
