import { redirect } from "next/navigation";

export default function GastosRapidosRedirectPage() {
  redirect("/finanzas/transacciones/fijos");
}
