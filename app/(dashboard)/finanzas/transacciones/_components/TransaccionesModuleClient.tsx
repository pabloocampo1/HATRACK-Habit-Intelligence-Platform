"use client";

import {
  createTransactionAction,
  deleteTransactionAction,
  updateTransactionAction,
} from "@/app/actions/finance/financeActions";
import FinanceFormField from "../../_components/FinanceFormField";
import FinanceModal, { financeInputClass } from "../../_components/FinanceModal";
import {
  OBLIGATION_META_PREFIX,
  OBLIGATION_PAYMENT_META_PREFIX,
} from "@/lib/finance/obligationMeta";
import { Account, FinanceCategory, FinanceTransaction } from "@/lib/types";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Copy,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

type TxType = FinanceTransaction["type"];
type TxStatus = "pending" | "completed" | "cancelled";
type Recurrence = "none" | "daily" | "weekly" | "monthly" | "yearly";
type QuickPeriod = "all" | "today" | "week" | "month";
type SortKey = "recent" | "oldest" | "amount_desc" | "amount_asc";

type SplitLine = { category_id: string; amount: string };

type TxMeta = {
  tags?: string[];
  favorite?: boolean;
  recurrence?: Recurrence;
  splits?: Array<{ category_id: number; amount: number }>;
  notes?: string;
};

type FormState = {
  editingId: number | null;
  title: string;
  type: TxType;
  amount: string;
  account_id: string;
  category_id: string;
  to_account_id: string;
  description: string;
  date: string;
  time: string;
  status: TxStatus;
  tagInput: string;
  tags: string[];
  recurrence: Recurrence;
  favorite: boolean;
  splitEnabled: boolean;
  splits: SplitLine[];
};

type Props = {
  userId: string;
  accounts: Account[];
  categories: FinanceCategory[];
  transactions: FinanceTransaction[];
};

const META_PREFIX = "[[HATRACK_TX_META]]";
const SAVINGS_META_PREFIX = "[[HATRACK_SAVINGS_META]]";
const SORT_STORAGE_KEY = "hatrack:finance:transactions:sort";
const FAVORITES_STORAGE_KEY = "hatrack:finance:transactions:favorites";
const PAGE_SIZE = 30;

const TYPE_LABELS: Record<TxType, string> = {
  income: "Ingreso",
  expense: "Gasto",
  transfer: "Transferencia",
};

const STATUS_LABELS: Record<TxStatus, string> = {
  pending: "Pendiente",
  completed: "Completado",
  cancelled: "Cancelado",
};

const RECURRENCE_LABELS: Record<Recurrence, string> = {
  none: "Sin recurrencia",
  daily: "Diario",
  weekly: "Semanal",
  monthly: "Mensual",
  yearly: "Anual",
};

const SORT_LABELS: Record<SortKey, string> = {
  recent: "Más reciente",
  oldest: "Más antiguo",
  amount_desc: "Mayor monto",
  amount_asc: "Menor monto",
};

function todayBogota() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function nowBogotaTime() {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Bogota",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

function formatDateBogota(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", {
    dateStyle: "medium",
    timeZone: "America/Bogota",
  });
}

function formatTimeBogota(iso: string) {
  return new Date(iso).toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Bogota",
  });
}

function isoFromBogota(date: string, time: string) {
  return new Date(`${date}T${time || "00:00"}:00-05:00`).toISOString();
}

function formatMoney(value: number) {
  return `$${Math.round(value).toLocaleString("es-CO")}`;
}

function normalizeStatus(status?: string | null): TxStatus {
  if (status === "pending" || status === "cancelled") return status;
  return "completed";
}

function encodeDescription(notes: string, meta: TxMeta) {
  const cleanNotes = notes.trim();
  const hasMeta =
    (meta.tags?.length ?? 0) > 0 ||
    Boolean(meta.favorite) ||
    (meta.recurrence && meta.recurrence !== "none") ||
    (meta.splits?.length ?? 0) > 0;

  if (!hasMeta) return cleanNotes || undefined;
  return `${cleanNotes}${cleanNotes ? "\n" : ""}${META_PREFIX}${JSON.stringify(meta)}`;
}

function stripInternalMeta(raw: string): string {
  let text = raw;
  for (const prefix of [
    META_PREFIX,
    SAVINGS_META_PREFIX,
    OBLIGATION_META_PREFIX,
    OBLIGATION_PAYMENT_META_PREFIX,
  ]) {
    const idx = text.indexOf(prefix);
    if (idx !== -1) text = text.slice(0, idx);
  }
  return text.trim();
}

