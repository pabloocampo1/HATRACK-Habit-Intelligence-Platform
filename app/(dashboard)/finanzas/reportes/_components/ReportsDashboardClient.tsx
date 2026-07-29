"use client";

import React, { useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";
import {
  bogotaDateToYMD,
  bogotaTodayYMD,
  bogotaYMDToDate,
  diffDaysBogotaYMD,
} from "@/lib/dates/bogota";
import {
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  CalendarClock,
  CreditCard,
  Flame,
  Landmark,
  LineChart,
  PiggyBank,
  Target,
  Wallet,
  Zap,
} from "lucide-react";
import type {
  Account,
  FinanceCategory,
  FinanceTransaction,
  Obligation,
  QuickExpenseTemplate,
  SavingsGoal,
} from "@/lib/types";

type RangeKey = "today" | "week" | "month" | "quarter" | "year" | "all";

type Props = {
  accounts: Account[];
  categories: FinanceCategory[];
  goals: SavingsGoal[];
  obligations: Obligation[];
  quickExpenses: QuickExpenseTemplate[];
  transactions: FinanceTransaction[];
};

const OBLIGATION_META_PREFIX = "[[HATRACK_OBLIGATION_META]]";

const palette = {
  emerald: "#10b981",
  green: "#22c55e",
  rose: "#fb7185",
  sky: "#38bdf8",
  amber: "#f59e0b",
  violet: "#a78bfa",
  slate: "#94a3b8",
  grid: "rgba(148, 163, 184, 0.16)",
  text: "#cbd5e1",
  muted: "#64748b",
};

const chartText = {
  color: palette.text,
  fontFamily: "Inter, system-ui, sans-serif",
};

const currency = (value: number) =>
  `$${Math.round(Number(value || 0)).toLocaleString("es-CO")}`;

const percent = (value: number) => `${Math.round(value || 0)}%`;

function toBogotaDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? bogotaYMDToDate(value) : new Date(value);
}

function dateKey(value: Date) {
  return bogotaDateToYMD(value);
}

function monthKey(value: Date) {
  return bogotaDateToYMD(value).slice(0, 7);
}

function monthLabel(key: string) {
  const [year, month] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("es-CO", { month: "short", year: "2-digit" }).format(
    new Date(year, month - 1, 1),
  );
}

function rangeStart(range: RangeKey) {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  if (range === "today") return start;
  if (range === "week") {
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
    return start;
  }
  if (range === "month") {
    start.setDate(1);
    return start;
  }
  if (range === "quarter") {
    start.setMonth(start.getMonth() - 2, 1);
    return start;
  }
  if (range === "year") {
    start.setMonth(0, 1);
    return start;
  }
  return new Date("2000-01-01T00:00:00");
}

function parseObligationMeta(raw?: string | null) {
  if (!raw) return { totalInstallments: 1, paidInstallments: 0, totalDebt: undefined as number | undefined };
  const idx = raw.indexOf(OBLIGATION_META_PREFIX);
  if (idx === -1) return { totalInstallments: 1, paidInstallments: 0, totalDebt: undefined as number | undefined };
  try {
    const meta = JSON.parse(raw.slice(idx + OBLIGATION_META_PREFIX.length)) as {
      totalInstallments?: number;
      paidInstallments?: number;
      totalDebt?: number;
    };
    return {
      totalInstallments: Math.max(1, Number(meta.totalInstallments ?? 1)),
      paidInstallments: Math.max(0, Number(meta.paidInstallments ?? 0)),
      totalDebt:
        meta.totalDebt != null && Number(meta.totalDebt) > 0 ? Number(meta.totalDebt) : undefined,
    };
  } catch {
    return { totalInstallments: 1, paidInstallments: 0, totalDebt: undefined as number | undefined };
  }
}

function chartBase() {
  return {
    backgroundColor: "transparent",
    textStyle: chartText,
    grid: { left: 48, right: 20, top: 46, bottom: 36 },
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(15, 23, 42, 0.96)",
      borderColor: "rgba(148, 163, 184, 0.22)",
      textStyle: chartText,
    },
    legend: {
      textStyle: { color: palette.text },
      top: 0,
    },
  };
}

