import { getCategoriesAction } from "@/app/actions/finance/financeActions";
import { getCurrentUser } from "@/services/authService";
import { redirect } from "next/navigation";
import CategoriasModuleClient from "./_components/CategoriasModuleClient";

export default async function CategoriasPage() {
  const user = await getCurrentUser();
  if (!user?.id) redirect("/login");

  const categories = await getCategoriesAction(user.id);
  return <CategoriasModuleClient userId={user.id} categories={categories} />;
}