function parseDescription(raw?: string | null): { notes: string; meta: TxMeta } {
  if (!raw) return { notes: "", meta: {} };

  const txIdx = raw.indexOf(META_PREFIX);
  let meta: TxMeta = {};
  if (txIdx !== -1) {
    try {
      meta = JSON.parse(raw.slice(txIdx + META_PREFIX.length)) as TxMeta;
    } catch {
      meta = {};
    }
  }

  return {
    notes: stripInternalMeta(raw),
    meta,
  };
}

function categoryIcon(categoryName?: string, title?: string) {
  const value = `${categoryName ?? ""} ${title ?? ""}`.toLowerCase();
  if (/salario|n[oó]mina|sueldo|pago/.test(value)) return "💰";
  if (/comida|alimenta|mercado|restaurante|almuerzo|cena/.test(value)) return "🍔";
  if (/moto|transporte|gasolina|uber|taxi/.test(value)) return "🏍️";
  if (/casa|hogar|arriendo|servicio|luz|agua/.test(value)) return "🏠";
  if (/salud|eps|m[eé]dico|farmacia/.test(value)) return "❤️";
  if (/educaci[oó]n|curso|libro|universidad/.test(value)) return "📚";
  if (/ocio|entreten|netflix|spotify|cine|juego/.test(value)) return "🎮";
  if (/viaje|vacacion|vuelo|hotel/.test(value)) return "✈️";
  return "●";
}

function emptyForm(accounts: Account[]): FormState {
  return {
    editingId: null,
    title: "",
    type: "expense",
    amount: "",
    account_id: accounts[0]?.account_id ? String(accounts[0].account_id) : "",
    category_id: "",
    to_account_id: "",
    description: "",
    date: todayBogota(),
    time: nowBogotaTime(),
    status: "completed",
    tagInput: "",
    tags: [],
    recurrence: "none",
    favorite: false,
    splitEnabled: false,
    splits: [{ category_id: "", amount: "" }],
  };
}

function startOfWeek(d: Date) {
  const out = new Date(d);
  const day = out.getDay();
  const diff = out.getDate() - day + (day === 0 ? -6 : 1);
  out.setDate(diff);
  out.setHours(0, 0, 0, 0);
  return out;
}

function matchesQuickPeriod(iso: string, period: QuickPeriod) {
  if (period === "all") return true;
  const d = new Date(iso);
  const now = new Date();
  if (period === "today") {
    return (
      d.toLocaleDateString("en-CA", { timeZone: "America/Bogota" }) ===
      now.toLocaleDateString("en-CA", { timeZone: "America/Bogota" })
    );
  }
  if (period === "week") return d >= startOfWeek(now);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  return d >= monthStart;
}

