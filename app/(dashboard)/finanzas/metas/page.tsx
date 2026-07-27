import {
  getFinanceAccountsAction,
  getSavingsGoalsAction,
} from "@/app/actions/finance/financeActions";
import { getCurrentUser } from "@/services/authService";
import { redirect } from "next/navigation";
import MetasAhorroModuleClient from "./_components/MetasAhorroModuleClient";

export default async function MetasAhorroPage() {
  const user = await getCurrentUser();
  if (!user?.id) redirect("/login");

  const [goals, accounts] = await Promise.all([
    getSavingsGoalsAction(user.id),
    getFinanceAccountsAction(user.id, true),
  ]);

  return <MetasAhorroModuleClient userId={user.id} goals={goals} accounts={accounts} />;
}
