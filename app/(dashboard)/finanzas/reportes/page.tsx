import { getFinanceOverviewAction } from "@/app/actions/finance/financeActions";
import { getCurrentUser } from "@/services/authService";
import { redirect } from "next/navigation";

export default async function ReportesPage() {
  const user = await getCurrentUser();
  if (!user?.id) redirect("/login");

  const overview = await getFinanceOverviewAction(user.id);
  const recentTransactions = overview.transactions.slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border-subtle bg-surface-card p-5">
        <h1 className="text-xl font-semibold text-text-primary">Reportes financieros</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Visión ejecutiva de tu salud financiera para decidir mejor cada semana.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Kpi title="Saldo total" value={overview.metrics.balance} />
        <Kpi title="Ingresos" value={overview.metrics.income} />
        <Kpi title="Gastos" value={overview.metrics.expense} />
        <Kpi title="Flujo neto" value={overview.metrics.cashflow} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border-subtle bg-surface-card p-5">
          <h2 className="text-base font-semibold text-text-primary">Indicadores de enfoque</h2>
          <ul className="mt-3 space-y-2 text-sm text-text-secondary">
            <li>Metas de ahorro activas: {overview.metrics.activeGoals}</li>
            <li>Obligaciones pendientes: {overview.metrics.upcomingObligations}</li>
            <li>Cuentas activas: {overview.accounts.length}</li>
            <li>Transacciones registradas: {overview.transactions.length}</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-surface-card p-5">
          <h2 className="text-base font-semibold text-text-primary">Últimos movimientos</h2>
          <div className="mt-3 space-y-2">
            {recentTransactions.length === 0 ? (
              <p className="text-sm text-text-muted">Sin movimientos recientes.</p>
            ) : null}
            {recentTransactions.map((item) => (
              <div
                key={item.id_transaction}
                className="flex items-center justify-between rounded-xl border border-border-default bg-surface-muted p-3"
              >
                <div>
                  <p className="text-sm font-semibold text-text-primary">{item.title}</p>
                  <p className="text-xs text-text-muted">{item.type}</p>
                </div>
                <p className="text-sm font-semibold text-text-primary">
                  ${Number(item.amount).toLocaleString("es-CO")}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface-card p-4">
      <p className="text-xs text-text-muted">{title}</p>
      <p className="mt-1 text-2xl font-semibold text-text-primary">
        ${Number(value).toLocaleString("es-CO")}
      </p>
    </div>
  );
}