export default function TransaccionesModuleClient({
  userId,
  accounts,
  categories,
  transactions,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(() => emptyForm(accounts));
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState<QuickPeriod>("all");
  const [typeFilter, setTypeFilter] = useState<TxType | "all">("all");
  const [sort, setSort] = useState<SortKey>("recent");
  const [page, setPage] = useState(1);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [toast, setToast] = useState<{
    txId: number;
    title: string;
    timeout: ReturnType<typeof setTimeout>;
  } | null>(null);

  useEffect(() => {
    const savedSort = localStorage.getItem(SORT_STORAGE_KEY) as SortKey | null;
    if (
      savedSort === "recent" ||
      savedSort === "oldest" ||
      savedSort === "amount_desc" ||
      savedSort === "amount_asc"
    ) {
      setSort(savedSort);
    }
    setFavoriteIds(JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY) || "[]"));
  }, []);

  useEffect(() => {
    localStorage.setItem(SORT_STORAGE_KEY, sort);
  }, [sort]);

  useEffect(() => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  useEffect(() => () => {
    if (toast?.timeout) clearTimeout(toast.timeout);
  }, [toast]);

  const categoryById = useMemo(
    () => new Map(categories.map((category) => [Number(category.id_category), category])),
    [categories],
  );

  const accountById = useMemo(
    () => new Map(accounts.map((account) => [String(account.account_id), account])),
    [accounts],
  );

  const selectedAccount = accountById.get(form.account_id);
  const amount = Number(form.amount || 0);
  const currentBalance = Number(selectedAccount?.balance ?? 0);
  const balanceDelta =
    form.type === "income" ? amount : form.type === "expense" || form.type === "transfer" ? -amount : 0;
  const balanceAfter = currentBalance + balanceDelta;

  const metrics = useMemo(() => {
    const income = transactions
      .filter((tx) => tx.type === "income")
      .reduce((sum, tx) => sum + Number(tx.amount ?? 0), 0);
    const expense = transactions
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + Number(tx.amount ?? 0), 0);
    return { income, expense, cashflow: income - expense };
  }, [transactions]);

  const allTags = useMemo(() => {
    const s = new Set<string>(["Casa", "Trabajo", "Emergencia", "Moto", "Viaje", "Vacaciones"]);
    transactions.forEach((tx) => {
      parseDescription(tx.description).meta.tags?.forEach((tag) => s.add(tag));
    });
    form.tags.forEach((tag) => s.add(tag));
    return [...s];
  }, [transactions, form.tags]);

  const filteredTransactions = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = transactions.filter((tx) => {
      const category = categoryById.get(Number(tx.category_id ?? 0));
      const from = accountById.get(String(tx.account_id));
      const to = tx.to_account_id ? accountById.get(String(tx.to_account_id)) : null;
      const { meta, notes } = parseDescription(tx.description);
      if (!matchesQuickPeriod(tx.transaction_date, period)) return false;
      if (typeFilter !== "all" && tx.type !== typeFilter) return false;
      if (q) {
        const blob = [
          tx.title,
          notes,
          TYPE_LABELS[tx.type],
          category?.name,
          from?.account_name,
          to?.account_name,
          String(tx.amount),
          normalizeStatus(tx.status),
          ...(meta.tags ?? []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!blob.includes(q)) return false;
      }
      return true;
    });

    return rows.sort((a, b) => {
      if (sort === "oldest") {
        return new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime();
      }
      if (sort === "amount_desc") return Number(b.amount) - Number(a.amount);
      if (sort === "amount_asc") return Number(a.amount) - Number(b.amount);
      return new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime();
    });
  }, [accountById, categoryById, period, search, sort, transactions, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [search, period, typeFilter, sort]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pagedTransactions = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredTransactions.slice(start, start + PAGE_SIZE);
  }, [filteredTransactions, page]);

  const pageRangeLabel = useMemo(() => {
    if (filteredTransactions.length === 0) return "0 de 0";
    const start = (page - 1) * PAGE_SIZE + 1;
    const end = Math.min(page * PAGE_SIZE, filteredTransactions.length);
    return `${start}–${end} de ${filteredTransactions.length}`;
  }, [filteredTransactions.length, page]);

  const favoriteTransactions = transactions.filter((tx) =>
    favoriteIds.includes(String(tx.id_transaction)),
  );

  const updateForm = (patch: Partial<FormState>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const resetForm = () => {
    setForm(emptyForm(accounts));
    setError(null);
  };

  const openCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  const addTag = (tag?: string) => {
    const clean = (tag ?? form.tagInput).trim();
    if (!clean) return;
    if (form.tags.some((item) => item.toLowerCase() === clean.toLowerCase())) {
      updateForm({ tagInput: "" });
      return;
    }
    updateForm({ tags: [...form.tags, clean], tagInput: "" });
  };

  const removeTag = (tag: string) => {
    updateForm({ tags: form.tags.filter((item) => item !== tag) });
  };

  const fillFromTransaction = (tx: FinanceTransaction, mode: "edit" | "duplicate") => {
    const { notes, meta } = parseDescription(tx.description);
    const date = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Bogota",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(tx.transaction_date));
    const time = new Intl.DateTimeFormat("en-GB", {
      timeZone: "America/Bogota",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(tx.transaction_date));

    setForm({
      ...emptyForm(accounts),
      editingId: mode === "edit" ? tx.id_transaction : null,
      title: tx.title,
      type: tx.type,
      amount: String(Number(tx.amount ?? 0)),
      account_id: String(tx.account_id),
      category_id: tx.category_id ? String(tx.category_id) : "",
      to_account_id: tx.to_account_id ? String(tx.to_account_id) : "",
      description: notes,
      date,
      time,
      status: normalizeStatus(tx.status),
      tags: meta.tags ?? [],
      recurrence: meta.recurrence ?? "none",
      favorite: favoriteIds.includes(String(tx.id_transaction)) || Boolean(meta.favorite),
      splitEnabled: (meta.splits?.length ?? 0) > 0,
      splits:
        meta.splits?.map((s) => ({
          category_id: String(s.category_id),
          amount: String(s.amount),
        })) ?? [{ category_id: "", amount: "" }],
      tagInput: "",
    });
    setError(null);
    setModalOpen(true);
  };

  const validateForm = () => {
    const n = Number(form.amount);
    if (!form.title.trim()) return "El concepto es obligatorio.";
    if (!Number.isFinite(n) || n <= 0) return "El monto debe ser mayor que cero.";
    if (!form.account_id) return "Selecciona una cuenta origen.";
    if (!form.date || Number.isNaN(new Date(`${form.date}T00:00:00`).getTime())) {
      return "Selecciona una fecha válida.";
    }
    if (!form.time) return "Selecciona una hora válida.";
    if (form.type !== "transfer" && !form.category_id) {
      return "Selecciona una categoría para este movimiento.";
    }
    if (form.type === "transfer") {
      if (!form.to_account_id) return "Selecciona una cuenta destino.";
      if (form.account_id === form.to_account_id) {
        return "La cuenta origen y destino deben ser diferentes.";
      }
    }
    if ((form.type === "expense" || form.type === "transfer") && balanceAfter < 0) {
      return "No tienes saldo suficiente para realizar esta operación.";
    }
    if (form.tags.some((tag) => tag.length > 24)) {
      return "Las etiquetas deben tener máximo 24 caracteres.";
    }
    if (form.splitEnabled && form.type === "expense") {
      if (form.splits.some((split) => !split.category_id || Number(split.amount) <= 0)) {
        return "Cada división debe tener categoría y monto mayor a cero.";
      }
      const total = form.splits.reduce((sum, split) => sum + Number(split.amount || 0), 0);
      if (Math.round(total) !== Math.round(n)) {
        return "La suma de las divisiones debe ser exactamente igual al monto principal.";
      }
    }
    return null;
  };

  const requestConfirmation = () => {
    const msg = validateForm();
    if (msg) {
      setError(msg);
      return;
    }
    setError(null);
    setConfirmOpen(true);
  };

  const handleCreate = () => {
    setError(null);
    setConfirmOpen(false);
    startTransition(async () => {
      try {
        const meta: TxMeta = {
          tags: form.tags,
          favorite: form.favorite,
          recurrence: form.recurrence,
          splits:
            form.splitEnabled && form.type === "expense"
              ? form.splits.map((split) => ({
                  category_id: Number(split.category_id),
                  amount: Number(split.amount),
                }))
              : [],
          notes: form.description.trim() || undefined,
        };
        const payload = {
          account_id: Number(form.account_id),
          category_id: form.type === "transfer" ? null : Number(form.category_id),
          amount: Number(form.amount),
          title: form.title.trim(),
          type: form.type,
          status: form.status,
          transaction_date: isoFromBogota(form.date, form.time),
          description: encodeDescription(form.description, meta),
          to_account_id:
            form.type === "transfer" && form.to_account_id
              ? Number(form.to_account_id)
              : null,
        };
        const saved = form.editingId
          ? await updateTransactionAction(userId, form.editingId, payload)
          : await createTransactionAction(userId, payload);
        if (form.favorite || meta.favorite) {
          setFavoriteIds((prev) => [...new Set([...prev, String(saved.id_transaction)])]);
        }
        resetForm();
        setModalOpen(false);
        if (!form.editingId) {
          const timeout = setTimeout(() => setToast(null), 5000);
          setToast({ txId: saved.id_transaction, title: saved.title, timeout });
        }
        router.refresh();
      } catch (actionError) {
        setError(
          actionError instanceof Error
            ? actionError.message
            : "No se pudo registrar la transacción.",
        );
      }
    });
  };

  const handleDelete = (idTransaction: number) => {
    startTransition(async () => {
      await deleteTransactionAction(userId, idTransaction);
      setFavoriteIds((prev) => prev.filter((id) => id !== String(idTransaction)));
      router.refresh();
    });
  };

  const handleUndo = () => {
    if (!toast) return;
    clearTimeout(toast.timeout);
    const txId = toast.txId;
    setToast(null);
    handleDelete(txId);
  };

  const toggleFavorite = (id: number) => {
    setFavoriteIds((prev) =>
      prev.includes(String(id))
        ? prev.filter((item) => item !== String(id))
        : [...prev, String(id)],
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Transacciones</h1>
          <p className="mt-1 max-w-xl text-sm text-text-secondary">
            Registra ingresos, gastos y transferencias entre cuentas. Aquí también aparecen
            pagos de deudas y aportes a metas de ahorro.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={openCreate}
            disabled={accounts.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black disabled:opacity-50"
          >
            <Plus className="size-4" />
            Nueva transacción
          </button>
        </div>
      </div>

      {accounts.length === 0 ? (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Primero crea al menos una cuenta en el módulo de Cuentas.
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border-subtle bg-surface-card p-4">
          <p className="text-xs text-text-muted">Ingresos totales</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-400">
            ${metrics.income.toLocaleString("es-CO")}
          </p>
        </div>
        <div className="rounded-2xl border border-border-subtle bg-surface-card p-4">
          <p className="text-xs text-text-muted">Gastos totales</p>
          <p className="mt-1 text-2xl font-semibold text-rose-300">
            ${metrics.expense.toLocaleString("es-CO")}
          </p>
        </div>
        <div className="rounded-2xl border border-border-subtle bg-surface-card p-4">
          <p className="text-xs text-text-muted">Flujo neto</p>
          <p className="mt-1 text-2xl font-semibold text-text-primary">
            ${metrics.cashflow.toLocaleString("es-CO")}
          </p>
        </div>
      </div>

      {favoriteTransactions.length > 0 ? (
        <div className="rounded-2xl border border-border-subtle bg-surface-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Favoritos
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {favoriteTransactions.map((tx) => (
              <button
                key={tx.id_transaction}
                type="button"
                onClick={() => fillFromTransaction(tx, "duplicate")}
                className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-200"
              >
                {tx.title}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-border-subtle bg-surface-card p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-text-primary">
              Historial de movimientos
            </h2>
            <p className="mt-1 text-xs text-text-muted">
              Busca, filtra y ordena en tiempo real. Se muestran {PAGE_SIZE} por página.
            </p>
          </div>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortKey)}
            className={`${financeInputClass} w-auto min-w-44`}
          >
            {Object.entries(SORT_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full items-center gap-3">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-text-muted" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por concepto, categoría, etiqueta, cuenta o monto…"
                className={`${financeInputClass} pl-12 py-2`}
              />
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <div className="rounded-xl border border-border-default bg-surface-card px-2 py-1 text-xs text-text-secondary">
                <span className="mr-2 text-[13px] font-semibold">Periodo</span>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as QuickPeriod)}
                  className="bg-transparent text-xs font-semibold outline-none"
                >
                  <option value="today">Hoy</option>
                  <option value="week">Esta semana</option>
                  <option value="month">Este mes</option>
                  <option value="all">Todo</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1 rounded-xl border border-border-default bg-surface-card px-2 py-1">
              {(["all", "income", "expense", "transfer"] as (TxType | "all")[]).map((t) => {
                const active = typeFilter === t || (t === "all" && typeFilter === "all");
                return (
                  <button
                    key={String(t)}
                    type="button"
                    onClick={() => setTypeFilter(t === "all" ? "all" : (typeFilter === t ? "all" : (t as TxType)))}
                    className={`flex items-center gap-2 rounded-md px-3 py-1 text-xs font-semibold transition ${
                      active ? "bg-emerald-500 text-black" : "text-text-secondary hover:bg-surface-muted"
                    }`}
                  >
                    {t === "income" ? <ArrowDownLeft className="size-4" /> : t === "expense" ? <ArrowUpRight className="size-4" /> : t === "transfer" ? <ArrowLeftRight className="size-4" /> : null}
                    <span>{t === "all" ? "Todos" : TYPE_LABELS[t as TxType]}</span>
                  </button>
                );
              })}
            </div>

            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              className={`${financeInputClass} w-auto text-sm`}
            >
              {Object.entries(SORT_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          {filteredTransactions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border-default p-8 text-center">
              <ArrowLeftRight className="mx-auto size-8 text-text-muted" />
              <p className="mt-2 text-sm text-text-muted">
                No hay movimientos que coincidan con la búsqueda.
              </p>
            </div>
          ) : null}
          {pagedTransactions.map((tx) => {
            const category = categoryById.get(Number(tx.category_id ?? 0));
            const from = accountById.get(String(tx.account_id));
            const to = tx.to_account_id ? accountById.get(String(tx.to_account_id)) : null;
            const { meta, notes } = parseDescription(tx.description);
            const status = normalizeStatus(tx.status);
            const isFav = favoriteIds.includes(String(tx.id_transaction));
            const typeColor =
              tx.type === "income"
                ? "text-emerald-400"
                : tx.type === "expense"
                  ? "text-rose-300"
                  : "text-sky-300";
            const typeIcon =
              tx.type === "income" ? (
                <ArrowDownLeft className="size-4" />
              ) : tx.type === "expense" ? (
                <ArrowUpRight className="size-4" />
              ) : (
                <ArrowLeftRight className="size-4" />
              );

            return (
              <div
                key={tx.id_transaction}
                className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-border-default bg-surface-muted p-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-lg">{categoryIcon(category?.name, tx.title)}</span>
                    <p className="text-sm font-semibold text-text-primary">{tx.title}</p>
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${typeColor}`}>
                      {typeIcon}
                      {TYPE_LABELS[tx.type]}
                    </span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                        status === "completed"
                          ? "border-emerald-500/30 text-emerald-300"
                          : status === "pending"
                            ? "border-amber-500/30 text-amber-200"
                            : "border-rose-500/30 text-rose-200"
                      }`}
                    >
                      {STATUS_LABELS[status]}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-text-muted">
                    {category?.name || "Sin categoría"} · {from?.account_name || "Cuenta"}{" "}
                    {to ? `→ ${to.account_name}` : ""} · {formatDateBogota(tx.transaction_date)} ·{" "}
                    {formatTimeBogota(tx.transaction_date)}
                  </p>
                  {notes ? <p className="mt-1 text-xs text-text-secondary">{notes}</p> : null}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(meta.tags ?? []).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-border-default bg-surface-card px-2 py-0.5 text-[10px] font-semibold text-text-secondary"
                      >
                        {tag}
                      </span>
                    ))}
                    {meta.recurrence && meta.recurrence !== "none" ? (
                      <span className="rounded-full border border-sky-500/30 px-2 py-0.5 text-[10px] font-semibold text-sky-200">
                        {RECURRENCE_LABELS[meta.recurrence]}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-sm font-semibold ${typeColor}`}>
                    {tx.type === "income" ? "+" : tx.type === "expense" ? "-" : "↔"}{" "}
                    {formatMoney(Number(tx.amount))}
                  </span>
                  <div className="flex flex-wrap justify-end gap-1.5">
                    <button
                      type="button"
                onClick={() => fillFromTransaction(tx, "edit")}
                      className="rounded-lg border border-border-default px-2 py-1 text-xs text-text-secondary"
                      title="Editar usando estos datos"
                    >
                      <Pencil className="inline size-3.5" /> Editar
                    </button>
                    <button
                      type="button"
                onClick={() => fillFromTransaction(tx, "duplicate")}
                      className="rounded-lg border border-border-default px-2 py-1 text-xs text-text-secondary"
                    >
                      <Copy className="inline size-3.5" /> Duplicar
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleFavorite(tx.id_transaction)}
                      className={`rounded-lg border px-2 py-1 text-xs ${
                        isFav
                          ? "border-amber-400/50 text-amber-200"
                          : "border-border-default text-text-secondary"
                      }`}
                    >
                      <Star className="inline size-3.5" /> Favorito
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(tx.id_transaction)}
                      className="rounded-lg border border-red-500/40 px-2 py-1 text-xs text-red-300"
                    >
                      <Trash2 className="inline size-3.5" /> Eliminar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredTransactions.length > 0 ? (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle pt-4">
            <p className="text-xs text-text-muted">{pageRangeLabel}</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 rounded-xl border border-border-default px-3 py-2 text-xs font-semibold text-text-secondary disabled:opacity-40"
              >
                <ChevronLeft className="size-3.5" />
                Anterior
              </button>
              <span className="rounded-xl border border-border-default bg-surface-muted px-3 py-2 text-xs font-semibold text-text-primary">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1 rounded-xl border border-border-default px-3 py-2 text-xs font-semibold text-text-secondary disabled:opacity-40"
              >
                Siguiente
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {modalOpen ? (
        <FinanceModal
          title={form.editingId ? "Editar transacción" : "Nueva transacción"}
          subtitle="Registra un ingreso, un gasto o una transferencia entre cuentas."
          onClose={() => setModalOpen(false)}
        >
          <div className="space-y-4">
            <FinanceFormField label="Concepto" required>
              <input
                value={form.title}
                onChange={(event) => updateForm({ title: event.target.value })}
                placeholder="¿De qué se trata este movimiento?"
                className={financeInputClass}
              />
            </FinanceFormField>
            <FinanceFormField label="Tipo de movimiento" required>
              <select
                value={form.type}
                onChange={(event) =>
                  updateForm({
                    type: event.target.value as TxType,
                    to_account_id: "",
                    splitEnabled: false,
                  })
                }
                className={financeInputClass}
              >
                <option value="expense">Gasto — sale dinero</option>
                <option value="income">Ingreso — entra dinero</option>
                <option value="transfer">Transferencia — entre mis cuentas</option>
              </select>
            </FinanceFormField>

            <FinanceFormField label="Monto" required>
              <input
                type="number"
                min="0"
                value={form.amount}
                onChange={(event) => updateForm({ amount: event.target.value })}
                placeholder="Ej: 45000"
                className={financeInputClass}
              />
            </FinanceFormField>

            <div className="grid gap-3 sm:grid-cols-2">
              <FinanceFormField label="Fecha" required>
                <input
                  type="date"
                  value={form.date}
                  onChange={(event) => updateForm({ date: event.target.value })}
                  className={`${financeInputClass} [color-scheme:dark]`}
                />
              </FinanceFormField>
              <FinanceFormField label="Hora" required>
                <input
                  type="time"
                  value={form.time}
                  onChange={(event) => updateForm({ time: event.target.value })}
                  className={`${financeInputClass} [color-scheme:dark]`}
                />
              </FinanceFormField>
            </div>

            <FinanceFormField
              label={form.type === "transfer" ? "Cuenta origen" : "Cuenta"}
              required
            >
              <select
                value={form.account_id}
                onChange={(event) => updateForm({ account_id: event.target.value })}
                className={financeInputClass}
              >
                {accounts.map((account) => (
                  <option key={account.account_id} value={account.account_id}>
                    {account.account_name} ({account.currency})
                  </option>
                ))}
              </select>
            </FinanceFormField>

            {selectedAccount ? (
              <div className="grid gap-3 rounded-xl border border-border-default bg-surface-muted p-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-text-muted">Saldo actual</p>
                  <p className="text-lg font-semibold text-text-primary">
                    {formatMoney(currentBalance)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Después del movimiento</p>
                  <p
                    className={`text-lg font-semibold ${
                      balanceAfter < 0 ? "text-rose-300" : "text-emerald-300"
                    }`}
                  >
                    {formatMoney(balanceAfter)}
                  </p>
                </div>
              </div>
            ) : null}

            {form.type === "transfer" ? (
              <FinanceFormField label="Cuenta destino" required>
                <select
                  value={form.to_account_id}
                  onChange={(event) => updateForm({ to_account_id: event.target.value })}
                  className={financeInputClass}
                >
                  <option value="">Selecciona cuenta destino</option>
                  {accounts
                    .filter((account) => String(account.account_id) !== form.account_id)
                    .map((account) => (
                      <option key={account.account_id} value={account.account_id}>
                        {account.account_name} ({account.currency})
                      </option>
                    ))}
                </select>
              </FinanceFormField>
            ) : (
              <FinanceFormField label="Categoría" required>
                <select
                  value={form.category_id}
                  onChange={(event) => updateForm({ category_id: event.target.value })}
                  className={financeInputClass}
                >
                  <option value="">Selecciona categoría</option>
                  {categories
                    .filter((category) => category.kind === form.type || category.kind === "both")
                    .map((category) => (
                      <option key={category.id_category} value={category.id_category}>
                        {category.name}
                      </option>
                    ))}
                </select>
              </FinanceFormField>
            )}

            <FinanceFormField label="Etiquetas">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    value={form.tagInput}
                    onChange={(event) => updateForm({ tagInput: event.target.value })}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder="Casa, Trabajo, Moto…"
                    className={financeInputClass}
                  />
                  <button
                    type="button"
                    onClick={() => addTag()}
                    className="rounded-xl border border-border-default px-3 text-sm text-text-secondary"
                  >
                    Añadir
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {allTags.slice(0, 8).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addTag(tag)}
                      className="rounded-full border border-border-default px-2 py-1 text-[10px] text-text-secondary"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {form.tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] text-emerald-200"
                    >
                      {tag} ×
                    </button>
                  ))}
                </div>
              </div>
            </FinanceFormField>

            {form.type === "expense" ? (
              <div className="rounded-xl border border-border-default bg-surface-muted p-3">
                <label className="flex items-center gap-2 text-sm text-text-secondary">
                  <input
                    type="checkbox"
                    checked={form.splitEnabled}
                    onChange={(event) => updateForm({ splitEnabled: event.target.checked })}
                  />
                  Dividir gasto entre varias categorías
                </label>
                {form.splitEnabled ? (
                  <div className="mt-3 space-y-2">
                    {form.splits.map((split, index) => (
                      <div key={index} className="grid gap-2 sm:grid-cols-[1fr_140px_auto]">
                        <select
                          value={split.category_id}
                          onChange={(event) => {
                            const next = [...form.splits];
                            next[index] = { ...split, category_id: event.target.value };
                            updateForm({ splits: next });
                          }}
                          className={financeInputClass}
                        >
                          <option value="">Categoría</option>
                          {categories
                            .filter((category) => category.kind === "expense" || category.kind === "both")
                            .map((category) => (
                              <option key={category.id_category} value={category.id_category}>
                                {category.name}
                              </option>
                            ))}
                        </select>
                        <input
                          type="number"
                          value={split.amount}
                          onChange={(event) => {
                            const next = [...form.splits];
                            next[index] = { ...split, amount: event.target.value };
                            updateForm({ splits: next });
                          }}
                          className={financeInputClass}
                          placeholder="Monto"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            updateForm({
                              splits: form.splits.filter((_, i) => i !== index),
                            })
                          }
                          className="rounded-xl border border-border-default px-3 text-xs text-text-secondary"
                        >
                          Quitar
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        updateForm({
                          splits: [...form.splits, { category_id: "", amount: "" }],
                        })
                      }
                      className="rounded-xl border border-border-default px-3 py-2 text-xs text-text-secondary"
                    >
                      Añadir división
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}

            <FinanceFormField label="Notas (opcional)">
              <input
                value={form.description}
                onChange={(event) => updateForm({ description: event.target.value })}
                placeholder="Ej: Pago en efectivo"
                className={financeInputClass}
              />
            </FinanceFormField>

            {error ? <p className="text-sm text-red-400">{error}</p> : null}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-xl border border-border-default px-4 py-2 text-sm text-text-secondary"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={requestConfirmation}
                disabled={isPending}
                className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
              >
                Revisar y guardar
              </button>
            </div>
          </div>
        </FinanceModal>
      ) : null}

      {confirmOpen ? (
        <FinanceModal
          title="Confirmar movimiento"
          subtitle="Revisa el resumen antes de guardar."
          onClose={() => setConfirmOpen(false)}
        >
          <div className="space-y-4 text-sm">
            {[
              ["Concepto", form.title],
              ["Monto", formatMoney(Number(form.amount))],
              ["Tipo", TYPE_LABELS[form.type]],
              ["Cuenta origen", selectedAccount?.account_name ?? "Cuenta"],
              [
                "Cuenta destino",
                form.type === "transfer"
                  ? accountById.get(form.to_account_id)?.account_name ?? "Cuenta"
                  : "No aplica",
              ],
              ["Fecha", form.date],
              ["Hora", form.time],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 border-b border-border-subtle pb-2">
                <span className="text-text-muted">{label}</span>
                <span className="text-right font-semibold text-text-primary">{value}</span>
              </div>
            ))}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="rounded-xl border border-border-default px-4 py-2 text-sm text-text-secondary"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={isPending}
                className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
              >
                {isPending ? "Guardando…" : "Confirmar"}
              </button>
            </div>
          </div>
        </FinanceModal>
      ) : null}

      {toast ? (
        <div className="fixed bottom-5 right-5 z-[220] flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-surface-card px-4 py-3 shadow-2xl">
          <p className="text-sm text-text-primary">Movimiento registrado correctamente.</p>
          <button
            type="button"
            onClick={handleUndo}
            className="rounded-xl border border-border-default px-3 py-1.5 text-xs font-semibold text-emerald-300"
          >
            Deshacer
          </button>
        </div>
      ) : null}
    </div>
  );
}
