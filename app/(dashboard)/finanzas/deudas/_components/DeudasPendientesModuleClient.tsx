"use client";

import {
  createObligationAction,
  deleteObligationAction,
  registerObligationPaymentAction,
  updateObligationAction,
  updateObligationStatusAction,
} from "@/app/actions/finance/financeActions";
import FinanceFormField from "../../_components/FinanceFormField";
import FinanceConfirmModal from "../../_components/FinanceConfirmModal";
import FinanceModal, { financeInputClass } from "../../_components/FinanceModal";
import {
  encodeObligationDescription,
  parseObligationDescription,
} from "@/lib/finance/obligationMeta";
import { Account, Obligation } from "@/lib/types";
import {
  AlertCircle,
  ArrowLeftRight,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  PauseCircle,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition, useEffect } from "react";

type FilterStatus = Obligation["status"] | "all";
type DueFilter = "all" | "overdue" | "7d" | "30d";
type SortKey = "due_asc" | "due_desc" | "amount_desc" | "amount_asc" | "progress_desc";

type FormState = {
  title: string;
  totalDebt: string;
  amount: string;
  frequency: Obligation["frequency"];
  next_due_date: string;
  description: string;
  totalInstallments: string;
  paidInstallments: string;
};

type PaymentFormState = {
  amount: string;
  account_id: string;
  installment_number: string;
  note: string;
};

const FREQUENCY_LABELS: Record<Obligation["frequency"], string> = {
  once: "Pago único",
  weekly: "Semanal",
  monthly: "Mensual",
  yearly: "Anual",
};

const STATUS_LABELS: Record<Obligation["status"], string> = {
  active: "Pendiente",
  paid: "Pagada",
  paused: "Pausada",
};

const SORT_LABELS: Record<SortKey, string> = {
  due_asc: "Vence primero",
  due_desc: "Vence después",
  amount_desc: "Mayor monto",
  amount_asc: "Menor monto",
  progress_desc: "Más avanzado",
};

const emptyForm: FormState = {
  title: "",
  totalDebt: "",
  amount: "",
  frequency: "monthly",
  next_due_date: "",
  description: "",
  totalInstallments: "1",
  paidInstallments: "0",
};

function formatMoney(value: number) {
  return `$${Math.round(value).toLocaleString("es-CO")}`;
}

function formatDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("es-CO", {
    dateStyle: "medium",
  });
}

