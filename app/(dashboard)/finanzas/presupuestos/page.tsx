import {
  getBudgetsAction,
  getCategoriesAction,
} from "@/app/actions/finance/financeActions";
import { getCurrentUser } from "@/services/authService";
import { redirect } from "next/navigation";
import PresupuestosModuleClient from "./_components/PresupuestosModuleClient";

export default async function PresupuestosPage() {
  const user = await getCurrentUser();
  if (!user?.id) redirect("/login");

  const [budgets, categories] = await Promise.all([
    getBudgetsAction(user.id),
    getCategoriesAction(user.id),
  ]);

  return (
    <PresupuestosModuleClient
      userId={user.id}
      budgets={budgets}
      categories={categories}
    />
  );
}
