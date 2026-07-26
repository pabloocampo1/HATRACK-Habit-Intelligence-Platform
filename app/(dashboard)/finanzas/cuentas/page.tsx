import { getFinanceAccountsAction } from "@/app/actions/finance/financeActions";
import { getCurrentUser } from "@/services/authService";
import { redirect } from "next/navigation";
import CuentasClient from "./_components/CuentasClient";

export default async function CuentasPage() {
  const user = await getCurrentUser();
  if (!user?.id) redirect("/login");

  const accounts = await getFinanceAccountsAction(user.id);

  return <CuentasClient userId={user.id} initialAccounts={accounts} />;
}