function daysUntil(value: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${value}T00:00:00`);
  return Math.ceil((target.getTime() - today.getTime()) / 86_400_000);
}

function installmentProgress(meta: ReturnType<typeof parseObligationDescription>["meta"]) {
  const total = Math.max(1, Number(meta.totalInstallments ?? 1));
  const paid = Math.min(total, Math.max(0, Number(meta.paidInstallments ?? 0)));
  return { total, paid, pct: Math.round((paid / total) * 100) };
}

function statusClasses(status: Obligation["status"]) {
  if (status === "paid") return "border-emerald-500/30 text-emerald-300 bg-emerald-500/10";
  if (status === "paused") return "border-amber-500/30 text-amber-300 bg-amber-500/10";
  return "border-sky-500/30 text-sky-300 bg-sky-500/10";
}

export default function DeudasPendientesModuleClient({
  userId,
  obligations,
  accounts,
}: {
  userId: string;
  obligations: Obligation[];
  accounts: Account[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [items, setItems] = useState(obligations);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selected, setSelected] = useState<Obligation | null>(null);
  const [paymentTarget, setPaymentTarget] = useState<Obligation | null>(null);
  const [settleFull, setSettleFull] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Obligation | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [paymentForm, setPaymentForm] = useState<PaymentFormState>({
    amount: "",
    account_id: accounts[0] ? String(accounts[0].account_id) : "",
    installment_number: "",
    note: "",
  });
  const [detailPaid, setDetailPaid] = useState("");
  const [detailTotal, setDetailTotal] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<FilterStatus>("all");
  const [dueFilter, setDueFilter] = useState<DueFilter>("all");
  const [sort, setSort] = useState<SortKey>("due_asc");

  useEffect(() => {
    setItems(obligations);
  }, [obligations]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const showToast = (message: string) => setToast(message);

  const enriched = useMemo(
    () =>
      items.map((item) => {
        const parsed = parseObligationDescription(item.description);
        return {
          item,
          ...parsed,
          progress: installmentProgress(parsed.meta),
          days: daysUntil(item.next_due_date),
        };
      }),
    [items],
  );

  const metrics = useMemo(() => {
    const active = enriched.filter((row) => row.item.status === "active");
    const totalPending = active.reduce((sum, row) => {
      const debt =
        row.meta.totalDebt != null && row.meta.totalDebt > 0
          ? row.meta.totalDebt
          : Number(row.item.amount) * row.progress.total;
      const paidValue = Number(row.item.amount) * row.progress.paid;
      return sum + Math.max(0, debt - paidValue);
    }, 0);
    const overdue = active.filter((row) => row.days < 0).length;
    const next7 = active.filter((row) => row.days >= 0 && row.days <= 7).length;
    return { active: active.length, totalPending, overdue, next7 };
  }, [enriched]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return enriched
      .filter((row) => {
        if (status !== "all" && row.item.status !== status) return false;
        if (dueFilter === "overdue" && row.days >= 0) return false;
        if (dueFilter === "7d" && (row.days < 0 || row.days > 7)) return false;
        if (dueFilter === "30d" && (row.days < 0 || row.days > 30)) return false;
        if (q) {
          const blob = [
            row.item.title,
            row.notes,
            row.item.amount,
            FREQUENCY_LABELS[row.item.frequency],
            STATUS_LABELS[row.item.status],
            `${row.progress.paid}/${row.progress.total}`,
          ]
            .join(" ")
            .toLowerCase();
          if (!blob.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sort === "due_desc") return b.days - a.days;
        if (sort === "amount_desc") return Number(b.item.amount) - Number(a.item.amount);
        if (sort === "amount_asc") return Number(a.item.amount) - Number(b.item.amount);
        if (sort === "progress_desc") return b.progress.pct - a.progress.pct;
        return a.days - b.days;
      });
  }, [dueFilter, enriched, query, sort, status]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError(null);
  };

  const openCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (item: Obligation) => {
    const { notes, meta } = parseObligationDescription(item.description);
    const p = installmentProgress(meta);
    setEditingId(item.id_obligation);
    setForm({
      title: item.title,
      totalDebt:
        meta.totalDebt != null
          ? String(meta.totalDebt)
          : String(Number(item.amount) * p.total),
      amount: String(item.amount),
      frequency: item.frequency,
      next_due_date: item.next_due_date,
      description: notes,
      totalInstallments: String(p.total),
      paidInstallments: String(p.paid),
    });
    setError(null);
    setModalOpen(true);
  };

  const remainingDebtAmount = (item: Obligation) => {
    const { meta } = parseObligationDescription(item.description);
    const p = installmentProgress(meta);
    const totalDebt =
      meta.totalDebt != null && meta.totalDebt > 0
        ? meta.totalDebt
        : Number(item.amount) * p.total;
    const paidValue = Number(item.amount) * p.paid;
    return Math.max(0, totalDebt - paidValue);
  };

  const openPayment = (item: Obligation, options?: { settle?: boolean }) => {
    const settle = Boolean(options?.settle);
    const { meta } = parseObligationDescription(item.description);
    const p = installmentProgress(meta);
    const remaining = remainingDebtAmount(item);
    setSettleFull(settle);
    setPaymentTarget(item);
    setPaymentForm({
      amount: String(settle ? remaining || Number(item.amount) : item.amount),
      account_id: accounts[0] ? String(accounts[0].account_id) : "",
      installment_number: settle
        ? String(p.total)
        : p.total > 1
          ? String(Math.min(p.total, p.paid + 1))
          : "",
      note: "",
    });
    setError(null);
  };

  const openMarkAsPaid = (item: Obligation) => {
    if (accounts.length === 0) {
      setError("Crea al menos una cuenta para registrar el pago y marcar la deuda como pagada.");
      return;
    }
    openPayment(item, { settle: true });
  };

  const handleSave = () => {
    const total = Number(form.totalInstallments);
    const paid = Number(form.paidInstallments);
    const totalDebt = Number(form.totalDebt);
    if (!form.title.trim()) return setError("El nombre de la deuda es obligatorio.");
    if (!Number.isFinite(totalDebt) || totalDebt <= 0) {
      return setError("El valor de la deuda debe ser mayor a cero.");
    }
    if (Number(form.amount) <= 0) return setError("El valor de la cuota debe ser mayor a cero.");
    if (!form.next_due_date) {
      return setError("Selecciona la fecha de pago de la deuda o cuota.");
    }
    if (!Number.isFinite(total) || total < 1) return setError("El número de cuotas debe ser mínimo 1.");
    if (!Number.isFinite(paid) || paid < 0 || paid > total) {
      return setError("Las cuotas pagadas deben estar entre 0 y el total de cuotas.");
    }

    const description = encodeObligationDescription(form.description, {
      totalInstallments: total,
      paidInstallments: paid,
      totalDebt,
    });

    setError(null);
    startTransition(async () => {
      try {
        if (editingId) {
          await updateObligationAction(userId, editingId, {
            title: form.title.trim(),
            amount: Number(form.amount),
            frequency: form.frequency,
            next_due_date: form.next_due_date,
            description,
            ...(paid >= total ? { status: "paid" as const } : {}),
          });
        } else {
          await createObligationAction(userId, {
            title: form.title.trim(),
            amount: Number(form.amount),
            frequency: form.frequency,
            next_due_date: form.next_due_date,
            description,
          });
        }
        resetForm();
        setModalOpen(false);
        setSelected(null);
        router.refresh();
      } catch (actionError) {
        setError(
          actionError instanceof Error
            ? actionError.message
            : editingId
              ? "No se pudo actualizar la deuda."
              : "No se pudo crear la deuda.",
        );
      }
    });
  };

  const handleDelete = (item: Obligation) => {
    setError(null);
    setDeleteTarget(item);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;

    setError(null);
    startTransition(async () => {
      try {
        await deleteObligationAction(userId, deleteTarget.id_obligation);
        setItems((prev) =>
          prev.filter((row) => row.id_obligation !== deleteTarget.id_obligation),
        );
        if (selected?.id_obligation === deleteTarget.id_obligation) setSelected(null);
        if (paymentTarget?.id_obligation === deleteTarget.id_obligation) setPaymentTarget(null);
        if (editingId === deleteTarget.id_obligation) {
          resetForm();
          setModalOpen(false);
        }
        setDeleteTarget(null);
        showToast(`“${deleteTarget.title}” eliminada.`);
        router.refresh();
      } catch (actionError) {
        setError(
          actionError instanceof Error ? actionError.message : "No se pudo eliminar la deuda.",
        );
      }
    });
  };

  const handlePayment = () => {
    if (!paymentTarget) return;
    const amount = Number(paymentForm.amount);
    if (!paymentForm.account_id) return setError("Selecciona la cuenta de origen.");
    if (!amount || amount <= 0) return setError("El monto del pago debe ser mayor a cero.");

    const installmentNumber = paymentForm.installment_number
      ? Number(paymentForm.installment_number)
      : undefined;

    setError(null);
    startTransition(async () => {
      try {
        await registerObligationPaymentAction(userId, paymentTarget.id_obligation, {
          amount,
          account_id: Number(paymentForm.account_id),
          installment_number: installmentNumber,
          note: paymentForm.note.trim() || undefined,
          mark_as_paid: settleFull,
        });
        showToast(
          settleFull
            ? `“${paymentTarget.title}” marcada como pagada.`
            : `Pago registrado en “${paymentTarget.title}”.`,
        );
        setPaymentTarget(null);
        setSettleFull(false);
        setSelected(null);
        router.refresh();
      } catch (actionError) {
        setError(
          actionError instanceof Error ? actionError.message : "No se pudo registrar el pago.",
        );
      }
    });
  };

  const changeStatus = (item: Obligation, nextStatus: "active" | "paused") => {
    if (item.status === nextStatus) return;
    if (item.status === "paid") {
      setError("Una deuda pagada no se puede pausar ni reactivar así. Crea una nueva si aplica.");
      return;
    }

    const previous = item.status;
    setError(null);
    // Optimistic UI: el badge cambia al instante
    setItems((prev) =>
      prev.map((row) =>
        row.id_obligation === item.id_obligation ? { ...row, status: nextStatus } : row,
      ),
    );
    if (selected?.id_obligation === item.id_obligation) {
      setSelected({ ...item, status: nextStatus });
    }

    startTransition(async () => {
      try {
        const updated = await updateObligationStatusAction(
          userId,
          item.id_obligation,
          nextStatus,
        );
        setItems((prev) =>
          prev.map((row) =>
            row.id_obligation === updated.id_obligation ? updated : row,
          ),
        );
        showToast(
          nextStatus === "paused"
            ? `“${item.title}” quedó pausada.`
            : `“${item.title}” quedó activa otra vez.`,
        );
        router.refresh();
      } catch (actionError) {
        setItems((prev) =>
          prev.map((row) =>
            row.id_obligation === item.id_obligation ? { ...row, status: previous } : row,
          ),
        );
        if (selected?.id_obligation === item.id_obligation) {
          setSelected({ ...item, status: previous });
        }
        setError(
          actionError instanceof Error
            ? actionError.message
            : "No se pudo actualizar el estado de la deuda.",
        );
      }
    });
  };

  const openDetail = (item: Obligation) => {
    const { meta } = parseObligationDescription(item.description);
    const p = installmentProgress(meta);
    setSelected(item);
    setDetailPaid(String(p.paid));
    setDetailTotal(String(p.total));
    setError(null);
  };

  const saveInstallments = () => {
    if (!selected) return;
    const paid = Number(detailPaid);
    const total = Number(detailTotal);
    if (!Number.isFinite(total) || total < 1) return setError("El total de cuotas debe ser mínimo 1.");
    if (!Number.isFinite(paid) || paid < 0 || paid > total) {
      return setError("Las cuotas pagadas deben estar entre 0 y el total.");
    }
    const { notes, meta } = parseObligationDescription(selected.description);
    const nextStatus: Obligation["status"] = paid >= total ? "paid" : selected.status;
    setError(null);
    startTransition(async () => {
      await updateObligationAction(userId, selected.id_obligation, {
        description: encodeObligationDescription(notes, {
          totalInstallments: total,
          paidInstallments: paid,
          totalDebt: meta.totalDebt,
        }),
        status: nextStatus,
      });
      setSelected(null);
      router.refresh();
    });
  };

  const selectedAccount = accounts.find(
    (account) => String(account.account_id) === paymentForm.account_id,
  );
  const paymentAmount = Number(paymentForm.amount || 0);
  const balanceAfter = selectedAccount
    ? Number(selectedAccount.balance ?? 0) - paymentAmount
    : null;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border-subtle bg-surface-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Compromisos por pagar
            </p>
            <h1 className="mt-1 text-xl font-semibold text-text-primary">Deudas pendientes</h1>
            <p className="mt-1 max-w-xl text-sm text-text-secondary">
              Registra deudas con cuotas y vencimientos. Al pagar, el movimiento se crea en
              Transacciones y se descuenta de la cuenta que elijas.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black"
          >
            <Plus className="size-4" />
            Nueva deuda
          </button>
        </div>
      </div>

      {accounts.length === 0 ? (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Crea al menos una cuenta para registrar pagos de deudas.
        </p>
      ) : null}

      {error && !modalOpen && !paymentTarget && !selected && !deleteTarget ? (
        <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Pendientes", metrics.active, "text-sky-300"],
          ["Total por pagar", formatMoney(metrics.totalPending), "text-text-primary"],
          ["Vencidas", metrics.overdue, "text-rose-300"],
          ["Próximos 7 días", metrics.next7, "text-emerald-300"],
        ].map(([label, value, tone]) => (
          <div key={String(label)} className="rounded-2xl border border-border-subtle bg-surface-card p-4">
            <p className="text-xs text-text-muted">{label}</p>
            <p className={`mt-1 text-2xl font-semibold ${tone}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border-subtle bg-surface-card p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-text-primary">Deudas registradas</h2>
            <p className="mt-1 text-xs text-text-muted">Filtra por estado, vencimiento y texto.</p>
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className={`${financeInputClass} w-auto min-w-44`}
          >
            {Object.entries(SORT_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar deuda, nota, monto, estado…"
              className={`${financeInputClass} pl-10`}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(["all", "active", "paid", "paused"] as FilterStatus[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setStatus(key)}
                className={`rounded-xl border px-3 py-2 text-xs font-semibold ${
                  status === key
                    ? "border-emerald-500 bg-emerald-500 text-black"
                    : "border-border-default text-text-secondary"
                }`}
              >
                {key === "all" ? "Todas" : STATUS_LABELS[key]}
              </button>
            ))}
            {(["overdue", "7d", "30d"] as DueFilter[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setDueFilter(dueFilter === key ? "all" : key)}
                className={`rounded-xl border px-3 py-2 text-xs font-semibold ${
                  dueFilter === key
                    ? "border-emerald-500 bg-emerald-500 text-black"
                    : "border-border-default text-text-secondary"
                }`}
              >
                {key === "overdue" ? "Vencidas" : key === "7d" ? "7 días" : "30 días"}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border-default p-8 text-center">
              <CalendarClock className="mx-auto size-8 text-text-muted" />
              <p className="mt-2 text-sm text-text-muted">No hay deudas que coincidan.</p>
            </div>
          ) : null}

          {filtered.map(({ item, notes, meta, progress: p, days }) => {
            const totalDebt =
              meta.totalDebt != null && meta.totalDebt > 0
                ? meta.totalDebt
                : Number(item.amount) * p.total;
            return (
            <div
              key={item.id_obligation}
              className="rounded-xl border border-border-default bg-surface-muted p-4"
            >
              <button
                type="button"
                onClick={() => openDetail(item)}
                className="w-full text-left"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex size-9 items-center justify-center rounded-xl border border-border-default bg-surface-card text-emerald-300">
                        {item.status === "paid" ? (
                          <CheckCircle2 className="size-4" />
                        ) : item.status === "paused" ? (
                          <PauseCircle className="size-4" />
                        ) : (
                          <CreditCard className="size-4" />
                        )}
                      </span>
                      <h3 className="text-sm font-semibold text-text-primary">{item.title}</h3>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusClasses(item.status)}`}
                      >
                        {STATUS_LABELS[item.status]}
                      </span>
                      {days < 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 px-2 py-0.5 text-[10px] font-semibold text-rose-200">
                          <AlertCircle className="size-3" /> Vencida
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-xs text-text-muted">
                      {FREQUENCY_LABELS[item.frequency]} · vence {formatDate(item.next_due_date)} ·{" "}
                      {days < 0
                        ? `${Math.abs(days)} día(s) vencida`
                        : `faltan ${days} día(s)`}
                    </p>
                    {notes ? <p className="mt-1 text-xs text-text-secondary">{notes}</p> : null}
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/20">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${p.pct}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-text-muted">
                      Cuotas {p.paid}/{p.total} · {p.pct}% pagado · deuda {formatMoney(totalDebt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-text-primary">
                      {formatMoney(Number(item.amount))}
                    </p>
                    <p className="mt-0.5 text-[11px] text-text-muted">valor cuota</p>
                  </div>
                </div>
              </button>

              <div className="mt-3 flex flex-wrap gap-2 border-t border-border-subtle pt-3">
                {item.status !== "paid" ? (
                  <button
                    type="button"
                    onClick={() => openPayment(item)}
                    disabled={accounts.length === 0 || isPending}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-200 disabled:opacity-50"
                  >
                    <ArrowLeftRight className="size-3.5" />
                    Registrar pago
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => openEdit(item)}
                  className="inline-flex items-center gap-1 rounded-lg border border-border-default px-2 py-1 text-xs text-text-secondary hover:text-text-primary"
                >
                  <Pencil className="size-3" />
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item)}
                  disabled={isPending}
                  className="inline-flex items-center gap-1 rounded-lg border border-rose-500/40 px-2 py-1 text-xs text-rose-300 disabled:opacity-50"
                >
                  <Trash2 className="size-3" />
                  Eliminar
                </button>
                {item.status !== "paid" ? (
                  <button
                    type="button"
                    onClick={() => openMarkAsPaid(item)}
                    disabled={accounts.length === 0 || isPending}
                    className="rounded-lg border border-emerald-500/40 px-2 py-1 text-xs text-emerald-300 disabled:opacity-50"
                  >
                    Marcar pagada
                  </button>
                ) : null}
                {item.status === "active" ? (
                  <button
                    type="button"
                    onClick={() => changeStatus(item, "paused")}
                    disabled={isPending}
                    className="inline-flex items-center gap-1 rounded-lg border border-amber-500/40 px-2 py-1 text-xs text-amber-300 disabled:opacity-50"
                  >
                    <PauseCircle className="size-3" />
                    Pausar
                  </button>
                ) : null}
                {item.status === "paused" ? (
                  <button
                    type="button"
                    onClick={() => changeStatus(item, "active")}
                    disabled={isPending}
                    className="inline-flex items-center gap-1 rounded-lg border border-sky-500/40 px-2 py-1 text-xs text-sky-300 disabled:opacity-50"
                  >
                    <CheckCircle2 className="size-3" />
                    Reactivar
                  </button>
                ) : null}
              </div>
            </div>
            );
          })}
        </div>
      </div>

      {modalOpen ? (
        <FinanceModal
          title={editingId ? "Editar deuda" : "Nueva deuda"}
          subtitle={
            editingId
              ? "Actualiza los datos de la deuda. Los pagos ya registrados no se modifican."
              : "Registra una deuda con cuotas, monto y próximo vencimiento."
          }
          onClose={() => {
            setModalOpen(false);
            resetForm();
          }}
        >
          <div className="space-y-4">
            <FinanceFormField label="Nombre de la deuda" required hint='Ej: "Crédito moto", "Tarjeta", "Arriendo".'>
              <input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="¿Qué debes pagar?"
                className={financeInputClass}
              />
            </FinanceFormField>
            <FinanceFormField
              label="Valor de la deuda"
              required
              hint="Monto total que debes (ej. saldo del crédito)."
            >
              <input
                type="number"
                value={form.totalDebt}
                onChange={(e) => setForm((p) => ({ ...p, totalDebt: e.target.value }))}
                placeholder="Ej: 4200000"
                className={financeInputClass}
              />
            </FinanceFormField>
            <div className="grid gap-3 sm:grid-cols-2">
              <FinanceFormField label="Valor de la cuota" required>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                  placeholder="Ej: 350000"
                  className={financeInputClass}
                />
              </FinanceFormField>
              <FinanceFormField label="Frecuencia">
                <select
                  value={form.frequency}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, frequency: e.target.value as Obligation["frequency"] }))
                  }
                  className={financeInputClass}
                >
                  <option value="once">Pago único</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensual</option>
                  <option value="yearly">Anual</option>
                </select>
              </FinanceFormField>
            </div>
            <FinanceFormField label="Fecha de pago de la deuda o cuota" required>
              <input
                type="date"
                value={form.next_due_date}
                onChange={(e) => setForm((p) => ({ ...p, next_due_date: e.target.value }))}
                className={`${financeInputClass} [color-scheme:dark]`}
              />
            </FinanceFormField>
            <div className="grid gap-3 sm:grid-cols-2">
              <FinanceFormField label="Número de cuotas" required>
                <input
                  type="number"
                  min={1}
                  value={form.totalInstallments}
                  onChange={(e) => setForm((p) => ({ ...p, totalInstallments: e.target.value }))}
                  className={financeInputClass}
                />
              </FinanceFormField>
              <FinanceFormField label="Cuotas ya pagadas">
                <input
                  type="number"
                  min={0}
                  value={form.paidInstallments}
                  onChange={(e) => setForm((p) => ({ ...p, paidInstallments: e.target.value }))}
                  className={financeInputClass}
                />
              </FinanceFormField>
            </div>
            <FinanceFormField label="Notas (opcional)">
              <input
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Ej: débito automático día 5"
                className={financeInputClass}
              />
            </FinanceFormField>
            {error ? <p className="text-sm text-red-400">{error}</p> : null}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setModalOpen(false);
                  resetForm();
                }}
                className="rounded-xl border border-border-default px-4 py-2 text-sm text-text-secondary"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isPending}
                className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
              >
                {isPending ? "Guardando…" : editingId ? "Guardar cambios" : "Registrar deuda"}
              </button>
            </div>
          </div>
        </FinanceModal>
      ) : null}

      {paymentTarget ? (
        <FinanceModal
          title={
            settleFull
              ? `Marcar pagada: ${paymentTarget.title}`
              : `Registrar pago: ${paymentTarget.title}`
          }
          subtitle={
            settleFull
              ? "Registra el pago final con la cuenta de origen. Al confirmar, la deuda quedará marcada como pagada."
              : "Se creará un gasto en Transacciones y se descontará de la cuenta origen."
          }
          onClose={() => {
            setPaymentTarget(null);
            setSettleFull(false);
          }}
        >
          <div className="space-y-4">
            {settleFull ? (
              <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-100">
                Saldo pendiente sugerido:{" "}
                <span className="font-semibold">
                  {formatMoney(remainingDebtAmount(paymentTarget))}
                </span>
                . Puedes ajustar el monto del pago antes de confirmar.
              </div>
            ) : null}
            <FinanceFormField label="Monto del pago" required>
              <input
                type="number"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm((p) => ({ ...p, amount: e.target.value }))}
                className={financeInputClass}
              />
            </FinanceFormField>
            {!settleFull
              ? (() => {
                  const { meta } = parseObligationDescription(paymentTarget.description);
                  const p = installmentProgress(meta);
                  return p.total > 1 ? (
                    <FinanceFormField
                      label="Número de cuota"
                      hint={`Cuota a registrar (1–${p.total}). Siguiente sugerida: ${Math.min(p.total, p.paid + 1)}.`}
                    >
                      <input
                        type="number"
                        min={1}
                        max={p.total}
                        value={paymentForm.installment_number}
                        onChange={(e) =>
                          setPaymentForm((prev) => ({
                            ...prev,
                            installment_number: e.target.value,
                          }))
                        }
                        className={financeInputClass}
                      />
                    </FinanceFormField>
                  ) : null;
                })()
              : null}
            <FinanceFormField label="Cuenta de origen" required>
              <select
                value={paymentForm.account_id}
                onChange={(e) =>
                  setPaymentForm((p) => ({ ...p, account_id: e.target.value }))
                }
                className={financeInputClass}
              >
                <option value="">Selecciona cuenta</option>
                {accounts.map((account) => (
                  <option key={account.account_id} value={account.account_id}>
                    {account.account_name} · {formatMoney(Number(account.balance))}
                  </option>
                ))}
              </select>
            </FinanceFormField>
            {selectedAccount && paymentAmount > 0 ? (
              <div className="grid gap-3 rounded-xl border border-border-default bg-surface-muted p-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-text-muted">Saldo actual</p>
                  <p className="text-lg font-semibold text-text-primary">
                    {formatMoney(Number(selectedAccount.balance))}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Después del pago</p>
                  <p
                    className={`text-lg font-semibold ${
                      balanceAfter != null && balanceAfter < 0
                        ? "text-rose-300"
                        : "text-emerald-300"
                    }`}
                  >
                    {balanceAfter != null ? formatMoney(balanceAfter) : "—"}
                  </p>
                </div>
              </div>
            ) : null}
            <FinanceFormField label="Nota (opcional)">
              <input
                value={paymentForm.note}
                onChange={(e) => setPaymentForm((p) => ({ ...p, note: e.target.value }))}
                placeholder="Ej: pago en efectivo"
                className={financeInputClass}
              />
            </FinanceFormField>
            {error ? <p className="text-sm text-red-400">{error}</p> : null}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setPaymentTarget(null);
                  setSettleFull(false);
                }}
                className="rounded-xl border border-border-default px-4 py-2 text-sm text-text-secondary"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handlePayment}
                disabled={isPending || !paymentForm.account_id}
                className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
              >
                {isPending
                  ? "Registrando…"
                  : settleFull
                    ? "Confirmar y marcar pagada"
                    : "Confirmar pago"}
              </button>
            </div>
          </div>
        </FinanceModal>
      ) : null}

      {selected ? (
        <FinanceModal
          title={selected.title}
          subtitle="Detalle de la deuda y control manual de cuotas."
          onClose={() => setSelected(null)}
        >
          <div className="space-y-4">
            {(() => {
              const { meta } = parseObligationDescription(selected.description);
              const p = installmentProgress(meta);
              const totalDebt =
                meta.totalDebt != null && meta.totalDebt > 0
                  ? meta.totalDebt
                  : Number(selected.amount) * p.total;
              return (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-border-default bg-surface-muted p-4">
                    <p className="text-xs text-text-muted">Valor de la deuda</p>
                    <p className="mt-1 text-2xl font-semibold text-text-primary">
                      {formatMoney(totalDebt)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border-default bg-surface-muted p-4">
                    <p className="text-xs text-text-muted">Valor de cuota</p>
                    <p className="mt-1 text-2xl font-semibold text-text-primary">
                      {formatMoney(Number(selected.amount))}
                    </p>
                  </div>
                  <p className="sm:col-span-2 text-sm text-text-secondary">
                    Fecha de pago: {formatDate(selected.next_due_date)} ·{" "}
                    {FREQUENCY_LABELS[selected.frequency]}
                  </p>
                </div>
              );
            })()}
            <div className="grid gap-3 sm:grid-cols-2">
              <FinanceFormField label="Cuotas pagadas">
                <input
                  type="number"
                  min={0}
                  value={detailPaid}
                  onChange={(e) => setDetailPaid(e.target.value)}
                  className={financeInputClass}
                />
              </FinanceFormField>
              <FinanceFormField label="Número total de cuotas">
                <input
                  type="number"
                  min={1}
                  value={detailTotal}
                  onChange={(e) => setDetailTotal(e.target.value)}
                  className={financeInputClass}
                />
              </FinanceFormField>
            </div>
            {error ? <p className="text-sm text-red-400">{error}</p> : null}
            <div className="flex flex-wrap justify-end gap-3 pt-2">
              {selected.status !== "paid" ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelected(null);
                    openPayment(selected);
                  }}
                  className="rounded-xl border border-emerald-500/40 px-4 py-2 text-sm font-semibold text-emerald-200"
                >
                  Registrar pago
                </button>
              ) : null}
              {selected.status === "active" ? (
                <button
                  type="button"
                  onClick={() => changeStatus(selected, "paused")}
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 px-4 py-2 text-sm text-amber-300 disabled:opacity-50"
                >
                  <PauseCircle className="size-3.5" />
                  Pausar
                </button>
              ) : null}
              {selected.status === "paused" ? (
                <button
                  type="button"
                  onClick={() => changeStatus(selected, "active")}
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-sky-500/40 px-4 py-2 text-sm text-sky-300 disabled:opacity-50"
                >
                  <CheckCircle2 className="size-3.5" />
                  Reactivar
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  const item = selected;
                  setSelected(null);
                  openEdit(item);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border-default px-4 py-2 text-sm text-text-secondary"
              >
                <Pencil className="size-3.5" />
                Editar
              </button>
              <button
                type="button"
                onClick={() => handleDelete(selected)}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/40 px-4 py-2 text-sm text-rose-300 disabled:opacity-50"
              >
                <Trash2 className="size-3.5" />
                Eliminar
              </button>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-xl border border-border-default px-4 py-2 text-sm text-text-secondary"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={saveInstallments}
                disabled={isPending}
                className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
              >
                {isPending ? "Guardando…" : "Guardar cuotas"}
              </button>
            </div>
          </div>
        </FinanceModal>
      ) : null}

      {deleteTarget ? (
        <FinanceConfirmModal
          title={`Eliminar "${deleteTarget.title}"`}
          subtitle="Esta acción no se puede deshacer."
          description="Se borrará el registro de la deuda. Los pagos que ya registraste en Transacciones y los saldos de tus cuentas no se modifican."
          confirmLabel="Sí, eliminar deuda"
          cancelLabel="Conservar deuda"
          isPending={isPending}
          onClose={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      ) : null}

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-[300] -translate-x-1/2 rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-4 py-2.5 text-sm font-medium text-emerald-100 shadow-lg">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
