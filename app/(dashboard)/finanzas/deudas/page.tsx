import {
  getFinanceAccountsAction,
  getObligationsAction,
} from "@/app/actions/finance/financeActions";
import { getCurrentUser } from "@/services/authService";
import { redirect } from "next/navigation";
import DeudasPendientesModuleClient from "./_components/DeudasPendientesModuleClient";

export default async function DeudasPendientesPage() {
  const user = await getCurrentUser();
  if (!user?.id) redirect("/login");

  const [obligations, accounts] = await Promise.all([
    getObligationsAction(user.id),
    getFinanceAccountsAction(user.id, true),
  ]);

  return (
    <DeudasPendientesModuleClient
      userId={user.id}
      obligations={obligations}
      accounts={accounts}
    />
  );
}
