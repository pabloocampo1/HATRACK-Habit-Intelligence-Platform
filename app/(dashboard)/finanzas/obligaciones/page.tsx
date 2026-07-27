import { getObligationsAction } from "@/app/actions/finance/financeActions";
import { getCurrentUser } from "@/services/authService";
import { redirect } from "next/navigation";
import ObligacionesModuleClient from "./_components/ObligacionesModuleClient";

export default async function ObligacionesPage() {
  const user = await getCurrentUser();
  if (!user?.id) redirect("/login");

  const obligations = await getObligationsAction(user.id);
  return <ObligacionesModuleClient userId={user.id} obligations={obligations} />;
}