function SectionCard({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-3xl border border-border-subtle bg-surface-card p-5 shadow-sm ${className}`}>
      <div className="mb-4">
        <h2 className="text-base font-semibold text-text-primary">{title}</h2>
        {subtitle ? <p className="mt-1 text-xs text-text-muted">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  helper,
  tone = "emerald",
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  helper?: string;
  tone?: "emerald" | "rose" | "sky" | "amber" | "violet";
}) {
  const toneClass = {
    emerald: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
    rose: "border-rose-500/25 bg-rose-500/10 text-rose-300",
    sky: "border-sky-500/25 bg-sky-500/10 text-sky-300",
    amber: "border-amber-500/25 bg-amber-500/10 text-amber-300",
    violet: "border-violet-500/25 bg-violet-500/10 text-violet-300",
  }[tone];

  return (
    <div className="rounded-3xl border border-border-subtle bg-surface-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">{label}</p>
          <p className="mt-3 text-2xl font-bold tracking-tight text-text-primary">{value}</p>
          {helper ? <p className="mt-2 text-xs leading-relaxed text-text-secondary">{helper}</p> : null}
        </div>
        <span className={`flex size-11 shrink-0 items-center justify-center rounded-2xl border ${toneClass}`}>
          <Icon className="size-5" />
        </span>
      </div>
    </div>
  );
}

export default function ReportsDashboardClient({
  accounts,
  categories,
  goals,
  obligations,
  quickExpenses,
  transactions,
}: Props) {
  const [range, setRange] = useState<RangeKey>("month");
  const [seriesMonths, setSeriesMonths] = useState(12);
  const [todayYMD] = useState(() => bogotaTodayYMD());

  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [String(category.id_category), category])),
    [categories],
  );

  const accountMap = useMemo(
    () => new Map(accounts.map((account) => [String(account.account_id), account])),
    [accounts],
  );

  const filteredTransactions = useMemo(() => {
    const start = rangeStart(range);
    return transactions.filter((tx) => toBogotaDate(tx.transaction_date) >= start);
  }, [range, transactions]);

  const periodStats = useMemo(() => {
    const income = filteredTransactions
      .filter((tx) => tx.type === "income")
      .reduce((sum, tx) => sum + Number(tx.amount ?? 0), 0);
    const expense = filteredTransactions
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + Number(tx.amount ?? 0), 0);
    const transfers = filteredTransactions
      .filter((tx) => tx.type === "transfer")
      .reduce((sum, tx) => sum + Number(tx.amount ?? 0), 0);
    return {
      income,
      expense,
      transfers,
      net: income - expense,
      count: filteredTransactions.length,
      averageTicket: filteredTransactions.length
        ? (income + expense + transfers) / filteredTransactions.length
        : 0,
      savingsRate: income > 0 ? ((income - expense) / income) * 100 : 0,
    };
  }, [filteredTransactions]);

  const accountBalance = accounts.reduce((sum, account) => sum + Number(account.balance ?? 0), 0);
  const activeDebt = obligations.filter((debt) => debt.status === "active");
  const totalDebt = activeDebt.reduce((sum, debt) => {
    const meta = parseObligationMeta(debt.description);
    const total = meta.totalDebt ?? Number(debt.amount) * meta.totalInstallments;
    const paid = Number(debt.amount) * meta.paidInstallments;
    return sum + Math.max(0, total - paid);
  }, 0);
  const goalTarget = goals.reduce((sum, goal) => sum + Number(goal.target_amount ?? 0), 0);
  const goalSaved = goals.reduce((sum, goal) => sum + Number(goal.saved_amount ?? 0), 0);
  const goalProgress = goalTarget > 0 ? (goalSaved / goalTarget) * 100 : 0;

  const monthly = useMemo(() => {
    const now = new Date();
    const labels: string[] = [];
    for (let i = seriesMonths - 1; i >= 0; i--) {
      labels.push(monthKey(new Date(now.getFullYear(), now.getMonth() - i, 1)));
    }
    const byMonth = new Map(
      labels.map((key) => [key, { income: 0, expense: 0, transfer: 0, count: 0 }]),
    );
    for (const tx of transactions) {
      const key = monthKey(toBogotaDate(tx.transaction_date));
      const row = byMonth.get(key);
      if (!row) continue;
      row.count += 1;
      if (tx.type === "income") row.income += Number(tx.amount);
      if (tx.type === "expense") row.expense += Number(tx.amount);
      if (tx.type === "transfer") row.transfer += Number(tx.amount);
    }
    return labels.map((key) => ({ key, label: monthLabel(key), ...byMonth.get(key)! }));
  }, [seriesMonths, transactions]);

  const categoryBreakdown = useMemo(() => {
    const totals = new Map<string, { name: string; value: number }>();
    for (const tx of filteredTransactions) {
      if (tx.type !== "expense") continue;
      const key = String(tx.category_id ?? "none");
      const category = categoryMap.get(key);
      const name = category?.name ?? "Sin categoría";
      totals.set(key, { name, value: (totals.get(key)?.value ?? 0) + Number(tx.amount) });
    }
    return [...totals.values()].sort((a, b) => b.value - a.value).slice(0, 10);
  }, [categoryMap, filteredTransactions]);

  const accountBreakdown = useMemo(
    () =>
      [...accounts]
        .sort((a, b) => Number(b.balance ?? 0) - Number(a.balance ?? 0))
        .map((account) => ({
          name: account.account_name,
          value: Number(account.balance ?? 0),
          type: account.type,
        })),
    [accounts],
  );

  const heatmapData = useMemo(() => {
    const days = 42;
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - days + 1);
    start.setHours(0, 0, 0, 0);
    const totals = new Map<string, number>();
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      totals.set(dateKey(d), 0);
    }
    for (const tx of transactions) {
      if (tx.type !== "expense") continue;
      const d = toBogotaDate(tx.transaction_date);
      if (d < start) continue;
      const key = dateKey(d);
      totals.set(key, (totals.get(key) ?? 0) + Number(tx.amount));
    }
    return [...totals.entries()].map(([date, value]) => [date, value]);
  }, [transactions]);

  const transactionMix = [
    { name: "Ingresos", value: filteredTransactions.filter((tx) => tx.type === "income").length },
    { name: "Gastos", value: filteredTransactions.filter((tx) => tx.type === "expense").length },
    { name: "Transferencias", value: filteredTransactions.filter((tx) => tx.type === "transfer").length },
  ];

  const quickExpenseUsage = [...quickExpenses]
    .sort((a, b) => Number(b.usage_count ?? 0) - Number(a.usage_count ?? 0))
    .slice(0, 8);

  const upcomingDebts = [...obligations]
    .filter((debt) => debt.status === "active")
    .sort((a, b) => new Date(a.next_due_date).getTime() - new Date(b.next_due_date).getTime())
    .slice(0, 8);

  const cashflowOption = {
    ...chartBase(),
    tooltip: { ...chartBase().tooltip, trigger: "axis" },
    legend: { ...chartBase().legend, data: ["Ingresos", "Gastos", "Flujo neto"] },
    xAxis: {
      type: "category",
      data: monthly.map((row) => row.label),
      axisLabel: { color: palette.muted },
      axisLine: { lineStyle: { color: palette.grid } },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: palette.muted, formatter: (v: number) => `$${Math.round(v / 1000)}k` },
      splitLine: { lineStyle: { color: palette.grid } },
    },
    series: [
      {
        name: "Ingresos",
        type: "bar",
        stack: "money",
        data: monthly.map((row) => row.income),
        itemStyle: { color: palette.emerald, borderRadius: [8, 8, 0, 0] },
      },
      {
        name: "Gastos",
        type: "bar",
        stack: "money",
        data: monthly.map((row) => -row.expense),
        itemStyle: { color: palette.rose, borderRadius: [0, 0, 8, 8] },
      },
      {
        name: "Flujo neto",
        type: "line",
        smooth: true,
        data: monthly.map((row) => row.income - row.expense),
        symbolSize: 8,
        lineStyle: { color: palette.sky, width: 3 },
        itemStyle: { color: palette.sky },
      },
    ],
  };

  const categoryOption = {
    ...chartBase(),
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(15, 23, 42, 0.96)",
      borderColor: "rgba(148, 163, 184, 0.22)",
      textStyle: chartText,
      formatter: "{b}<br/>" + "{c} ({d}%)",
    },
    legend: { type: "scroll", bottom: 0, textStyle: { color: palette.text } },
    series: [
      {
        type: "pie",
        radius: ["52%", "78%"],
        center: ["50%", "44%"],
        avoidLabelOverlap: true,
        label: { color: palette.text, formatter: "{b}" },
        data: categoryBreakdown.map((row) => ({ name: row.name, value: row.value })),
      },
    ],
  };

  const accountOption = {
    ...chartBase(),
    grid: { left: 120, right: 20, top: 16, bottom: 24 },
    xAxis: {
      type: "value",
      axisLabel: { color: palette.muted, formatter: (v: number) => `$${Math.round(v / 1000)}k` },
      splitLine: { lineStyle: { color: palette.grid } },
    },
    yAxis: {
      type: "category",
      data: accountBreakdown.map((row) => row.name),
      axisLabel: { color: palette.text },
      axisLine: { show: false },
    },
    series: [
      {
        type: "bar",
        data: accountBreakdown.map((row) => row.value),
        itemStyle: { color: palette.violet, borderRadius: [0, 10, 10, 0] },
      },
    ],
  };

  const heatmapOption = {
    backgroundColor: "transparent",
    tooltip: {
      backgroundColor: "rgba(15, 23, 42, 0.96)",
      borderColor: "rgba(148, 163, 184, 0.22)",
      textStyle: chartText,
      formatter: (params: { data: [string, number] }) => `${params.data[0]}<br/>${currency(params.data[1])}`,
    },
    visualMap: {
      min: 0,
      max: Math.max(...heatmapData.map((row) => Number(row[1])), 1),
      orient: "horizontal",
      left: "center",
      bottom: 0,
      inRange: { color: ["#0f172a", "#064e3b", "#10b981"] },
      textStyle: { color: palette.text },
    },
    calendar: {
      top: 30,
      left: 32,
      right: 16,
      cellSize: ["auto", 18],
      range: [heatmapData[0]?.[0], heatmapData.at(-1)?.[0]],
      splitLine: { lineStyle: { color: palette.grid } },
      itemStyle: { color: "rgba(15,23,42,0.8)", borderColor: "rgba(148,163,184,0.16)" },
      dayLabel: { color: palette.muted },
      monthLabel: { color: palette.muted },
      yearLabel: { show: false },
    },
    series: [{ type: "heatmap", coordinateSystem: "calendar", data: heatmapData }],
  };

  const goalsOption = {
    ...chartBase(),
    grid: { left: 130, right: 24, top: 16, bottom: 26 },
    xAxis: {
      type: "value",
      max: 100,
      axisLabel: { color: palette.muted, formatter: "{value}%" },
      splitLine: { lineStyle: { color: palette.grid } },
    },
    yAxis: {
      type: "category",
      data: goals.slice(0, 8).map((goal) => goal.title),
      axisLabel: { color: palette.text },
    },
    series: [
      {
        type: "bar",
        data: goals.slice(0, 8).map((goal) =>
          Math.min(100, (Number(goal.saved_amount) / Math.max(1, Number(goal.target_amount))) * 100),
        ),
        itemStyle: { color: palette.emerald, borderRadius: [0, 10, 10, 0] },
      },
    ],
  };

  const debtOption = {
    ...chartBase(),
    grid: { left: 120, right: 20, top: 16, bottom: 24 },
    xAxis: {
      type: "value",
      axisLabel: { color: palette.muted },
      splitLine: { lineStyle: { color: palette.grid } },
    },
    yAxis: {
      type: "category",
      data: upcomingDebts.map((debt) => debt.title),
      axisLabel: { color: palette.text },
    },
    series: [
      {
        type: "bar",
        data: upcomingDebts.map((debt) =>
          diffDaysBogotaYMD(todayYMD, debt.next_due_date),
        ),
        itemStyle: {
          color: (params: { value: number }) =>
            params.value < 0 ? palette.rose : params.value <= 7 ? palette.amber : palette.sky,
          borderRadius: [0, 10, 10, 0],
        },
      },
    ],
  };

  const quickOption = {
    ...chartBase(),
    grid: { left: 130, right: 20, top: 16, bottom: 24 },
    xAxis: {
      type: "value",
      axisLabel: { color: palette.muted },
      splitLine: { lineStyle: { color: palette.grid } },
    },
    yAxis: {
      type: "category",
      data: quickExpenseUsage.map((item) => item.label),
      axisLabel: { color: palette.text },
    },
    series: [
      {
        type: "bar",
        data: quickExpenseUsage.map((item) => Number(item.usage_count ?? 0)),
        itemStyle: { color: palette.amber, borderRadius: [0, 10, 10, 0] },
      },
    ],
  };

  const mixOption = {
    ...chartBase(),
    tooltip: { trigger: "item", backgroundColor: "rgba(15, 23, 42, 0.96)", textStyle: chartText },
    legend: { bottom: 0, textStyle: { color: palette.text } },
    series: [
      {
        type: "pie",
        radius: ["45%", "72%"],
        center: ["50%", "43%"],
        label: { color: palette.text },
        data: transactionMix,
      },
    ],
  };

  const strongestCategory = categoryBreakdown[0];
  const cashAccounts = accounts.filter((account) => account.type === "CASH");

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-emerald-500/20 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.22),transparent_36%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(2,6,23,0.96))] p-6 shadow-2xl">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-300">
              Inteligencia financiera
            </p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
              Reportes que sí sirven para tomar decisiones
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-secondary">
              Lee flujo de caja, hábitos de gasto, salud de cuentas, metas, deudas y gastos fijos
              en una sola vista. Cambia el rango para ver el pulso real de tu plata.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="mb-2 text-xs font-semibold text-text-muted">Rango de análisis</p>
            <div className="grid grid-cols-3 gap-2 sm:flex">
              {[
                ["today", "Hoy"],
                ["week", "Semana"],
                ["month", "Mes"],
                ["quarter", "Trim."],
                ["year", "Año"],
                ["all", "Todo"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setRange(key as RangeKey)}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    range === key
                      ? "bg-emerald-500 text-black"
                      : "border border-white/10 text-text-secondary hover:bg-white/5"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon={Wallet}
          label="Patrimonio líquido"
          value={currency(accountBalance)}
          helper={`${accounts.length} cuentas · ${cashAccounts.length} efectivo`}
          tone="emerald"
        />
        <KpiCard
          icon={ArrowDownLeft}
          label="Ingresos del rango"
          value={currency(periodStats.income)}
          helper={`${periodStats.count} movimientos analizados`}
          tone="sky"
        />
        <KpiCard
          icon={ArrowUpRight}
          label="Gastos del rango"
          value={currency(periodStats.expense)}
          helper={`Ticket promedio ${currency(periodStats.averageTicket)}`}
          tone="rose"
        />
        <KpiCard
          icon={PiggyBank}
          label="Tasa de ahorro"
          value={percent(periodStats.savingsRate)}
          helper={`Flujo neto ${currency(periodStats.net)}`}
          tone={periodStats.net >= 0 ? "emerald" : "amber"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.45fr_0.9fr]">
        <SectionCard
          title="Flujo de caja mensual"
          subtitle="Ingresos, gastos reales y flujo neto. Las transferencias no contaminan el cashflow."
        >
          <div className="mb-3 flex justify-end">
            <select
              value={seriesMonths}
              onChange={(event) => setSeriesMonths(Number(event.target.value))}
              className="rounded-xl border border-border-default bg-surface-muted px-3 py-2 text-xs font-semibold text-text-secondary outline-none"
            >
              <option value={6}>Últimos 6 meses</option>
              <option value={12}>Últimos 12 meses</option>
              <option value={18}>Últimos 18 meses</option>
              <option value={24}>Últimos 24 meses</option>
            </select>
          </div>
          <ReactECharts option={cashflowOption} style={{ height: 380 }} />
        </SectionCard>

        <SectionCard
          title="Distribución de gastos"
          subtitle={strongestCategory ? `Mayor presión: ${strongestCategory.name}` : "Aún sin gastos"}
        >
          <ReactECharts option={categoryOption} style={{ height: 380 }} />
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard title="Saldo por cuenta" subtitle="Concentración del dinero disponible.">
          <ReactECharts option={accountOption} style={{ height: 330 }} />
        </SectionCard>
        <SectionCard title="Actividad por día" subtitle="Heatmap de gastos de las últimas 6 semanas.">
          <ReactECharts option={heatmapOption} style={{ height: 330 }} />
        </SectionCard>
        <SectionCard title="Mix de transacciones" subtitle="Volumen por tipo en el rango seleccionado.">
          <ReactECharts option={mixOption} style={{ height: 330 }} />
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Metas de ahorro"
          subtitle={`Progreso global ${percent(goalProgress)} · ${currency(goalSaved)} de ${currency(goalTarget)}`}
        >
          {goals.length === 0 ? (
            <EmptyState icon={Target} text="Aún no hay metas de ahorro." />
          ) : (
            <ReactECharts option={goalsOption} style={{ height: 320 }} />
          )}
        </SectionCard>

        <SectionCard
          title="Deudas pendientes"
          subtitle={`${activeDebt.length} activas · exposición aproximada ${currency(totalDebt)}`}
        >
          {upcomingDebts.length === 0 ? (
            <EmptyState icon={CalendarClock} text="No hay deudas activas por pagar." />
          ) : (
            <ReactECharts option={debtOption} style={{ height: 320 }} />
          )}
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr_0.85fr]">
        <SectionCard title="Gastos fijos más usados" subtitle="Plantillas que más se convierten en movimientos.">
          {quickExpenseUsage.length === 0 ? (
            <EmptyState icon={Zap} text="Aún no hay gastos fijos usados." />
          ) : (
            <ReactECharts option={quickOption} style={{ height: 310 }} />
          )}
        </SectionCard>

        <SectionCard title="Top categorías del rango" subtitle="Dónde se está yendo la plata.">
          <div className="space-y-3">
            {categoryBreakdown.length === 0 ? (
              <EmptyState icon={Flame} text="Sin gastos en este rango." />
            ) : (
              categoryBreakdown.slice(0, 6).map((item, index) => {
                const max = categoryBreakdown[0]?.value ?? 1;
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-text-primary">
                        {index + 1}. {item.name}
                      </span>
                      <span className="text-text-secondary">{currency(item.value)}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${Math.max(8, (item.value / max) * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </SectionCard>

        <SectionCard title="Insights rápidos" subtitle="Alertas simples para mirar primero.">
          <div className="space-y-3">
            <Insight
              icon={LineChart}
              label="Flujo del rango"
              value={periodStats.net >= 0 ? "Positivo" : "Negativo"}
              detail={`${currency(periodStats.net)} después de gastos`}
              good={periodStats.net >= 0}
            />
            <Insight
              icon={CreditCard}
              label="Deuda activa"
              value={currency(totalDebt)}
              detail={`${activeDebt.length} compromisos por pagar`}
              good={totalDebt === 0}
            />
            <Insight
              icon={Target}
              label="Metas"
              value={percent(goalProgress)}
              detail={`${goals.filter((goal) => goal.status === "active").length} metas activas`}
              good={goalProgress >= 50}
            />
            <Insight
              icon={Activity}
              label="Frecuencia"
              value={`${periodStats.count}`}
              detail="movimientos en el rango"
              good={periodStats.count > 0}
            />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, text }: { icon: typeof Wallet; text: string }) {
  return (
    <div className="flex h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-border-default bg-surface-muted/40 text-center">
      <Icon className="size-8 text-text-muted" />
      <p className="mt-3 text-sm text-text-secondary">{text}</p>
    </div>
  );
}

function Insight({
  icon: Icon,
  label,
  value,
  detail,
  good,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  detail: string;
  good: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border-default bg-surface-muted p-3">
      <span
        className={`flex size-10 shrink-0 items-center justify-center rounded-xl border ${
          good
            ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
            : "border-amber-500/25 bg-amber-500/10 text-amber-300"
        }`}
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-text-primary">{value}</p>
        <p className="text-xs text-text-secondary">{detail}</p>
      </div>
    </div>
  );
}

